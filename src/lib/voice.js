import { TEACHERS } from "./teachers.js";

// ---------- Speaking (text-to-speech with a mouth level for lip-sync) ----------

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
let voices = [];
function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices();
}
if (synth) {
  loadVoices();
  synth.onvoiceschanged = loadVoices;
}

// Best browser voice for a teacher: their preferred names first, and the
// natural-sounding "Premium"/"Enhanced"/"Neural" versions over robotic ones.
function pickVoice(teacherId) {
  if (!voices.length) loadVoices();
  const prefs = TEACHERS[teacherId]?.voice?.prefer || [];
  let best = null;
  let bestScore = -1;
  for (const v of voices) {
    if (!v.lang?.toLowerCase().startsWith("en")) continue;
    const pi = prefs.findIndex((n) => v.name.includes(n));
    const score =
      (pi >= 0 ? 20 - pi : 0) + (/premium|enhanced|natural|neural/i.test(v.name) ? 8 : 0) + (/google|microsoft/i.test(v.name) ? 2 : 0);
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return best || voices[0] || null;
}

// Delivery tags like [curious] steer ElevenLabs; they are never shown or read out by the browser.
export const stripTags = (t) => t.replace(/\[[a-z][a-z ,'-]{1,30}\]\s*/gi, "").trim();

const MUTE_KEY = "champ:muted";

// The Speaker plays a queue of sentences and exposes a 0..1 `level` that the
// character's mouth follows.
//  - With ElevenLabs (server has ELEVENLABS_API_KEY), each teacher speaks in
//    their own voice. Sentences are fetched as soon as they are queued, so the
//    next one is ready before the current one ends, and the mouth follows the
//    real loudness of the audio.
//  - Otherwise it falls back to the browser's built-in voices, and if there are
//    none it still animates the mouth for a realistic duration.
export class Speaker {
  constructor() {
    this.queue = [];
    this.speaking = false;
    this.level = 0;
    this.muted = (() => {
      try {
        return localStorage.getItem(MUTE_KEY) === "1";
      } catch {
        return false;
      }
    })();
    this.teacher = "einstein";
    this.engine = "browser"; // "elevenlabs" once the server confirms a key
    this.listeners = new Set();
    this._pulse = 0;
    this._raf = null;
    this._token = 0;
    this._el = null;
    this._analyser = null;
    this._buf = null;
    this._urls = new Set();
    this._abort = null;
    this._ready =
      typeof window !== "undefined"
        ? fetch("/api/tts/status")
            .then((r) => r.json())
            .then((j) => (this.engine = j.enabled ? "elevenlabs" : "browser"))
            .catch(() => {})
        : Promise.resolve();
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  _emit(evt) {
    this.listeners.forEach((fn) => fn(evt));
  }
  _audioLevel() {
    if (!this._analyser || !this._el || this._el.paused) return null;
    this._analyser.getByteTimeDomainData(this._buf);
    let sum = 0;
    for (let i = 0; i < this._buf.length; i++) {
      const x = (this._buf[i] - 128) / 128;
      sum += x * x;
    }
    return Math.min(1, Math.sqrt(sum / this._buf.length) * 5.5);
  }
  _animate = () => {
    const t = performance.now() / 1000;
    const real = this._audioLevel();
    if (real != null) {
      // Real lip-sync: follow the voice's loudness, opening fast and closing a little slower.
      this.level = real > this.level ? real : this.level * 0.72 + real * 0.28;
    } else if (this.speaking) {
      const wobble = 0.35 + 0.3 * Math.abs(Math.sin(t * 13)) + 0.15 * Math.abs(Math.sin(t * 7.3));
      this._pulse = Math.max(0, this._pulse - 0.06);
      this.level = Math.min(1, wobble * 0.75 + this._pulse);
    } else {
      this.level = Math.max(0, this.level - 0.15);
    }
    this._raf = requestAnimationFrame(this._animate);
  };
  start() {
    if (!this._raf) this._raf = requestAnimationFrame(this._animate);
  }
  _setupAudio() {
    if (this._el) return;
    this._el = new Audio();
    this._el.preload = "auto";
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(this._el);
      this._analyser = ctx.createAnalyser();
      this._analyser.fftSize = 512;
      this._buf = new Uint8Array(this._analyser.fftSize);
      src.connect(this._analyser);
      this._analyser.connect(ctx.destination);
      this._ctx = ctx;
    } catch {
      this._analyser = null; // audio still plays, mouth uses the fallback wobble
    }
  }
  _fetchAudio(text, teacher) {
    if (this.muted) return null;
    if (!this._abort) this._abort = new AbortController();
    const signal = this._abort.signal;
    return this._ready
      .then(() =>
        this.engine === "elevenlabs"
          ? fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ teacher, text }),
              signal,
            })
          : { ok: false }
      )
      .then((r) => {
        if (r.ok) return r.blob();
        if (r.status === 401 || r.status === 503) this.engine = "browser"; // bad or missing key: stop asking
        return null;
      })
      .then((b) => {
        if (!b) return null;
        const url = URL.createObjectURL(b);
        this._urls.add(url);
        return url;
      })
      .catch(() => null);
  }
  setMuted(m) {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {}
    if (m) this.cancel();
    this._emit({ type: "mute", muted: m });
  }
  enqueue(text) {
    const raw = text.replace(/[*_#`>]/g, "").trim();
    const clean = stripTags(raw);
    if (!clean) return;
    this.queue.push({ text: clean, teacher: this.teacher, audio: this._fetchAudio(raw, this.teacher) });
    this.start();
    if (!this.speaking) this._next();
  }
  say(text) {
    this.cancel();
    this.enqueue(text);
  }
  cancel() {
    this._token++;
    this.queue = [];
    this._abort?.abort();
    this._abort = null;
    if (this._el) {
      this._el.pause();
      this._el.removeAttribute("src");
    }
    this._urls.forEach((u) => URL.revokeObjectURL(u));
    this._urls.clear();
    if (synth) synth.cancel();
    if (this.speaking) {
      this.speaking = false;
      this._emit({ type: "end" });
    }
  }
  _next() {
    const item = this.queue.shift();
    if (!item) {
      if (this.speaking) {
        this.speaking = false;
        this._emit({ type: "end" });
      }
      return;
    }
    const token = this._token;
    if (!this.speaking) {
      this.speaking = true;
      this._emit({ type: "start" });
    }
    const done = () => {
      if (token !== this._token) return;
      this._next();
    };
    if (item.audio) {
      item.audio.then((url) => {
        if (token !== this._token) return;
        if (!url) return this._speakBrowser(item, token, done);
        this._playUrl(url, item, token, done);
      });
      return;
    }
    this._speakBrowser(item, token, done);
  }
  _playUrl(url, item, token, done) {
    this._setupAudio();
    this._ctx?.state === "suspended" && this._ctx.resume().catch(() => {});
    const el = this._el;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.onended = el.onerror = null;
      URL.revokeObjectURL(url);
      this._urls.delete(url);
      done();
    };
    el.onended = finish;
    el.onerror = () => {
      finished = true;
      this._speakBrowser(item, token, done);
    };
    el.src = url;
    this._emit({ type: "sentence", text: item.text });
    el.play().catch(() => {
      // Autoplay blocked (no tap yet) -> use the browser voice for this sentence.
      if (finished || token !== this._token) return;
      finished = true;
      this._speakBrowser(item, token, done, true);
    });
  }
  _speakBrowser(item, token, done, emitted = false) {
    const { text, teacher } = item;
    if (!emitted) this._emit({ type: "sentence", text });
    const fallbackMs = Math.max(900, text.split(/\s+/).length * 330);
    if (!synth || this.muted || !voices.length) {
      setTimeout(done, fallbackMs);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(teacher);
    if (v) u.voice = v;
    const cfg = TEACHERS[teacher]?.voice || {};
    u.pitch = cfg.pitch ?? 1;
    u.rate = cfg.rate ?? 1;
    u.onboundary = () => (this._pulse = 0.45);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      if (token === this._token) done();
    };
    // Some engines never fire onend; guard against a stuck avatar.
    const guard = setTimeout(finish, fallbackMs * 2.5 + 2000);
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
  }
}

export const speaker = new Speaker();

// ---------- Listening (speech-to-text, patient) ----------

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const canListen = !!SR;

// Waits for a real pause (default 2.4s of silence) before handing the
// learner's words over, so the teacher never cuts them off mid-thought.
export function createListener({ onInterim, onFinal, onState, silenceMs = 2400 }) {
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;
  let finalText = "";
  let timer = null;
  let active = false;

  const flush = () => {
    clearTimeout(timer);
    if (!active) return;
    active = false;
    try {
      rec.stop();
    } catch {}
    const text = finalText.trim();
    finalText = "";
    onState?.("idle");
    if (text) onFinal?.(text);
  };

  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    onInterim?.((finalText + interim).trim());
    clearTimeout(timer);
    timer = setTimeout(flush, silenceMs);
  };
  rec.onerror = (e) => {
    onState?.(e.error === "not-allowed" ? "denied" : "error");
    active = false;
  };
  rec.onend = () => {
    if (active) {
      // Browser stopped early (e.g. a long pause); keep listening patiently.
      try {
        rec.start();
      } catch {
        flush();
      }
    }
  };

  return {
    start() {
      finalText = "";
      active = true;
      onState?.("listening");
      try {
        rec.start();
      } catch {}
    },
    finish: flush,
    abort() {
      active = false;
      clearTimeout(timer);
      try {
        rec.abort();
      } catch {}
      onState?.("idle");
    },
  };
}

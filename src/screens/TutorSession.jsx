import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Character from "../components/Character.jsx";
import { Bubble, bouncy, spring, useMouth } from "../components/ui.jsx";
import { getTeacher } from "../lib/teachers.js";
import { canListen, createListener, speaker, stripTags } from "../lib/voice.js";
import { MuteButton, useSpeaking } from "../components/VoiceDock.jsx";
import { askTeacher } from "../lib/brain.js";
import { MicIcon } from "./Home.jsx";

// Live, spoken session with the chosen teacher.
// phase: "greeting" | "idle" | "listening" | "thinking" | "speaking"
export default function TutorSession({ profile, teacherId, lesson, opener, onClose, onMinutes, onQuestion }) {
  const t = getTeacher(teacherId || profile.teacher);
  const { mouth, talking } = useMouth();
  const { muted } = useSpeaking();
  const [hint, setHint] = useState(() => {
    try {
      return !localStorage.getItem("champ:stopHint");
    } catch {
      return false;
    }
  });
  const [phase, setPhase] = useState("greeting");
  const [caption, setCaption] = useState("");
  const [heard, setHeard] = useState("");
  const [history, setHistory] = useState([]);
  const [handsFree, setHandsFree] = useState(canListen);
  const [typing, setTyping] = useState(!canListen);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState(null);
  const [micState, setMicState] = useState("idle");
  const [showLog, setShowLog] = useState(false);
  const listener = useRef(null);
  const historyRef = useRef(history);
  historyRef.current = history;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const handsFreeRef = useRef(handsFree);
  handsFreeRef.current = handsFree;
  const startedAt = useRef(Date.now());

  // speaker events -> captions + phase
  useEffect(() => {
    speaker.teacher = t.id;
    const off = speaker.on((e) => {
      if (e.type === "sentence") setCaption(e.text);
      if (e.type === "start") setPhase((p) => (p === "listening" ? p : "speaking"));
      if (e.type === "end") {
        setPhase((p) => (p === "speaking" || p === "greeting" ? "idle" : p));
      }
    });
    return () => {
      off();
      speaker.cancel();
      listener.current?.abort();
      const mins = (Date.now() - startedAt.current) / 60000;
      onMinutes?.(Math.min(30, mins), Math.round(mins * 10));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After the teacher finishes, listen again automatically (hands-free).
  useEffect(() => {
    if (phase === "idle" && handsFreeRef.current && !typing && historyRef.current.some((m) => m.role === "user")) {
      const id = setTimeout(() => phaseRef.current === "idle" && startListening(), 700);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, typing]);

  const ask = useCallback(
    async (text, via) => {
      const q = text.trim();
      if (!q) return;
      onQuestion?.({ text: q, voice: via === "voice", teacher: t.id });
      speaker.cancel();
      setHeard(q);
      setCaption("");
      setPhase("thinking");
      const msgs = [...historyRef.current, { role: "user", content: q }];
      setHistory(msgs);

      let full = "";
      let pending = "";
      const flushSentences = (final = false) => {
        const parts = pending.split(/(?<=[.!?])\s+/);
        const keep = final ? "" : parts.pop();
        for (const s of parts) if (s.trim()) speaker.enqueue(s);
        pending = keep;
      };

      try {
        await askTeacher({
          messages: msgs,
          teacher: t.id,
          profile,
          lesson,
          onMode: setMode,
          onDelta: (text) => {
            full += text;
            pending += text;
            flushSentences();
          },
        });
        flushSentences(true);
      } catch {
        full = "Hmm, my thinking machine hiccuped. Could you ask me that once more?";
        speaker.enqueue(full);
      }
      setHistory((h) => [...h, { role: "assistant", content: full }]);
      if (!speaker.speaking) setPhase("idle");
    },
    [t.id, profile, lesson]
  );

  const startListening = useCallback(() => {
    speaker.cancel();
    setTyping(false);
    setHeard("");
    if (!listener.current) {
      listener.current = createListener({
        onInterim: (txt) => setHeard(txt),
        onFinal: (txt) => ask(txt, "voice"),
        onState: (s) => {
          setMicState(s);
          if (s === "listening") setPhase("listening");
          if (s === "denied" || s === "error") {
            setPhase("idle");
            setTyping(true);
            setHandsFree(false);
          }
          if (s === "idle") setPhase((p) => (p === "listening" ? "idle" : p));
        },
      });
    }
    listener.current?.start();
  }, [ask]);

  // Greeting (or the lesson's opening question) when the session opens.
  useEffect(() => {
    const line =
      opener ||
      `Hello ${profile.name || "my friend"}! I'm listening. Ask me anything, or tell me what's confusing you. There's no rush.`;
    const id = setTimeout(() => {
      speaker.say(line);
      setHistory([{ role: "assistant", content: line }]);
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTalking = () => {
    speaker.cancel();
    if (hint) {
      setHint(false);
      try {
        localStorage.setItem("champ:stopHint", "1");
      } catch {}
    }
  };

  const mood =
    phase === "listening" ? "listening" : phase === "thinking" ? "thinking" : talking ? "talking" : phase === "greeting" ? "happy" : "idle";
  const status =
    phase === "listening"
      ? heard
        ? "I'm listening… take your time"
        : "Listening…"
      : phase === "thinking"
        ? `${t.short} is thinking…`
        : talking
          ? `${t.short} is speaking`
          : typing
            ? "Type your question"
            : "Tap the mic to talk";

  const suggestions = teacherId
    ? ["What did you discover?", "Why does it matter today?", "Explain your big idea simply", "Where should I start?"]
    : ["Explain gradient descent simply", "Why do we step downhill?", "Give me a small hint", "Can you say that differently?"];

  return (
    <motion.div
      className="tutor"
      style={{ "--accent": t.color, "--accent-deep": t.deep, "--accent-soft": t.soft }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="tutor__top">
        <motion.button className="iconbtn" onClick={onClose} whileTap={{ scale: 0.85 }} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </motion.button>
        <div className="tutor__who">
          <b>{t.name}</b>
          <span>
            <motion.i animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} /> Live lesson
            {mode === "demo" && <em className="tag">practice replies</em>}
          </span>
        </div>
        <div className="tutor__actions">
          <MuteButton muted={muted} />
          <motion.button className="iconbtn" onClick={() => setShowLog((s) => !s)} whileTap={{ scale: 0.85 }} aria-label="Show conversation">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="tutor__stage" onClick={() => talking && speaker.cancel()}>
        <div className="tutor__glow" />
        <AnimatePresence mode="wait">
          {phase === "thinking" ? (
            <motion.div key="dots" className="bubble bubble--bottom tutor__caption thinking" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={bouncy}>
              {[0, 1, 2].map((k) => (
                <motion.i key={k} animate={{ y: [0, -7, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.14 }} />
              ))}
            </motion.div>
          ) : (
            caption && <Bubble key={caption} text={caption} from="bottom" className="tutor__caption" speed={18} />
          )}
        </AnimatePresence>

        <motion.div
          className="tutor__char"
          initial={{ scale: 0.6, y: 80 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.15 }}
        >
          {phase === "listening" &&
            [0, 1].map((k) => (
              <motion.span
                key={k}
                className="ear-wave"
                animate={{ scale: [0.8, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.8 }}
              />
            ))}
          <Character teacher={t.id} size={250} mood={mood} mouth={mouth} nodding={phase === "listening" && !!heard} wave={phase === "greeting" && !talking} />
        </motion.div>
      </div>

      <div className="tutor__bottom">
        <AnimatePresence>
          {heard && (
            <motion.div className="you" initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={spring}>
              <small>You</small>
              {heard}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="status" role="status" aria-live="polite">
          {phase === "listening" && <Bars />}
          <span>{status}</span>
          {talking && (
            <button className="stopchip" onClick={stopTalking}>
              <span className="dock__square" /> Stop
            </button>
          )}
        </div>

        {!heard && history.length <= 1 && (
          <div className="sugg">
            {suggestions.map((s, k) => (
              <motion.button key={s} className="sugg__b" onClick={() => ask(s)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 + k * 0.07 }} whileTap={{ scale: 0.94 }}>
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {typing ? (
          <form
            className="typebar"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
              setDraft("");
            }}
          >
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Ask ${t.short} anything…`} />
            {canListen && (
              <button type="button" className="typebar__mic" onClick={startListening} aria-label="Use microphone">
                <MicIcon size={22} />
              </button>
            )}
            <motion.button type="submit" className="typebar__send" whileTap={{ scale: 0.88 }} disabled={!draft.trim()}>
              ↑
            </motion.button>
          </form>
        ) : (
          <div className="microw">
            <motion.button className="round" onClick={() => setTyping(true)} whileTap={{ scale: 0.88 }} aria-label="Type instead">
              ⌨︎
            </motion.button>
            <motion.button
              className={`mic ${phase === "listening" ? "mic--on" : ""} ${talking ? "mic--stop" : ""}`}
              onClick={() => (talking ? stopTalking() : phase === "listening" ? listener.current?.finish() : startListening())}
              whileTap={{ scale: 0.9 }}
              animate={phase === "listening" ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={phase === "listening" ? { duration: 1.2, repeat: Infinity } : bouncy}
              aria-label={talking ? `Stop ${t.short}` : phase === "listening" ? "Done speaking" : "Start talking"}
            >
              {phase === "listening" && [0, 1, 2].map((k) => (
                <motion.span key={k} className="mic__ring" animate={{ scale: [1, 1.9], opacity: [0.45, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: k * 0.6 }} />
              ))}
              {talking || phase === "listening" ? <span className="mic__stop" /> : <MicIcon size={34} />}
              <AnimatePresence>
                {talking && hint && (
                  <motion.span className="coach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    Tap to stop me anytime
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              className={`round ${handsFree ? "round--on" : ""}`}
              onClick={() => setHandsFree((h) => !h)}
              whileTap={{ scale: 0.88 }}
              aria-label="Hands-free mode"
              title="Hands-free: listen again after each answer"
            >
              ∞
            </motion.button>
          </div>
        )}
        {micState === "denied" && <p className="perm__note">Microphone blocked. You can type instead.</p>}
      </div>

      <AnimatePresence>
        {showLog && (
          <motion.div className="log" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}>
            <div className="log__head">
              <b>Conversation</b>
              <button onClick={() => setShowLog(false)}>Done</button>
            </div>
            <div className="log__list">
              {history.map((m, k) => (
                <div key={k} className={`msg msg--${m.role}`}>
                  {stripTags(m.content)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Bars() {
  return (
    <span className="sbars">
      {[0, 1, 2, 3, 4].map((k) => (
        <motion.i key={k} animate={{ scaleY: [0.3, 1, 0.4, 0.8, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.1 }} />
      ))}
    </span>
  );
}

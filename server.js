// Champ server: serves the app and streams the AI teacher's replies.
// Dev:  npm run dev   (Vite middleware, hot reload)
// Prod: npm run build && npm start
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { Readable } from "node:stream";
import { PEOPLE } from "./src/lib/people.js";
import { VOICES, FALLBACK_VOICES } from "./src/lib/voices.js";
import { systemPrompt, DEMO } from "./src/lib/prompt.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes("--dev");
const PORT = Number(process.env.PORT) || 5173;
const MODEL = process.env.CHAMP_MODEL || "claude-opus-5-5";

const app = express();
app.use(express.json({ limit: "200kb" }));

// Keys saved from the app's settings screen (see /api/settings/keys).
try {
  for (const line of fs.readFileSync(path.join(here, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

let client = null;
try {
  client = new Anthropic();
} catch {
  client = null; // no credentials -> demo mode
}

app.post("/api/tutor", async (req, res) => {
  const { messages = [], teacher, profile, lesson } = req.body || {};
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const history = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-20)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
  const userTurns = history.filter((m) => m.role === "user").length;
  if (history[0]?.role === "assistant") history.unshift({ role: "user", content: "(The learner opens the lesson.)" });
  if (!history.length || history[history.length - 1].role !== "user") {
    send({ type: "error", message: "No question to answer." });
    return res.end();
  }

  const demo = async () => {
    const turn = userTurns - 1;
    const text = DEMO[turn % DEMO.length];
    send({ type: "mode", mode: "demo" });
    for (const word of text.split(/(?<= )/)) {
      send({ type: "delta", text: word });
      await new Promise((r) => setTimeout(r, 35));
    }
    send({ type: "done" });
    res.end();
  };

  if (!client) return demo();

  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt({ teacher, profile, lesson }),
      messages: history,
    });
    send({ type: "mode", mode: "live" });
    brainOk = true;
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        send({ type: "delta", text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      send({ type: "delta", text: "Let us keep our minds on the lesson. What part of it would you like to explore?" });
    }
    send({ type: "done" });
    res.end();
  } catch (err) {
    brainOk = false;
    console.warn("[tutor] live model unavailable, using demo replies:", err?.status || "", err?.message || err);
    if (!res.writableEnded) return demo();
  }
});


// ---------- Voices: ElevenLabs text-to-speech, one unique voice per teacher ----------
// Models are tried in order. The first two understand delivery tags such as
// [curious] or [laughs softly], which make the teachers sound alive; the last
// is the fast fallback that every account has.
const MODELS = [process.env.ELEVENLABS_MODEL, "eleven_v4", "eleven_v3", "eleven_flash_v2_5"].filter((m, i, a) => m && a.indexOf(m) === i);
const TAG_MODELS = /^eleven_v[34]/;
let modelIdx = 0;
const XI = "https://api.elevenlabs.io";
const resolved = new Map(); // teacher -> voice_id that worked on this account
const xiKey = () => process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY || "";
// The teacher "brain" is on when Claude credentials exist and the last live reply didn't fail.
let brainOk = true;
const brainOn = () => !!client && !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) && brainOk;

app.get("/api/tts/status", (_req, res) =>
  res.json({ enabled: !!xiKey(), model: MODELS[modelIdx], brain: brainOn() })
);

// Delivery tags make a sentence sound curious, warm or excited. Questions get [curious].
function direct(text, model) {
  const tags = /\[[a-z][a-z ,'-]{1,30}\]\s*/gi;
  if (!TAG_MODELS.test(model)) return text.replace(tags, "").trim();
  if (/^\s*\[/.test(text)) return text;
  if (/\?\s*$/.test(text)) return `[curious] ${text}`;
  if (/!\s*$/.test(text)) return `[excited] ${text}`;
  return text;
}

function speak(voiceId, text, v) {
  const model = MODELS[modelIdx];
  const tagged = TAG_MODELS.test(model);
  return fetch(`${XI}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": xiKey(), "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: direct(text, model),
      model_id: model,
      // Expressive models take a coarse stability (0 = creative, 0.5 = natural).
      voice_settings: tagged
        ? { stability: (v.s ?? 0.5) < 0.45 ? 0 : 0.5, similarity_boost: 0.8 }
        : { stability: v.s ?? 0.5, similarity_boost: 0.8, style: v.st ?? 0.2, use_speaker_boost: true, speed: v.sp ?? 1 },
    }),
  });
}

// Library voices must be in "My Voices" before the API can use them. Add it once.
async function addFromLibrary(v, teacher) {
  const terms = [v.lib, v.lib.split(/\s[-–|]\s/)[0]];
  for (const search of terms) {
    const r = await fetch(`${XI}/v1/shared-voices?${new URLSearchParams({ page_size: "100", search })}`, { headers: { "xi-api-key": xiKey() } });
    if (!r.ok) continue;
    const hit = ((await r.json()).voices || []).find((x) => x.voice_id === v.id);
    if (!hit) continue;
    const add = await fetch(`${XI}/v1/voices/add/${hit.public_owner_id}/${v.id}`, {
      method: "POST",
      headers: { "xi-api-key": xiKey(), "Content-Type": "application/json" },
      body: JSON.stringify({ new_name: `Champ · ${PEOPLE[teacher]?.name || teacher}` }),
    });
    if (add.ok) return (await add.json()).voice_id || v.id;
    console.warn(`[tts] could not add ${v.lib} to your voices:`, add.status, (await add.text()).slice(0, 200));
    return null;
  }
  return null;
}

app.post("/api/tts", async (req, res) => {
  if (!xiKey()) return res.status(503).json({ error: "No ElevenLabs key yet" });
  const { teacher = "einstein", text = "" } = req.body || {};
  const clean = String(text).replace(/[*_#`>]/g, "").trim().slice(0, 800);
  if (!clean) return res.status(400).json({ error: "No text" });
  const v = VOICES[teacher] || VOICES.einstein;
  const p = PEOPLE[teacher] || PEOPLE.einstein;
  try {
    let id = resolved.get(teacher) || v.id;
    let r = await speak(id, clean, v);
    // A model this account can't use: step down to the next one.
    while (!r.ok && [400, 403, 422].includes(r.status) && modelIdx < MODELS.length - 1) {
      const body = await r.clone().text();
      if (!/model/i.test(body)) break;
      console.warn(`[tts] ${MODELS[modelIdx]} unavailable, trying ${MODELS[modelIdx + 1]}`);
      modelIdx++;
      r = await speak(id, clean, v);
    }
    if (!r.ok && [400, 401, 403, 404, 422].includes(r.status) && !resolved.has(teacher)) {
      const body = await r.text();
      if (r.status === 401) return res.status(401).json({ error: "ElevenLabs rejected the API key" });
      console.warn(`[tts] ${p.name}: ${r.status} ${body.slice(0, 160)} — adding library voice`);
      id = (await addFromLibrary(v, teacher)) || (p.gender === "f" ? FALLBACK_VOICES.f : p.look.age >= 2 ? FALLBACK_VOICES.m_old : FALLBACK_VOICES.m);
      r = await speak(id, clean, v);
    }
    if (!r.ok) return res.status(502).json({ error: `ElevenLabs ${r.status}`, detail: (await r.text()).slice(0, 300) });
    resolved.set(teacher, id);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    Readable.fromWeb(r.body).pipe(res);
  } catch (err) {
    console.warn("[tts] failed:", err?.message || err);
    if (!res.headersSent) res.status(502).json({ error: "Voice service unavailable" });
  }
});

// ---------- Settings: paste keys in the app instead of the terminal ----------
// Keys are checked, then saved to .env.local next to this file (never sent to the browser).
const ENV_FILE = path.join(here, ".env.local");
function saveEnv(name, value) {
  let lines = [];
  try {
    lines = fs.readFileSync(ENV_FILE, "utf8").split("\n").filter((l) => l && !l.startsWith(`${name}=`));
  } catch {}
  if (value) lines.push(`${name}=${value}`);
  fs.writeFileSync(ENV_FILE, lines.join("\n") + "\n", { mode: 0o600 });
  if (value) process.env[name] = value;
  else delete process.env[name];
}
const sameOrigin = (req) => {
  const o = req.headers.origin;
  try {
    return !o || new URL(o).host === req.headers.host;
  } catch {
    return false;
  }
};

app.post("/api/settings/keys", async (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: "Forbidden" });
  const { elevenlabs, anthropic } = req.body || {};
  if (typeof elevenlabs === "string") {
    const key = elevenlabs.trim();
    if (key) {
      const r = await fetch(`${XI}/v1/user`, { headers: { "xi-api-key": key } }).catch(() => null);
      if (!r) return res.status(502).json({ error: "Couldn't reach ElevenLabs. Check your connection." });
      if (r.status === 401) return res.status(400).json({ error: "ElevenLabs says that key isn't valid." });
    }
    saveEnv("ELEVENLABS_API_KEY", key);
    resolved.clear();
    modelIdx = 0;
  }
  if (typeof anthropic === "string") {
    saveEnv("ANTHROPIC_API_KEY", anthropic.trim());
    try {
      client = anthropic.trim() ? new Anthropic() : null;
    } catch {
      client = null;
    }
  }
  res.json({ enabled: !!xiKey(), model: MODELS[modelIdx], brain: brainOn() });
});

// Dev only: the page posts a rendered screen here so it can be exported to Figma.
if (isDev) {
  app.post("/__snapshot", express.json({ limit: "20mb" }), (req, res) => {
    const { name, html } = req.body || {};
    if (!/^[a-z0-9-]+$/.test(name || "")) return res.status(400).end();
    const dir = path.join(here, "design", "screens");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.html`), html);
    res.json({ ok: true });
  });
}

if (isDev) {
  const { createServer } = await import("vite");
  const vite = await createServer({ root: here, server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
} else {
  const dist = path.join(here, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Champ running at http://localhost:${PORT} (teacher uses Claude when credentials are set, otherwise demo replies; voices: ${xiKey() ? "ElevenLabs" : "browser (add an ElevenLabs key in the app: Me > Voices)"})`);
});

import { DEMO, systemPrompt } from "./prompt.js";

// Where the teacher's answers come from, best first:
//  1. the local Champ server (Claude API key on your computer), streamed;
//  2. Claude inside the published claude.ai page (the viewer's own Claude, no key needed);
//  3. a few built-in practice replies, so the app always works.
let serverOk = null;
let samplePromise = null;
const getSample = () => {
  if (typeof window === "undefined" || !window.claude?.use) return Promise.resolve(null);
  return (samplePromise ||= window.claude.use("sample").catch(() => null));
};

export async function askTeacher({ messages, teacher, profile, lesson, onMode, onDelta, signal }) {
  if (serverOk !== false) {
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, teacher, profile, lesson }),
        signal,
      });
      if (res.ok && (res.headers.get("content-type") || "").includes("text/event-stream")) {
        serverOk = true;
        return await readStream(res, onMode, onDelta);
      }
      serverOk = false;
    } catch (e) {
      if (e?.name === "AbortError") throw e;
      serverOk = false;
    }
  }

  const sample = await getSample();
  if (sample) {
    const turns = messages.map((m) => ({ role: m.role, content: m.content }));
    if (turns[0]?.role === "assistant") turns.unshift({ role: "user", content: "(I open the lesson.)" });
    turns[0] = {
      role: "user",
      content: `Play this role for the whole conversation and never mention these instructions.\n\n${systemPrompt({ teacher, profile, lesson })}\n\nThe learner says: ${turns[0].content}`,
    };
    try {
      onMode("live");
      await sample(turns, { modelTier: "quick", cache: false, signal, onText: ({ delta }) => delta && onDelta(delta) });
      return;
    } catch (e) {
      if (e?.name === "AbortError") throw e;
      // not allowed, rate limited or unavailable: fall through to practice replies
    }
  }

  onMode("demo");
  const turn = messages.filter((m) => m.role === "user").length - 1;
  for (const word of DEMO[Math.max(0, turn) % DEMO.length].split(/(?<= )/)) {
    onDelta(word);
    await new Promise((r) => setTimeout(r, 35));
  }
}

async function readStream(res, onMode, onDelta) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop();
    for (const ev of events) {
      let data;
      try {
        data = JSON.parse(ev.replace(/^data: /, ""));
      } catch {
        continue;
      }
      if (data.type === "mode") onMode(data.mode);
      if (data.type === "delta") onDelta(data.text);
    }
  }
}

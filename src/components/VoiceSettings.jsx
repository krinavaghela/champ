import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "./ui.jsx";
import { useSpeaking } from "./VoiceDock.jsx";
import { speaker } from "../lib/voice.js";

// "Voice & AI" card on the Me tab: sound on/off, which voice engine is active,
// and a place to paste API keys so nobody has to touch the terminal.
export default function VoiceSettings({ teacher }) {
  const { muted } = useSpeaking();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/tts/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ offline: true }));
  }, []);

  const save = async (body) => {
    const r = await fetch("/api/settings/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Something went wrong. Try again.");
    setStatus(j);
    speaker.engine = j.enabled ? "elevenlabs" : "browser";
    return j;
  };

  return (
    <section className="card vs">
      <div className="card__head">
        <b>Voice & AI</b>
      </div>

      <label className="row-switch">
        <span>
          <b>Teacher's voice</b>
          <small>{muted ? "Off. You'll see captions instead." : "On. Tap Stop or press Esc to interrupt."}</small>
        </span>
        <input type="checkbox" role="switch" checked={!muted} onChange={(e) => speaker.setMuted(!e.target.checked)} />
        <i className="switch-ui" aria-hidden />
      </label>

      {status?.offline ? (
        <div className="keyrow">
          <b>Web version</b>
          <small>{typeof window !== "undefined" && window.claude ? "Here, teachers think with Claude and speak with your browser's voice." : "Here, teachers use practice replies and your browser's voice."} For full AI answers and ElevenLabs voices, run Champ on a computer and add your keys in this card.</small>
        </div>
      ) : (
      <>
      <KeyRow
        title="Real voices (ElevenLabs)"
        on={status?.enabled}
        onText="On. Every teacher has their own accent and personality."
        offText="Off. Teachers use your browser's basic voice, which sounds flat. Add an ElevenLabs key to switch on real, expressive voices."
        placeholder="Paste your ElevenLabs API key"
        link="https://elevenlabs.io/app/settings/api-keys"
        onSave={(k) => save({ elevenlabs: k })}
        onRemove={() => save({ elevenlabs: "" })}
        after={() => {
          speaker.teacher = teacher.id;
          speaker.say(teacher.hello);
        }}
      />

      <KeyRow
        title="AI teacher brain (Claude)"
        on={status?.brain}
        onText="On. Teachers answer anything you ask."
        offText="Off. Teachers use a few practice replies. Add a Claude API key so they can answer any question."
        placeholder="Paste your Claude API key"
        link="https://console.anthropic.com/settings/keys"
        onSave={(k) => save({ anthropic: k })}
        onRemove={() => save({ anthropic: "" })}
      />
      </>
      )}

      <Button
        variant="soft"
        onClick={() => {
          speaker.teacher = teacher.id;
          speaker.say(teacher.hello);
        }}
      >
        ▶ Test {teacher.short}'s voice
      </Button>
    </section>
  );
}

function KeyRow({ title, on, onText, offText, placeholder, link, onSave, onRemove, after }) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    setBusy(true);
    setErr("");
    try {
      await onSave(val.trim());
      setVal("");
      setOpen(false);
      after?.();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  return (
    <div className={`keyrow ${on ? "keyrow--on" : ""}`}>
      <div className="keyrow__head">
        <span className={`dot ${on ? "dot--on" : ""}`} aria-hidden />
        <b>{title}</b>
        {on && (
          <button className="link" onClick={onRemove}>
            Remove key
          </button>
        )}
      </div>
      <small>{on ? onText : offText}</small>
      {!on &&
        (open ? (
          <motion.form className="keyrow__form" onSubmit={submit} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              autoFocus
            />
            <Button type="submit" disabled={!val.trim() || busy}>
              {busy ? "Checking…" : "Save"}
            </Button>
            {err && <p className="keyrow__err" role="alert">{err}</p>}
            <small className="keyrow__help">
              Get one at{" "}
              <a href={link} target="_blank" rel="noreferrer">
                {new URL(link).hostname}
              </a>
              . It's saved only on this computer.
            </small>
          </motion.form>
        ) : (
          <button className="keyrow__add" onClick={() => setOpen(true)}>
            + Add key
          </button>
        ))}
    </div>
  );
}

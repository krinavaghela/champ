import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Character from "./Character.jsx";
import { bouncy } from "./ui.jsx";
import { getTeacher } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";

// Tracks whether a teacher is talking and whether sound is muted.
export function useSpeaking() {
  const [speaking, setSpeaking] = useState(speaker.speaking);
  const [muted, setMuted] = useState(speaker.muted);
  const [who, setWho] = useState(speaker.teacher);
  useEffect(
    () =>
      speaker.on((e) => {
        if (e.type === "start") {
          setSpeaking(true);
          setWho(speaker.teacher);
        }
        if (e.type === "end") setSpeaking(false);
        if (e.type === "mute") setMuted(e.muted);
      }),
    []
  );
  return { speaking, muted, who };
}

// Floating "now speaking" pill, shown on every screen whenever a teacher talks,
// so the voice can always be stopped with one tap (or the Esc key).
export default function VoiceDock({ hidden }) {
  const { speaking, muted, who } = useSpeaking();
  const t = getTeacher(who);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && speaker.speaking && speaker.cancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {speaking && !hidden && (
        <motion.div
          className="dock"
          role="status"
          aria-live="polite"
          initial={{ y: -70, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={bouncy}
          style={{ "--accent": t.color }}
        >
          <span className="dock__face">
            <Character teacher={t.id} crop="head" size={34} mood="talking" />
          </span>
          <span className="dock__txt">
            <b>{t.short}</b>
            <small>{muted ? "Muted · captions only" : "is speaking"}</small>
          </span>
          {!muted && <Bars />}
          <MuteButton muted={muted} className="dock__btn" />
          <button className="dock__stop" onClick={() => speaker.cancel()} aria-label={`Stop ${t.short} speaking (Esc)`} title="Stop (Esc)">
            <span className="dock__square" />
            Stop
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MuteButton({ muted, className = "iconbtn" }) {
  return (
    <motion.button
      className={className}
      onClick={() => speaker.setMuted(!muted)}
      whileTap={{ scale: 0.85 }}
      aria-label={muted ? "Turn voice on" : "Mute voice"}
      aria-pressed={muted}
      title={muted ? "Turn voice on" : "Mute voice"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {muted ? (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        ) : (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        )}
      </svg>
    </motion.button>
  );
}

function Bars() {
  return (
    <span className="dock__bars" aria-hidden>
      {[0, 1, 2, 3].map((k) => (
        <motion.i key={k} animate={{ scaleY: [0.35, 1, 0.5, 0.85, 0.35] }} transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.12 }} />
      ))}
    </span>
  );
}

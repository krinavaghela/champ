import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Badge from "../components/Badge.jsx";
import { Button, Confetti, bouncy, useDeviceRoot } from "../components/ui.jsx";
import { BADGES, BADGE } from "../lib/badges.js";
import { speaker } from "../lib/voice.js";

// Grid of Animal Mindset Badges with progress toward each locked one.
export default function Badges({ state }) {
  const [open, setOpen] = useState(null);
  const root = useDeviceRoot();
  const earned = BADGES.filter((b) => state.badges[b.id]).length;
  return (
    <div>
      <section className="card badges-hero">
        <div>
          <b>Animal Mindset Badges</b>
          <small>Each animal is a learning habit. Earn them by how you learn, not just how much.</small>
        </div>
        <div className="badges-count">
          <b>{earned}</b>
          <small>/ {BADGES.length}</small>
        </div>
      </section>
      <motion.div className="badge-grid" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
        {BADGES.map((b) => {
          const got = !!state.badges[b.id];
          const [cur, goal] = b.progress(state);
          return (
            <motion.button
              key={b.id}
              className={`badge-tile ${got ? "badge-tile--on" : ""}`}
              variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: bouncy } }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setOpen(b.id)}
            >
              <motion.span animate={got ? { y: [0, -4, 0] } : {}} transition={{ duration: 2.4, repeat: Infinity, delay: Math.random() }}>
                <Badge id={b.id} color={b.color} earned={got} size={78} progress={got ? null : cur / goal} />
              </motion.span>
              <b>{b.title}</b>
              <small>{got ? b.mindset : `${Math.min(cur, goal)}/${goal}`}</small>
            </motion.button>
          );
        })}
      </motion.div>
      {root && createPortal(
      <AnimatePresence>
        {open && <BadgeModal key={open} id={open} earned={!!state.badges[open]} state={state} onClose={() => setOpen(null)} />}
      </AnimatePresence>,
        root
      )}
    </div>
  );
}

// Shown both when a badge is tapped and when one is newly earned (celebrate = true).
export function BadgeModal({ id, earned, state, celebrate, onClose }) {
  const b = BADGE[id];
  const [cur, goal] = state ? b.progress(state) : [1, 1];
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => !speaker.speaking && speaker.say(`You earned the ${b.title} badge! ${b.mindset}.`), 500);
    return () => clearTimeout(t);
  }, [celebrate, b]);

  return (
    <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      {celebrate && <Confetti fire={1} count={60} />}
      <motion.div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={b.title}
        style={{ "--c": b.color }}
        initial={{ scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={bouncy}
        onClick={(e) => e.stopPropagation()}
      >
        {celebrate && <motion.div className="modal__kicker" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>New badge unlocked!</motion.div>}
        <div className="modal__medal">
          {earned && (
            <motion.div className="rays" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />
              ))}
            </motion.div>
          )}
          <motion.div
            initial={celebrate ? { scale: 0, rotate: -200 } : { scale: 0.8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 11, delay: celebrate ? 0.15 : 0 }}
          >
            <Badge id={b.id} color={b.color} earned={earned} size={150} />
          </motion.div>
        </div>
        <h3>{b.title}</h3>
        <span className="modal__mind">{b.mindset}</span>
        <p>{b.how}</p>
        {!earned && (
          <div className="modal__prog">
            <div><i style={{ width: `${Math.min(100, (cur / goal) * 100)}%` }} /></div>
            <small>{Math.min(cur, goal)} of {goal}</small>
          </div>
        )}
        <Button onClick={onClose} style={{ "--accent": b.color, "--accent-deep": "rgba(0,0,0,0.25)" }}>
          {celebrate ? "Awesome!" : "Got it"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

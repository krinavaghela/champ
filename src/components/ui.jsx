import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { speaker } from "../lib/voice.js";

export const spring = { type: "spring", stiffness: 420, damping: 28 };
export const bouncy = { type: "spring", stiffness: 520, damping: 16 };

export function Button({ children, variant = "primary", disabled, onClick, className = "", ...rest }) {
  return (
    <motion.button
      type="button"
      className={`btn btn--${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.95, y: 3 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={bouncy}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function TopBar({ step, total, onBack }) {
  return (
    <div className="topbar">
      <motion.button
        className="iconbtn"
        onClick={onBack}
        whileTap={{ scale: 0.85 }}
        style={{ visibility: onBack ? "visible" : "hidden" }}
        aria-label="Back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>
      <div className="progress">
        <motion.div
          className="progress__fill"
          initial={false}
          animate={{ width: `${Math.max(6, (step / total) * 100)}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <span className="progress__shine" />
        </motion.div>
      </div>
      <div style={{ width: 40 }} />
    </div>
  );
}

// Speech bubble that types its text in, word by word.
export function Bubble({ text, from = "bottom", className = "", speed = 28 }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <motion.div
      key={text}
      role="status"
      aria-live="polite"
      aria-label={text}
      className={`bubble bubble--${from} ${className}`}
      initial={{ scale: 0.4, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={bouncy}
    >
      <span className="bubble__ghost" aria-hidden>{text}</span>
      <span className="bubble__text" aria-hidden>{shown}</span>
    </motion.div>
  );
}

// Follows the speaker's level so a character's mouth moves while it talks.
export function useMouth() {
  const [m, setM] = useState(0);
  const [talking, setTalking] = useState(speaker.speaking);
  useEffect(() => {
    let raf;
    let last = 0;
    const tick = (t) => {
      if (t - last > 33) {
        last = t;
        setM(speaker.level);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    speaker.start();
    const off = speaker.on((e) => {
      if (e.type === "start") setTalking(true);
      if (e.type === "end") setTalking(false);
    });
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, []);
  return { mouth: m, talking };
}

// Erlenmeyer flask that fills with glowing liquid: the daily-goal vessel.
export function Flask({ level = 0, colors = ["#7FA6FF", "#4F7CFF"], size = 200, children }) {
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  const lv = useSpring(level, { stiffness: 60, damping: 14 });
  useEffect(() => lv.set(Math.max(0, Math.min(1, level))), [level, lv]);
  const y = useTransform(lv, (v) => 268 - v * 212);
  const bubbles = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: 70 + ((i * 37) % 100), d: 2.4 + (i % 4) * 0.7, delay: i * 0.45, r: 3 + (i % 3) * 2 })),
    []
  );
  const body = "M78 20 h84 v14 h-8 v58 l62 132 a30 30 0 0 1 -27 44 H51 a30 30 0 0 1 -27 -44 l62 -132 V34 h-8 Z";
  return (
    <div className="flask" style={{ width: size, height: size * 1.2 }}>
      <svg viewBox="0 0 240 288" width="100%" height="100%">
        <defs>
          <clipPath id={`f${id}`}>
            <path d={body} />
          </clipPath>
          <linearGradient id={`l${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <path d={body} fill="rgba(255,255,255,0.75)" />
        <g clipPath={`url(#f${id})`}>
          <motion.g style={{ y }}>
            <g className="wave wave--back">
              <path
                d="M-240 10 Q-210 -2 -180 10 T-120 10 T-60 10 T0 10 T60 10 T120 10 T180 10 T240 10 T300 10 T360 10 T420 10 T480 10 V300 H-240 Z"
                fill={colors[1]}
                opacity="0.45"
              />
            </g>
            <g className="wave wave--front">
              <path
                d="M-240 14 Q-210 4 -180 14 T-120 14 T-60 14 T0 14 T60 14 T120 14 T180 14 T240 14 T300 14 T360 14 T420 14 T480 14 V300 H-240 Z"
                fill={`url(#l${id})`}
              />
            </g>
          </motion.g>
          {level > 0.04 &&
            bubbles.map((b, i) => (
              <circle
                key={i}
                className="flask__bubble"
                cx={b.x}
                cy={276}
                r={b.r}
                fill="rgba(255,255,255,0.7)"
                style={{ animationDuration: `${b.d}s`, animationDelay: `${b.delay}s` }}
              />
            ))}
        </g>
        <path d={body} fill="none" stroke="#1E1A2B" strokeWidth="6" strokeLinejoin="round" />
        <path d="M46 232 l22 -48" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
        <path d="M150 120 h14 M156 150 h14 M163 180 h14" stroke="#1E1A2B" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      </svg>
      {children}
    </div>
  );
}

export function Confetti({ fire, count = 46 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 380,
        y: -(220 + Math.random() * 300),
        r: (Math.random() - 0.5) * 720,
        c: ["#FF8A3D", "#4F7CFF", "#1FB57A", "#8B5CF6", "#FFD93D", "#FF5D8F"][i % 6],
        w: 6 + Math.random() * 8,
        d: Math.random() * 0.15,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fire, count]
  );
  return (
    <AnimatePresence>
      {fire && (
        <div className="confetti" key={String(fire)}>
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              className="confetti__p"
              style={{ background: p.c, width: p.w, height: p.w * 0.45 }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: p.x, y: [0, p.y, p.y + 520], rotate: p.r, opacity: [1, 1, 0] }}
              transition={{ duration: 1.9, delay: p.d, ease: [0.15, 0.7, 0.4, 1] }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// iOS-style scrolling wheel picker built from scroll-snap.
export function Wheel({ items, value, onChange, width = 80 }) {
  const ref = useRef(null);
  const ITEM = 48;
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const i = Math.max(0, items.indexOf(value));
    if (ref.current) {
      ref.current.scrollTop = i * ITEM;
      setScroll(i * ITEM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const timer = useRef();
  const onScroll = () => {
    const st = ref.current.scrollTop;
    setScroll(st);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const i = Math.round(st / ITEM);
      const v = items[Math.max(0, Math.min(items.length - 1, i))];
      if (v !== value) onChange(v);
    }, 90);
  };
  return (
    <div className="wheel" style={{ width }}>
      <div className="wheel__scroll" ref={ref} onScroll={onScroll}>
        <div style={{ height: ITEM * 2 }} />
        {items.map((it, i) => {
          const dist = Math.abs(i * ITEM - scroll) / ITEM;
          return (
            <div
              key={it}
              className="wheel__item"
              style={{
                opacity: Math.max(0.18, 1 - dist * 0.38),
                transform: `scale(${Math.max(0.72, 1 - dist * 0.12)}) rotateX(${Math.min(60, (i * ITEM - scroll) / 2)}deg)`,
              }}
              onClick={() => ref.current.scrollTo({ top: i * ITEM, behavior: "smooth" })}
            >
              {typeof it === "number" ? String(it).padStart(2, "0") : it}
            </div>
          );
        })}
        <div style={{ height: ITEM * 2 }} />
      </div>
    </div>
  );
}

export function Stagger({ children, delay = 0.08, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: delay, delayChildren: 0.12 } } }}
    >
      {children}
    </motion.div>
  );
}

export const popItem = {
  hidden: { opacity: 0, y: 26, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: bouncy },
};

// Small message at the bottom of the screen, optionally with an Undo action.
export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDone, toast.ms || 4000);
    return () => clearTimeout(id);
  }, [toast, onDone]);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={spring}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo();
                onDone();
              }}
            >
              Undo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Asks before anything that can't be undone.
export function Confirm({ open, title, body, confirm = "Yes", cancel = "Cancel", danger, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={bouncy}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title">{title}</h3>
            <p>{body}</p>
            <div className="modal__btns">
              <Button variant="soft" onClick={onCancel} autoFocus>
                {cancel}
              </Button>
              <Button className={danger ? "btn--danger" : ""} onClick={onConfirm}>
                {confirm}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// The phone frame that pop-ups render into. Resolved after mount so a pop-up that is
// open on the very first render still lands inside the frame, not on <body>.
export function useDeviceRoot() {
  const [root, setRoot] = useState(null);
  useEffect(() => setRoot(document.querySelector(".device") || document.body), []);
  return root;
}

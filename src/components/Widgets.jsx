import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { bouncy } from "./ui.jsx";

// Hands-on experiments that live inside story lessons.
export default function Widget({ name }) {
  if (name === "neuron") return <Neuron />;
  if (name === "tokens") return <Tokens />;
  if (name === "nextword") return <NextWord />;
  if (name === "attention") return <Attention />;
  return null;
}

/* ---------- Perceptron: two inputs, two weights, one threshold ---------- */
function Neuron() {
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0);
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [th, setTh] = useState(1.5);
  const sum = x1 * w1 + x2 * w2;
  const fire = sum >= th;
  return (
    <div className="wdg">
      <div className="wdg__title">🧪 Try it: the Tiny Voter decides "Go to the park?"</div>
      <div className="neuron">
        <div className="neuron__ins">
          <Toggle on={!!x1} onClick={() => setX1(x1 ? 0 : 1)} label="☀️ Sunny" />
          <Toggle on={!!x2} onClick={() => setX2(x2 ? 0 : 1)} label="📚 Homework done" />
        </div>
        <svg viewBox="0 0 120 90" className="neuron__wires" aria-hidden>
          <path d="M0 22 C50 22 60 45 92 45" stroke={x1 ? "#FF8A3D" : "#ddd2c4"} strokeWidth={2 + Math.abs(w1) * 2} fill="none" />
          <path d="M0 68 C50 68 60 45 92 45" stroke={x2 ? "#FF8A3D" : "#ddd2c4"} strokeWidth={2 + Math.abs(w2) * 2} fill="none" />
        </svg>
        <motion.div className={`neuron__cell ${fire ? "neuron__cell--on" : ""}`} animate={fire ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={bouncy}>
          <b>{sum.toFixed(1)}</b>
          <small>{fire ? "GO! ✓" : "stay"}</small>
        </motion.div>
      </div>
      <Slider label="How much sun matters" value={w1} min={-2} max={2} step={0.5} onChange={setW1} />
      <Slider label="How much homework matters" value={w2} min={-2} max={2} step={0.5} onChange={setW2} />
      <Slider label="Bar to decide 'go'" value={th} min={0} max={3} step={0.5} onChange={setTh} />
      <p className="wdg__note">
        Sum = {x1}×{w1} + {x2}×{w2} = <b>{sum.toFixed(1)}</b> {fire ? "≥" : "<"} bar {th}. Change the weights until the voter only says GO when both are true.
      </p>
    </div>
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button className={`tog ${on ? "tog--on" : ""}`} onClick={onClick} aria-pressed={on}>
      {label} <b>{on ? "1" : "0"}</b>
    </button>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="sld">
      <span>
        {label} <b>{value}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/* ---------- Tokenizer: greedy longest-match over a small subword vocabulary ---------- */
const VOCAB = [
  "story", "tell", "teller", "ing", "un", "believ", "able", "robot", "learn", "er", "ed", "s", "the", "re", "machine", "token", "iz", "ation",
  "once", "upon", "time", "dragon", "happy", "ness", "play", "ful", "ly", "dis", "cover", "y", "a", "an", "and", "is", "in", "on", "it", "to",
  "of", "tale", "word", "pre", "dict", "ion", "think", "ai", "chat", "bot", "super", "cal", "i", "fr", "ag", "ist", "ic", "ex", "pi", "ali", "do", "ci", "ous",
];
function tokenize(text) {
  const out = [];
  const words = text.toLowerCase().match(/\s+|[a-z]+|[^a-z\s]/g) || [];
  for (const w of words) {
    if (/^\s+$/.test(w) || !/[a-z]/.test(w)) {
      out.push(w === " " ? "␣" : w);
      continue;
    }
    let i = 0;
    while (i < w.length) {
      let hit = w[i];
      for (const v of VOCAB) if (v.length > hit.length && w.startsWith(v, i)) hit = v;
      out.push(hit);
      i += hit.length;
    }
  }
  return out;
}
const hue = (t) => [...t].reduce((a, c) => a + c.charCodeAt(0) * 37, 0) % 360;
const tokenId = (t) => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 50000, 7);

function Tokens() {
  const [text, setText] = useState("Unbelievable storytelling!");
  const toks = useMemo(() => tokenize(text), [text]);
  return (
    <div className="wdg">
      <div className="wdg__title">🧪 Try it: type anything and watch it get chopped into tokens</div>
      <input className="wdg__input" value={text} onChange={(e) => setText(e.target.value.slice(0, 60))} aria-label="Text to tokenize" />
      <div className="toks" aria-live="polite">
        <AnimatePresence initial={false}>
          {toks.map((t, k) => (
            <motion.span
              key={k + t}
              className="tok"
              style={{ background: `hsl(${hue(t)} 85% 88%)`, borderColor: `hsl(${hue(t)} 60% 60%)` }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={bouncy}
            >
              {t}
              <small>{tokenId(t)}</small>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <p className="wdg__note">
        {text.length} letters became <b>{toks.length} tokens</b>. Common chunks like "story" or "ing" stay whole; rare words split into smaller pieces.
      </p>
    </div>
  );
}

/* ---------- Bigram storyteller: pick the next word from probabilities ---------- */
const BIGRAMS = {
  START: { Once: 0.7, The: 0.3 },
  Once: { upon: 0.9, more: 0.1 },
  upon: { a: 1 },
  more: { "the": 1 },
  a: { time: 0.5, robot: 0.3, dragon: 0.2 },
  time: { "a": 0.4, there: 0.6 },
  there: { lived: 0.7, was: 0.3 },
  lived: { a: 1 },
  was: { a: 1 },
  The: { robot: 0.5, dragon: 0.3, moon: 0.2 },
  the: { robot: 0.5, moon: 0.5 },
  robot: { dreamed: 0.4, laughed: 0.3, "." : 0.3 },
  dragon: { sang: 0.5, slept: 0.3, ".": 0.2 },
  moon: { smiled: 0.6, ".": 0.4 },
  dreamed: { of: 1 },
  of: { the: 0.6, a: 0.4 },
  laughed: { ".": 1 },
  sang: { to: 0.6, ".": 0.4 },
  to: { the: 1 },
  slept: { ".": 1 },
  smiled: { ".": 1 },
};

function NextWord() {
  const [words, setWords] = useState([]);
  const [temp, setTemp] = useState(1);
  const last = words.length ? words[words.length - 1] : "START";
  const done = last === ".";
  const opts = BIGRAMS[last] || { ".": 1 };
  const scaled = useMemo(() => {
    const e = Object.entries(opts).map(([w, p]) => [w, Math.pow(p, 1 / temp)]);
    const z = e.reduce((a, [, p]) => a + p, 0);
    return e.map(([w, p]) => [w, p / z]).sort((a, b) => b[1] - a[1]);
  }, [opts, temp]);
  const sample = () => {
    let r = Math.random();
    for (const [w, p] of scaled) {
      if ((r -= p) <= 0) return setWords((x) => [...x, w]);
    }
    setWords((x) => [...x, scaled[0][0]]);
  };
  return (
    <div className="wdg">
      <div className="wdg__title">🧪 Try it: help Tale tell a story, one word at a time</div>
      <div className="story-line" aria-live="polite">
        {words.length ? words.join(" ").replace(" .", ".") : <i>Pick the first word…</i>}
        {!done && <span className="caret" />}
      </div>
      {!done ? (
        <>
          <div className="nw">
            {scaled.map(([w, p]) => (
              <button key={w} className="nw__opt" onClick={() => setWords((x) => [...x, w])}>
                <span className="nw__bar" style={{ width: `${Math.round(p * 100)}%` }} />
                <b>{w === "." ? "· end ·" : w}</b>
                <small>{Math.round(p * 100)}%</small>
              </button>
            ))}
          </div>
          <div className="wdg__row">
            <button className="chipbtn" onClick={sample}>🎲 Let Tale pick</button>
            <Slider label="Temperature (surprise)" value={temp} min={0.3} max={2} step={0.1} onChange={setTemp} />
          </div>
        </>
      ) : (
        <button className="chipbtn" onClick={() => setWords([])}>↺ Tell another story</button>
      )}
      <p className="wdg__note">Tale only looks at the last word to guess the next one. That is a bigram model, the very first step toward a real storyteller.</p>
    </div>
  );
}

/* ---------- Attention: tap a word to see who it listens to ---------- */
const SENT = ["The", "robot", "read", "the", "book", "because", "it", "was", "curious"];
const ATT = {
  it: { robot: 0.75, book: 0.15, curious: 0.1 },
  curious: { it: 0.45, robot: 0.4, was: 0.15 },
  read: { robot: 0.45, book: 0.45, The: 0.1 },
  book: { read: 0.5, the: 0.3, robot: 0.2 },
  was: { it: 0.6, curious: 0.4 },
  robot: { The: 0.4, read: 0.4, it: 0.2 },
  because: { read: 0.4, was: 0.3, it: 0.3 },
};
function Attention() {
  const [sel, setSel] = useState("it");
  const w = ATT[sel] || {};
  return (
    <div className="wdg">
      <div className="wdg__title">🧪 Try it: tap a word to see which words it pays attention to</div>
      <div className="att">
        {SENT.map((t, k) => {
          const a = t === sel ? 1 : w[t] || 0.04;
          return (
            <button
              key={k}
              className={`att__w ${t === sel ? "att__w--sel" : ""}`}
              onClick={() => setSel(t)}
              style={{ background: t === sel ? "var(--ink)" : `rgba(255,138,61,${a})`, color: t === sel ? "#fff" : "var(--ink)" }}
            >
              {t}
              {t !== sel && a > 0.05 && <small>{Math.round(a * 100)}%</small>}
            </button>
          );
        })}
      </div>
      <p className="wdg__note">
        "<b>{sel}</b>" listens most to "<b>{Object.entries(w).sort((a, b) => b[1] - a[1])[0]?.[0] || "itself"}</b>". That's how a transformer figures out that "it" means the robot.
      </p>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Character from "../components/Character.jsx";
import { Bubble, Button, Confetti, bouncy, spring, useMouth } from "../components/ui.jsx";
import { TEACHERS } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";
import { LESSONS } from "../lib/course.js";

// "Lost in the Fog": an interactive visual story about gradient descent.
// The learner acts first; the teacher speaks at fixed moments and asks
// questions instead of handing out answers.

const f = (x) => 0.05 * x ** 4 - 0.9 * x ** 2 + 0.35 * x + 5;
const df = (x) => 0.2 * x ** 3 - 1.8 * x + 0.35;
const X0 = -4.4, X1 = 4.4, Y0 = -0.8, Y1 = 7.4;
const W = 340, H = 250;
const px = (x) => 10 + ((x - X0) / (X1 - X0)) * (W - 20);
const py = (y) => H - 18 - ((y - Y0) / (Y1 - Y0)) * (H - 40);

const INTRO = {
  fog: "We're lost in the fog on a mountain. Our goal is to reach the lowest ground. First, use the probe stick to feel the slope under your feet.",
  strides: "Today you control my stride. A long stride is fast, but is it safe? Feel the slope, set a stride, and let's find out.",
  lake: "Let's walk down again. This time, keep asking yourself: is where we stop really the lowest point?",
  neuron: "Before neurons, let's warm up with our foggy mountain. Feel the slope and walk us down.",
  chain: "Let's warm up on our foggy mountain. Feel the slope and walk us down.",
};

export default function FogLesson({ profile, lessonId, onClose, onComplete, onExplain }) {
  const t = TEACHERS[profile.teacher];
  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const { mouth, talking } = useMouth();
  const [x, setX] = useState(4.0);
  const [lr, setLr] = useState(0.25);
  const [felt, setFelt] = useState(false);
  const [line, setLine] = useState(INTRO[lessonId] || INTRO.fog);
  const [mood, setMood] = useState("idle");
  const [trail, setTrail] = useState([4.0]);
  const [lifted, setLifted] = useState(false);
  const [atLake, setAtLake] = useState(false);
  const [done, setDone] = useState(false);
  const [fire, setFire] = useState(0);
  const [hits, setHits] = useState({ up: 0, over: 0, down: 0 });
  const said = useRef(new Set());

  const say = (text, m = "idle", once) => {
    if (once) {
      if (said.current.has(once)) return;
      said.current.add(once);
    }
    setLine(text);
    setMood(m);
    speaker.teacher = t.id;
    speaker.say(text);
  };

  useEffect(() => {
    const id = setTimeout(() => say(INTRO[lessonId] || INTRO.fog), 500);
    return () => {
      clearTimeout(id);
      speaker.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slope = df(x);
  const loss = f(x);
  const uphillRight = slope > 0;

  const feel = () => {
    setFelt(true);
    say(
      `Feel that? The ground rises to the ${uphillRight ? "right" : "left"}. Which way will you step?`,
      "listening"
    );
  };

  const step = (dir) => {
    if (atLake || done) return;
    const g = df(x);
    const size = lr * Math.abs(g);
    const nx = Math.max(X0 + 0.1, Math.min(X1 - 0.1, x + dir * size));
    const wentDown = f(nx) < f(x);
    const overshoot = Math.sign(df(nx)) !== Math.sign(g) && Math.abs(nx - x) > 0.05 && wentDown === false;
    setX(nx);
    setTrail((tr) => [...tr, nx]);

    if (!wentDown && Math.sign(dir) === Math.sign(g)) {
      setHits((h) => ({ ...h, up: h.up + 1 }));
      if (hits.up === 0) say("Hmm, we went up. Why did you choose that way?", "thinking");
      else say("Up again. Remember, the probe points uphill. What happens if we step the opposite way?", "thinking");
      return;
    }
    if (overshoot || (lr > 0.42 && Math.sign(df(nx)) !== Math.sign(g))) {
      setHits((h) => ({ ...h, over: h.over + 1 }));
      if (hits.over === 0) say("Whoa! We leapt right across the valley. What do you think went wrong?", "thinking");
      else say("Another giant leap. What could you change about my stride?", "thinking");
      return;
    }
    setHits((h) => ({ ...h, down: h.down + 1 }));
    if (Math.abs(df(nx)) < 0.12 && Math.abs(nx) > 1.5) {
      setAtLake(true);
      say("We've reached a little mountain lake. The ground is flat here. But tell me: is this the lowest point on the whole mountain?", "thinking");
      return;
    }
    if (Math.sign(df(nx)) !== Math.sign(g)) {
      say("Down, but we stepped right over the lowest spot! Now the ground tilts the other way. Feel it again before your next step.", "thinking");
      return;
    }
    if (hits.down === 0) say("Down we go! Notice we stepped opposite to the slope. Keep going.", "happy");
    else if (hits.down === 2) say("See how the steps get shorter as the ground flattens? Interesting, isn't it?", "happy", "shorter");
  };

  const lift = () => {
    setLifted(true);
    say(
      "Surprise! There's a deeper valley we couldn't see. A machine learns exactly like this: the mountain is its error, and every step downhill makes it a little less wrong.",
      "happy"
    );
    setTimeout(() => setDone(true), 1200);
  };

  const finish = () => {
    setFire((v) => v + 1);
    onComplete(lesson);
  };

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const xx = X0 + (i / 120) * (X1 - X0);
      d += `${i ? "L" : "M"}${px(xx).toFixed(1)} ${py(f(xx)).toFixed(1)} `;
    }
    return d;
  }, []);
  const ground = `${path} L${W - 10} ${H} L10 ${H} Z`;
  const cx = px(x), cy = py(loss);
  const tan = (() => {
    const dx = 0.7;
    return { x1: px(x - dx), y1: py(loss - slope * dx), x2: px(x + dx), y2: py(loss + slope * dx) };
  })();

  return (
    <motion.div
      className="lesson"
      style={{ "--accent": t.color, "--accent-deep": t.deep, "--accent-soft": t.soft }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <Confetti fire={fire} />
      <div className="tutor__top">
        <motion.button className="iconbtn" onClick={onClose} whileTap={{ scale: 0.85 }} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </motion.button>
        <div className="tutor__who">
          <b>{lesson.title}</b>
          <span>{lesson.topic}</span>
        </div>
        <div className="lossmeter">
          <small>Height</small>
          <motion.b key={loss.toFixed(2)} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={bouncy}>
            {loss.toFixed(2)}
          </motion.b>
        </div>
      </div>

      <div className="scene">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="scene__svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#CFE6FF" />
              <stop offset="1" stopColor="#FFF4E6" />
            </linearGradient>
            <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7DD87F" />
              <stop offset="1" stopColor="#3E9B5B" />
            </linearGradient>
            <radialGradient id="hole">
              <stop offset="0.45" stopColor="#000" />
              <stop offset="1" stopColor="#fff" />
            </radialGradient>
            <mask id="fogmask">
              <rect width={W} height={H} fill="#fff" />
              <motion.circle r="70" fill="url(#hole)" animate={{ cx, cy: cy - 10 }} transition={{ type: "spring", stiffness: 120, damping: 16 }} />
            </mask>
          </defs>
          <rect width={W} height={H} fill="url(#sky)" />
          <path d={ground} fill="url(#hill)" />
          <path d={path} fill="none" stroke="#2F7A47" strokeWidth="3" />
          <ellipse cx={px(2.9)} cy={py(f(2.9)) + 2} rx="20" ry="5" fill="#59B7FF" opacity="0.9" />
          <ellipse cx={px(-3.09)} cy={py(f(-3.09)) + 2} rx="26" ry="6" fill="#59B7FF" opacity="0.9" />
          {lifted && (
            <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...bouncy, delay: 0.8 }} style={{ transformOrigin: `${px(-3.09)}px ${py(f(-3.09))}px` }}>
              <text x={px(-3.09)} y={py(f(-3.09)) - 14} textAnchor="middle" className="scene__flag">Lowest point ⛳</text>
            </motion.g>
          )}
          {/* footprints */}
          {trail.map((tx, k) => (
            <motion.circle key={k} cx={px(tx)} cy={py(f(tx))} r="3.2" fill="#1E1A2B" initial={{ scale: 0 }} animate={{ scale: 1, opacity: 0.35 }} transition={bouncy} />
          ))}
          {felt && !lifted && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line {...tan} stroke="#FF5D8F" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 7" />
              <motion.text
                x={uphillRight ? tan.x2 : tan.x1}
                y={(uphillRight ? tan.y2 : tan.y1) - 8}
                textAnchor="middle"
                className="scene__up"
                animate={{ y: [(uphillRight ? tan.y2 : tan.y1) - 8, (uphillRight ? tan.y2 : tan.y1) - 14] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
              >
                ↑ up
              </motion.text>
            </motion.g>
          )}
          <motion.g animate={{ opacity: lifted ? 0 : 1 }} transition={{ duration: 1.6 }}>
            <rect width={W} height={H} fill="#EEF1F5" opacity="0.97" mask="url(#fogmask)" />
            <g className="fog-drift" mask="url(#fogmask)">
              <ellipse cx="60" cy="60" rx="90" ry="26" fill="#fff" opacity="0.7" />
              <ellipse cx="260" cy="120" rx="110" ry="30" fill="#fff" opacity="0.6" />
              <ellipse cx="140" cy="200" rx="120" ry="24" fill="#fff" opacity="0.6" />
            </g>
          </motion.g>
          <motion.g animate={{ x: cx - 22, y: cy - 58 }} initial={false} transition={{ type: "spring", stiffness: 140, damping: 13 }}>
            <foreignObject width="44" height="58">
              <Character teacher={t.id} size={44} mood={mood === "happy" ? "happy" : "idle"} />
            </foreignObject>
          </motion.g>
        </svg>
        <AnimatePresence>
          {lifted && (
            <motion.div className="formula" initial={{ y: 30, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ ...bouncy, delay: 1.4 }}>
              <small>What you just did</small>
              <b>new spot = spot − stride × slope</b>
              <span>x ← x − η · ∇L(x)</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="coach">
        <motion.div className="coach__char" animate={talking ? { y: [0, -3, 0] } : {}} transition={{ duration: 0.4, repeat: talking ? Infinity : 0 }}>
          <Character teacher={t.id} size={86} mood={talking ? "talking" : mood} mouth={mouth} />
        </motion.div>
        <AnimatePresence mode="wait">
          <Bubble key={line} text={line} from="left" className="coach__bubble" speed={16} />
        </AnimatePresence>
      </div>

      <div className="controls">
        {!lifted && !atLake && (
          <>
            <div className="stride">
              <span>Stride</span>
              <input type="range" min="0.05" max="0.6" step="0.01" value={lr} onChange={(e) => setLr(Number(e.target.value))} style={{ "--p": `${((lr - 0.05) / 0.55) * 100}%` }} />
              <b>{lr < 0.15 ? "Tiny" : lr < 0.32 ? "Normal" : lr < 0.45 ? "Long" : "Giant"}</b>
            </div>
            <div className="steprow">
              <Button variant="soft" onClick={() => step(-1)}>◀ Step</Button>
              <Button variant={felt ? "soft" : "primary"} onClick={feel}>🦯 Feel</Button>
              <Button variant="soft" onClick={() => step(1)}>Step ▶</Button>
            </div>
          </>
        )}
        {atLake && !lifted && <Button onClick={lift}>☀️ Lift the fog</Button>}
        {done && (
          <motion.div className="steprow steprow--col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <Button onClick={() => { finish(); onExplain(); }}>🎙️ Explain it back to {t.short}</Button>
            <Button variant="ghost" onClick={() => { finish(); onClose(); }}>Finish lesson (+50 XP)</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

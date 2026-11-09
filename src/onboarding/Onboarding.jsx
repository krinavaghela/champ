import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Character from "../components/Character.jsx";
import { LogoMark } from "../components/Logo.jsx";
import { Bubble, Button, Confetti, Flask, TopBar, Wheel, Stagger, popItem, bouncy, spring, useMouth } from "../components/ui.jsx";
import { TEACHERS, TEACHER_LIST } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";

const STEPS = [
  "splash", "welcome", "name", "teacher", "meet", "subjects", "level", "goal",
  "minutes", "reminder", "placement", "building", "ready", "permissions",
];

export default function Onboarding({ profile, setProfile, onDone }) {
  const [i, setI] = useState(() => {
    const q = new URLSearchParams(location.search).get("step");
    const k = q == null ? -1 : isNaN(q) ? STEPS.indexOf(q) : Number(q);
    return k >= 0 && k < STEPS.length ? k : 0;
  });
  const [dir, setDir] = useState(1);
  const go = (d) => {
    setDir(d);
    setI((x) => Math.max(0, Math.min(STEPS.length - 1, x + d)));
  };
  const next = () => (i === STEPS.length - 1 ? onDone() : go(1));
  const back = i > 2 ? () => go(-1) : undefined;
  const step = STEPS[i];
  const t = TEACHERS[profile.teacher];
  const showBar = i >= 2 && step !== "building" && step !== "ready";

  useEffect(() => () => speaker.cancel(), []);

  return (
    <div className="screen" style={{ "--accent": t.color, "--accent-deep": t.deep, "--accent-soft": t.soft }}>
      <motion.div
        className="screen__bg"
        initial={false}
        animate={{ background: step === "teacher" || step === "meet" ? t.soft : "#FFF6EC" }}
        transition={{ duration: 0.5 }}
      />
      {showBar && <TopBar step={i - 1} total={STEPS.length - 3} onBack={back} />}
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.div
          key={step}
          className="step"
          custom={dir}
          variants={{
            enter: (d) => ({ x: d > 0 ? 120 : -120, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d > 0 ? -120 : 120, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 32 }, opacity: { duration: 0.22 } }}
        >
          {step === "splash" && <Splash onNext={next} />}
          {step === "welcome" && <Welcome onNext={next} onSkip={onDone} />}
          {step === "name" && <NameStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "teacher" && <TeacherStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "meet" && <MeetStep profile={profile} onNext={next} />}
          {step === "subjects" && <SubjectsStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "level" && <LevelStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "goal" && <GoalStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "minutes" && <MinutesStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "reminder" && <ReminderStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "placement" && <PlacementStep profile={profile} setProfile={setProfile} onNext={next} />}
          {step === "building" && <BuildingStep profile={profile} onNext={next} />}
          {step === "ready" && <ReadyStep profile={profile} onNext={next} />}
          {step === "permissions" && <PermissionsStep profile={profile} onNext={next} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- helpers */

function Header({ title, sub }) {
  return (
    <div className="head">
      <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...bouncy, delay: 0.05 }}>
        {title}
      </motion.h1>
      {sub && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.14 }}>
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function Footer({ children }) {
  return (
    <motion.div className="footer" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.2 }}>
      {children}
    </motion.div>
  );
}

function Option({ selected, onClick, icon, title, sub, check = "radio" }) {
  return (
    <motion.button
      variants={popItem}
      className={`opt ${selected ? "opt--on" : ""}`}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={bouncy}
    >
      {icon && <span className="opt__icon">{icon}</span>}
      <span className="opt__txt">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <span className={`opt__check opt__check--${check}`}>
        <AnimatePresence>
          {selected && (
            <motion.svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={bouncy}
            >
              <path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

function PeekTeacher({ teacher, mood = "idle", say, size = 120 }) {
  return (
    <div className="peek">
      <motion.div initial={{ y: 80, rotate: -8 }} animate={{ y: 0, rotate: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
        <Character teacher={teacher} mood={mood} size={size} />
      </motion.div>
      <AnimatePresence mode="wait">{say && <Bubble key={say} text={say} from="left" className="peek__bubble" />}</AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- steps */

function Splash({ onNext }) {
  useEffect(() => {
    const id = setTimeout(onNext, 2600);
    return () => clearTimeout(id);
  }, [onNext]);
  const letters = "Champ".split("");
  return (
    <div className="splash" onClick={onNext}>
      <motion.div
        className="splash__sun"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      />
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.1 }} className="splash__mark">
        <LogoMark size={96} animate />
      </motion.div>
      <div className="splash__logo">
        {letters.map((l, k) => (
          <motion.span
            key={k}
            initial={{ y: 60, opacity: 0, rotate: -20 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ ...bouncy, delay: 0.25 + k * 0.05 }}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <motion.p className="splash__tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        Learn. Think. Create. Grow.
      </motion.p>
      <div className="splash__cast">
        {TEACHER_LIST.map((tt, k) => (
          <motion.div
            key={tt.id}
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 + k * 0.12 }}
          >
            <Character teacher={tt.id} size={TEACHER_LIST.length > 4 ? 72 : 92} mood={k % 2 ? "happy" : "idle"} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Welcome({ onNext, onSkip }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((x) => (x + 1) % TEACHER_LIST.length), 2400);
    return () => clearInterval(id);
  }, []);
  const tt = TEACHER_LIST[k];
  return (
    <div className="welcome">
      <div className="welcome__stage">
        <motion.div className="welcome__blob" animate={{ background: tt.soft }} transition={{ duration: 0.6 }} />
        <motion.div className="welcome__ring" animate={{ borderColor: tt.color, rotate: 360 }} transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, borderColor: { duration: 0.6 } }} />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={tt.id}
            initial={{ scale: 0.3, y: 60, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, y: -40, opacity: 0, rotate: 10 }}
            transition={bouncy}
            className="welcome__char"
          >
            <Character teacher={tt.id} size={210} mood="happy" wave />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={tt.id + "n"}
            className="welcome__tag"
            style={{ background: tt.color }}
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -4 }}
            exit={{ scale: 0 }}
            transition={bouncy}
          >
            {tt.name}
          </motion.div>
        </AnimatePresence>
      </div>
      <Header
        title={<>A school with history's greatest teachers</>}
        sub="Learn AI through stories, with Einstein, Curie, Turing and more by your side. Endlessly patient, always listening, never rushing you."
      />
      <Footer>
        <Button onClick={onNext}>Get started</Button>
        <Button variant="ghost" onClick={onSkip}>
          I already have an account
        </Button>
        <p className="disclaimer">Teachers are cartoon AI characters inspired by real people. They are not the real people.</p>
      </Footer>
    </div>
  );
}

function NameStep({ profile, setProfile, onNext }) {
  const ref = useRef(null);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 450);
    return () => clearTimeout(id);
  }, []);
  const ok = profile.name.trim().length > 0;
  return (
    <>
      <PeekTeacher teacher={profile.teacher} mood={ok ? "happy" : "listening"} say={ok ? `Lovely to meet you, ${profile.name.trim()}!` : "Hi there! What should we call you?"} />
      <Header title="What's your name?" />
      <motion.div className="field" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...bouncy, delay: 0.2 }}>
        <input
          ref={ref}
          value={profile.name}
          maxLength={24}
          placeholder="Your first name"
          onChange={(e) => setProfile({ name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && ok && onNext()}
        />
      </motion.div>
      <Footer>
        <Button disabled={!ok} onClick={onNext}>
          Continue
        </Button>
      </Footer>
    </>
  );
}

function TeacherStep({ profile, setProfile, onNext }) {
  const idx = TEACHER_LIST.findIndex((x) => x.id === profile.teacher);
  const x = useMotionValue(0);
  const W = 262;
  useEffect(() => {
    animate(x, -idx * W, { type: "spring", stiffness: 300, damping: 30 });
  }, [idx, x]);
  const select = (k) => {
    const n = (k + TEACHER_LIST.length) % TEACHER_LIST.length;
    speaker.cancel();
    setProfile({ teacher: TEACHER_LIST[n].id });
  };
  const t = TEACHERS[profile.teacher];
  return (
    <>
      <Header title="Choose your teacher" sub="Swipe to meet them. You can switch any time." />
      <div className="carousel">
        <motion.div
          className="carousel__track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(TEACHER_LIST.length - 1) * W, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            const k = Math.round((-x.get() - info.velocity.x * 0.12) / W);
            select(Math.max(0, Math.min(TEACHER_LIST.length - 1, k)));
            if (k === idx) animate(x, -idx * W, { type: "spring", stiffness: 300, damping: 30 });
          }}
        >
          {TEACHER_LIST.map((tt, k) => (
            <motion.div
              key={tt.id}
              className="tcard"
              animate={{ scale: k === idx ? 1 : 0.86, opacity: k === idx ? 1 : 0.55, rotate: k === idx ? 0 : k < idx ? -4 : 4 }}
              transition={spring}
              onClick={() => select(k)}
              style={{ "--c": tt.color, "--cs": tt.soft }}
            >
              <div className="tcard__art">
                <Character teacher={tt.id} size={150} mood={k === idx ? "happy" : "idle"} />
              </div>
              <h3>{tt.name}</h3>
              <span className="tcard__field">{tt.field}</span>
              <p>“{tt.tagline}”</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="dots">
        {TEACHER_LIST.map((tt, k) => (
          <motion.span key={tt.id} animate={{ width: k === idx ? 22 : 8, background: k === idx ? t.color : "#D9CFC3" }} onClick={() => select(k)} />
        ))}
      </div>
      <Footer>
        <Button variant="soft" onClick={() => { speaker.teacher = t.id; speaker.say(t.hello); }}>
          <SpeakerIcon /> Hear {t.short}'s voice
        </Button>
        <Button onClick={() => { speaker.cancel(); onNext(); }}>Learn with {t.short}</Button>
      </Footer>
    </>
  );
}

function MeetStep({ profile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const { mouth, talking } = useMouth();
  const line = `Nice to meet you, ${profile.name || "friend"}! ${t.hello}`;
  useEffect(() => {
    speaker.teacher = t.id;
    const id = setTimeout(() => speaker.say(line), 500);
    return () => {
      clearTimeout(id);
      speaker.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="meet">
      <Bubble text={line} from="bottom" className="meet__bubble" speed={22} />
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}
        className="meet__char"
      >
        <Character teacher={t.id} size={250} mood={talking ? "talking" : "happy"} mouth={mouth} wave={!talking} />
      </motion.div>
      <motion.div className="meet__floor" style={{ background: t.color }} />
      <Footer>
        <Button onClick={() => { speaker.cancel(); onNext(); }}>Nice to meet you too!</Button>
      </Footer>
    </div>
  );
}

const SUBJECTS = [
  { id: "ai", icon: "🤖", title: "AI & Machine Learning" },
  { id: "math", icon: "📐", title: "Mathematics" },
  { id: "physics", icon: "🪐", title: "Physics" },
  { id: "chem", icon: "⚗️", title: "Chemistry" },
  { id: "cs", icon: "💻", title: "Computer Science" },
  { id: "bio", icon: "🧬", title: "Biology" },
];

function SubjectsStep({ profile, setProfile, onNext }) {
  const toggle = (id) =>
    setProfile({ subjects: profile.subjects.includes(id) ? profile.subjects.filter((s) => s !== id) : [...profile.subjects, id] });
  return (
    <>
      <Header title="What do you want to learn?" sub="Pick as many as you like." />
      <Stagger className="grid2" delay={0.06}>
        {SUBJECTS.map((s) => {
          const on = profile.subjects.includes(s.id);
          return (
            <motion.button
              key={s.id}
              variants={popItem}
              className={`tile ${on ? "tile--on" : ""}`}
              onClick={() => toggle(s.id)}
              whileTap={{ scale: 0.92 }}
            >
              <motion.span className="tile__icon" animate={on ? { rotate: [0, -14, 12, 0], scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.45 }}>
                {s.icon}
              </motion.span>
              <b>{s.title}</b>
            </motion.button>
          );
        })}
      </Stagger>
      <Footer>
        <Button disabled={!profile.subjects.length} onClick={onNext}>
          Continue
        </Button>
      </Footer>
    </>
  );
}

const LEVELS = [
  { id: "new", title: "Brand new", sub: "I'm just curious", bars: 1 },
  { id: "some", title: "I know a little", sub: "I remember some school maths", bars: 2 },
  { id: "good", title: "Fairly comfortable", sub: "I can follow equations", bars: 3 },
  { id: "pro", title: "Advanced", sub: "I study or work in this area", bars: 4 },
];

function Bars({ n }) {
  return (
    <span className="bars">
      {[1, 2, 3, 4].map((b) => (
        <i key={b} style={{ height: 6 + b * 5, opacity: b <= n ? 1 : 0.2 }} />
      ))}
    </span>
  );
}

function LevelStep({ profile, setProfile, onNext }) {
  return (
    <>
      <Header title="How much do you already know?" sub="Your teacher will start exactly where you are." />
      <Stagger className="list">
        {LEVELS.map((l) => (
          <Option key={l.id} icon={<Bars n={l.bars} />} title={l.title} sub={l.sub} selected={profile.level === l.id} onClick={() => setProfile({ level: l.id })} />
        ))}
      </Stagger>
      <Footer>
        <Button disabled={!profile.level} onClick={onNext}>
          Continue
        </Button>
      </Footer>
    </>
  );
}

const GOALS = [
  { id: "career", icon: "💼", title: "Boost my career" },
  { id: "school", icon: "🎓", title: "Do better at school" },
  { id: "curious", icon: "✨", title: "Pure curiosity" },
  { id: "build", icon: "🛠️", title: "Build something with AI" },
  { id: "kids", icon: "🧒", title: "Help my kids learn" },
];

function GoalStep({ profile, setProfile, onNext }) {
  return (
    <>
      <Header title="Why are you learning?" />
      <Stagger className="list">
        {GOALS.map((g) => (
          <Option key={g.id} icon={<span className="emoji">{g.icon}</span>} title={g.title} selected={profile.goal === g.id} onClick={() => setProfile({ goal: g.id })} />
        ))}
      </Stagger>
      <Footer>
        <Button disabled={!profile.goal} onClick={onNext}>
          Continue
        </Button>
      </Footer>
    </>
  );
}

const MINUTES = [
  { m: 5, label: "Casual" },
  { m: 10, label: "Regular" },
  { m: 15, label: "Serious" },
  { m: 20, label: "Intense" },
  { m: 30, label: "Genius mode" },
];

function MinutesStep({ profile, setProfile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const cur = MINUTES.find((x) => x.m === profile.minutes) || MINUTES[2];
  return (
    <>
      <Header title="Set your daily goal" sub="Fill the flask every day to keep your streak." />
      <div className="minutes">
        <Flask level={cur.m / 30} colors={t.liquid} size={150}>
          <motion.div key={cur.m} className="flask__label" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={bouncy}>
            {cur.m}
            <small>min</small>
          </motion.div>
        </Flask>
        <div className="minutes__char">
          <Character teacher={t.id} size={110} mood={cur.m >= 20 ? "happy" : "idle"} />
        </div>
      </div>
      <Stagger className="chips">
        {MINUTES.map((x) => (
          <motion.button
            key={x.m}
            variants={popItem}
            className={`chip ${x.m === cur.m ? "chip--on" : ""}`}
            onClick={() => setProfile({ minutes: x.m })}
            whileTap={{ scale: 0.9 }}
          >
            <b>{x.m} min</b>
            <small>{x.label}</small>
          </motion.button>
        ))}
      </Stagger>
      <Footer>
        <Button onClick={onNext}>Commit to {cur.m} min a day</Button>
      </Footer>
    </>
  );
}

function ReminderStep({ profile, setProfile, onNext }) {
  const r = profile.reminder;
  const hours = useMemo(() => Array.from({ length: 12 }, (_, k) => k + 1), []);
  const mins = useMemo(() => Array.from({ length: 12 }, (_, k) => k * 5), []);
  return (
    <>
      <Header title="When should we study?" sub={`${TEACHERS[profile.teacher].short} will gently remind you.`} />
      <motion.div className="bell" animate={{ rotate: [0, -16, 14, -10, 8, 0] }} transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.6 }}>
        <svg viewBox="0 0 64 64" width="70" height="70">
          <path d="M32 8a4 4 0 0 1 4 4v2c8 2 13 9 13 18v10l5 6H10l5-6V32c0-9 5-16 13-18v-2a4 4 0 0 1 4-4Z" fill="#FFD93D" stroke="#1E1A2B" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="32" cy="54" r="5" fill="#1E1A2B" />
        </svg>
      </motion.div>
      <div className="wheels">
        <div className="wheels__hl" />
        <Wheel items={hours} value={r.h} onChange={(h) => setProfile({ reminder: { ...r, h } })} />
        <span className="wheels__colon">:</span>
        <Wheel items={mins} value={r.m} onChange={(m) => setProfile({ reminder: { ...r, m } })} />
        <Wheel items={["AM", "PM"]} value={r.ampm} onChange={(ampm) => setProfile({ reminder: { ...r, ampm } })} width={70} />
      </div>
      <Footer>
        <Button onClick={onNext}>Set reminder</Button>
      </Footer>
    </>
  );
}

const QUESTIONS = [
  {
    q: "You're standing on a hill in thick fog. You can only feel the ground under your feet. How do you get to the bottom?",
    options: ["Walk where the ground slopes down", "Walk in a random direction", "Stand still and wait"],
    correct: 0,
    hint: "Think about what your feet can tell you. Which way does the ground tilt?",
  },
  {
    q: "For the curve y = x², how steep is it at x = 3?",
    options: ["3", "6", "9", "I'm not sure yet"],
    correct: 1,
    hint: "The slope of x² is 2 times x. What do you get when x is 3?",
  },
];

function PlacementStep({ profile, setProfile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [tries, setTries] = useState(0);
  const [score, setScore] = useState(0);
  const q = QUESTIONS[qi];
  const right = pick === q.correct;
  const notSure = pick != null && q.options[pick].startsWith("I'm not sure");
  const say = pick == null
    ? qi === 0 ? "Quick warm-up! No pressure, just show me how you think." : "One more. Take your time."
    : right ? "Exactly! You reasoned that perfectly." : notSure ? "That's completely fine. Here's a little hint: " + q.hint : "Good try! Hint: " + q.hint;

  const choose = (k) => {
    if (pick === q.correct) return;
    setPick(k);
    setTries((x) => x + 1);
    if (k === q.correct && tries === 0) setScore((s) => s + 1);
  };
  const advance = () => {
    if (qi < QUESTIONS.length - 1) {
      setQi(qi + 1);
      setPick(null);
      setTries(0);
    } else {
      setProfile({ placement: score });
      onNext();
    }
  };
  return (
    <>
      <PeekTeacher teacher={t.id} mood={pick == null ? "listening" : right ? "happy" : "thinking"} say={say} size={104} />
      <motion.div key={qi} className="qcard" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={spring}>
        <span className="qcard__n">Question {qi + 1} of {QUESTIONS.length}</span>
        <p>{q.q}</p>
      </motion.div>
      <Stagger className="list" key={"o" + qi}>
        {q.options.map((o, k) => (
          <motion.button
            key={o}
            variants={popItem}
            className={`ans ${pick === k ? (k === q.correct ? "ans--right" : "ans--wrong") : ""}`}
            onClick={() => choose(k)}
            animate={pick === k && k !== q.correct ? { x: [0, -10, 9, -6, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
          >
            {o}
          </motion.button>
        ))}
      </Stagger>
      <Footer>
        <Button disabled={!right && !(tries >= 2) && !notSure} onClick={advance}>
          {right ? "Continue" : "Skip for now"}
        </Button>
      </Footer>
    </>
  );
}

function BuildingStep({ profile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const [p, setP] = useState(0);
  const items = [
    `Matching you with ${t.short}`,
    "Finding your starting point",
    `Planning ${profile.minutes} minutes a day`,
    "Drawing your first visual story",
  ];
  useEffect(() => {
    const ctl = animate(0, 100, { duration: 4.2, ease: [0.4, 0.1, 0.3, 1], onUpdate: (v) => setP(v) });
    const id = setTimeout(onNext, 4900);
    return () => {
      ctl.stop();
      clearTimeout(id);
    };
  }, [onNext]);
  const R = 74;
  const C = 2 * Math.PI * R;
  return (
    <div className="building">
      <div className="ring">
        <svg viewBox="0 0 180 180" width="210" height="210">
          <circle cx="90" cy="90" r={R} stroke="#F0E5D8" strokeWidth="14" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={R}
            stroke={t.color}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p / 100)}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <div className="ring__char">
          <Character teacher={t.id} size={100} mood="thinking" />
        </div>
        <div className="ring__pct">{Math.round(p)}%</div>
      </div>
      <h1 className="building__title">Building your learning plan…</h1>
      <div className="checks">
        {items.map((it, k) => {
          const done = p > (k + 1) * 23;
          return (
            <motion.div key={it} className="check" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.15 }}>
              <span className={`check__box ${done ? "check__box--on" : ""}`}>
                {done && (
                  <motion.svg viewBox="0 0 24 24" width="14" height="14" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy}>
                    <path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                  </motion.svg>
                )}
              </span>
              <span style={{ opacity: done ? 1 : 0.55 }}>{it}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReadyStep({ profile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const [fire, setFire] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setFire(1), 250);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="ready">
      <Confetti fire={fire} />
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
        <Character teacher={t.id} size={170} mood="happy" wave />
      </motion.div>
      <Header title={`Your plan is ready, ${profile.name || "friend"}!`} />
      <Stagger className="plan">
        <motion.div variants={popItem} className="plan__row">
          <span>Teacher</span>
          <b style={{ color: t.deep }}>{t.name}</b>
        </motion.div>
        <motion.div variants={popItem} className="plan__row">
          <span>Daily goal</span>
          <b>{profile.minutes} min / day</b>
        </motion.div>
        <motion.div variants={popItem} className="plan__row">
          <span>First story</span>
          <b>Lost in the Fog</b>
        </motion.div>
        <motion.div variants={popItem} className="plan__row">
          <span>You'll learn</span>
          <b>How machines learn</b>
        </motion.div>
      </Stagger>
      <Footer>
        <Button onClick={onNext}>Continue</Button>
      </Footer>
    </div>
  );
}

function PermissionsStep({ profile, onNext }) {
  const t = TEACHERS[profile.teacher];
  const [state, setState] = useState("ask");
  const ask = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((tr) => tr.stop());
      setState("ok");
      setTimeout(onNext, 900);
    } catch {
      setState("denied");
    }
  };
  return (
    <div className="perm">
      <div className="perm__art">
        {[0, 1, 2].map((k) => (
          <motion.span
            key={k}
            className="perm__wave"
            style={{ borderColor: t.color }}
            animate={{ scale: [0.6, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.7, ease: "easeOut" }}
          />
        ))}
        <Character teacher={t.id} size={160} mood={state === "ok" ? "happy" : "listening"} nodding={state === "ok"} />
      </div>
      <Header
        title={`Talk with ${t.short} out loud`}
        sub={`${t.short} listens patiently and answers in their own voice. Allow the microphone to ask questions by speaking.`}
      />
      {state === "denied" && <p className="perm__note">No problem. You can always type your questions instead.</p>}
      <Footer>
        <Button onClick={state === "denied" ? onNext : ask}>{state === "ok" ? "All set!" : state === "denied" ? "Continue" : "Allow microphone"}</Button>
        <Button variant="ghost" onClick={onNext}>
          Maybe later
        </Button>
      </Footer>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

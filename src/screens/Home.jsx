import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Character from "../components/Character.jsx";
import Badge from "../components/Badge.jsx";
import Tale from "../components/Tale.jsx";
import { LogoMark } from "../components/Logo.jsx";
import { Bubble, Button, Confetti, Flask, bouncy, spring, useMouth } from "../components/ui.jsx";
import { getTeacher } from "../lib/teachers.js";
import { BADGES, BADGE } from "../lib/badges.js";
import { COURSE, LESSONS, UNITS } from "../lib/course.js";
import { speaker } from "../lib/voice.js";
import Legends from "./Legends.jsx";
import Rewards from "./Rewards.jsx";
import Journal from "./Journal.jsx";
import Profile from "./Profile.jsx";
import { shot } from "../lib/shot.js";

export { LESSONS };

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const TITLES = { home: "Home", explore: "Explore", journal: "My Journal", rewards: "Rewards", profile: "Profile" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// A lesson is open once the one before it is finished (the first is always open).
export function lessonState(progress, l) {
  const k = LESSONS.findIndex((x) => x.id === l.id);
  const done = progress.lessonsDone.includes(l.id);
  const open = k === 0 || done || progress.lessonsDone.includes(LESSONS[k - 1]?.id);
  return { done, open };
}
export function nextLesson(progress) {
  return LESSONS.find((l) => !progress.lessonsDone.includes(l.id)) || LESSONS[LESSONS.length - 1];
}

export default function Home(props) {
  const { state, onAsk, notify } = props;
  const { profile, progress } = state;
  const t = getTeacher(profile.teacher);
  const [tab, setTab] = useState(shot("tab") || "home");

  return (
    <div className="home" style={{ "--accent": t.color, "--accent-deep": t.deep, "--accent-soft": t.soft }}>
      <div className="home__scroll">
        <header className="home__top">
          <div>
            <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {tab === "home" ? `${greeting()}, ${profile.name || "friend"}` : new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </motion.small>
            <motion.h2 key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
              {tab === "home" ? (
                <span className="home__brand">
                  <LogoMark size={34} /> Champ
                </span>
              ) : (
                TITLES[tab]
              )}
            </motion.h2>
          </div>
          <div className="pills">
            <button className="pill pill--fire" onClick={() => setTab("rewards")} aria-label={`${progress.streak} day streak`}>
              <motion.span animate={{ scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                🔥
              </motion.span>
              {progress.streak}
            </button>
            <button className="pill pill--xp" onClick={() => setTab("rewards")} aria-label={`${progress.xp} XP`}>
              <span>⚡</span>
              {progress.xp}
            </button>
            <button className={`avatar-btn ${tab === "profile" ? "avatar-btn--on" : ""}`} onClick={() => setTab("profile")} aria-label="Your profile and settings">
              {profile.avatar || "🦊"}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
            {tab === "home" && <Dashboard {...props} t={t} setTab={setTab} />}
            {tab === "explore" && <Explore {...props} t={t} />}
            {tab === "journal" && <Journal {...props} />}
            {tab === "rewards" && <Rewards state={state} />}
            {tab === "profile" && <Profile {...props} t={t} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="tabbar" aria-label="Main">
        <TabBtn on={tab === "home"} onClick={() => setTab("home")} label="Home" icon="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
        <TabBtn on={tab === "explore"} onClick={() => setTab("explore")} label="Explore" icon="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5z" />
        <motion.button className="tabbar__ask" onClick={() => onAsk()} whileTap={{ scale: 0.9 }} transition={bouncy} aria-label={`Ask ${t.name} anything`}>
          <Character teacher={t.id} crop="head" size={64} mood="happy" />
          <small>{t.short.length > 7 ? "Ask" : `Ask ${t.short}`}</small>
        </motion.button>
        <TabBtn on={tab === "journal"} onClick={() => setTab("journal")} label="Journal" icon="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h5M10 12h5" />
        <TabBtn on={tab === "rewards"} onClick={() => setTab("rewards")} label="Rewards" icon="M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3.5 0L7 21l5-2.5L17 21l-1.5-7" />
      </nav>
    </div>
  );
}

/* ---------------------------------------------------------------- Home dashboard */

function Dashboard({ state, setProfile, onLesson, onAsk, t, setTab }) {
  const { profile, progress } = state;
  const [quip, setQuip] = useState(0);
  const [wave, setWave] = useState(true);
  const [fire, setFire] = useState(0);
  const { mouth, talking } = useMouth();
  const level = Math.min(1, progress.minutesToday / profile.minutes);
  const done = level >= 1;
  const next = nextLesson(progress);
  const dow = (new Date().getDay() + 6) % 7;
  const doneCount = progress.lessonsDone.filter((id) => LESSONS.some((l) => l.id === id)).length;
  const pct = Math.round((doneCount / LESSONS.length) * 100);
  const recent = Object.entries(state.badges)
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 4)
    .map(([id]) => BADGE[id])
    .filter(Boolean);
  const recommended = LESSONS.filter((l) => !progress.lessonsDone.includes(l.id) && lessonState(progress, l).open).slice(0, 3);
  const extra = LESSONS.filter((l) => !progress.lessonsDone.includes(l.id) && !recommended.includes(l)).slice(0, 3 - recommended.length);

  // Daily challenge: one idea from the course, chosen by date.
  const dayIndex = Math.floor(Date.now() / 86400000);
  const pool = LESSONS.filter((l) => l.concepts?.length);
  const ch = pool[dayIndex % pool.length];
  const challengeConcept = ch?.concepts?.[0];

  const quips = done
    ? [`Goal reached! I'm proud of you, ${profile.name}.`, "Your flask is full. Rest that brilliant brain!"]
    : [
        `${greeting()}, ${profile.name || "friend"}! Shall we continue "${next.title}"?`,
        "Ask me anything. I'm all ears, and I'm never in a hurry.",
        "Every expert was once a beginner.",
        "Mistakes are just experiments with surprising results!",
      ];

  useEffect(() => {
    const id = setTimeout(() => setWave(false), 2200);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (done) setFire((f) => f + 1);
  }, [done]);

  const poke = () => {
    const n = (quip + 1) % quips.length;
    setQuip(n);
    setWave(true);
    setTimeout(() => setWave(false), 1600);
    speaker.teacher = t.id;
    speaker.say(quips[n]);
  };

  return (
    <>
      <Confetti fire={fire} />
      <section className="hero">
        <div className="hero__bg" />
        <AnimatePresence mode="wait">
          <Bubble key={quip + String(done)} text={quips[quip % quips.length]} from="left" className="hero__bubble" />
        </AnimatePresence>
        <motion.button
          className="hero__char"
          onClick={poke}
          aria-label={`Talk to ${t.short}`}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 16, delay: 0.15 }}
          whileTap={{ scale: 0.94, rotate: -3 }}
        >
          <Character teacher={t.id} size={150} mood={talking ? "talking" : done ? "happy" : "idle"} mouth={mouth} wave={wave && !talking} />
        </motion.button>
        <motion.div className="hero__flask" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 170, damping: 16, delay: 0.25 }}>
          <Flask level={level} colors={t.liquid} size={150}>
            <div className="flask__label flask__label--sm">
              {Math.round(progress.minutesToday)}
              <small>/ {profile.minutes} min today</small>
            </div>
          </Flask>
        </motion.div>
      </section>

      <div className="cta-row">
        <Button className="cta-main" onClick={() => onLesson(next.id)}>
          <span className="cta-main__play">▶</span>
          <span>
            <small>{doneCount ? "Continue learning" : "Start learning"} · {next.mins} min</small>
            {next.title}
          </span>
        </Button>
        <motion.button className="mic-fab" onClick={() => onAsk()} whileTap={{ scale: 0.88 }} transition={bouncy} aria-label={`Ask ${t.short} a question`}>
          <motion.span className="mic-fab__ring" animate={{ scale: [1, 1.35], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
          <MicIcon />
        </motion.button>
      </div>

      {ch && (
        <section className="card challenge">
          <div className="challenge__icon">🎯</div>
          <div className="challenge__txt">
            <small>Daily challenge · +20 XP</small>
            <b>Explain “{challengeConcept}” to {t.short} in one sentence</b>
          </div>
          <Button
            className="challenge__go"
            onClick={() =>
              onAsk(t.id, {
                lesson: `Daily challenge: the learner tries to explain "${challengeConcept}" (from the lesson "${ch.title}") in one sentence. Answer key: ${ch.explain?.key || ch.topic}. Give warm, specific feedback and one follow-up question.`,
                opener: `Today's challenge! Can you explain ${challengeConcept} to me in just one sentence? Take your time.`,
                kind: "challenge",
              })
            }
          >
            Go
          </Button>
        </section>
      )}

      <section className="card storyteller" onClick={() => setTab("explore")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setTab("explore")}>
        <Tale parts={doneCount} total={LESSONS.length} size={92} />
        <div className="storyteller__txt">
          <small>Your course</small>
          <b>{COURSE.title}</b>
          <div className="bar" aria-label={`${pct}% complete`}>
            <motion.i initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ ...spring, delay: 0.3 }} />
          </div>
          <small>
            {doneCount} of {LESSONS.length} lessons · Tale is {pct}% built
          </small>
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <b>Recommended for you</b>
          <button className="link" onClick={() => setTab("explore")}>
            See all ›
          </button>
        </div>
        <div className="recs">
          {[...recommended, ...extra].map((l) => {
            const tt = getTeacher(l.teacher);
            const st = lessonState(progress, l);
            return (
              <motion.button key={l.id} className="rec" style={{ "--c": tt.color, "--cs": tt.soft }} whileTap={{ scale: 0.96 }} onClick={() => onLesson(l.id)} disabled={!st.open}>
                <span className="rec__face">
                  <Character teacher={tt.id} crop="head" size={54} />
                </span>
                <b>{l.title}</b>
                <small>{st.open ? `${l.topic} · ${l.mins} min` : "🔒 Finish the lesson before"}</small>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="card week">
        <div className="card__head">
          <b>This week</b>
          <span>{progress.week.filter(Boolean).length}/7 goals</span>
        </div>
        <div className="week__row">
          {DAYS.map((d, k) => (
            <div key={k} className={`day ${k === dow ? "day--today" : ""}`}>
              <motion.span className={`day__dot ${progress.week[k] ? "day__dot--on" : ""}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...bouncy, delay: 0.3 + k * 0.05 }}>
                {progress.week[k] ? "✓" : k === dow ? Math.round(level * 100) + "%" : ""}
              </motion.span>
              <small>{d}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <b>Recent badges</b>
          <button className="link" onClick={() => setTab("rewards")}>
            All rewards ›
          </button>
        </div>
        {recent.length ? (
          <div className="recent-badges">
            {recent.map((b) => (
              <div key={b.id}>
                <Badge id={b.id} color={b.color} size={56} />
                <small>{b.title}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="recent-badges recent-badges--ghost">
              {BADGES.slice(0, 4).map((b) => (
                <Badge key={b.id} id={b.id} color={b.color} earned={false} size={44} />
              ))}
            </div>
            <p>Ask a question, finish a lesson or keep a streak to earn your first animal badge.</p>
          </div>
        )}
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- Explore */

function Explore({ state, setProfile, onLesson, onAsk, onSeen, notify, t }) {
  const { progress, profile } = state;
  const [view, setView] = useState(shot("view") || "course");
  return (
    <>
      <div className="seg" role="tablist">
        {[
          ["course", "🤖 AI course"],
          ["teachers", "🏛 Teachers"],
          ["soon", "✨ More subjects"],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} className={`seg__b ${view === id ? "seg__b--on" : ""}`} onClick={() => setView(id)}>
            {label}
            {view === id && <motion.i layoutId="segpill" className="seg__pill" transition={bouncy} />}
          </button>
        ))}
      </div>

      {view === "course" && (
        <>
          <section className="course-hero">
            <Tale parts={progress.lessonsDone.filter((id) => LESSONS.some((l) => l.id === id)).length} total={LESSONS.length} size={110} />
            <div>
              <small>AI course</small>
              <h3>{COURSE.title}</h3>
              <p>{COURSE.tagline}</p>
            </div>
          </section>
          {UNITS.map((u) => {
            const ls = LESSONS.filter((l) => l.unit === u.id);
            const done = ls.filter((l) => progress.lessonsDone.includes(l.id)).length;
            return (
              <section key={u.id} className="card path">
                <div className="card__head">
                  <b>
                    Unit {u.id} · {u.title}
                  </b>
                  <span>
                    {done}/{ls.length}
                  </span>
                </div>
                {u.blurb && <p className="unit__blurb">{u.blurb}</p>}
                {ls.map((l, k) => {
                  const st = lessonState(progress, l);
                  const isNext = nextLesson(progress).id === l.id;
                  const tt = getTeacher(l.teacher);
                  return (
                    <motion.button
                      key={l.id}
                      className={`node ${st.done ? "node--done" : ""} ${isNext ? "node--next" : ""} ${!st.open ? "node--locked" : ""}`}
                      onClick={() => st.open && onLesson(l.id)}
                      whileTap={!st.open ? { x: [0, -6, 6, 0] } : { scale: 0.97 }}
                      aria-label={`${l.title}${st.done ? ", done" : !st.open ? ", locked" : ""}`}
                    >
                      <span className="node__dot">
                        {st.done ? "✓" : !st.open ? "🔒" : LESSONS.indexOf(l) + 1}
                        {isNext && <motion.i className="node__pulse" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
                      </span>
                      <span className="node__txt">
                        <b>{l.title}</b>
                        <small>
                          {l.topic} · {tt.short} · {l.mins} min
                        </small>
                      </span>
                      {st.open && <span className="node__go">{st.done ? "Replay" : "Start"}</span>}
                      {k < ls.length - 1 && <span className="node__line" />}
                    </motion.button>
                  );
                })}
              </section>
            );
          })}
        </>
      )}

      {view === "teachers" && <Legends profile={profile} setProfile={setProfile} onAsk={(id) => onAsk(id)} onSeen={onSeen} notify={notify} />}

      {view === "soon" && (
        <section className="soon">
          {[
            ["🔬", "Science"],
            ["➗", "Mathematics"],
            ["🪐", "Space & astronomy"],
            ["💻", "Technology"],
            ["🎨", "Creativity & problem solving"],
            ["🧭", "Famous inventors"],
          ].map(([i, n]) => (
            <div key={n} className="soon__item">
              <span>{i}</span>
              <b>{n}</b>
              <small>Coming soon</small>
            </div>
          ))}
          <p className="soon__note">Right now Champ teaches one course, AI, so it can be really good. More worlds are on the way.</p>
        </section>
      )}
    </>
  );
}

function TabBtn({ on, onClick, label, icon }) {
  return (
    <motion.button className={`tab ${on ? "tab--on" : ""}`} onClick={onClick} whileTap={{ scale: 0.88 }} aria-current={on ? "page" : undefined}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d={icon} stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill={on ? "var(--accent-soft)" : "none"} />
      </svg>
      <small>{label}</small>
      {on && <motion.i layoutId="tabdot" className="tab__dot" transition={bouncy} />}
    </motion.button>
  );
}

export function MicIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8.5" y="3" width="7" height="12" rx="3.5" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

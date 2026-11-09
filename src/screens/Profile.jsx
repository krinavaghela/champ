import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Character from "../components/Character.jsx";
import VoiceSettings from "../components/VoiceSettings.jsx";
import { Button, Confirm, bouncy, spring, useDeviceRoot } from "../components/ui.jsx";
import { TEACHER_LIST } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";
import { progressStats } from "./Rewards.jsx";
import { LESSONS } from "../lib/course.js";
import { shot } from "../lib/shot.js";

const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🐙", "🦉", "🐬", "🦄", "🐨", "🐵", "🤖"];
const AGES = ["6–8", "9–11", "12–14", "15–17", "18+"];
const LEVELS = ["Brand new", "I know a little", "I know a lot"];
const INTERESTS = ["Robots", "Games", "Art", "Stories", "Space", "Animals", "Music", "Coding", "Science"];
export const LANGUAGES = ["English", "Español", "Français", "Deutsch", "हिन्दी", "Português", "中文", "العربية", "Italiano", "日本語"];

// Profile & Settings: who you are, your teacher, accessibility, voice & AI, and the parent area.
export default function Profile({ state, setProfile, setSettings, setParent, onReset, notify, t }) {
  const { profile, settings } = state;
  const [parent, setParentOpen] = useState(!!shot("parent"));
  const root = useDeviceRoot();
  const [askReset, setAskReset] = useState(false);
  const teachers = TEACHER_LIST.some((x) => x.id === t.id) ? TEACHER_LIST : [...TEACHER_LIST.slice(0, 5), t];

  return (
    <>
      <section className="card me">
        <div className="me__avatar" aria-hidden>
          {profile.avatar || "🦊"}
        </div>
        <label className="me__name">
          <small>Your name</small>
          <input value={profile.name} onChange={(e) => setProfile({ name: e.target.value.slice(0, 24) })} aria-label="Your name" />
        </label>
      </section>

      <section className="card">
        <div className="card__head">
          <b>Choose your avatar</b>
        </div>
        <div className="avatars">
          {AVATARS.map((a) => (
            <motion.button key={a} className={`av ${profile.avatar === a ? "av--on" : ""}`} onClick={() => setProfile({ avatar: a })} whileTap={{ scale: 0.85 }} aria-label={`Avatar ${a}`} aria-pressed={profile.avatar === a}>
              {a}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <b>About me</b>
        </div>
        <Field label="Age">
          <Chips items={AGES} value={profile.age} onPick={(v) => setProfile({ age: v })} />
        </Field>
        <Field label="What I know about AI">
          <Chips items={LEVELS} value={profile.level} onPick={(v) => setProfile({ level: v })} />
        </Field>
        <Field label="I love">
          <Chips
            items={INTERESTS}
            value={profile.subjects}
            multi
            onPick={(v) => setProfile({ subjects: profile.subjects.includes(v) ? profile.subjects.filter((x) => x !== v) : [...profile.subjects, v] })}
          />
        </Field>
        <Field label="My teacher speaks">
          <select className="select" value={profile.language || "English"} onChange={(e) => setProfile({ language: e.target.value })} aria-label="Language">
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <small className="field__hint">Your teacher answers in this language. Lessons are in English for now.</small>
        </Field>
        <Field label="Daily goal">
          <Chips items={[5, 10, 15, 20, 30]} value={profile.minutes} onPick={(v) => setProfile({ minutes: v })} suffix=" min" />
        </Field>
      </section>

      <section className="card">
        <div className="card__head">
          <b>Your teacher</b>
        </div>
        <div className="switch">
          {teachers.map((tt) => (
            <motion.button
              key={tt.id}
              className={`switch__t ${tt.id === t.id ? "switch__t--on" : ""}`}
              style={{ "--c": tt.color, "--cs": tt.soft }}
              onClick={() => {
                const prev = profile.teacher;
                setProfile({ teacher: tt.id });
                speaker.teacher = tt.id;
                speaker.say(tt.hello);
                if (prev !== tt.id) notify?.({ text: `${tt.short} is now your teacher`, undo: () => setProfile({ teacher: prev }) });
              }}
              whileTap={{ scale: 0.92 }}
              aria-pressed={tt.id === t.id}
            >
              <Character teacher={tt.id} crop="head" size={58} mood={tt.id === t.id ? "happy" : "idle"} />
              <small>{tt.short}</small>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="card vs">
        <div className="card__head">
          <b>Accessibility</b>
        </div>
        <Field label="Text size">
          <Chips items={["Normal", "Large", "Extra large"]} value={{ normal: "Normal", large: "Large", xl: "Extra large" }[settings.textSize]} onPick={(v) => setSettings({ textSize: { Normal: "normal", Large: "large", "Extra large": "xl" }[v] })} />
        </Field>
        <label className="row-switch">
          <span>
            <b>Reduce motion</b>
            <small>Calmer screens with fewer bouncing animations.</small>
          </span>
          <input type="checkbox" role="switch" checked={!!settings.reduceMotion} onChange={(e) => setSettings({ reduceMotion: e.target.checked })} />
          <i className="switch-ui" aria-hidden />
        </label>
      </section>

      <VoiceSettings teacher={t} />

      <motion.button className="card parent-entry" onClick={() => setParentOpen(true)} whileTap={{ scale: 0.98 }}>
        <span className="parent-entry__icon">👨‍👩‍👧</span>
        <span>
          <b>For parents & guardians</b>
          <small>Activity, skills, screen time and privacy</small>
        </span>
        <span className="parent-entry__go">🔒 ›</span>
      </motion.button>

      <Button variant="ghost" onClick={() => setAskReset(true)}>
        Restart onboarding
      </Button>
      <Confirm
        open={askReset}
        title="Start over?"
        body="This erases your progress, streak, XP, journal and badges, and takes you back to the first screen. It can't be undone."
        confirm="Erase and restart"
        cancel="Keep my progress"
        danger
        onCancel={() => setAskReset(false)}
        onConfirm={() => {
          setAskReset(false);
          onReset();
        }}
      />

      {root && createPortal(
        <AnimatePresence>{parent && <ParentArea state={state} setParent={setParent} onReset={onReset} onClose={() => setParentOpen(false)} />}</AnimatePresence>,
        root
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <small className="field__label">{label}</small>
      {children}
    </div>
  );
}

function Chips({ items, value, onPick, multi, suffix = "" }) {
  return (
    <div className="chips-row chips-row--wrap">
      {items.map((it) => {
        const on = multi ? value?.includes(it) : value === it;
        return (
          <button key={it} className={`fchip ${on ? "fchip--on" : ""}`} onClick={() => onPick(it)} aria-pressed={on}>
            {it}
            {suffix}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Parent area */

// A simple grown-ups-only check (common in children's apps), then the dashboard.
function ParentArea({ state, setParent, onReset, onClose }) {
  const [ok, setOk] = useState(shot("parent") === "open");
  const q = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 6 + Math.floor(Math.random() * 7);
    return { a, b, ans: a * b };
  }, []);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  return (
    <motion.div className="parent" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 32 }} role="dialog" aria-modal="true" aria-label="Parent area">
      <div className="parent__top">
        <button className="iconbtn" onClick={onClose} aria-label="Close parent area">
          ‹
        </button>
        <b>Parent dashboard</b>
        <span style={{ width: 44 }} />
      </div>
      {!ok ? (
        <form
          className="gate"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(val) === q.ans) setOk(true);
            else {
              setErr(true);
              setVal("");
            }
          }}
        >
          <span className="gate__icon">🔒</span>
          <h3>Grown-ups only</h3>
          <p>
            To continue, answer: what is {q.a} × {q.b}?
          </p>
          <motion.input
            inputMode="numeric"
            value={val}
            onChange={(e) => {
              setVal(e.target.value.replace(/\D/g, ""));
              setErr(false);
            }}
            autoFocus
            aria-label="Answer"
            animate={err ? { x: [0, -8, 8, -4, 0] } : {}}
          />
          {err && <p className="keyrow__err" role="alert">That's not right. Try again.</p>}
          <Button type="submit" disabled={!val}>
            Continue
          </Button>
        </form>
      ) : (
        <ParentDashboard state={state} setParent={setParent} onReset={onReset} onClose={onClose} />
      )}
    </motion.div>
  );
}

function ParentDashboard({ state, setParent, onReset, onClose }) {
  const { progress, profile, parent } = state;
  const s = progressStats(state);
  const [erase, setErase] = useState(false);
  const days = [...Array(7)].map((_, k) => {
    const d = new Date(Date.now() - (6 - k) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), mins: Math.round(progress.log?.[key] || 0) };
  });
  const max = Math.max(10, ...days.map((d) => d.mins));
  const week = days.reduce((a, d) => a + d.mins, 0);
  const missed = (progress.quiz?.missed || []).slice(0, 4);
  const nextUp = LESSONS.find((l) => !progress.lessonsDone.includes(l.id));

  return (
    <div className="parent__body">
      <section className="card">
        <div className="card__head">
          <b>{profile.name || "Your child"}'s learning this week</b>
          <span>{week} min</span>
        </div>
        <div className="chart" role="img" aria-label={`Minutes learned per day: ${days.map((d) => `${d.label} ${d.mins}`).join(", ")}`}>
          {days.map((d, k) => (
            <div key={k} className="chart__col">
              <small>{d.mins || ""}</small>
              <motion.i initial={{ height: 0 }} animate={{ height: `${(d.mins / max) * 100}%` }} transition={{ ...spring, delay: k * 0.05 }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="prog-grid">
        <Stat icon="📚" label="Lessons completed" value={`${s.done}/${s.total}`} />
        <Stat icon="🧠" label="Concepts mastered" value={s.concepts.length} />
        <Stat icon="🎯" label="First-try accuracy" value={s.retention == null ? "—" : `${s.retention}%`} />
        <Stat icon="❓" label="Questions asked" value={s.questions} />
        <Stat icon="✍️" label="Words written" value={s.words} />
        <Stat icon="🔥" label="Streak" value={`${s.streak} days`} />
      </div>

      <section className="card">
        <div className="card__head">
          <b>Skills developing</b>
        </div>
        {s.concepts.length ? (
          <div className="concepts">
            {s.concepts.slice(-12).map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        ) : (
          <p className="empty-text">Nothing yet. Skills appear after the first finished lesson.</p>
        )}
        {nextUp && <p className="field__hint">Up next: “{nextUp.title}” ({nextUp.topic}).</p>}
      </section>

      <section className="card">
        <div className="card__head">
          <b>Areas needing support</b>
        </div>
        {missed.length ? (
          <ul className="support">
            {missed.map((m, k) => (
              <li key={k}>{m}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">No trouble spots so far. Questions answered wrong on the first try will show up here.</p>
        )}
      </section>

      <section className="card vs">
        <div className="card__head">
          <b>Screen time</b>
        </div>
        <div className="field">
          <small className="field__label">Daily learning limit</small>
          <div className="chips-row chips-row--wrap">
            {[0, 15, 30, 45, 60].map((m) => (
              <button key={m} className={`fchip ${parent.limitMin === m ? "fchip--on" : ""}`} onClick={() => setParent({ limitMin: m })} aria-pressed={parent.limitMin === m}>
                {m ? `${m} min` : "No limit"}
              </button>
            ))}
          </div>
          <small className="field__hint">When the limit is reached, Champ suggests a break. A grown-up can unlock more time.</small>
        </div>
      </section>

      <section className="card vs">
        <div className="card__head">
          <b>Privacy</b>
        </div>
        <p className="field__hint">
          Progress, journal and drawings are stored only on this device. Questions are sent to the AI teacher to get an answer, and spoken lines are sent to the voice service, only when those keys are switched on.
        </p>
        <Button variant="soft" className="btn--danger-soft" onClick={() => setErase(true)}>
          Erase all data on this device
        </Button>
      </section>

      <Confirm
        open={erase}
        title="Erase everything?"
        body="All progress, journal entries, drawings and badges on this device will be deleted. This can't be undone."
        confirm="Erase everything"
        cancel="Cancel"
        danger
        onCancel={() => setErase(false)}
        onConfirm={() => {
          setErase(false);
          onClose();
          onReset();
        }}
      />
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="prog">
      <span className="prog__icon">{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

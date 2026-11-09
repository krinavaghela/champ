import { motion } from "framer-motion";
import { useState } from "react";
import { spring } from "../components/ui.jsx";
import { LESSONS } from "../lib/course.js";
import Badges from "./Badges.jsx";
import { shot } from "../lib/shot.js";

// Rewards = "My Progress" (how you're growing) + Animal Mindset Badges.
export default function Rewards({ state }) {
  const [view, setView] = useState(shot("view") || "badges");
  return (
    <>
      <div className="seg" role="tablist">
        {[
          ["badges", "🏅 Animal badges"],
          ["progress", "📈 My progress"],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} className={`seg__b ${view === id ? "seg__b--on" : ""}`} onClick={() => setView(id)}>
            {label}
            {view === id && <motion.i layoutId="segpill2" className="seg__pill" />}
          </button>
        ))}
      </div>
      {view === "badges" ? <Badges state={state} /> : <Progress state={state} />}
    </>
  );
}

export function progressStats(state) {
  const { progress, journal = [], stats } = state;
  const done = progress.lessonsDone.filter((id) => LESSONS.some((l) => l.id === id)).length;
  const words = journal.filter((e) => e.text).reduce((a, e) => a + e.text.trim().split(/\s+/).length, 0);
  const predictions = journal.filter((e) => e.type === "prediction").length;
  const q = progress.quiz || { right: 0, total: 0 };
  const retention = q.total ? Math.round((q.right / q.total) * 100) : null;
  const daysLearned = Object.values(progress.log || {}).filter((m) => m > 0).length;
  return { done, total: LESSONS.length, concepts: progress.concepts || [], words, entries: journal.length, predictions, retention, streak: progress.streak, daysLearned, questions: stats.questions, explains: stats.explains };
}

function Progress({ state }) {
  const s = progressStats(state);
  const items = [
    { icon: "📚", label: "Lessons completed", value: `${s.done}/${s.total}`, pct: s.done / s.total },
    { icon: "🧠", label: "Concepts mastered", value: s.concepts.length, pct: Math.min(1, s.concepts.length / 40) },
    { icon: "✍️", label: "Writing", value: `${s.words} words`, sub: `${s.entries} journal entries`, pct: Math.min(1, s.words / 500) },
    { icon: "💡", label: "Independent thinking", value: `${s.predictions} predictions`, sub: `${s.explains} ideas explained back`, pct: Math.min(1, (s.predictions + s.explains) / 20) },
    { icon: "🎯", label: "Knowledge retention", value: s.retention == null ? "—" : `${s.retention}%`, sub: "right on the first try", pct: (s.retention || 0) / 100 },
    { icon: "🔥", label: "Consistency", value: `${s.streak}-day streak`, sub: `${s.daysLearned} days learned`, pct: Math.min(1, s.streak / 7) },
  ];
  return (
    <>
      <div className="prog-grid">
        {items.map((it, k) => (
          <motion.div key={it.label} className="prog" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: k * 0.05 }}>
            <span className="prog__icon">{it.icon}</span>
            <small>{it.label}</small>
            <b>{it.value}</b>
            {it.sub && <small className="prog__sub">{it.sub}</small>}
            <div className="bar">
              <motion.i initial={{ width: 0 }} animate={{ width: `${Math.round(it.pct * 100)}%` }} transition={{ ...spring, delay: 0.2 + k * 0.05 }} />
            </div>
          </motion.div>
        ))}
      </div>
      <section className="card">
        <div className="card__head">
          <b>Concepts you've mastered</b>
          <span>{s.concepts.length}</span>
        </div>
        {s.concepts.length ? (
          <div className="concepts">
            {s.concepts.map((c) => (
              <span key={c}>✓ {c}</span>
            ))}
          </div>
        ) : (
          <p className="empty-text">Finish a lesson and the ideas you learned will appear here.</p>
        )}
      </section>
    </>
  );
}

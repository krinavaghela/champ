import { useCallback, useEffect, useState } from "react";
import { categoriesOf } from "./people.js";

import { SHOT_MODE } from "./shot.js";

const KEY = SHOT_MODE ? "champ:shot" : "champ:v1";
const OLD_KEY = "chimpion:v1"; // name before the rename; read once so nobody loses progress

export const DEFAULT_STATE = {
  onboarded: false,
  profile: {
    name: "",
    teacher: "einstein",
    subjects: [],
    level: "",
    goal: "",
    minutes: 15,
    reminder: { h: 7, m: 30, ampm: "PM" },
    placement: 0,
    avatar: "🦊",
    age: "",
    language: "English",
  },
  // Accessibility & display
  settings: { textSize: "normal", reduceMotion: false, captions: true },
  // Parent area (opened through a grown-ups-only check)
  parent: { limitMin: 0 },
  progress: {
    day: "",
    minutesToday: 0,
    xp: 0,
    streak: 0,
    week: [false, false, false, false, false, false, false],
    lessonsDone: [],
    log: {}, // date -> minutes learned (for the parent dashboard)
    lessonsByDay: {}, // date -> lessons finished that day
    quiz: { right: 0, total: 0, missed: [] }, // knowledge checks
    concepts: [],
  },
  // Learning journal: predictions, reflections, saved questions, notes and drawings
  journal: [],
  // counters the Animal Mindset badges are earned from
  stats: {
    questions: 0,
    voiceQuestions: 0,
    whyQuestions: 0,
    explains: 0,
    minutesTotal: 0,
    goalsHit: 0,
    met: [],
    fields: [],
    hallsSeen: [],
  },
  badges: {}, // badge id -> ISO date earned
};

function load() {
  try {
    const raw = localStorage.getItem(KEY) || (SHOT_MODE ? null : localStorage.getItem(OLD_KEY));
    if (!raw) return DEFAULT_STATE;
    const s = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...s,
      profile: { ...DEFAULT_STATE.profile, ...s.profile },
      progress: { ...DEFAULT_STATE.progress, ...s.progress },
      settings: { ...DEFAULT_STATE.settings, ...s.settings },
      parent: { ...DEFAULT_STATE.parent, ...s.parent },
      journal: Array.isArray(s.journal) ? s.journal : [],
      stats: { ...DEFAULT_STATE.stats, ...s.stats },
      badges: { ...s.badges },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const addUnique = (arr, items) => [...new Set([...arr, ...items])];

export function useAppState() {
  const [state, setState] = useState(() => {
    const s = load();
    if (s.progress.day !== today()) {
      return { ...s, progress: { ...s.progress, day: today(), minutesToday: 0 } };
    }
    return s;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const update = useCallback((fn) => setState((s) => (typeof fn === "function" ? fn(s) : { ...s, ...fn })), []);
  const setProfile = useCallback(
    (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    []
  );
  const addMinutes = useCallback(
    (mins, xp = 0) =>
      setState((s) => {
        const p = s.progress;
        const before = p.minutesToday;
        const after = before + mins;
        const hitGoal = before < s.profile.minutes && after >= s.profile.minutes;
        const week = [...p.week];
        const dow = (new Date().getDay() + 6) % 7;
        if (hitGoal) week[dow] = true;
        return {
          ...s,
          progress: {
            ...p,
            minutesToday: after,
            xp: p.xp + xp,
            streak: hitGoal ? p.streak + 1 : p.streak,
            week,
            log: { ...p.log, [today()]: (p.log?.[today()] || 0) + mins },
          },
          stats: { ...s.stats, minutesTotal: s.stats.minutesTotal + mins, goalsHit: s.stats.goalsHit + (hitGoal ? 1 : 0) },
        };
      }),
    []
  );
  // Called each time the learner asks their teacher something.
  const recordQuestion = useCallback(
    ({ text, voice, teacher, explain }) =>
      setState((s) => {
        const st = s.stats;
        return {
          ...s,
          stats: {
            ...st,
            questions: st.questions + 1,
            voiceQuestions: st.voiceQuestions + (voice ? 1 : 0),
            whyQuestions: st.whyQuestions + (/\bwhy\b/i.test(text) ? 1 : 0),
            explains: st.explains + (explain ? 1 : 0),
            met: addUnique(st.met, [teacher]),
            fields: addUnique(st.fields, categoriesOf(teacher).map((c) => c.id)),
          },
        };
      }),
    []
  );
  const markHallSeen = useCallback(
    (id) =>
      setState((s) => (s.stats.hallsSeen.includes(id) ? s : { ...s, stats: { ...s.stats, hallsSeen: [...s.stats.hallsSeen, id] } })),
    []
  );
  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const addJournal = useCallback(
    (entry) => setState((s) => ({ ...s, journal: [{ id: Date.now() + Math.random().toString(36).slice(2, 6), date: new Date().toISOString(), ...entry }, ...s.journal].slice(0, 300) })),
    []
  );
  const removeJournal = useCallback((id) => setState((s) => ({ ...s, journal: s.journal.filter((e) => e.id !== id) })), []);
  const setSettings = useCallback((patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })), []);
  const setParent = useCallback((patch) => setState((s) => ({ ...s, parent: { ...s.parent, ...patch } })), []);
  // Called when a story lesson ends.
  const completeLesson = useCallback(
    ({ id, concepts = [], right = 0, total = 0, missed = [] }) =>
      setState((s) => {
        const p = s.progress;
        const d = today();
        return {
          ...s,
          progress: {
            ...p,
            lessonsDone: p.lessonsDone.includes(id) ? p.lessonsDone : [...p.lessonsDone, id],
            lessonsByDay: { ...p.lessonsByDay, [d]: (p.lessonsByDay?.[d] || 0) + 1 },
            quiz: { right: p.quiz.right + right, total: p.quiz.total + total, missed: [...missed, ...p.quiz.missed].slice(0, 30) },
            concepts: [...new Set([...p.concepts, ...concepts])],
          },
        };
      }),
    []
  );

  return { state, update, setProfile, addMinutes, recordQuestion, markHallSeen, reset, addJournal, removeJournal, setSettings, setParent, completeLesson };
}

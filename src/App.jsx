import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import VoiceDock from "./components/VoiceDock.jsx";
import { Button, Toast } from "./components/ui.jsx";
import Character from "./components/Character.jsx";
import Onboarding from "./onboarding/Onboarding.jsx";
import Home from "./screens/Home.jsx";
import TutorSession from "./screens/TutorSession.jsx";
import FogLesson from "./screens/FogLesson.jsx";
import StoryLesson from "./screens/StoryLesson.jsx";
import { BadgeModal } from "./screens/Badges.jsx";
import { useAppState } from "./lib/store.js";
import { qualified } from "./lib/badges.js";
import { getTeacher } from "./lib/teachers.js";
import { categoriesOf } from "./lib/people.js";
import { LESSONS } from "./lib/course.js";
import { speaker } from "./lib/voice.js";
import { shot } from "./lib/shot.js";

export default function App() {
  const app = useAppState();
  const { state, update, setProfile, addMinutes, recordQuestion, markHallSeen, reset, addJournal, completeLesson } = app;
  const [overlay, setOverlay] = useState(() =>
    shot("lesson") ? { type: "lesson", id: shot("lesson") } : shot("ask") ? { type: "ask" } : null
  ); // {type:"ask"|"lesson", ...}
  const [newBadges, setNewBadges] = useState([]);
  const [toast, setToast] = useState(null);
  const [extraMin, setExtraMin] = useState(0); // grown-up granted extra screen time today
  const notify = useCallback((t) => setToast({ id: Date.now(), ...t }), []);
  const clearToast = useCallback(() => setToast(null), []);
  const explainCounted = useRef(false);
  const { settings, parent, progress } = state;

  const finishOnboarding = () => update((s) => ({ ...s, onboarded: true, profile: { ...s.profile, name: s.profile.name || "Friend" } }));

  // Award any Animal Mindset Badge the learner now qualifies for.
  // The celebration waits until the lesson or live session is closed, so it never interrupts the teacher.
  useEffect(() => {
    if (!state.onboarded) return;
    const fresh = qualified(state).filter((id) => !state.badges[id]);
    if (!fresh.length) return;
    const now = new Date().toISOString();
    update((s) => ({ ...s, badges: { ...s.badges, ...Object.fromEntries(fresh.map((id) => [id, now])) } }));
    setNewBadges((q) => [...q, ...fresh]);
  }, [state, update]);

  // onAsk(teacherId?, {lesson, opener, kind}?)
  const openTutor = (teacher, opts) => {
    explainCounted.current = false;
    if (opts) return setOverlay({ type: "ask", teacher, ...opts });
    if (!teacher || teacher === state.profile.teacher) return setOverlay({ type: "ask" });
    const p = getTeacher(teacher);
    const hall = categoriesOf(teacher)[0];
    setOverlay({
      type: "ask",
      teacher,
      lesson: `Open conversation. The learner chose you from the ${hall?.name || "teachers"} hall to learn about your field. You are known for: ${p.known} Start from what the learner is curious about, and connect it to your work.`,
      opener: `${p.hello}`,
    });
  };

  const openLesson = (id) => setOverlay({ type: "lesson", id });
  const lesson = overlay?.type === "lesson" ? LESSONS.find((l) => l.id === overlay.id) : null;
  const lessonIdx = lesson ? LESSONS.indexOf(lesson) : -1;
  const doneCount = progress.lessonsDone.filter((id) => LESSONS.some((l) => l.id === id)).length;
  const today = new Date().toISOString().slice(0, 10);
  const timeUp = state.onboarded && parent.limitMin > 0 && progress.minutesToday >= parent.limitMin + extraMin;

  const fontScale = { normal: 1, large: 1.12, xl: 1.25 }[settings.textSize] || 1;

  return (
    // Honour the system "Reduce motion" setting, or force it from Profile → Accessibility.
    <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>
      <div className="device-wrap">
        <div className={`device ${settings.reduceMotion ? "calm" : ""}`} style={{ "--fs": fontScale, fontSize: `${fontScale * 16}px` }}>
          <AnimatePresence mode="wait">
            {!state.onboarded ? (
              <motion.div key="onb" className="fill" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
                <Onboarding profile={state.profile} setProfile={setProfile} onDone={finishOnboarding} />
              </motion.div>
            ) : (
              <motion.div key="home" className="fill" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Home
                  {...app}
                  onLesson={openLesson}
                  onAsk={openTutor}
                  onSeen={markHallSeen}
                  notify={notify}
                  onReset={() => {
                    setOverlay(null);
                    reset();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {lesson?.special === "fog" && (
              <FogLesson
                key="fog"
                profile={state.profile}
                lessonId={lesson.id}
                onClose={() => setOverlay(null)}
                onComplete={(l) => {
                  completeLesson({ id: l.id, concepts: l.concepts || ["gradient descent", "loss"] });
                  addMinutes(l.mins || 6, 50);
                }}
                onExplain={() => {
                  explainCounted.current = false;
                  setOverlay({
                    type: "ask",
                    kind: "explain",
                    lesson: "Gradient descent (the learner just finished the foggy-mountain story and is now explaining it back in their own words; give feedback against this answer key: the slope or gradient points uphill, so we step the opposite way; the stride is the learning rate, too big overshoots and too small is slow; a flat spot may be only a local minimum; for a machine the mountain is its error or loss).",
                    opener: "Wonderful work in the fog! Now, in your own words, how does a machine use the slope to learn? Take all the time you need.",
                  });
                }}
              />
            )}
            {lesson && lesson.special !== "fog" && (
              <StoryLesson
                key={lesson.id}
                lesson={lesson}
                next={LESSONS[lessonIdx + 1]}
                profile={state.profile}
                partsDone={doneCount}
                total={LESSONS.length}
                onClose={() => setOverlay(null)}
                onNext={openLesson}
                onFinish={completeLesson}
                addJournal={addJournal}
                recordQuestion={recordQuestion}
                onMinutes={(m, xp) => addMinutes(m, xp)}
              />
            )}
            {overlay?.type === "ask" && (
              <TutorSession
                key="ask"
                profile={state.profile}
                teacherId={overlay.teacher}
                lesson={overlay.lesson}
                opener={overlay.opener}
                onClose={() => setOverlay(null)}
                onMinutes={(m, xp) => addMinutes(m, xp)}
                onQuestion={({ text, voice, teacher }) => {
                  const explain = overlay.kind === "explain" && !explainCounted.current;
                  if (explain) explainCounted.current = true;
                  recordQuestion({ text, voice, teacher, explain });
                  addJournal({ type: "question", teacher, text });
                  // Daily challenge: +20 XP once per day.
                  if (overlay.kind === "challenge" && state.progress.challengeDay !== today) {
                    update((s) => ({ ...s, progress: { ...s.progress, challengeDay: today, xp: s.progress.xp + 20 } }));
                    notify({ text: "Daily challenge done! +20 XP 🎯" });
                  }
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {newBadges.length > 0 && !overlay && (
              <BadgeModal key={newBadges[0]} id={newBadges[0]} earned celebrate state={state} onClose={() => setNewBadges((q) => q.slice(1))} />
            )}
          </AnimatePresence>

          <AnimatePresence>{timeUp && !overlay && <BreakScreen teacher={state.profile.teacher} name={state.profile.name} onMore={() => setExtraMin((m) => m + 15)} />}</AnimatePresence>

          {/* Lessons and live sessions have their own Stop controls, so the floating dock steps aside there. */}
          <VoiceDock hidden={!!overlay || !state.onboarded} />
          <Toast toast={toast} onDone={clearToast} />
        </div>
      </div>
    </MotionConfig>
  );
}

// Screen-time limit reached (set in the parent dashboard): a friendly pause, unlockable by a grown-up.
function BreakScreen({ teacher, name, onMore }) {
  const [gate, setGate] = useState(false);
  const [val, setVal] = useState("");
  const t = getTeacher(teacher);
  useEffect(() => {
    speaker.teacher = t.id;
    speaker.say(`Great learning today, ${name || "friend"}! Time for a break. Your brain grows while you rest.`);
  }, [t.id, name]);
  return (
    <motion.div className="break" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Time for a break">
      <Character teacher={t.id} size={170} mood="happy" wave />
      <h2>Time for a break!</h2>
      <p>You've reached today's learning time. Go play, draw or tell someone what you learned. See you tomorrow!</p>
      {!gate ? (
        <button className="link" onClick={() => setGate(true)}>
          Grown-up: add 15 minutes
        </button>
      ) : (
        <form
          className="gate gate--inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (val.trim() === "56") onMore();
            setVal("");
          }}
        >
          <p>What is 7 × 8?</p>
          <input inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))} aria-label="Answer" autoFocus />
          <Button type="submit" disabled={!val}>
            Unlock 15 minutes
          </Button>
        </form>
      )}
    </motion.div>
  );
}

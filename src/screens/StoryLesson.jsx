import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Character from "../components/Character.jsx";
import Tale from "../components/Tale.jsx";
import Widget from "../components/Widgets.jsx";
import { Button, Confetti, Confirm, bouncy, spring, useMouth } from "../components/ui.jsx";
import { getTeacher } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";
import TutorSession from "./TutorSession.jsx";
import { MuteButton, useSpeaking } from "../components/VoiceDock.jsx";
import { shot } from "../lib/shot.js";

// The Learning Journey for one story lesson:
// intro → story (with a "think first" prediction halfway) → knowledge check → explain it back → Tale gets a new part.
export default function StoryLesson({ lesson, next, profile, partsDone, total, onClose, onFinish, onNext, addJournal, recordQuestion, onMinutes }) {
  const t = getTeacher(lesson.teacher);
  const steps = useMemo(() => {
    const beats = lesson.beats || [];
    const mid = Math.max(1, Math.ceil(beats.length / 2));
    return [
      { type: "intro" },
      ...beats.slice(0, mid).map((b) => ({ type: "beat", b })),
      ...(lesson.predict ? [{ type: "predict" }] : []),
      ...beats.slice(mid).map((b) => ({ type: "beat", b })),
      ...(lesson.check || []).map((q, k) => ({ type: "check", q, k })),
      ...(lesson.explain ? [{ type: "explain" }] : []),
      { type: "done" },
    ];
  }, [lesson]);
  const [i, setI] = useState(() => Math.min(Number(shot("step")) || 0, 99));
  const [prediction, setPrediction] = useState("");
  const [answers, setAnswers] = useState({}); // check index -> {first: bool, picked}
  const [explainText, setExplainText] = useState("");
  const [tutor, setTutor] = useState(null);
  const [leave, setLeave] = useState(false);
  const started = useRef(Date.now());
  const finished = useRef(false);
  const step = steps[i];
  const { mouth, talking } = useMouth();
  const { muted } = useSpeaking();
  const beatNo = steps.slice(0, i + 1).filter((s) => s.type === "beat").length;

  // The teacher narrates each story beat out loud.
  useEffect(() => {
    speaker.teacher = t.id;
    if (step.type === "beat") speaker.say(step.b.say);
    else if (step.type === "intro") speaker.say(`${lesson.title}. ${lesson.sub}.`);
    else if (step.type === "predict") speaker.say(`Before I tell you more, what do you think? ${lesson.predict.q}`);
    else if (step.type === "explain") speaker.say(lesson.explain.prompt);
    else speaker.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => () => speaker.cancel(), []);

  useEffect(() => {
    if (step.type !== "done" || finished.current) return;
    finished.current = true;
    const checks = lesson.check || [];
    const right = checks.filter((_, k) => answers[k]?.first).length;
    const missed = checks.filter((_, k) => answers[k] && !answers[k].first).map((q) => q.q);
    onFinish({ id: lesson.id, concepts: lesson.concepts || [], right, total: checks.length, missed });
    onMinutes(Math.max(1, Math.round((Date.now() - started.current) / 60000)), 50);
    setTimeout(() => speaker.say(`Wonderful! Tale just got ${lesson.taleGets}!`), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.type]);

  const go = (d) => setI((x) => Math.max(0, Math.min(steps.length - 1, x + d)));
  const canNext =
    step.type === "check" ? !!answers[step.k]?.correct : step.type === "predict" ? prediction.trim().length > 0 : true;

  const openTutor = (kind) =>
    setTutor({
      kind,
      lesson:
        kind === "explain"
          ? `${lesson.topic}. The learner just finished the story lesson "${lesson.title}" and is explaining it back in their own words. Give feedback against this answer key: ${lesson.explain.key}`
          : `${lesson.topic}, in the story lesson "${lesson.title}". The learner is stuck on this question: "${step.q?.q}". Give a small hint, never the answer.`,
      opener:
        kind === "explain"
          ? `${lesson.explain.prompt} Take your time. I'm listening.`
          : `Let's think about it together. What part of the question feels tricky?`,
    });

  return (
    <motion.div
      className={`story scene--${lesson.scene || "lab"}`}
      style={{ "--accent": t.color, "--accent-deep": t.deep, "--accent-soft": t.soft }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="story__top">
        <button className="iconbtn" onClick={() => (step.type === "done" || i === 0 ? onClose() : setLeave(true))} aria-label="Close lesson">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>
        </button>
        <div className="story__progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length - 1} aria-valuenow={i} aria-label="Lesson progress">
          <motion.i animate={{ width: `${(i / (steps.length - 1)) * 100}%` }} transition={spring} />
        </div>
        <MuteButton muted={muted} />
        <button className="iconbtn" onClick={() => openTutor("hint")} aria-label={`Ask ${t.short} a question`} title={`Ask ${t.short}`}>
          <span style={{ fontSize: 20 }}>💬</span>
        </button>
      </div>

      <div className="story__body">
        <AnimatePresence mode="wait">
          <motion.div key={i} className="story__step" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={spring}>
            {step.type === "intro" && (
              <div className="si">
                <span className="si__unit">Unit {lesson.unit} · {lesson.topic}</span>
                <h2>{lesson.title}</h2>
                <p>{lesson.sub}</p>
                <motion.div className="si__char" initial={{ y: 60, scale: 0.7 }} animate={{ y: 0, scale: 1 }} transition={{ ...bouncy, delay: 0.1 }}>
                  <Character teacher={t.id} size={170} mood={talking ? "talking" : "happy"} mouth={mouth} wave={!talking} />
                </motion.div>
                <div className="si__meta">
                  <span>👩‍🏫 With {t.name}</span>
                  <span>⏱ {lesson.mins} min</span>
                  <span>📚 {lesson.source}</span>
                </div>
                <div className="si__tale">
                  <Tale parts={partsDone} total={total} size={56} />
                  <small>
                    Today, Tale gets <b>{lesson.taleGets}</b>
                  </small>
                </div>
              </div>
            )}

            {step.type === "beat" && (
              <div className="sb">
                <div className="sb__art">
                  <motion.span className="sb__emoji" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
                    {step.b.art}
                  </motion.span>
                  {step.b.caption && <span className="sb__cap">{step.b.caption}</span>}
                  <span className="sb__count">
                    {beatNo}/{lesson.beats.length}
                  </span>
                </div>
                {step.b.widget && <Widget name={step.b.widget} />}
                <div className="sb__say">
                  <span className="sb__face">
                    <Character teacher={t.id} crop="head" size={64} mood={talking ? "talking" : "happy"} mouth={mouth} />
                  </span>
                  <p aria-live="polite">{step.b.say}</p>
                </div>
                {talking ? (
                  <button className="replay replay--stop" onClick={() => speaker.cancel()}>
                    <span className="dock__square" /> Stop talking
                  </button>
                ) : (
                  <button className="replay" onClick={() => speaker.say(step.b.say)}>
                    🔁 Hear it again
                  </button>
                )}
              </div>
            )}

            {step.type === "predict" && (
              <div className="sp">
                <span className="sp__tag">🤔 Think before you learn</span>
                <h3>{lesson.predict.q}</h3>
                <textarea
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder="Write your guess. There's no wrong answer yet!"
                  aria-label="Your prediction"
                  rows={4}
                />
                <details className="sp__hint">
                  <summary>Need a nudge?</summary>
                  {lesson.predict.hint}
                </details>
                <button className="link" onClick={() => setPrediction("I'm not sure yet.")}>
                  I'm not sure yet
                </button>
              </div>
            )}

            {step.type === "check" && (
              <Check
                q={step.q}
                n={step.k + 1}
                of={lesson.check.length}
                state={answers[step.k]}
                onPick={(idx) =>
                  setAnswers((a) => {
                    const prev = a[step.k];
                    const correct = idx === step.q.answer;
                    if (correct) speaker.say(`That's right! ${step.q.why}`);
                    return { ...a, [step.k]: { picked: idx, correct, first: prev ? prev.first : correct, tries: (prev?.tries || 0) + 1 } };
                  })
                }
                onHint={() => openTutor("hint")}
                teacher={t}
              />
            )}

            {step.type === "explain" && (
              <div className="sp">
                <span className="sp__tag">🗣 Explain it back</span>
                <h3>{lesson.explain.prompt}</h3>
                <Button onClick={() => openTutor("explain")}>🎙 Say it to {t.short}</Button>
                <span className="or">or write it</span>
                <textarea value={explainText} onChange={(e) => setExplainText(e.target.value)} placeholder="In my own words…" aria-label="Your explanation" rows={3} />
              </div>
            )}

            {step.type === "done" && (
              <div className="sd">
                <Confetti fire={1} />
                <motion.div initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }} transition={bouncy}>
                  <Tale parts={partsDone + (lesson && !finished.current ? 1 : 0)} total={total} size={170} fresh={Math.min(10, Math.round(((partsDone) / total) * 10))} />
                </motion.div>
                <h2>Tale just got {lesson.taleGets}!</h2>
                <p>
                  {partsDone} of {total} parts built · +50 XP
                </p>
                <div className="sd__concepts">
                  {(lesson.concepts || []).map((c) => (
                    <span key={c}>✓ {c}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="story__foot">
        {step.type === "done" ? (
          <>
            {next && <Button onClick={() => onNext(next.id)}>Next: {next.title} ▸</Button>}
            <Button variant={next ? "soft" : "primary"} onClick={onClose}>
              Back to my journey
            </Button>
          </>
        ) : (
          <div className="story__nav">
            {i > 0 && (
              <Button variant="soft" className="story__back" onClick={() => go(-1)} aria-label="Previous">
                ‹
              </Button>
            )}
            <Button
              disabled={!canNext}
              onClick={() => {
                if (step.type === "predict") addJournal({ type: "prediction", lessonId: lesson.id, teacher: t.id, q: lesson.predict.q, text: prediction.trim() });
                if (step.type === "explain" && explainText.trim()) addJournal({ type: "reflection", lessonId: lesson.id, teacher: t.id, q: lesson.explain.prompt, text: explainText.trim() });
                go(1);
              }}
            >
              {step.type === "intro" ? "Start the story" : step.type === "predict" ? "Save my guess" : step.type === "check" && !answers[step.k]?.correct ? "Pick an answer" : "Continue"}
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {tutor && (
          <TutorSession
            key="tutor"
            profile={profile}
            teacherId={t.id}
            lesson={tutor.lesson}
            opener={tutor.opener}
            onClose={() => setTutor(null)}
            onMinutes={() => {}}
            onQuestion={({ text, voice, teacher }) => {
              recordQuestion({ text, voice, teacher, explain: tutor.kind === "explain" });
              addJournal({ type: "question", lessonId: lesson.id, teacher, text });
            }}
          />
        )}
      </AnimatePresence>

      <Confirm
        open={leave}
        title="Leave this lesson?"
        body="Your answers in this lesson won't be saved. You can start it again any time."
        confirm="Leave"
        cancel="Keep learning"
        onCancel={() => setLeave(false)}
        onConfirm={onClose}
      />
    </motion.div>
  );
}

function Check({ q, n, of, state, onPick, onHint, teacher }) {
  const wrong = state && !state.correct;
  return (
    <div className="sc">
      <span className="sp__tag">✅ Check yourself · {n}/{of}</span>
      <h3>{q.q}</h3>
      <div className="sc__opts">
        {q.options.map((o, k) => {
          const picked = state?.picked === k;
          const cls = picked ? (state.correct ? "sc__opt--right" : "sc__opt--wrong") : "";
          return (
            <motion.button
              key={k}
              className={`sc__opt ${cls}`}
              onClick={() => !state?.correct && onPick(k)}
              animate={picked && !state.correct ? { x: [0, -8, 8, -5, 0] } : {}}
              transition={{ duration: 0.35 }}
              disabled={state?.correct && !picked}
            >
              <span className="sc__letter">{"ABC"[k]}</span>
              {o}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {state?.correct && (
          <motion.p className="sc__why" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            🎉 {q.why}
          </motion.p>
        )}
        {wrong && (
          <motion.div className="sc__hint" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p>Not quite. Hint: {q.hint}</p>
            <button className="chipbtn" onClick={onHint}>
              💬 Ask {teacher.short} for help
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Character from "../components/Character.jsx";
import { Bubble, Button, bouncy, spring, useMouth, useDeviceRoot } from "../components/ui.jsx";
import { CATEGORIES } from "../lib/people.js";
import { TEACHERS } from "../lib/teachers.js";
import { speaker } from "../lib/voice.js";
import { shot } from "../lib/shot.js";

// Hall of Laureates: pick a field, meet the top 5 winners, learn from any of them.
export default function Legends({ profile, setProfile, onAsk, onSeen, notify, initialCat = "physics" }) {
  const [cat, setCat] = useState(shot("cat") || initialCat);
  const [open, setOpen] = useState(shot("open"));
  const root = useDeviceRoot();
  const c = CATEGORIES.find((x) => x.id === cat);

  useEffect(() => onSeen?.(cat), [cat, onSeen]);

  return (
    <div className="legends">
      <p className="legends__sub">Pick a field, meet its greatest prize winners, and learn straight from them.</p>

      <div className="cats">
        {CATEGORIES.map((k) => (
          <motion.button
            key={k.id}
            className={`cat ${k.id === cat ? "cat--on" : ""}`}
            style={{ "--c": k.color }}
            onClick={() => setCat(k.id)}
            whileTap={{ scale: 0.9 }}
          >
            <span className="cat__icon">{k.icon}</span>
            <small>{k.name}</small>
            {k.id === cat && <motion.i layoutId="catglow" className="cat__glow" transition={bouncy} />}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cat} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={spring}>
          <div className="hall" style={{ "--c": c.color }}>
            <div className="hall__row">
              <span className="hall__icon">{c.icon}</span>
              <div>
                <b>Top 5 in {c.name}</b>
                <small>{c.award}</small>
              </div>
            </div>
            {c.note && <p className="hall__note">{c.note}</p>}
          </div>

          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
            {c.people.map((id, k) => {
              const p = TEACHERS[id];
              const mine = profile.teacher === id;
              return (
                <motion.button
                  key={id}
                  className="laur"
                  style={{ "--c": p.color, "--cs": p.soft }}
                  variants={{ hidden: { opacity: 0, y: 24, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: bouncy } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOpen(id)}
                >
                  <span className="laur__rank">{k + 1}</span>
                  <span className="laur__face">
                    <Character teacher={id} crop="head" size={66} mood={mine ? "happy" : "idle"} />
                  </span>
                  <span className="laur__txt">
                    <b>
                      {p.name} {mine && <em>Your teacher</em>}
                    </b>
                    <small className="laur__award">{p.award}</small>
                    <span className="laur__known">{p.known}</span>
                  </span>
                  <span className="laur__go">›</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {root && createPortal(
      <AnimatePresence>
        {open && (
          <LaureateSheet
            key={open}
            id={open}
            mine={profile.teacher === open}
            onClose={() => {
              speaker.cancel();
              setOpen(null);
            }}
            onAsk={() => {
              speaker.cancel();
              onAsk(open);
              setOpen(null);
            }}
            onChoose={() => {
              const prev = profile.teacher;
              setProfile({ teacher: open });
              notify?.({ text: `${TEACHERS[open].short} is now your teacher`, undo: () => setProfile({ teacher: prev }) });
              speaker.teacher = open;
              speaker.say(`Wonderful! I'll be your teacher from now on.`);
            }}
          />
        )}
      </AnimatePresence>,
        root
      )}
    </div>
  );
}

function LaureateSheet({ id, mine, onClose, onAsk, onChoose }) {
  const p = TEACHERS[id];
  const { mouth, talking } = useMouth();
  const [wave, setWave] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !speaker.speaking && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      speaker.teacher = id;
      speaker.say(p.hello);
    }, 450);
    const t2 = setTimeout(() => setWave(false), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [id, p.hello]);

  return (
    <motion.div className="sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        style={{ "--accent": p.color, "--accent-deep": p.deep, "--accent-soft": p.soft }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
      >
        <span className="sheet__grab" />
        <div className="sheet__stage">
          <div className="sheet__glow" />
          <AnimatePresence>{talking && <Bubble text={p.hello} from="bottom" className="sheet__bubble" speed={22} />}</AnimatePresence>
          <motion.div initial={{ y: 60, scale: 0.7 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}>
            <Character teacher={id} size={190} mood={talking ? "talking" : "happy"} mouth={mouth} wave={wave && !talking} />
          </motion.div>
        </div>
        <motion.div className="sheet__body" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}>
          <motion.h3 variants={pop}>{p.name}</motion.h3>
          <motion.span className="sheet__award" variants={pop}>
            🏅 {p.award}
          </motion.span>
          <motion.p variants={pop}>{p.known}</motion.p>
          <motion.p variants={pop} className="disclaimer">A cartoon AI character inspired by {p.name}, not the real person.</motion.p>
          <motion.div className="sheet__btns" variants={pop}>
            <Button onClick={onAsk}>Ask {p.short} a question</Button>
            <Button variant="soft" onClick={onChoose} disabled={mine}>
              {mine ? `✓ ${p.short} is your teacher` : `Make ${p.short} my teacher`}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const pop = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } };

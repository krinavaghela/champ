import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Character from "../components/Character.jsx";
import { Button, spring, useDeviceRoot } from "../components/ui.jsx";
import { getTeacher } from "../lib/teachers.js";
import { LESSONS } from "../lib/course.js";
import { shot } from "../lib/shot.js";

// My Learning Journal: a notebook to write in, a board to draw or hand-write on,
// plus everything saved automatically: predictions, explanations, questions asked.
const FILTERS = [
  ["all", "All"],
  ["writing", "✏️ Writing"],
  ["drawing", "🎨 Drawings"],
  ["question", "❓ Questions"],
  ["lesson", "📖 Lesson notes"],
];
const TYPE = {
  reflection: { icon: "✏️", label: "Reflection" },
  note: { icon: "📝", label: "Note" },
  prediction: { icon: "🤔", label: "My prediction" },
  question: { icon: "❓", label: "Question I asked" },
  drawing: { icon: "🎨", label: "Drawing" },
};

export default function Journal({ state, addJournal, removeJournal, notify }) {
  const [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState(shot("editor"));
  const root = useDeviceRoot(); // "write" | "draw" | "hand"
  const entries = (state.journal || []).filter((e) =>
    filter === "all"
      ? true
      : filter === "writing"
        ? e.type === "reflection" || e.type === "note"
        : filter === "lesson"
          ? e.type === "prediction" || (e.lessonId && e.type === "reflection")
          : e.type === filter
  );

  const remove = (e) => {
    removeJournal(e.id);
    notify?.({ text: "Entry deleted", undo: () => addJournal({ ...e }) });
  };

  return (
    <>
      <div className="jr-new">
        <motion.button className="jr-new__b" whileTap={{ scale: 0.95 }} onClick={() => setEditor("write")}>
          <span>✏️</span>
          <b>Write</b>
          <small>Thoughts & reflections</small>
        </motion.button>
        <motion.button className="jr-new__b" whileTap={{ scale: 0.95 }} onClick={() => setEditor("hand")}>
          <span>🖊️</span>
          <b>Handwrite</b>
          <small>Lined notebook</small>
        </motion.button>
        <motion.button className="jr-new__b" whileTap={{ scale: 0.95 }} onClick={() => setEditor("draw")}>
          <span>🎨</span>
          <b>Draw</b>
          <small>Sketch an idea</small>
        </motion.button>
      </div>

      <div className="chips-row" role="tablist">
        {FILTERS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={filter === id} className={`fchip ${filter === id ? "fchip--on" : ""}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card empty">
          <span className="empty__big">📓</span>
          <b>{filter === "all" ? "Your journal is empty" : "Nothing here yet"}</b>
          <p>Your predictions, explanations and questions from lessons are saved here automatically. You can also write or draw anything you like.</p>
        </div>
      ) : (
        <motion.div initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.04 } } }}>
          {entries.map((e) => {
            const tp = TYPE[e.type] || TYPE.note;
            const l = LESSONS.find((x) => x.id === e.lessonId);
            const tt = e.teacher ? getTeacher(e.teacher) : null;
            return (
              <motion.article key={e.id} className="jr" variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0, transition: spring } }}>
                <header>
                  <span className="jr__type">
                    {tp.icon} {tp.label}
                  </span>
                  <time>{new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                  <button className="jr__del" onClick={() => remove(e)} aria-label="Delete entry">
                    ✕
                  </button>
                </header>
                {e.title && <h4>{e.title}</h4>}
                {e.q && <p className="jr__q">{e.q}</p>}
                {e.text && <p className="jr__text">{e.text}</p>}
                {e.image && <img src={e.image} alt={e.title || "Drawing from my journal"} className="jr__img" />}
                {(l || tt) && (
                  <footer>
                    {tt && <Character teacher={tt.id} crop="head" size={24} />}
                    {l ? l.title : tt?.name}
                  </footer>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      )}

      {root && createPortal(
        <AnimatePresence>
          {editor === "write" && (
            <WriteSheet
              onClose={() => setEditor(null)}
              onSave={(entry) => {
                addJournal({ type: "reflection", ...entry });
                setEditor(null);
                notify?.({ text: "Saved to your journal ✏️" });
              }}
            />
          )}
          {(editor === "draw" || editor === "hand") && (
            <DrawSheet
              lined={editor === "hand"}
              onClose={() => setEditor(null)}
              onSave={(entry) => {
                addJournal({ type: "drawing", ...entry });
                setEditor(null);
                notify?.({ text: "Saved to your journal 🎨" });
              }}
            />
          )}
        </AnimatePresence>,
        root
      )}
    </>
  );
}

function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div className="sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="sheet sheet--tall" role="dialog" aria-modal="true" aria-label={title} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 30 }}>
        <div className="sheet__head">
          <button className="link" onClick={onClose}>
            Cancel
          </button>
          <b>{title}</b>
          <span style={{ width: 52 }} />
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const PROMPTS = ["What surprised me today…", "A question I still have…", "I could explain it to a friend like this…", "If I built my own AI, it would…"];

function WriteSheet({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  return (
    <Sheet title="New entry" onClose={onClose}>
      <input className="jr-input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
      <textarea className="jr-area" placeholder="Write anything…" value={text} onChange={(e) => setText(e.target.value)} autoFocus aria-label="Entry" rows={8} />
      <div className="chips-row">
        {PROMPTS.map((p) => (
          <button key={p} className="fchip" onClick={() => setText((t) => (t ? t + "\n" : "") + p + " ")}>
            {p}
          </button>
        ))}
      </div>
      <Button disabled={!text.trim()} onClick={() => onSave({ title: title.trim(), text: text.trim() })}>
        Save to journal
      </Button>
    </Sheet>
  );
}

const COLORS = ["#1E1A2B", "#FF8A3D", "#4F7CFF", "#1FB57A", "#E5484D", "#8B5CF6", "#F5B700"];

function DrawSheet({ lined, onClose, onSave }) {
  const canvas = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(lined ? 3 : 6);
  const [eraser, setEraser] = useState(false);
  const [title, setTitle] = useState("");
  const [strokes, setStrokes] = useState(0);
  const history = useRef([]);
  const drawing = useRef(false);
  const last = useRef(null);

  const paper = (ctx, w, h) => {
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, w, h);
    if (lined) {
      ctx.strokeStyle = "#cfe0f5";
      ctx.lineWidth = 1;
      for (let y = 40; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#f5c2c2";
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.lineTo(36, h);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const c = canvas.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    paper(ctx, r.width, r.height);
    history.current = [ctx.getImageData(0, 0, c.width, c.height)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5 };
  };
  const down = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    move(e);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvas.current.getContext("2d");
    const p = pos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = eraser ? "#fffdf8" : color;
    ctx.lineWidth = (eraser ? size * 3 : size) * (e.pointerType === "pen" ? 0.6 + p.p : 1);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvas.current;
    history.current.push(c.getContext("2d").getImageData(0, 0, c.width, c.height));
    if (history.current.length > 30) history.current.shift();
    setStrokes((n) => n + 1);
  };
  const undo = () => {
    if (history.current.length < 2) return;
    history.current.pop();
    canvas.current.getContext("2d").putImageData(history.current[history.current.length - 1], 0, 0);
    setStrokes((n) => Math.max(0, n - 1));
  };
  const clear = () => {
    const c = canvas.current;
    const r = c.getBoundingClientRect();
    paper(c.getContext("2d"), r.width, r.height);
    history.current = [c.getContext("2d").getImageData(0, 0, c.width, c.height)];
    setStrokes(0);
  };
  const save = () => {
    // Downscale to keep the journal small enough for on-device storage.
    const c = canvas.current;
    const out = document.createElement("canvas");
    const scale = 600 / c.width;
    out.width = 600;
    out.height = c.height * scale;
    out.getContext("2d").drawImage(c, 0, 0, out.width, out.height);
    onSave({ title: title.trim() || (lined ? "Handwritten note" : "My drawing"), image: out.toDataURL("image/jpeg", 0.8) });
  };

  return (
    <Sheet title={lined ? "Handwriting" : "Drawing board"} onClose={onClose}>
      <input className="jr-input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
      <canvas
        ref={canvas}
        className="board"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        aria-label={lined ? "Handwriting area. Write with your finger, mouse or pen." : "Drawing area. Draw with your finger, mouse or pen."}
        role="img"
      />
      <div className="board__tools">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`swatch ${!eraser && color === c ? "swatch--on" : ""}`}
            style={{ background: c }}
            onClick={() => {
              setColor(c);
              setEraser(false);
            }}
            aria-label={`Colour ${c}`}
          />
        ))}
      </div>
      <div className="board__tools">
        {[3, 6, 12].map((s) => (
          <button key={s} className={`sizebtn ${size === s ? "sizebtn--on" : ""}`} onClick={() => setSize(s)} aria-label={`Brush size ${s}`}>
            <i style={{ width: s + 4, height: s + 4 }} />
          </button>
        ))}
        <button className={`toolbtn ${eraser ? "toolbtn--on" : ""}`} onClick={() => setEraser((x) => !x)} aria-pressed={eraser}>
          🧽 Eraser
        </button>
        <button className="toolbtn" onClick={undo} disabled={!strokes}>
          ↶ Undo
        </button>
        <button className="toolbtn" onClick={clear} disabled={!strokes}>
          🗑 Clear
        </button>
      </div>
      <Button disabled={!strokes} onClick={save}>
        Save to journal
      </Button>
    </Sheet>
  );
}

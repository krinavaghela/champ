import { motion } from "framer-motion";

// Tale: the little storytelling robot the learner builds across the course.
// `parts` = how many lessons are finished; each lesson bolts on one more piece.
// `total` = lessons in the course. `fresh` = index of the part to celebrate.
const INK = "#1E1A2B";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" };

export default function Tale({ parts = 0, total = 17, size = 160, fresh = -1 }) {
  // Map lesson count onto ten visual stages so every lesson visibly adds something.
  const stage = Math.min(10, Math.round((parts / Math.max(1, total)) * 10));
  const pop = (k) => (k === fresh ? { initial: { scale: 0, rotate: -30 }, animate: { scale: [0, 1.3, 1], rotate: 0 }, transition: { duration: 0.8, delay: 0.3 } } : {});
  const show = (k) => stage >= k;
  const talking = stage >= 10;
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} className="tale" role="img" aria-label={`Tale the storytelling robot, ${parts} of ${total} parts built`}>
      <ellipse cx="100" cy="212" rx="60" ry="6" fill="rgba(30,26,43,0.12)" />
      {/* frame (always there: an empty shell waiting to be built) */}
      <g className="tale__bob">
        {show(6) && (
          <motion.g {...pop(6)}>
            <path d="M48 128 Q28 140 30 168" fill="none" {...S} strokeWidth="9" />
            <path d="M48 128 Q28 140 30 168" fill="none" stroke="#9fb3c8" strokeWidth="5" strokeLinecap="round" />
            <path d="M152 128 Q172 140 170 168" fill="none" {...S} strokeWidth="9" />
            <path d="M152 128 Q172 140 170 168" fill="none" stroke="#9fb3c8" strokeWidth="5" strokeLinecap="round" />
            <circle cx="30" cy="172" r="8" fill="#FFB27A" {...S} />
            <circle cx="170" cy="172" r="8" fill="#FFB27A" {...S} />
          </motion.g>
        )}
        <rect x="50" y="112" width="100" height="86" rx="22" fill={show(1) ? "#D7E3F1" : "none"} {...S} strokeDasharray={show(1) ? "0" : "6 6"} />
        {show(4) && (
          <motion.g {...pop(4)}>
            <rect x="66" y="128" width="68" height="40" rx="10" fill="#1E1A2B" />
            <motion.path d="M74 150 l8 -8 l8 10 l8 -14 l8 12 l8 -6 l8 6" fill="none" stroke="#7DFFB8" strokeWidth="3" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />
          </motion.g>
        )}
        {show(7) && (
          <motion.g {...pop(7)}>
            <path d="M84 180 h32 v14 h-32 z" fill="#FFE2CC" {...S} strokeWidth="2.4" />
            <path d="M100 180 v14" {...S} strokeWidth="2" />
          </motion.g>
        )}
        {/* neck + head */}
        <rect x="90" y="98" width="20" height="16" fill={show(1) ? "#B9C9DB" : "none"} {...S} strokeDasharray={show(1) ? "0" : "5 5"} />
        <rect x="46" y="34" width="108" height="70" rx="26" fill={show(1) ? "#E6EEF7" : "none"} {...S} strokeDasharray={show(1) ? "0" : "6 6"} />
        {show(2) && (
          <motion.g {...pop(2)}>
            <circle cx="78" cy="66" r="13" fill="#fff" {...S} />
            <circle cx="122" cy="66" r="13" fill="#fff" {...S} />
            <motion.g animate={{ x: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <circle cx="80" cy="67" r="6" fill={INK} />
              <circle cx="124" cy="67" r="6" fill={INK} />
              <circle cx="78" cy="65" r="2" fill="#fff" />
              <circle cx="122" cy="65" r="2" fill="#fff" />
            </motion.g>
          </motion.g>
        )}
        {show(3) && (
          <motion.g {...pop(3)}>
            <rect x="34" y="56" width="14" height="24" rx="6" fill="#FF8A3D" {...S} />
            <rect x="152" y="56" width="14" height="24" rx="6" fill="#FF8A3D" {...S} />
          </motion.g>
        )}
        {show(5) && (
          <motion.g {...pop(5)}>
            <path d="M100 34 V16" {...S} />
            <motion.circle cx="100" cy="12" r="7" fill="#FFD93D" {...S} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ transformOrigin: "100px 12px" }} />
          </motion.g>
        )}
        {show(8) ? (
          <motion.path {...pop(8)} d={talking ? "M84 86 Q100 100 116 86 Q100 92 84 86 Z" : "M86 88 Q100 96 114 88"} fill={talking ? "#6B1F2A" : "none"} {...S} />
        ) : (
          show(1) && <path d="M90 90 h20" {...S} opacity="0.4" />
        )}
        {show(9) && (
          <motion.g {...pop(9)}>
            <circle cx="64" cy="84" r="6" fill="#FF9DB0" opacity="0.6" />
            <circle cx="136" cy="84" r="6" fill="#FF9DB0" opacity="0.6" />
          </motion.g>
        )}
        {talking && (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} style={{ transformOrigin: "170px 30px" }}>
            <path d="M150 6 H194 Q198 6 198 10 V34 Q198 38 194 38 H168 L160 46 L161 38 H150 Q146 38 146 34 V10 Q146 6 150 6 Z" fill="#fff" {...S} strokeWidth="2.4" />
            <text x="172" y="27" textAnchor="middle" fontSize="13" fontWeight="900" fill={INK}>Once…</text>
          </motion.g>
        )}
      </g>
    </svg>
  );
}

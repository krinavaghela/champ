// Animal Mindset Badge medals, drawn in the same ink-outline cartoon style as the teachers.
const INK = "#1E1A1D";
const S = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: "round", strokeLinecap: "round" };

const Eye = ({ x, y, r = 3.2 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={INK} />
    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </g>
);

const ANIMALS = {
  chimp: () => (
    <g>
      <circle cx="28" cy="50" r="9" fill="#6B4A3A" {...S} />
      <circle cx="72" cy="50" r="9" fill="#6B4A3A" {...S} />
      <circle cx="28" cy="50" r="4.5" fill="#E9BE97" />
      <circle cx="72" cy="50" r="4.5" fill="#E9BE97" />
      <circle cx="50" cy="48" r="24" fill="#6B4A3A" {...S} />
      <path d="M50 44 C46 36 32 36 32 47 C32 54 36 56 38 58 C34 66 40 74 50 74 C60 74 66 66 62 58 C64 56 68 54 68 47 C68 36 54 36 50 44 Z" fill="#E9BE97" {...S} />
      <Eye x={42} y={47} />
      <Eye x={58} y={47} />
      <path d="M47 57 l1 1 M53 57 l-1 1" {...S} />
      <path d="M42 64 Q50 71 58 64" fill="none" {...S} />
    </g>
  ),
  owl: () => (
    <g>
      <path d="M30 34 L34 22 L42 30 Z M70 34 L66 22 L58 30 Z" fill="#7A4E2A" {...S} />
      <ellipse cx="50" cy="52" rx="24" ry="25" fill="#A0703F" {...S} />
      <ellipse cx="50" cy="62" rx="14" ry="13" fill="#E8D2AE" />
      <path d="M44 60 q3 3 6 0 q3 3 6 0 M44 67 q3 3 6 0 q3 3 6 0" fill="none" stroke="#B88C5E" strokeWidth="1.6" />
      <circle cx="40" cy="44" r="10" fill="#fff" {...S} />
      <circle cx="60" cy="44" r="10" fill="#fff" {...S} />
      <Eye x={41} y={45} r={4.4} />
      <Eye x={59} y={45} r={4.4} />
      <path d="M46 52 L54 52 L50 59 Z" fill="#F5A623" {...S} />
    </g>
  ),
  fox: () => (
    <g>
      <path d="M26 24 L36 46 L44 34 Z M74 24 L64 46 L56 34 Z" fill="#F07A22" {...S} />
      <path d="M30 30 L36 40 M70 30 L64 40" stroke="#3A2016" strokeWidth="3" />
      <path d="M24 40 C30 32 70 32 76 40 C76 58 62 74 50 78 C38 74 24 58 24 40 Z" fill="#F07A22" {...S} />
      <path d="M26 46 C34 50 42 58 50 78 C58 58 66 50 74 46 C70 62 60 74 50 78 C40 74 30 62 26 46 Z" fill="#FFF4E8" {...S} />
      <Eye x={40} y={50} />
      <Eye x={60} y={50} />
      <ellipse cx="50" cy="70" rx="4" ry="3" fill={INK} />
    </g>
  ),
  lion: () => (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 24} cy={50 + Math.sin(a) * 24} r="10" fill="#C2621B" {...S} />;
      })}
      <circle cx="50" cy="50" r="24" fill="#C2621B" />
      <circle cx="34" cy="34" r="6" fill="#F2B544" {...S} />
      <circle cx="66" cy="34" r="6" fill="#F2B544" {...S} />
      <circle cx="50" cy="52" r="19" fill="#F2B544" {...S} />
      <Eye x={43} y={48} />
      <Eye x={57} y={48} />
      <ellipse cx="50" cy="60" rx="9" ry="6" fill="#FBE3B0" />
      <path d="M46 56 L54 56 L50 60 Z" fill="#6B3A2A" {...S} strokeWidth="1.6" />
      <path d="M50 60 v3 M46 64 q4 3 8 0" fill="none" {...S} strokeWidth="1.8" />
    </g>
  ),
  elephant: () => (
    <g>
      <path d="M30 34 C14 30 12 60 26 64 C32 66 36 60 36 56 Z" fill="#A9B4C2" {...S} />
      <path d="M70 34 C86 30 88 60 74 64 C68 66 64 60 64 56 Z" fill="#A9B4C2" {...S} />
      <circle cx="50" cy="46" r="20" fill="#B8C2CE" {...S} />
      <path d="M44 56 C44 66 42 74 36 78 C34 80 38 84 42 80 C50 74 56 66 56 56 Z" fill="#B8C2CE" {...S} />
      <Eye x={42} y={44} />
      <Eye x={58} y={44} />
      <path d="M42 62 q-4 4 -6 2 M58 62 q4 4 6 2" fill="none" stroke="#fff" strokeWidth="3" />
    </g>
  ),
  tortoise: () => (
    <g>
      <circle cx="78" cy="50" r="9" fill="#9BCB6B" {...S} />
      <Eye x={80} y={48} r={2.4} />
      <path d="M26 66 l-2 8 h8 l0 -6 M66 66 l2 8 h-8 l0 -6" fill="#9BCB6B" {...S} />
      <path d="M18 66 C18 40 32 30 46 30 C60 30 74 40 74 66 Z" fill="#2E8B57" {...S} />
      <path d="M38 40 l8 -4 l8 4 v8 l-8 4 l-8 -4 Z M26 58 l6 -6 l8 4 v8 h-14 Z M66 58 l-6 -6 l-8 4 v8 h14 Z" fill="#3FAE6E" {...S} strokeWidth="1.8" />
      <path d="M14 66 H78" {...S} />
    </g>
  ),
  ant: () => (
    <g>
      <path d="M40 30 C36 20 30 18 26 20 M52 30 C56 20 62 18 66 20" fill="none" {...S} />
      <path d="M36 54 L22 46 M36 58 L20 62 M40 62 L28 76 M62 54 L76 46 M62 58 L78 62 M58 62 L70 76" fill="none" {...S} />
      <circle cx="46" cy="38" r="11" fill="#D9372B" {...S} />
      <ellipse cx="49" cy="57" rx="9" ry="8" fill="#B92E24" {...S} />
      <ellipse cx="54" cy="74" rx="13" ry="10" fill="#D9372B" {...S} />
      <Eye x={42} y={36} r={2.6} />
      <Eye x={51} y={36} r={2.6} />
      <path d="M42 43 q4 3 8 0" fill="none" {...S} strokeWidth="1.8" />
    </g>
  ),
  beaver: () => (
    <g>
      <circle cx="30" cy="34" r="6" fill="#7A4A26" {...S} />
      <circle cx="70" cy="34" r="6" fill="#7A4A26" {...S} />
      <circle cx="50" cy="50" r="24" fill="#93592E" {...S} />
      <ellipse cx="50" cy="60" rx="13" ry="10" fill="#D6A877" {...S} />
      <Eye x={41} y={46} />
      <Eye x={59} y={46} />
      <ellipse cx="50" cy="55" rx="4.5" ry="3" fill={INK} />
      <path d="M45 62 h10 v9 h-10 Z" fill="#fff" {...S} strokeWidth="2" />
      <path d="M50 62 v9" stroke={INK} strokeWidth="1.6" />
    </g>
  ),
  dolphin: () => (
    <g>
      <path d="M14 64 C24 30 62 22 80 40 C84 44 86 48 88 50 C82 50 78 50 74 52 C66 46 52 44 40 52 C30 58 24 66 22 74 Z" fill="#5AB3E6" {...S} />
      <path d="M44 34 L52 20 L58 32 Z" fill="#5AB3E6" {...S} />
      <path d="M22 74 L12 80 L20 68 Z" fill="#5AB3E6" {...S} />
      <path d="M40 54 C52 48 64 50 74 54" fill="none" stroke="#D7F0FF" strokeWidth="4" />
      <Eye x={68} y={42} r={2.8} />
      <path d="M76 50 q-4 4 -10 3" fill="none" {...S} strokeWidth="1.8" />
      <circle cx="30" cy="30" r="3" fill="#BEE6FF" />
      <circle cx="24" cy="38" r="2" fill="#BEE6FF" />
    </g>
  ),
  octopus: () => (
    <g>
      {[22, 34, 46, 58, 70].map((x, i) => (
        <path key={x} d={`M${x + 4} 58 C${x} 70 ${x + (i % 2 ? 8 : -6)} 76 ${x + (i % 2 ? 2 : 0)} 82`} fill="none" stroke={INK} strokeWidth="9.5" strokeLinecap="round" />
      ))}
      {[22, 34, 46, 58, 70].map((x, i) => (
        <path key={"c" + x} d={`M${x + 4} 58 C${x} 70 ${x + (i % 2 ? 8 : -6)} 76 ${x + (i % 2 ? 2 : 0)} 82`} fill="none" stroke="#E0569B" strokeWidth="5.5" strokeLinecap="round" />
      ))}
      <path d="M22 58 C20 32 34 22 50 22 C66 22 80 32 78 58 C70 64 30 64 22 58 Z" fill="#E0569B" {...S} />
      <Eye x={41} y={44} r={3.6} />
      <Eye x={59} y={44} r={3.6} />
      <path d="M44 54 q6 5 12 0" fill="none" {...S} strokeWidth="2" />
      <circle cx="36" cy="32" r="3" fill="#F7A8CF" />
    </g>
  ),
  eagle: () => (
    <g>
      <path d="M20 80 C22 62 34 56 50 56 C66 56 78 62 80 80 Z" fill="#6B4226" {...S} />
      <path d="M30 50 C28 30 40 22 52 22 C66 22 74 32 72 48 C70 58 60 64 50 64 C40 64 32 60 30 50 Z" fill="#fff" {...S} />
      <path d="M36 40 L48 44 M64 40 L54 44" stroke={INK} strokeWidth="3.2" />
      <Eye x={44} y={46} r={2.8} />
      <Eye x={58} y={46} r={2.8} />
      <path d="M48 48 C52 46 62 48 62 54 C62 60 56 62 54 58 C54 56 50 54 48 54 Z" fill="#F5B700" {...S} />
    </g>
  ),
  cheetah: () => (
    <g>
      <circle cx="32" cy="32" r="8" fill="#E8A93A" {...S} />
      <circle cx="68" cy="32" r="8" fill="#E8A93A" {...S} />
      <circle cx="32" cy="32" r="3.5" fill="#3A2416" />
      <circle cx="68" cy="32" r="3.5" fill="#3A2416" />
      <path d="M26 46 C26 30 38 24 50 24 C62 24 74 30 74 46 C74 64 62 76 50 76 C38 76 26 64 26 46 Z" fill="#F2B544" {...S} />
      <path d="M38 60 C40 70 46 74 50 74 C54 74 60 70 62 60 C58 64 54 64 50 62 C46 64 42 64 38 60 Z" fill="#FFF3DC" />
      {[[36, 36], [44, 31], [56, 31], [64, 36], [32, 48], [68, 48], [50, 36]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#3A2416" />
      ))}
      <Eye x={42} y={47} />
      <Eye x={58} y={47} />
      <path d="M41 51 C40 56 41 60 44 63 M59 51 C60 56 59 60 56 63" fill="none" stroke="#3A2416" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M46 56 L54 56 L50 61 Z" fill="#3A2416" />
      <path d="M50 61 v3 M46 66 q4 3 8 0" fill="none" {...S} strokeWidth="1.8" />
    </g>
  ),
  bee: () => (
    <g>
      <ellipse cx="34" cy="34" rx="12" ry="9" fill="#E8F6FF" {...S} transform="rotate(-25 34 34)" />
      <ellipse cx="62" cy="32" rx="12" ry="9" fill="#E8F6FF" {...S} transform="rotate(20 62 32)" />
      <path d="M44 26 C42 18 38 16 34 18 M56 26 C58 18 62 16 66 18" fill="none" {...S} />
      <ellipse cx="50" cy="56" rx="22" ry="20" fill="#FFCF33" {...S} />
      <path d="M32 50 C40 46 60 46 68 50 L70 58 C60 54 40 54 30 58 Z M32 66 C40 62 60 62 68 66 L64 72 C56 70 44 70 36 72 Z" fill={INK} />
      <Eye x={43} y={44} r={2.8} />
      <Eye x={57} y={44} r={2.8} />
      <path d="M72 62 L80 64 L72 68" fill={INK} />
    </g>
  ),
};

export default function Badge({ id, color = "#FF8A3D", earned = true, size = 96, progress }) {
  const Animal = ANIMALS[id] || ANIMALS.chimp;
  const gid = `bd-${id}`;
  return (
    <svg viewBox="0 0 100 112" width={size} height={size * 1.12} className={`badge-svg ${earned ? "" : "badge-svg--locked"}`} aria-hidden>
      <defs>
        <clipPath id={gid}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>
      {/* ribbon tails */}
      <path d="M30 80 L22 108 L33 102 L40 110 L46 86 Z" fill={earned ? color : "#CFC6BA"} {...S} />
      <path d="M70 80 L78 108 L67 102 L60 110 L54 86 Z" fill={earned ? color : "#CFC6BA"} {...S} />
      {/* medal */}
      <circle cx="50" cy="50" r="47" fill={earned ? color : "#D8CFC4"} {...S} />
      <circle cx="50" cy="50" r="40" fill={earned ? "#FFF8EE" : "#EFE8DF"} {...S} />
      {earned && <path d="M22 34 A32 32 0 0 1 50 18" fill="none" stroke="#fff" strokeWidth="4" opacity="0.8" />}
      <g clipPath={`url(#${gid})`}>
        <g transform="translate(5 6) scale(0.9)" opacity={earned ? 1 : 0.45} style={earned ? undefined : { filter: "grayscale(1)" }}>
          <Animal />
        </g>
      </g>
      {!earned && (
        <g transform="translate(50 52)">
          <rect x="-9" y="-3" width="18" height="15" rx="3" fill="#8C8173" {...S} strokeWidth="2" />
          <path d="M-5 -3 v-4 a5 5 0 0 1 10 0 v4" fill="none" {...S} strokeWidth="2.6" />
        </g>
      )}
      {!earned && progress != null && (
        <g>
          <rect x="22" y="90" width="56" height="9" rx="4.5" fill="#fff" {...S} strokeWidth="1.8" />
          <rect x="24" y="92" width={Math.max(0, Math.min(1, progress)) * 52} height="5" rx="2.5" fill={color} />
        </g>
      )}
    </svg>
  );
}

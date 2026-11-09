import { useEffect, useId, useState } from "react";
import { getTeacher } from "../lib/teachers.js";

// Cartoon portraits of real scientists and laureates, drawn entirely in SVG.
// Style: bold ink outlines, flat colour with one cel-shade tone, big expressive
// eyes, oversized noses and recognisable hair and clothes.
// Each person is described by a "look" in lib/people.js, so one renderer draws everyone.
// All motion is code-driven: breathing, blinking, head tilt, nodding, waving and lip-sync.
//
// props:
//  teacher: person id from lib/people.js
//  mood: "idle" | "happy" | "talking" | "listening" | "thinking" | "sad"
//  mouth: 0..1 (how open the mouth is, drive this while speaking)
//  wave, nodding: boolean
//  size: px width
//  crop: "head" draws only the head and shoulders (for avatars)

const INK = "#1E1A1D";
const SW = 2.6;

const SKIN = {
  fair: ["#FAD9C1", "#E9B597", "#E39A86"],
  light: ["#F4C9A4", "#DFA67F", "#E08C78"],
  tan: ["#DDA273", "#C2845A", "#C9705C"],
  brown: ["#B87A50", "#9A603B", "#A4553F"],
  dark: ["#8C5535", "#704026", "#7E3E2C"],
  deep: ["#6E4029", "#55301E", "#6A3324"],
};

const FACE = {
  oval: "M66 92 C66 60 80 47 100 47 C120 47 134 60 134 92 C134 120 122 141 100 141 C78 141 66 120 66 92 Z",
  round: "M63 94 C63 60 80 48 100 48 C120 48 137 60 137 94 C137 124 122 139 100 139 C78 139 63 124 63 94 Z",
  long: "M68 90 C68 58 82 45 100 45 C118 45 132 58 132 90 C132 122 120 146 100 146 C80 146 68 122 68 90 Z",
  square: "M64 90 C64 58 80 46 100 46 C120 46 136 58 136 90 C137 112 134 132 120 139 C110 143 90 143 80 139 C66 132 63 112 64 90 Z",
};
const EDGE = { oval: 66, round: 63, long: 68, square: 64 };

export default function Character({
  teacher = "einstein",
  mood = "idle",
  mouth = 0,
  wave = false,
  nodding = false,
  size = 220,
  crop,
  className = "",
  style,
}) {
  const uid = useId().replace(/:/g, "");
  const [blink, setBlink] = useState(false);
  const p = getTeacher(teacher);
  const L = p.look;
  const [skin, shade, blush] = SKIN[L.skin] || SKIN.light;

  useEffect(() => {
    let t;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, 1800 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const look = mood === "thinking" ? { x: 3, y: -3 } : mood === "listening" ? { x: -1.5, y: 0.5 } : { x: 0, y: 0 };
  const browLift = mood === "listening" ? -4 : mood === "thinking" ? -2 : mood === "sad" ? 2 : mood === "happy" ? -1.5 : 0;
  const open = Math.max(0, Math.min(1, mouth));
  const talking = open > 0.06;
  const head = crop === "head";
  const face = FACE[L.face] || FACE.oval;
  const edge = EDGE[L.face] || 66;

  return (
    <svg
      viewBox={head ? "26 16 148 148" : "0 0 200 250"}
      width={size}
      height={head ? size : size * 1.25}
      className={`chr chr--${mood} ${nodding ? "chr--nod" : ""} ${wave ? "chr--wave" : ""} ${className}`}
      style={style}
      aria-label={`Cartoon of ${p.name}`}
      role="img"
    >
      <defs>
        <clipPath id={`face${uid}`}>
          <path d={face} />
        </clipPath>
        <clipPath id={`m${uid}`}>
          <ellipse cx="100" cy="129" rx={7 + open * 4} ry={1.5 + open * 7} />
        </clipPath>
      </defs>

      {!head && <ellipse cx="100" cy="246" rx="66" ry="6" fill="rgba(30,26,29,0.12)" className="chr__shadow" />}

      <g className="chr__body" strokeLinejoin="round" strokeLinecap="round">
        <HairBack L={L} />

        {/* neck */}
        <path d="M88 126 L88 162 L112 162 L112 126 Z" fill={skin} stroke={INK} strokeWidth={SW} />
        <path d="M88 132 Q100 146 112 132 L112 127 L88 127 Z" fill={shade} />

        <Outfit L={L} skin={skin} shade={shade} />

        {/* arms */}
        <g className="chr__armR">
          <Arm d="M138 174 Q156 204 148 234" L={L} />
          <Hand x={148} y={238} skin={skin} flip />
          {L.prop === "vial" && <Vial />}
          {L.prop === "spark" && <Spark />}
          {L.prop === "brush" && <Brush />}
        </g>
        <g className="chr__armL">
          <Arm d="M62 174 Q44 204 52 234" L={L} />
          <Hand x={52} y={238} skin={skin} />
        </g>

        {/* head */}
        <g className="chr__head">
          <Ear x={edge + 1} skin={skin} shade={shade} />
          <Ear x={200 - edge - 1} skin={skin} shade={shade} flip />
          <path d={face} fill={skin} />
          {/* cel shading: jaw + right cheek */}
          <g clipPath={`url(#face${uid})`}>
            <path d="M140 60 C128 96 128 128 100 150 L150 156 Z" fill={shade} opacity="0.55" />
            <path d="M70 128 Q100 156 130 128 L130 160 L70 160 Z" fill={shade} opacity="0.35" />
          </g>
          <path d={face} fill="none" stroke={INK} strokeWidth={SW} />

          {/* blush */}
          <ellipse cx="78" cy="112" rx="7" ry="4.5" fill={blush} opacity="0.35" />
          <ellipse cx="122" cy="112" rx="7" ry="4.5" fill={blush} opacity="0.35" />

          <Wrinkles age={L.age} shade={shade} />

          {/* brows */}
          <g style={{ transform: `translateY(${browLift}px)`, transition: "transform .35s cubic-bezier(.3,1.6,.5,1)" }}>
            <Brows color={L.brow} heavy={L.age >= 2 || L.nose === "broad"} mood={mood} />
          </g>

          {/* eyes */}
          {mood === "happy" ? (
            <g stroke={INK} strokeWidth="3" fill="none">
              <path d="M77 94 Q85 86 93 94" />
              <path d="M107 94 Q115 86 123 94" />
            </g>
          ) : (
            <g className="chr__eyes" style={{ transform: blink ? "scaleY(0.08)" : "scaleY(1)" }}>
              <ellipse cx="85" cy="93" rx="8.5" ry={L.age >= 2 ? 8 : 9.5} fill="#fff" stroke={INK} strokeWidth="2.2" />
              <ellipse cx="115" cy="93" rx="8.5" ry={L.age >= 2 ? 8 : 9.5} fill="#fff" stroke={INK} strokeWidth="2.2" />
              <g style={{ transform: `translate(${look.x}px, ${look.y}px)`, transition: "transform .4s ease" }}>
                <circle cx="86" cy="94" r="4" fill={INK} />
                <circle cx="114" cy="94" r="4" fill={INK} />
                <circle cx="84.8" cy="92.4" r="1.4" fill="#fff" />
                <circle cx="112.8" cy="92.4" r="1.4" fill="#fff" />
              </g>
              {L.age >= 1 && (
                <g fill="none" stroke={INK} strokeWidth="2.4">
                  <path d="M76 90 Q85 82 94 90" />
                  <path d="M106 90 Q115 82 124 90" />
                </g>
              )}
            </g>
          )}
          {L.age >= 2 && (
            <g fill="none" stroke={shade} strokeWidth="1.8">
              <path d="M78 104 Q85 108 92 104" />
              <path d="M108 104 Q115 108 122 104" />
            </g>
          )}

          <Nose type={L.nose} skin={skin} shade={shade} />

          {(L.facial === "beard" || L.facial === "longbeard") && <Beard long={L.facial === "longbeard"} color={L.facialColor} />}
          {L.facial === "stubble" && (
            <path d="M68 104 C68 132 84 150 100 150 C116 150 132 132 132 104 C128 118 120 124 112 126 C106 131 94 131 88 126 C80 124 72 118 68 104 Z" fill={L.facialColor} opacity="0.45" />
          )}
          {L.facial === "goatee" && <path d="M92 136 Q100 152 108 136 Q100 140 92 136 Z" fill={L.facialColor} stroke={INK} strokeWidth="1.8" />}

          <Mouth mood={mood} talking={talking} open={open} uid={uid} />

          {(L.facial === "mustache" || L.facial === "beard" || L.facial === "longbeard") && <Mustache color={L.facialColor} bushy={L.facial === "mustache"} />}
          {L.facial === "walrus" && <Mustache color={L.facialColor} walrus />}
          {L.facial === "pencil" && <path d="M89 121.5 Q100 117.5 111 121.5 Q100 120.5 89 121.5 Z" fill={L.facialColor} stroke={L.facialColor} strokeWidth="1.6" />}

          <HairFront L={L} />
          {L.glasses && L.glasses !== "none" && <Glasses type={L.glasses} />}
        </g>
      </g>
    </svg>
  );
}

/* ---------- parts ---------- */

function Ear({ x, skin, shade, flip }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} 96) scale(${s} 1)`}>
      <path d="M2 -9 C-10 -14 -13 4 -8 10 C-5 15 0 14 2 11" fill={skin} stroke={INK} strokeWidth={SW} />
      <path d="M-1 -4 C-7 -6 -8 3 -4 6" fill="none" stroke={shade} strokeWidth="2" />
    </g>
  );
}

function Hand({ x, y, skin, flip }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} 1)`}>
      <path d="M-8 -6 C-11 2 -8 10 0 10 C8 10 10 2 8 -6 Z" fill={skin} stroke={INK} strokeWidth={SW} />
      <path d="M8 -3 C13 -2 13 4 8 5" fill={skin} stroke={INK} strokeWidth="2.2" />
      <path d="M-3 4 L-3 8 M1 5 L1 9" stroke={INK} strokeWidth="1.4" opacity="0.5" />
    </g>
  );
}

function Arm({ d, L }) {
  const cuff = ["suit", "tweed", "bowtie", "labcoat"].includes(L.outfit);
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth="23" fill="none" />
      <path d={d} stroke={L.main} strokeWidth="17.5" fill="none" />
      {cuff && <path d={d} stroke={L.accent} strokeWidth="17.5" fill="none" strokeLinecap="butt" strokeDasharray="0 54 7 100" />}
    </g>
  );
}

function Wrinkles({ age, shade }) {
  if (!age) return null;
  return (
    <g fill="none" stroke={shade} strokeWidth="1.8">
      <path d="M86 112 Q80 120 84 128" />
      <path d="M114 112 Q120 120 116 128" />
      {age >= 2 && (
        <>
          <path d="M84 66 Q100 61 116 66" />
          <path d="M88 72 Q100 68 112 72" />
          <path d="M71 90 l-4 -2 M71 95 l-4 1 M129 90 l4 -2 M129 95 l4 1" />
        </>
      )}
    </g>
  );
}

function Brows({ color, heavy, mood }) {
  const t = heavy ? 6.5 : 4.5;
  const inner = mood === "sad" ? -3 : 0;
  return (
    <g fill={color} stroke={INK} strokeWidth="1.8">
      <path d={`M72 82 Q83 73 96 ${79 + inner} L96 ${79 + inner + t * 0.7} Q84 ${73 + t} 73 ${82 + t * 0.6} Z`} />
      <path
        d={`M128 82 Q117 73 104 ${79 + inner} L104 ${79 + inner + t * 0.7} Q116 ${73 + t} 127 ${82 + t * 0.6} Z`}
        style={{ transform: mood === "thinking" ? "translateY(-3px)" : "none", transition: "transform .3s" }}
      />
    </g>
  );
}

function Nose({ type, skin, shade }) {
  switch (type) {
    case "bulb":
      return (
        <g>
          <path d="M98 92 C97 102 91 106 90 112 C89 119 96 122 100 119 C104 122 111 119 110 112 C109 106 103 102 102 92" fill={skin} stroke={INK} strokeWidth={SW} />
          <path d="M103 106 C107 108 108 114 105 117" fill="none" stroke={shade} strokeWidth="2.4" />
        </g>
      );
    case "button":
      return (
        <g fill="none" stroke={INK} strokeWidth="2.2">
          <path d="M100 100 Q99 106 97 109" stroke={shade} />
          <path d="M95 111 Q100 116 105 111" />
        </g>
      );
    case "broad":
      return (
        <g fill="none" stroke={INK} strokeWidth="2.4">
          <path d="M98 94 L97 104" stroke={shade} strokeWidth="2.2" />
          <path d="M93 107 C88 110 89 118 95 118 C98 120 102 120 105 118 C111 118 112 110 107 107" />
          <path d="M95 115 l2 -1 M105 115 l-2 -1" strokeWidth="2" />
        </g>
      );
    case "hook":
      return (
        <g fill="none" stroke={INK} strokeWidth="2.4">
          <path d="M98 86 C103 96 109 106 107 113 C105 118 99 118 96 116" />
          <path d="M102 116 l2 -1" />
        </g>
      );
    case "long":
    default:
      return (
        <g fill="none" stroke={INK} strokeWidth="2.4">
          <path d="M99 88 C99 98 101 106 106 112 C108 116 104 119 99 118 C97 118 95 117 94 115" />
          <path d="M100 110 C101 112 101 114 100 115" stroke={shade} strokeWidth="2" />
        </g>
      );
  }
}

function Mouth({ mood, talking, open, uid }) {
  if (talking)
    return (
      <g>
        <ellipse cx="100" cy="129" rx={7 + open * 4} ry={1.5 + open * 7} fill="#5E1C26" stroke={INK} strokeWidth="2" />
        <g clipPath={`url(#m${uid})`}>
          <ellipse cx="100" cy={134 + open * 4} rx="8" ry="5" fill="#E27A82" />
          <rect x="90" y={127.5 - open * 7} width="20" height="3" rx="1.5" fill="#fff" />
        </g>
      </g>
    );
  if (mood === "happy")
    return (
      <g>
        <path d="M87 125 Q100 141 113 125 Q100 128 87 125 Z" fill="#6B1F2A" stroke={INK} strokeWidth="2.2" />
        <path d="M90 126 Q100 128.5 110 126 L109 129 Q100 131 91 129 Z" fill="#fff" />
        <path d="M95 135 Q100 133 105 135 Q100 138 95 135 Z" fill="#E27A82" />
      </g>
    );
  if (mood === "sad") return <path d="M90 131 Q100 125 110 131" fill="none" stroke={INK} strokeWidth="2.6" />;
  if (mood === "thinking") return <path d="M92 129 Q101 127 109 130" fill="none" stroke={INK} strokeWidth="2.6" />;
  return (
    <g>
      <path d="M89 127 Q100 134 111 127" fill="none" stroke={INK} strokeWidth="2.6" />
      <path d="M95 135 Q100 136.5 105 135" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.4" />
    </g>
  );
}

function Mustache({ color, bushy, walrus }) {
  if (walrus)
    return (
      <path
        d="M78 133 C77 118 92 113 100 117 C108 113 123 118 122 133 C116 127 110 126 104 129 C102 126 98 126 96 129 C90 126 84 127 78 133 Z"
        fill={color}
        stroke={INK}
        strokeWidth="2"
      />
    );
  return (
    <g>
      <path
        d={
          bushy
            ? "M79 127 C80 117 92 113 100 117 C108 113 120 117 121 127 C115 123 109 124 104 126 C102 124 98 124 96 126 C91 124 85 123 79 127 Z"
            : "M84 125 C86 118 94 116 100 119 C106 116 114 118 116 125 C111 122 106 123 100 124 C94 123 89 122 84 125 Z"
        }
        fill={color}
        stroke={INK}
        strokeWidth="2"
      />
      {bushy && <path d="M88 119 l-2 4 M94 117 l-1 4 M106 117 l1 4 M112 119 l2 4" stroke={INK} strokeWidth="1.2" opacity="0.35" />}
    </g>
  );
}

function Beard({ long, color }) {
  const d = long
    ? "M66 100 C62 140 80 182 100 194 C120 182 138 140 134 100 C130 116 122 124 114 125 C108 131 92 131 86 125 C78 124 70 116 66 100 Z"
    : "M66 100 C65 132 82 156 100 157 C118 156 135 132 134 100 C130 116 122 124 114 125 C108 131 92 131 86 125 C78 124 70 116 66 100 Z";
  return (
    <g>
      <path d={d} fill={color} stroke={INK} strokeWidth={SW} />
      <g fill="none" stroke={INK} strokeWidth="1.3" opacity="0.3">
        <path d="M80 136 q4 8 2 16 M120 136 q-4 8 -2 16 M100 140 q2 8 0 14" />
        {long && <path d="M90 160 q4 10 2 22 M110 160 q-4 10 -2 22" />}
      </g>
    </g>
  );
}

function Glasses({ type }) {
  const lens = { fill: "rgba(255,255,255,0.18)", stroke: INK, strokeWidth: 2.4 };
  return (
    <g>
      {type === "round" ? (
        <>
          <circle cx="85" cy="93" r="11" {...lens} />
          <circle cx="115" cy="93" r="11" {...lens} />
        </>
      ) : (
        <>
          <rect x="73" y="84" width="24" height="19" rx="5" {...lens} />
          <rect x="103" y="84" width="24" height="19" rx="5" {...lens} />
        </>
      )}
      <path d="M96 92 Q100 89 104 92 M74 90 L66 88 M126 90 L134 88" fill="none" stroke={INK} strokeWidth="2.4" />
      <path d="M78 88 l4 -3 M108 88 l4 -3" stroke="#fff" strokeWidth="2" opacity="0.8" />
    </g>
  );
}

/* ---------- hair ---------- */

const BACK_CAP = "M61 98 C57 60 78 39 100 39 C122 39 143 60 139 98 C139 106 135 110 133 104 L67 104 C65 110 61 106 61 98 Z";

function Curls({ cx = 100, cy = 92, rx = 44, ry = 50, from = 200, to = 340, n = 11, r = 10, color }) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
    out.push(<circle key={i} cx={cx + Math.cos(a) * rx} cy={cy + Math.sin(a) * ry} r={r} fill={color} stroke={INK} strokeWidth="2.2" />);
  }
  return <g>{out}</g>;
}

function HairBack({ L }) {
  const c = L.hairColor;
  const st = { fill: c, stroke: INK, strokeWidth: SW };
  switch (L.hair) {
    case "wild":
      return (
        <g className="chr__hair-puff">
          <path
            d="M64 70 C48 56 32 70 38 88 C24 96 28 118 44 122 C36 134 50 148 63 138 L100 120 L137 138 C150 148 164 134 156 122 C172 118 176 96 162 88 C168 70 152 56 136 70 C132 50 116 38 100 38 C84 38 68 50 64 70 Z"
            {...st}
          />
          <path d="M48 92 q10 4 14 14 M44 112 q10 0 18 8 M152 92 q-10 4 -14 14 M156 112 q-10 0 -18 8 M80 46 q4 8 2 14 M118 46 q-2 8 0 14" fill="none" stroke="#BDBDB7" strokeWidth="2" />
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx="100" cy="42" r="15" {...st} />
          <path d="M92 36 q8 -6 16 0" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.4" />
          <path d="M62 102 C56 64 76 41 100 41 C124 41 144 64 138 102 L62 102 Z" {...st} />
        </g>
      );
    case "bob":
      return <path d="M60 96 C56 58 78 39 100 39 C122 39 144 58 140 96 C142 112 141 126 135 132 L65 132 C59 126 58 112 60 96 Z" {...st} />;
    case "long":
      return <path d="M60 90 C56 54 78 37 100 37 C122 37 144 54 140 90 C146 120 150 150 142 172 L58 172 C50 150 54 120 60 90 Z" {...st} />;
    case "locs":
      return (
        <g>
          <path d="M58 92 C54 54 78 38 100 38 C122 38 146 54 142 92 C148 122 150 146 144 164 L56 164 C50 146 52 122 58 92 Z" {...st} />
          <path d="M64 100 q-4 30 0 60 M74 106 q-2 26 2 54 M136 100 q4 30 0 60 M126 106 q2 26 -2 54" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.45" />
        </g>
      );
    case "veil":
      return (
        <g>
          <path d="M54 100 C50 52 76 34 100 34 C124 34 150 52 146 100 C152 140 160 172 170 204 L30 204 C40 172 48 140 54 100 Z" {...st} />
          <path d="M44 170 C48 150 52 130 54 112 M156 170 C152 150 148 130 146 112" fill="none" stroke={L.accent || "#3B5BA9"} strokeWidth="3.5" />
        </g>
      );
    case "wrap":
      return (
        <g>
          <path d="M62 94 C54 60 68 26 100 22 C132 26 146 60 138 94 Z" {...st} />
          <path d="M72 40 q28 -14 56 0 M66 60 q34 -14 68 0" fill="none" stroke={INK} strokeWidth="1.8" opacity="0.4" />
          <g fill="#FFF3D6">
            <circle cx="86" cy="36" r="2.5" /><circle cx="104" cy="31" r="2.5" /><circle cx="120" cy="40" r="2.5" />
            <circle cx="78" cy="56" r="2.5" /><circle cx="98" cy="50" r="2.5" /><circle cx="118" cy="54" r="2.5" />
          </g>
        </g>
      );
    case "curly":
      return (
        <g>
          <path d={BACK_CAP} {...st} />
          <Curls color={c} from={190} to={350} n={10} rx={42} ry={48} cy={94} r={10} />
        </g>
      );
    case "fluffy":
      return <path d="M60 98 C50 74 58 46 84 38 C106 31 132 38 142 58 C150 72 146 90 141 100 L60 100 Z" {...st} />;
    case "beret":
      return <path d="M60 100 C56 74 66 56 80 52 L120 52 C134 56 144 74 140 100 Z" {...st} />;
    case "bald":
    case "shaved":
      return null;
    case "short":
      return <path d="M62 102 C58 62 78 42 100 42 C122 42 142 62 138 102 Z" {...st} />;
    default:
      return <path d={BACK_CAP} {...st} />;
  }
}

function HairFront({ L }) {
  const c = L.hairColor;
  const st = { fill: c, stroke: INK, strokeWidth: SW };
  const shine = { fill: "none", stroke: "rgba(255,255,255,0.35)", strokeWidth: 2.5 };
  switch (L.hair) {
    case "wild":
      return (
        <g>
          <path d="M61 106 C53 92 55 76 65 66 C62 56 71 47 80 50 C84 41 97 39 102 46 C111 39 125 43 127 52 C138 52 146 62 141 73 C148 83 147 97 139 107 C138 96 134 86 130 80 C126 72 118 66 109 67 C104 60 95 60 91 65 C83 65 76 70 72 78 C67 86 64 95 61 106 Z" {...st} />
          <path d="M70 62 q8 2 12 10 M96 50 q2 6 -2 12 M120 56 q-6 4 -8 10 M134 70 q-6 4 -6 12 M64 82 q6 2 8 8" fill="none" stroke="#BDBDB7" strokeWidth="2" />
        </g>
      );
    case "bun":
      return (
        <g>
          <path d="M65 98 C60 62 80 46 100 46 C120 46 140 62 135 98 C133 80 125 66 112 62 C106 60 102 62 100 67 C98 62 94 60 88 62 C75 66 67 80 65 98 Z" {...st} />
          <path d="M80 54 q8 -4 16 -2 M104 52 q8 -2 16 2" {...shine} />
        </g>
      );
    case "bald":
      return (
        <g>
          <path d="M66 84 C61 96 63 110 68 118 C71 108 70 96 72 86 Z" {...st} />
          <path d="M134 84 C139 96 137 110 132 118 C129 108 130 96 128 86 Z" {...st} />
          <path d="M84 56 q12 -6 26 -2" fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" />
        </g>
      );
    case "shaved":
      return (
        <g>
          <path d="M67 84 C65 60 80 48 100 48 C120 48 135 60 133 84 C126 66 114 58 100 58 C86 58 74 66 67 84 Z" fill={c} opacity="0.45" />
          <path d="M84 56 q12 -6 26 -2" fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" />
        </g>
      );
    case "receding":
      return (
        <g>
          <path d="M65 92 C64 76 70 64 79 57 C75 70 73 80 73 94 Z" {...st} />
          <path d="M135 92 C136 76 130 64 121 57 C125 70 127 80 127 94 Z" {...st} />
          <path d="M86 52 q12 -4 26 0" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.3" />
        </g>
      );
    case "sidepart":
      return (
        <g>
          <path d="M64 94 C60 58 82 42 104 42 C126 42 142 60 136 94 C134 78 128 68 120 62 C108 70 90 68 78 70 C71 76 66 84 64 94 Z" {...st} />
          <path d="M82 46 Q78 58 80 68" fill="none" stroke={INK} strokeWidth="1.8" />
          <path d="M92 50 q16 -4 30 6" {...shine} />
        </g>
      );
    case "slick":
      return (
        <g>
          <path d="M65 92 C62 58 80 44 100 44 C120 44 138 58 135 92 C131 72 120 60 100 64 C80 60 69 72 65 92 Z" {...st} />
          <path d="M100 46 L100 63" stroke={INK} strokeWidth="1.8" />
          <path d="M78 54 q8 -4 16 -4 M106 50 q8 0 16 4" {...shine} />
        </g>
      );
    case "wavy":
      return (
        <g>
          <path d="M64 92 C58 60 76 41 100 41 C124 41 142 60 136 92 C134 80 130 72 124 67 C120 74 112 74 108 67 C102 74 94 74 90 67 C84 74 75 74 71 69 C67 75 65 84 64 92 Z" {...st} />
          <path d="M84 50 q8 -4 16 -2 M106 48 q8 0 14 4" {...shine} />
        </g>
      );
    case "curly":
      return <Curls color={c} from={200} to={340} n={8} rx={32} ry={34} cy={86} r={8.5} />;
    case "short":
      return (
        <g>
          <path d="M65 90 C62 60 80 45 100 45 C120 45 138 60 135 90 C132 76 124 66 112 62 C100 60 84 62 76 66 C70 72 66 80 65 90 Z" {...st} />
          <path d="M84 52 q14 -6 28 0" {...shine} />
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M64 98 C60 60 80 44 100 44 C120 44 140 60 136 98 C130 80 120 70 108 68 C96 74 80 72 71 78 C67 84 65 90 64 98 Z" {...st} />
          <path d="M88 52 q14 -4 24 2" {...shine} />
        </g>
      );
    case "long":
    case "locs":
      return (
        <g>
          <path d="M66 94 C63 60 82 46 100 46 C118 46 137 60 134 94 C128 72 116 62 100 62 C84 62 72 72 66 94 Z" {...st} />
          <path d="M100 48 L100 62" stroke={INK} strokeWidth="1.6" />
        </g>
      );
    case "fluffy":
      return (
        <g>
          <path d="M66 90 C62 62 76 46 96 44 C116 42 134 52 136 74 C128 62 116 58 104 60 C92 56 76 64 66 90 Z" {...st} />
          <path d="M84 52 q10 -6 24 -4" fill="none" stroke="#BDBDB7" strokeWidth="2" />
        </g>
      );
    case "beret":
      return (
        <g>
          <path d="M66 92 C64 80 68 70 74 66 L72 94 Z" {...st} />
          <path d="M134 92 C136 80 132 70 126 66 L128 94 Z" {...st} />
          <path d="M60 66 C60 42 90 30 116 33 C140 36 148 52 142 64 C124 56 84 56 60 66 Z" fill="#23222A" stroke={INK} strokeWidth={SW} />
          <path d="M104 33 l2 -6" stroke={INK} strokeWidth="3" />
          <path d="M76 46 q16 -8 34 -6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
        </g>
      );
    case "veil": {
      const blue = L.accent || "#3B5BA9";
      return (
        <g>
          <path d="M60 106 C56 64 78 41 100 41 C122 41 144 64 140 106 C136 86 126 62 100 59 C74 62 64 86 60 106 Z" fill="#fff" stroke={INK} strokeWidth={SW} />
          <path d="M63 100 C62 70 80 50 100 49 C120 50 138 70 137 100" fill="none" stroke={blue} strokeWidth="3.5" />
          <path d="M67 98 C67 74 82 57 100 56 C118 57 133 74 133 98" fill="none" stroke={blue} strokeWidth="2" />
        </g>
      );
    }
    case "wrap":
      return (
        <g>
          <path d="M64 88 C70 64 130 64 136 88 C124 74 76 74 64 88 Z" fill={c} stroke={INK} strokeWidth={SW} />
          <path d="M112 70 q10 -10 6 -22 q-8 6 -6 22 Z" fill={L.accent} stroke={INK} strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- clothes ---------- */

const TORSO = "M30 254 C30 204 46 174 76 165 Q100 159 124 165 C154 174 170 204 170 254 Z";

function darker(hex, amt = 0.22) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c * (1 - amt)));
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
}

function Outfit({ L, skin }) {
  const m = L.main;
  const a = L.accent;
  const dk = darker(m);
  const base = <path d={TORSO} fill={m} stroke={INK} strokeWidth={SW} />;
  const fold = <path d="M60 200 q6 26 4 54 M140 200 q-6 26 -4 54" fill="none" stroke={dk} strokeWidth="2.4" />;

  switch (L.outfit) {
    case "sweater":
      return (
        <g>
          {base}
          {fold}
          <path d="M82 163 L100 196 L118 163 Z" fill={a} stroke={INK} strokeWidth="2.2" />
          <path d="M86 158 L80 174 L97 178 Z M114 158 L120 174 L103 178 Z" fill={a} stroke={INK} strokeWidth="2.2" />
          <path d="M78 164 Q100 206 122 164" fill="none" stroke={dk} strokeWidth="6" />
          <path d="M78 164 Q100 206 122 164" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.5" />
        </g>
      );
    case "dress":
      return (
        <g>
          {base}
          {fold}
          <path d="M84 156 Q100 170 116 156 L118 168 Q100 182 82 168 Z" fill={a} stroke={INK} strokeWidth="2.2" />
          <path d="M86 166 l2 6 M94 170 l1 6 M106 170 l-1 6 M114 166 l-2 6" stroke={INK} strokeWidth="1.2" opacity="0.4" />
          {[194, 208, 222, 236].map((y) => (
            <circle key={y} cx="100" cy={y} r="2.6" fill="#D9C9A8" stroke={INK} strokeWidth="1" />
          ))}
        </g>
      );
    case "blouse":
      return (
        <g>
          {base}
          {fold}
          <path d="M82 163 Q100 186 118 163" fill={skin} stroke={INK} strokeWidth="2.2" />
          <path d="M78 164 Q86 176 100 182 Q114 176 122 164 L126 172 Q112 188 100 190 Q88 188 74 172 Z" fill={a} stroke={INK} strokeWidth="2.2" />
          <circle cx="100" cy="198" r="3.4" fill="#F5C542" stroke={INK} strokeWidth="1.4" />
        </g>
      );
    case "robe":
      return (
        <g>
          {base}
          <path d="M84 162 Q100 178 116 162" fill="none" stroke={INK} strokeWidth="2.2" />
          <path d="M36 226 C60 206 110 176 132 164 C146 168 156 176 162 186 C130 198 84 230 64 254 L40 254 Z" fill={a} stroke={INK} strokeWidth={SW} />
          <path d="M60 236 C90 210 120 190 150 180" fill="none" stroke={darker(a)} strokeWidth="2.4" />
        </g>
      );
    case "habit":
      return (
        <g>
          {base}
          <path d="M40 226 C70 196 110 176 140 168" fill="none" stroke={a} strokeWidth="5" />
          <path d="M44 236 C74 206 114 186 146 178" fill="none" stroke={a} strokeWidth="2.6" />
          <path d="M92 168 L100 186 L108 168" fill="none" stroke={INK} strokeWidth="1.8" opacity="0.4" />
          <path d="M104 200 v14 M97 206 h14" stroke={INK} strokeWidth="2.2" />
        </g>
      );
    case "shirt":
      return (
        <g>
          {base}
          {fold}
          <path d="M88 160 L100 186 L112 160 Z" fill={skin} stroke={INK} strokeWidth="2.2" />
          <path d="M86 156 L78 176 L100 186 Z M114 156 L122 176 L100 186 Z" fill={m} stroke={INK} strokeWidth="2.2" />
          <path d="M100 186 V254" stroke={dk} strokeWidth="2" />
          {[200, 218, 236].map((y) => (
            <circle key={y} cx="104" cy={y} r="2" fill={a} />
          ))}
          <path d="M120 196 h18 v16 h-18 z" fill="none" stroke={dk} strokeWidth="2" />
        </g>
      );
    case "madiba":
      return (
        <g>
          {base}
          <g fill={a} opacity="0.9">
            {[
              [56, 206], [80, 196], [124, 196], [146, 208], [70, 230], [100, 222], [132, 232], [52, 244], [90, 246], [116, 246], [150, 246],
            ].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} l6 -8 l6 8 l-6 8 Z`} stroke={INK} strokeWidth="1.2" />
            ))}
          </g>
          <path d="M84 160 Q100 176 116 160" fill={skin} stroke={INK} strokeWidth="2.2" />
          <path d="M80 162 Q100 184 120 162" fill="none" stroke={dk} strokeWidth="4" />
        </g>
      );
    case "turtleneck":
      return (
        <g>
          {base}
          {fold}
          <path d="M86 153 L114 153 L119 168 Q100 176 81 168 Z" fill={darker(m, 0.1)} stroke={INK} strokeWidth={SW} />
          <path d="M86 158 h28 M85 163 h30" stroke={INK} strokeWidth="1.2" opacity="0.4" />
        </g>
      );
    case "african":
      return (
        <g>
          {base}
          <path d="M40 210 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10" fill="none" stroke={a} strokeWidth="4" />
          <path d="M34 236 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10" fill="none" stroke="#FFF3D6" strokeWidth="3" />
          <path d="M82 162 Q100 184 118 162" fill={skin} stroke={INK} strokeWidth="2.2" />
          <path d="M80 164 Q100 190 120 164" fill="none" stroke={a} strokeWidth="5" />
        </g>
      );
    case "labcoat":
    case "suit":
    case "tweed":
    case "bowtie":
    default: {
      const tie = L.tie || "#1F2937";
      const isBow = L.outfit === "bowtie";
      return (
        <g>
          {base}
          {fold}
          <path d="M82 162 L100 214 L118 162 Z" fill={a} stroke={INK} strokeWidth="2.2" />
          <path d="M88 158 L84 172 L99 170 Z M112 158 L116 172 L101 170 Z" fill={a} stroke={INK} strokeWidth="2" />
          {isBow ? (
            <g>
              <path d="M100 172 L86 164 L86 180 Z M100 172 L114 164 L114 180 Z" fill={tie} stroke={INK} strokeWidth="2" />
              <circle cx="100" cy="172" r="3.6" fill={tie} stroke={INK} strokeWidth="2" />
            </g>
          ) : (
            <g>
              <path d="M95 168 L105 168 L104 175 L96 175 Z" fill={tie} stroke={INK} strokeWidth="2" />
              <path d="M96 175 L104 175 L108 204 L100 213 L92 204 Z" fill={tie} stroke={INK} strokeWidth="2" />
            </g>
          )}
          <path d="M82 162 L74 192 L88 190 L100 216 Z" fill={dk} stroke={INK} strokeWidth="2.2" />
          <path d="M118 162 L126 192 L112 190 L100 216 Z" fill={dk} stroke={INK} strokeWidth="2.2" />
          <circle cx="100" cy="232" r="2.6" fill={dk} stroke={INK} strokeWidth="1.2" />
          {L.outfit === "tweed" && (
            <g stroke={dk} strokeWidth="1.6" opacity="0.7">
              <path d="M48 214 l5 3 M56 230 l5 3 M44 242 l5 3 M146 214 l-5 3 M144 230 l-5 3 M154 242 l-5 3 M66 246 l5 3 M134 246 l-5 3" />
            </g>
          )}
          <path d="M128 202 h18" stroke={dk} strokeWidth="2.2" />
          <path d="M131 196 l3 6 l3 -6" fill="#fff" stroke={INK} strokeWidth="1.2" />
        </g>
      );
    }
  }
}

function Vial() {
  return (
    <g className="chr__vial">
      <circle cx="158" cy="220" r="14" fill="#7DFFB8" opacity="0.25" />
      <path d="M154 206 h8 v10 l6 14 a3 3 0 0 1 -3 4 h-14 a3 3 0 0 1 -3 -4 l6 -14 Z" fill="#E9FFF4" stroke={INK} strokeWidth="2" />
      <path d="M150 226 l4 -8 h8 l4 8 a2 2 0 0 1 -2 3 h-12 a2 2 0 0 1 -2 -3 Z" fill="#3BE39A" />
    </g>
  );
}

function Brush() {
  return (
    <g className="chr__brush">
      <path d="M150 238 L178 196" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <path d="M150 238 L178 196" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M176 199 l6 -9 l5 2 l-4 10 Z" fill="#C9C2B4" stroke={INK} strokeWidth="1.6" />
      <path d="M182 190 q6 -10 4 -14 q-6 4 -9 12 Z" fill="#D9482B" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

function Spark() {
  return (
    <path
      className="chr__spark"
      d="M166 202 L158 220 L166 220 L160 238 L176 214 L168 214 L174 202 Z"
      fill="#FFD93D"
      stroke="#B88700"
      strokeWidth="1.5"
    />
  );
}

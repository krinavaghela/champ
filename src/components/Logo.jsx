import { useId } from "react";

// Champ logo: a speech bubble (a teacher talking with you) holding an open
// storybook, with a spark of discovery flying out of it.
export function LogoMark({ size = 48, animate = false, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`logo ${animate ? "logo--anim" : ""} ${className}`} role="img" aria-label="Champ">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFA864" />
          <stop offset="1" stopColor="#FF6A2B" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="28" fill={`url(#lg${id})`} />
      <rect x="2" y="2" width="96" height="96" rx="28" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <path d="M8 34 Q14 10 40 8" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
      {/* speech bubble */}
      <path
        d="M24 26 H76 Q84 26 84 34 V64 Q84 72 76 72 H44 L30 84 L32 72 H24 Q16 72 16 64 V34 Q16 26 24 26 Z"
        fill="#fff"
        stroke="#1E1A2B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* open book */}
      <path d="M50 44 Q40 37 28 40 V62 Q40 59 50 65 Z" fill="#FFE2CC" stroke="#1E1A2B" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M50 44 Q60 37 72 40 V62 Q60 59 50 65 Z" fill="#FFD2B0" stroke="#1E1A2B" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M33 47 Q39 45 45 48 M33 53 Q39 51 45 54 M55 48 Q61 45 67 47" fill="none" stroke="#FF8A3D" strokeWidth="2.4" strokeLinecap="round" />
      {/* spark */}
      <g className="logo__spark">
        <path d="M70 6 L73.5 16.5 L84 20 L73.5 23.5 L70 34 L66.5 23.5 L56 20 L66.5 16.5 Z" fill="#FFD93D" stroke="#1E1A2B" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <circle className="logo__dot" cx="88" cy="40" r="3" fill="#FFF3B0" />
    </svg>
  );
}

export default function Logo({ size = 40, light = false, tagline = false }) {
  return (
    <span className={`logo-lockup ${light ? "logo-lockup--light" : ""}`} style={{ "--s": `${size}px` }}>
      <LogoMark size={size} />
      <span>
        <b>Champ</b>
        {tagline && <small>Learn. Think. Create. Grow.</small>}
      </span>
    </span>
  );
}

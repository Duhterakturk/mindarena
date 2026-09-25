const SLOTS = ["cape", "body", "scarf", "glasses", "hat", "crown"];

function colorOf(equipped, slot, fallback) {
  return equipped.find((item) => item.slot === slot)?.preview?.color || fallback;
}

export default function Owl({ stage = "egg", equipped = [], className = "w-40 h-40" }) {
  const hat = colorOf(equipped, "hat", null);
  const glasses = colorOf(equipped, "glasses", null);
  const scarf = colorOf(equipped, "scarf", null);
  const cape = colorOf(equipped, "cape", null);
  const crown = colorOf(equipped, "crown", null);
  const grown = stage !== "egg";
  return (
    <svg viewBox="0 0 120 120" className={className} data-testid="owl" data-stage={stage} aria-hidden="true">
      {cape && <path d="M18 70 Q10 110 36 108 L60 78 L84 108 Q110 110 102 70 Z" fill={cape} />}
      {stage === "egg" && <ellipse cx="60" cy="72" rx="28" ry="34" fill="#f6e7c1" stroke="#c4a36a" strokeWidth="3" />}
      {stage === "egg" && <path d="M48 70 Q60 78 72 70" fill="none" stroke="#c4a36a" strokeWidth="2" />}
      {grown && <ellipse cx="60" cy="78" rx={stage === "legend" ? 34 : 30} ry="32" fill="#c9843a" />}
      {grown && <ellipse cx="60" cy="84" rx="16" ry="14" fill="#f3d2a2" />}
      {grown && <circle cx="42" cy="58" r={stage === "chick" ? 14 : 16} fill="#e8a15a" />}
      {grown && <circle cx="78" cy="58" r={stage === "chick" ? 14 : 16} fill="#e8a15a" />}
      {grown && <circle cx="42" cy="58" r="6" fill="#1e1a16" />}
      {grown && <circle cx="78" cy="58" r="6" fill="#1e1a16" />}
      {grown && <circle cx="44" cy="56" r="2" fill="#fff" />}
      {grown && <circle cx="80" cy="56" r="2" fill="#fff" />}
      {grown && <path d="M54 66 L60 74 L66 66 Z" fill="#f59e0b" />}
      {stage === "young" && <path d="M34 46 Q42 36 50 46" fill="none" stroke="#7c4a12" strokeWidth="3" />}
      {stage === "wise" && <path d="M30 48 Q42 34 54 48" fill="none" stroke="#7c4a12" strokeWidth="3" />}
      {stage === "wise" && <path d="M66 48 Q78 34 90 48" fill="none" stroke="#7c4a12" strokeWidth="3" />}
      {stage === "legend" && <path d="M24 50 Q40 28 56 50" fill="#f6e7c1" />}
      {stage === "legend" && <path d="M64 50 Q80 28 96 50" fill="#f6e7c1" />}
      {scarf && <path d={`M40 86 Q60 98 80 86 L84 96 Q60 110 36 96 Z`} fill={scarf} />}
      {glasses && (
        <g fill="none" stroke={glasses} strokeWidth="3">
          <circle cx="42" cy="58" r="10" />
          <circle cx="78" cy="58" r="10" />
          <path d="M52 58 H68" />
        </g>
      )}
      {hat && <path d="M34 48 L60 18 L86 48 Z" fill={hat} />}
      {crown && (
        <path d="M36 40 L46 22 L60 36 L74 20 L84 40 Z" fill={crown} stroke="#713f12" strokeWidth="1" />
      )}
      <title>{SLOTS.join(" ")}</title>
    </svg>
  );
}

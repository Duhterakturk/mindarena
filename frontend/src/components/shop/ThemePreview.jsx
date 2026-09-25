import ThemeScene from "./ThemeScene";

const DIGITS = ["5", "", "3", "", "", "1", "", "4", "2", "", "", "8", "", "6", "", "7"];

function motif(id) {
  if (id === "theme-space") {
    return (
      <g fill="#f8f1c8">
        <circle cx="18" cy="16" r="1.4" />
        <circle cx="40" cy="10" r="1" />
        <circle cx="70" cy="18" r="1.6" />
        <circle cx="96" cy="12" r="1" />
        <circle cx="110" cy="28" r="1.2" />
      </g>
    );
  }
  if (id === "theme-forest") {
    return (
      <g fill="#3d6b4f">
        <ellipse cx="16" cy="18" rx="6" ry="3" transform="rotate(-30 16 18)" />
        <ellipse cx="100" cy="16" rx="7" ry="3" transform="rotate(25 100 16)" />
        <ellipse cx="108" cy="30" rx="5" ry="2.4" transform="rotate(50 108 30)" />
      </g>
    );
  }
  if (id === "theme-sea") {
    return (
      <g fill="none" stroke="#2f6f8f" strokeWidth="2">
        <path d="M8 16 Q20 8 32 16 T56 16" />
        <path d="M70 14 Q82 6 94 14 T118 14" />
      </g>
    );
  }
  if (id === "theme-candy") {
    return (
      <g>
        <circle cx="16" cy="14" r="3" fill="#fb7185" />
        <circle cx="30" cy="18" r="2" fill="#fbbf24" />
        <rect x="96" y="10" width="6" height="6" rx="1" fill="#a78bfa" transform="rotate(20 99 13)" />
        <circle cx="112" cy="22" r="2.5" fill="#34d399" />
      </g>
    );
  }
  return (
    <g fill="#f6f1e8">
      <circle cx="104" cy="18" r="8" />
      <circle cx="110" cy="16" r="7" fill="#16141c" />
    </g>
  );
}

export default function ThemePreview({ item, className = "w-full h-28" }) {
  const { cell = "#fff", ink = "#1e1a16", line = "#94a3b8", room = "#f8fafc" } = item.preview || {};
  const size = 22;
  const origin = 8;
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} data-testid="preview" style={{ background: room }}>
    <ThemeScene id={item.id} mini />
    <svg
      viewBox="0 0 120 110"
      className="relative h-full w-full"
      aria-hidden="true"
    >
      {motif(item.id)}
      {DIGITS.map((digit, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = origin + col * size;
        const y = 28 + row * size;
        const selected = index === 5;
        return (
          <g key={index}>
            <rect x={x} y={y} width={size} height={size} fill={selected ? line : cell} stroke={line} />
            {digit && (
              <text x={x + size / 2} y={y + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={selected ? room : ink}>
                {digit}
              </text>
            )}
          </g>
        );
      })}
    </svg>
    </div>
  );
}

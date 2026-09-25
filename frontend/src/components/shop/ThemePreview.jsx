import { photoSrc } from "./ThemeScene";

const DIGITS = ["5", "", "3", "", "", "1", "", "4", "2", "", "", "8", "", "6", "", "7"];

export default function ThemePreview({ item, className = "w-full h-28" }) {
  const { cell = "#fff", ink = "#1e1a16", line = "#94a3b8" } = item.preview || {};
  const size = 22;
  const origin = 8;
  const src = photoSrc(item.id, true);
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} data-testid="preview">
      {src && <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />}
      <div className="absolute inset-0 bg-black/40" />
      <svg viewBox="0 0 120 110" className="relative h-full w-full" aria-hidden="true">
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
                <text x={x + size / 2} y={y + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={selected ? cell : ink}>
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

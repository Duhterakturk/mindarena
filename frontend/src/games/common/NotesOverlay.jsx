export default function NotesOverlay({ digits, maxDigit }) {
  if (!digits?.length) return null;
  const cols = maxDigit <= 4 ? 2 : 3;
  const size = maxDigit <= 4 ? "text-[11px]" : "text-[8px]";
  return (
    <div
      className={`cell-notes pointer-events-none absolute inset-0 z-20 grid p-0.5 ${size} leading-none font-semibold`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      aria-hidden="true"
    >
      {Array.from({ length: maxDigit }, (_, i) => {
        const digit = i + 1;
        return (
          <span key={digit} className="flex items-center justify-center">
            {digits.includes(digit) ? digit : ""}
          </span>
        );
      })}
    </div>
  );
}

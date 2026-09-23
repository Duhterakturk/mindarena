export default function NotesOverlay({ digits, maxDigit }) {
  if (!digits?.length) return null;
  const cols = maxDigit <= 4 ? 2 : 3;
  return (
    <div
      className="pointer-events-none absolute inset-0 grid p-0.5 text-[9px] leading-none text-slate-500 font-semibold"
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

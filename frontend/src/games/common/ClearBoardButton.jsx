import { usePlayCopy } from "./playCopy";

export default function ClearBoardButton({ onClick }) {
  const { clear } = usePlayCopy();
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
    >
      {clear}
    </button>
  );
}

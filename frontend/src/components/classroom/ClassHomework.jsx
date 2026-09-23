import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGames } from "../../api/games";
import { createAssignment, fetchAssignment, fetchMyAssignment } from "../../api/classrooms";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

export function ClassHomework({ classroomId, classroomName }) {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ slug: "cit", difficulty: "easy", target_count: 3 });
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGames().then(setGames).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classroomId) return;
    fetchAssignment(classroomId).then(setBoard).catch(() => setBoard(null));
  }, [classroomId]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      const next = await createAssignment(classroomId, {
        ...form,
        target_count: Number(form.target_count),
      });
      setBoard(next);
    } catch (err) {
      setError(err.response?.data?.error || "Ödev kaydedilemedi");
    }
  }

  async function handleCopy() {
    if (!board?.sentence) return;
    await copyText(board.sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const assignment = board?.assignment;

  return (
    <section className="bg-[#fffdf8] rounded-2xl border border-line p-6 mb-6">
      <h2 className="font-display text-2xl text-ink mb-1">Bu haftanın ödevi</h2>
      <p className="text-sm text-stone-500 mb-4">
        {classroomName} için bir oyun seçilir. Sayım, ödevin bırakıldığı andan başlar. Kolay kademe herkese açıktır.
      </p>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-5">
        <select
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        >
          {games.map((game) => (
            <option key={game.slug} value={game.slug}>{game.name_tr}</option>
          ))}
        </select>
        <select
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white"
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
        >
          <option value="easy">Kolay</option>
          <option value="medium">Orta</option>
          <option value="hard">Zor</option>
        </select>
        <input
          type="number"
          min="1"
          max="10"
          required
          value={form.target_count}
          onChange={(e) => setForm({ ...form, target_count: e.target.value })}
          className="w-20 border border-line rounded-lg px-3 py-2 text-sm bg-white"
        />
        <button type="submit" className="press-btn !px-4 !py-2 text-sm">Ödevi bırak</button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!assignment ? (
        <p className="text-sm text-stone-500">Bu hafta henüz bir ödev yok.</p>
      ) : (
        <div>
          <p className="text-sm text-stone-600 mb-4">
            Hedef: {assignment.target_count} {assignment.difficulty_label.toLowerCase()} {assignment.name_tr}
          </p>
          <p className="font-display text-5xl text-ink leading-none">{board.class_total}</p>
          <p className="text-sm text-stone-500 mb-4">bu hafta biten bulmaca</p>

          {board.finished.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-4">
              {board.finished.map((row) => (
                <li key={row.full_name} className="bg-white border border-line rounded-full px-3 py-1 text-sm">
                  {row.full_name}
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-stone-600 mb-4">Ödevi süren {board.pending_count} kişi kaldı.</p>
          <p className="bg-white border border-line rounded-xl px-4 py-3 text-sm mb-3">{board.sentence}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/board/${assignment.slug}?difficulty=${assignment.difficulty}`}
              className="press-btn !px-4 !py-2 text-sm"
            >
              Tahtada aç
            </Link>
            <button type="button" onClick={handleCopy} className="text-sm font-bold text-brand-700">
              {copied ? "Alındı" : "Metni al"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function StudentHomework() {
  const [assignment, setAssignment] = useState(undefined);

  useEffect(() => {
    fetchMyAssignment().then(setAssignment).catch(() => setAssignment(null));
  }, []);

  if (!assignment) return null;

  return (
    <section className="bg-[#fffdf8] rounded-2xl border border-line p-6 mb-6">
      <h2 className="font-display text-2xl text-ink mb-1">Bu haftanın ödevi</h2>
      <p className="text-stone-600 mb-3">
        {assignment.target_count} {assignment.difficulty_label.toLowerCase()} {assignment.name_tr}
      </p>
      <p className="font-display text-4xl text-ink">
        {Math.min(assignment.done_count, assignment.target_count)}
        <span className="text-2xl text-stone-400"> / {assignment.target_count}</span>
      </p>
      <p className="text-sm text-stone-500 mt-1 mb-4">
        {assignment.finished ? "Ödev tamam." : "Tamamlandığında burada görünür."}
      </p>
      {!assignment.finished && (
        <Link to={`/games/${assignment.slug}`} className="press-btn !px-4 !py-2 text-sm">
          Bulmacaya geç
        </Link>
      )}
    </section>
  );
}

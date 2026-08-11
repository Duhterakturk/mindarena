import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { joinClassroom, leaveClassroom } from "../../api/classrooms";

export default function ClassroomJoin() {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await joinClassroom(code);
      await refreshUser();
      setCode("");
    } catch (err) {
      setError(err.response?.data?.error || "Sınıfa katılınamadı");
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    try {
      await leaveClassroom();
      await refreshUser();
    } catch {
      // sessizce yoksay
    } finally {
      setBusy(false);
    }
  }

  if (user?.classroom_id) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Bir sınıfa bağlısın.</p>
        <button
          onClick={handleLeave}
          disabled={busy}
          className="text-xs text-red-500 hover:underline disabled:opacity-50"
        >
          Sınıftan ayrıl
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleJoin} className="flex gap-2">
      <input
        type="text"
        placeholder="Sınıf kodu"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase"
      />
      <button
        type="submit"
        disabled={busy}
        className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 text-sm disabled:opacity-50"
      >
        Katıl
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </form>
  );
}

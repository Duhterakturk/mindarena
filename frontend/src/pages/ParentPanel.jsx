import { useEffect, useState } from "react";
import { fetchChildren, linkChild } from "../api/users";
import { fetchChildProgress } from "../api/progress";
import ProgressSummary from "../components/progress/ProgressSummary";

export default function ParentPanel() {
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [childProgress, setChildProgress] = useState(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadChildren() {
    fetchChildren()
      .then((data) => {
        setChildren(data);
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadChildren, []);

  useEffect(() => {
    if (!selectedId) return;
    setChildProgress(null);
    fetchChildProgress(selectedId)
      .then(setChildProgress)
      .catch(() => {});
  }, [selectedId]);

  async function handleAddChild(e) {
    e.preventDefault();
    setError(null);
    try {
      await linkChild(email);
      setEmail("");
      loadChildren();
    } catch (err) {
      setError(err.response?.data?.error || "Öğrenci bağlanamadı");
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Veli Paneli</h1>
      <p className="text-slate-600 mb-8">Çocuklarının ilerlemesini takip et.</p>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
        <h2 className="text-lg font-semibold mb-3">Öğrenci Ekle</h2>
        <form onSubmit={handleAddChild} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Öğrencinin e-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 text-sm"
          >
            Bağla
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {children.length === 0 ? (
        <p className="text-slate-500 text-sm">Henüz bağlı bir öğrenci yok.</p>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedId(child.id)}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold border",
                  selectedId === child.id
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-brand-50",
                ].join(" ")}
              >
                {child.full_name}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            {childProgress ? (
              <ProgressSummary progress={childProgress} showExport={false} />
            ) : (
              <p className="text-slate-500 text-sm">Yükleniyor...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

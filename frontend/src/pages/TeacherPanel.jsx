import { useEffect, useState } from "react";
import { fetchMyClassrooms, createClassroom } from "../api/classrooms";
import { ClassHomework } from "../components/classroom/ClassHomework";
import { fetchStudentsOverview } from "../api/progress";

export default function TeacherPanel() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  function loadClassrooms() {
    fetchMyClassrooms()
      .then((data) => {
        setClassrooms(data);
        if (data.length > 0) setSelectedId((prev) => prev || data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadClassrooms, []);

  useEffect(() => {
    if (!selectedId) return;
    setStudentsLoading(true);
    fetchStudentsOverview(selectedId)
      .then((data) => setStudents([...data].sort((a, b) => b.total_points - a.total_points)))
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }, [selectedId]);

  async function handleCreateClassroom(e) {
    e.preventDefault();
    setError(null);
    try {
      const classroom = await createClassroom(name);
      setName("");
      setClassrooms((prev) => [...prev, classroom]);
      setSelectedId(classroom.id);
    } catch (err) {
      setError(err.response?.data?.error || "Sınıf oluşturulamadı");
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Yükleniyor...</div>;

  const selectedClassroom = classrooms.find((c) => c.id === selectedId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Öğretmen Paneli</h1>
      <p className="text-slate-600 mb-8">
        Sınıflarını yönet, öğrencilerinin katılması için sınıf kodunu paylaş.
      </p>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
        <h2 className="text-lg font-semibold mb-3">Yeni Sınıf Oluştur</h2>
        <form onSubmit={handleCreateClassroom} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Örn. 3-A Sınıfı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 text-sm"
          >
            Oluştur
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {classrooms.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Henüz bir sınıfın yok. Yukarıdan bir sınıf oluştur, ardından öğrencilerin sana
          katılması için oluşan sınıf kodunu paylaş.
        </p>
      ) : (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {classrooms.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold border",
                  selectedId === c.id
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-brand-50",
                ].join(" ")}
              >
                {c.name} ({c.student_count})
              </button>
            ))}
          </div>

          {selectedClassroom && (
            <ClassHomework classroomId={selectedClassroom.id} classroomName={selectedClassroom.name} />
          )}

          {selectedClassroom && (
            <p className="text-sm text-slate-600 mb-4">
              Sınıf kodu:{" "}
              <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                {selectedClassroom.join_code}
              </span>{" "}
              — öğrenciler "Panelim" sayfasından bu kodla sınıfa katılabilir.
            </p>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {studentsLoading ? (
              <p className="text-slate-500 text-sm p-6">Yükleniyor...</p>
            ) : students.length === 0 ? (
              <p className="text-slate-500 text-sm p-6">Bu sınıfta henüz öğrenci yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-left">
                    <tr>
                      <th className="px-4 py-2 whitespace-nowrap">Öğrenci</th>
                      <th className="px-4 py-2 whitespace-nowrap">Sınıf Seviyesi</th>
                      <th className="px-4 py-2 text-right whitespace-nowrap">Tamamlanan</th>
                      <th className="px-4 py-2 text-right whitespace-nowrap">Farklı Oyun</th>
                      <th className="px-4 py-2 text-right whitespace-nowrap">Toplam Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((row) => (
                      <tr key={row.student.id} className="border-t border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">{row.student.full_name}</td>
                        <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{row.student.grade_level ?? "-"}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.total_completed}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.distinct_games_completed}</td>
                        <td className="px-4 py-2 text-right font-semibold text-brand-700 whitespace-nowrap">{row.total_points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

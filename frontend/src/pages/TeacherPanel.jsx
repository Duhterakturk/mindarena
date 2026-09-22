import { useEffect, useState } from "react";
import { fetchMyClassrooms, createClassroom, setStudentPassword } from "../api/classrooms";
import { ClassHomework } from "../components/classroom/ClassHomework";
import { fetchStudentsOverview } from "../api/progress";

function StudentPassword({ classroomId, student }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(null);
  const [error, setError] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    const chosen = password;
    try {
      await setStudentPassword(classroomId, student.id, chosen);
      setPassword("");
      setOpen(false);
      setShown(chosen);
      setCopiedPassword(false);
    } catch (err) {
      setError(err.response?.data?.error || "Şifre kaydedilemedi");
    }
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(shown);
    } catch {
      const area = document.createElement("textarea");
      area.value = shown;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiedPassword(true);
  }

  if (shown) {
    return (
      <div className="text-left">
        <p className="text-slate-700">
          Yeni şifre: <span className="font-mono font-bold">{shown}</span>
        </p>
        <div className="flex gap-2 mt-1">
          <button type="button" onClick={copyPassword} className="text-brand-600 font-semibold">
            {copiedPassword ? "Kopyalandı" : "Kopyala"}
          </button>
          <button type="button" onClick={() => setShown(null)} className="text-slate-500">
            Kapattım
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-brand-600 font-semibold">
        Şifre ver
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-1 items-end">
      <input
        type="text"
        required
        minLength={8}
        autoComplete="off"
        placeholder="En az 8 karakter"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-slate-200 rounded-lg px-2 py-1 text-sm w-36"
      />
      <div className="flex gap-2">
        <button type="submit" className="text-brand-600 font-semibold">
          Kaydet
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setError(null);
          }}
          className="text-slate-500"
        >
          Vazgeç
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </form>
  );
}

export default function TeacherPanel() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const inviteText = `MindArena'ya katılın. Bu adresten öğrenci olarak kayıt olun ve şifrenizi kendiniz belirleyin: ${window.location.origin}/register
Şifreyi unutursanız giriş sayfasındaki Şifremi unuttum bağlantısını kullanın.`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteText);
    } catch {
      const area = document.createElement("textarea");
      area.value = inviteText;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
  }

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
        <h2 className="text-lg font-semibold mb-2">Sınıf grubuna davet</h2>
        <p className="text-sm text-slate-600 mb-3">
          Bunu bir kez kopyalayıp sınıf grubuna yapıştır. Aileler kendileri kayıt olur.
        </p>
        <p className="text-sm whitespace-pre-wrap mb-3">{inviteText}</p>
        <button
          type="button"
          onClick={copyInvite}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {copied ? "Kopyalandı" : "Daveti kopyala"}
        </button>
      </div>

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
                      <th className="px-4 py-2 text-right whitespace-nowrap">Şifre</th>
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
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <StudentPassword classroomId={selectedId} student={row.student} />
                        </td>
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

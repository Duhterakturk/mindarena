import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "student",
    grade_level: "",
  });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register({
        ...form,
        grade_level: form.grade_level ? Number(form.grade_level) : null,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Kayıt başarısız");
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">{t("auth.register_button")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={t("auth.full_name")}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          type="email"
          placeholder={t("auth.email")}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder={t("auth.password")}
          required
          minLength={8}
          title="Şifre en az 8 karakter olmalıdır"
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">{t("auth.role_student")}</option>
          <option value="parent">{t("auth.role_parent")}</option>
          <option value="teacher">{t("auth.role_teacher")}</option>
        </select>

        {form.role === "student" && (
          <input
            type="number"
            min="2"
            max="12"
            placeholder={t("auth.grade_level")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
          />
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand-500 text-white py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {t("auth.register_button")}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-4">
        {t("auth.have_account")}{" "}
        <Link to="/login" className="text-brand-600 font-medium">
          {t("auth.login_button")}
        </Link>
      </p>
    </div>
  );
}

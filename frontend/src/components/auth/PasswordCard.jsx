import { useState } from "react";
import { useTranslation } from "react-i18next";
import { changePassword } from "../../api/auth";

export default function PasswordCard() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage(t("auth.password_changed"));
    } catch (err) {
      setError(err.response?.data?.error || "Şifre değişmedi");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
      <h2 className="text-lg font-semibold mb-4">{t("auth.change_password")}</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          type="password"
          placeholder={t("auth.current_password")}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("auth.new_password")}
          required
          minLength={8}
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-sm text-slate-700">{message}</p>}
        <button
          type="submit"
          className="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600"
        >
          {t("auth.save_password")}
        </button>
      </form>
    </div>
  );
}

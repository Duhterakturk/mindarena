import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../api/auth";

export default function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Bağlantı gönderilemedi");
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-3">{t("auth.forgot_title")}</h1>
      <p className="text-sm text-slate-600 mb-6">{t("auth.forgot_help")}</p>

      {sent ? (
        <p className="text-sm text-slate-700">{t("auth.forgot_sent")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("auth.email")}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-500 text-white py-2 rounded-lg font-semibold hover:bg-brand-600"
          >
            {t("auth.send_link")}
          </button>
        </form>
      )}

      <p className="text-sm text-slate-500 mt-4">
        <Link to="/login" className="text-brand-600 font-medium">
          {t("auth.login_button")}
        </Link>
      </p>
    </div>
  );
}

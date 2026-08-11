import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function toggleLanguage() {
    const next = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(next);
    localStorage.setItem("mindarena_lang", next);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-600">
          {t("app.name")}
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/games" className="hover:text-brand-600">
            {t("nav.games")}
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-brand-600">
                {t("nav.dashboard")}
              </Link>
              {user.role === "parent" && (
                <Link to="/parent" className="hover:text-brand-600">
                  Veli Paneli
                </Link>
              )}
              {user.role === "teacher" && (
                <Link to="/teacher" className="hover:text-brand-600">
                  Öğretmen Paneli
                </Link>
              )}
              <button onClick={handleLogout} className="hover:text-brand-600">
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-600">
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600"
              >
                {t("nav.register")}
              </Link>
            </>
          )}

          <button
            onClick={toggleLanguage}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs uppercase"
          >
            {i18n.language === "tr" ? "EN" : "TR"}
          </button>
        </div>
      </div>
    </nav>
  );
}

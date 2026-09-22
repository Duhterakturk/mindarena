import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleLanguage() {
    const next = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(next);
    localStorage.setItem("mindarena_lang", next);
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
  }

  const linkClass = "block sm:inline hover:text-brand-600 py-2 sm:py-0";

  const links = (
    <>
      <Link to="/games" className={linkClass} onClick={() => setMenuOpen(false)}>
        {t("nav.games")}
      </Link>

      {user ? (
        <>
          <Link to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.dashboard")}
          </Link>
          {user.role === "parent" && (
            <Link to="/parent" className={linkClass} onClick={() => setMenuOpen(false)}>
              Veli Paneli
            </Link>
          )}
          {user.role === "teacher" && (
            <Link to="/teacher" className={linkClass} onClick={() => setMenuOpen(false)}>
              Öğretmen Paneli
            </Link>
          )}
          <button onClick={handleLogout} className={`${linkClass} w-full text-left sm:w-auto`}>
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.login")}
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="block sm:inline bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 text-center sm:text-left mt-1 sm:mt-0"
          >
            {t("nav.register")}
          </Link>
        </>
      )}

      <button
        onClick={toggleLanguage}
        className="border border-slate-200 rounded-lg px-2 py-1 text-xs uppercase mt-1 sm:mt-0 w-full sm:w-auto"
      >
        {i18n.language === "tr" ? "EN" : "TR"}
      </button>
    </>
  );

  return (
    <nav className="bg-paper/90 backdrop-blur sticky top-0 z-10 border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold text-ink" onClick={() => setMenuOpen(false)}>
          {t("app.name")}
        </Link>

        {/* sm ve üzeri: yatay bağlantı satırı */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">{links}</div>

        {/* sm altı: hamburger düğmesi */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menüyü aç/kapat"
          aria-expanded={menuOpen}
          className="sm:hidden p-2 -mr-2 text-slate-600"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* sm altı: açılır menü paneli */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 px-4 py-2 text-sm font-medium">{links}</div>
      )}
    </nav>
  );
}

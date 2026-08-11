import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-4">{t("home.title")}</h1>
      <p className="text-lg text-slate-600 mb-8">{t("home.subtitle")}</p>
      <Link
        to="/games"
        className="inline-block bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600"
      >
        {t("home.cta")}
      </Link>
    </div>
  );
}

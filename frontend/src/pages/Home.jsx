import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrainIcon from "../components/common/BrainIcon";

const BRAINS = [
  { className: "text-brand-400", style: { top: "6%", left: "4%", width: "90px", transform: "rotate(-12deg)" } },
  { className: "text-pink-400", style: { top: "12%", right: "6%", width: "70px", transform: "rotate(18deg)" } },
  { className: "text-amber-400", style: { bottom: "10%", left: "9%", width: "60px", transform: "rotate(8deg)" } },
  { className: "text-emerald-400", style: { bottom: "18%", right: "10%", width: "100px", transform: "rotate(-6deg)" } },
  { className: "text-violet-400", style: { top: "44%", left: "1%", width: "50px", transform: "rotate(-20deg)" } },
  { className: "text-sky-400", style: { top: "50%", right: "2%", width: "56px", transform: "rotate(14deg)" } },
];

const HIGHLIGHTS = [
  { slug: "sudoku", emoji: "🔢", name: "Sudoku", color: "bg-blue-100 text-blue-700" },
  { slug: "amiral-batti", emoji: "🚢", name: "Amiral Battı", color: "bg-rose-100 text-rose-700" },
  { slug: "pentominolar", emoji: "🧩", name: "Pentominolar", color: "bg-amber-100 text-amber-700" },
  { slug: "yildiz-savaslari", emoji: "⭐", name: "Yıldız Savaşları", color: "bg-violet-100 text-violet-700" },
  { slug: "kakuro", emoji: "➕", name: "Kakuro", color: "bg-emerald-100 text-emerald-700" },
  { slug: "colours", emoji: "🎨", name: "Colours", color: "bg-sky-100 text-sky-700" },
];

const STATS = [
  { value: "19", label: "Farklı Oyun", color: "text-brand-600" },
  { value: "3", label: "Zorluk Kademesi", color: "text-pink-500" },
  { value: "∞", label: "Sonsuz Bulmaca", color: "text-emerald-500" },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-violet-50 to-pink-50">
        {BRAINS.map((b, i) => (
          <BrainIcon key={i} className={`absolute pointer-events-none opacity-[0.14] ${b.className}`} style={b.style} />
        ))}

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/80 text-brand-700 text-xs font-bold tracking-wide px-3 py-1.5 rounded-full shadow-sm mb-5">
            🧠 2. sınıftan itibaren eğlenceli zeka oyunları
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-4 text-balance">
            {t("home.title")}
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">{t("home.subtitle")}</p>
          <Link
            to="/games"
            className="inline-block bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {t("home.cta")}
          </Link>

          <div className="flex justify-center gap-8 sm:gap-14 mt-14">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-center text-slate-700 font-semibold mb-8">Bazı oyunlarımızla tanış</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((g) => (
            <Link
              key={g.slug}
              to={`/games/${g.slug}`}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 font-semibold hover:scale-105 hover:shadow-md transition-all ${g.color}`}
            >
              <span className="text-3xl">{g.emoji}</span>
              <span className="text-sm text-center">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

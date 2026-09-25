import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Owl from "../components/owl/Owl";
import { chooseTitle, fetchProfile } from "../api/shop";

export default function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  if (!profile) return <p className="px-4 py-10 text-slate-400">{t("shop.loading")}</p>;

  const title = profile.active_title;
  const progress = profile.next
    ? Math.min(100, Math.round((1 - profile.next.remaining / (profile.solved + profile.next.remaining)) * 100))
    : 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white text-slate-900 rounded-2xl p-6 text-center">
        <Owl stage={profile.stage} equipped={profile.equipped} className="w-48 h-48 mx-auto" />
        <p className="text-xl font-bold mt-2">{profile.full_name}</p>
        <p className="text-slate-600" data-testid="active-title">
          {title ? t(`titles.${title.split(":")[1]}`) : t("profile.noTitle")}
        </p>
        <p className="mt-2 font-semibold">⭐ {profile.star_balance}</p>
        <div className="mt-4 text-left">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {profile.next
              ? t("profile.remaining", { stage: t(`stages.${profile.next.stage}`), count: profile.next.remaining })
              : t("profile.maxStage")}
          </p>
        </div>
      </div>

      <section className="bg-white text-slate-900 rounded-2xl p-6 mt-4">
        <h2 className="font-semibold mb-3">{t("profile.titles")}</h2>
        {profile.titles.length === 0 ? (
          <p className="text-sm text-slate-500">{t("profile.noTitlesYet")}</p>
        ) : (
          <ul className="space-y-2">
            {profile.titles.map((row) => {
              const key = `${row.game_slug}:${row.rank}`;
              return (
                <li key={key} className="flex items-center justify-between gap-2 text-sm">
                  <span>{row.game_slug} · {t(`titles.${row.rank}`)}</span>
                  <button type="button" className="font-semibold text-brand-700" onClick={() => chooseTitle(key).then(setProfile)}>
                    {profile.active_title === key ? t("profile.active") : t("profile.use")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="bg-white text-slate-900 rounded-2xl p-6 mt-4 overflow-x-auto">
        <h2 className="font-semibold mb-3">{t("profile.records")}</h2>
        {profile.records.length === 0 ? (
          <p className="text-sm text-slate-500">{t("profile.noRecords")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {profile.records.map((row) => (
                <tr key={`${row.game_slug}-${row.difficulty}`} className="border-t border-slate-100">
                  <td className="py-2">{row.game_slug}</td>
                  <td>{t(`difficulty.${row.difficulty}`)}</td>
                  <td className="text-right">{row.best_seconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Owl from "../components/owl/Owl";
import ThemePreview from "../components/shop/ThemePreview";
import { buyItem, equipItem, fetchProfile, fetchShop } from "../api/shop";
import { startTrial } from "../components/shop/themeTrial";

const TABS = ["theme", "accessory", "background"];

function wearing(equipped, item) {
  const rest = equipped.filter((piece) => piece.slot !== item.slot);
  return [...rest, { slot: item.slot, preview: item.preview, id: item.id }];
}

function Preview({ item, stage, equipped, large = false }) {
  if (item.type === "theme") {
    return <ThemePreview item={item} className={large ? "w-full h-64" : "w-full h-28"} />;
  }
  if (item.type === "accessory") {
    return (
      <div data-testid="preview">
        <Owl stage={stage} equipped={wearing(equipped, item)} className={large ? "w-56 h-56 mx-auto" : "w-28 h-28 mx-auto"} />
      </div>
    );
  }
  return (
    <div className={`rounded-xl p-3 ${large ? "py-8" : ""}`} style={{ background: item.preview.room }} data-testid="preview">
      <Owl stage={stage} equipped={equipped} className={large ? "w-40 h-40 mx-auto" : "w-16 h-16 mx-auto"} />
      <p className="text-center text-xs mt-1" style={{ color: item.preview.room === "#1a1c28" ? "#f4efe6" : "#1e1a16" }}>
        ★
      </p>
    </div>
  );
}

export default function Shop() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("theme");
  const [open, setOpen] = useState(null);
  const [trial, setTrial] = useState(null);
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";

  useEffect(() => {
    fetchShop()
      .then((data) => {
        setState(data);
        window.dispatchEvent(new CustomEvent("mindarena:stars", { detail: { star_balance: data.star_balance } }));
      })
      .catch(() => setError(t("shop.loadError")));
    fetchProfile().then(setProfile).catch(() => {});
  }, [t]);

  async function buy(id) {
    setError(null);
    try {
      const next = await buyItem(id);
      setState(next);
      setOpen((current) => next.items.find((item) => item.id === current?.id) || null);
    } catch (err) {
      setError(err.response?.data?.error || t("shop.fail"));
    }
  }

  async function wear(id) {
    setError(null);
    try {
      const next = await equipItem(id);
      setState(next);
      setOpen((current) => next.items.find((item) => item.id === current?.id) || null);
    } catch (err) {
      setError(err.response?.data?.error || t("shop.fail"));
    }
  }

  function tryOn(item) {
    if (item.type === "accessory") {
      setTrial(item);
      return;
    }
    startTrial(item);
    setOpen(null);
  }

  if (!state) return <p className="px-4 py-10 text-slate-400">{t("shop.loading")}</p>;

  const stage = profile?.stage || "egg";
  const equipped = trial?.type === "accessory" ? wearing(profile?.equipped || [], trial) : profile?.equipped || [];
  const items = state.items.filter((item) => item.type === tab);
  const short = open && !open.owned ? Math.max(0, open.price - state.star_balance) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{t("shop.title")}</h1>
      <p className="mb-4" data-testid="shop-balance">⭐ {state.star_balance}</p>
      <div className="mb-4 flex justify-center">
        <Owl stage={stage} equipped={equipped} className="w-24 h-24" data-shop-owl="1" />
      </div>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            data-testid={`tab-${key}`}
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${tab === key ? "bg-white text-slate-900" : "text-slate-300"}`}
          >
            {t(`shop.tab.${key}`)}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const need = Math.max(0, item.price - state.star_balance);
          return (
            <li key={item.id}>
              <article
                className="bg-white text-slate-900 rounded-2xl p-4 cursor-pointer"
                data-testid={`card-${item.id}`}
                onClick={() => setOpen(item)}
              >
                <Preview item={item} stage={stage} equipped={profile?.equipped || []} />
                <p className="font-semibold mt-2">{lang === "en" ? item.name_en : item.name_tr}</p>
                <p className="text-sm text-slate-500">⭐ {item.price}</p>
                {item.owned ? (
                  <p className="text-sm mt-2">
                    {t("shop.owned")}{" "}
                    <button
                      type="button"
                      className="font-semibold text-brand-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        wear(item.id);
                      }}
                    >
                      {item.equipped ? t("shop.inUse") : t("shop.use")}
                    </button>
                  </p>
                ) : (
                  <div className="mt-2">
                    <button
                      type="button"
                      data-testid={`buy-${item.id}`}
                      disabled={need > 0}
                      className={`text-sm font-semibold ${need > 0 ? "text-slate-600 cursor-not-allowed" : "text-brand-700"}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (need === 0) buy(item.id);
                      }}
                    >
                      {t("shop.buy")}
                    </button>
                    {need > 0 && <p className="text-xs text-slate-600">{t("shop.short", { count: need })}</p>}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" data-testid="preview-dialog">
          <div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Preview
              item={open}
              stage={stage}
              equipped={trial?.id === open.id ? wearing(profile?.equipped || [], open) : profile?.equipped || []}
              large
            />
            <p className="font-bold text-lg mt-3 text-center">{lang === "en" ? open.name_en : open.name_tr}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" onClick={() => tryOn(open)}>
                {t("shop.try")}
              </button>
              {open.owned ? (
                <button type="button" className="rounded-lg bg-brand-500 text-white px-4 py-2 font-semibold" onClick={() => wear(open.id)}>
                  {open.equipped ? t("shop.inUse") : t("shop.use")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={short > 0}
                  className={`rounded-lg px-4 py-2 font-semibold ${short > 0 ? "bg-slate-200 text-slate-600" : "bg-brand-500 text-white"}`}
                  onClick={() => short === 0 && buy(open.id)}
                >
                  {t("shop.buy")}
                </button>
              )}
            </div>
            {short > 0 && <p className="text-center text-sm text-slate-500 mt-2">{t("shop.short", { count: short })}</p>}
            <button type="button" className="block mx-auto mt-3 text-sm text-slate-500" onClick={() => setOpen(null)}>
              {t("shop.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

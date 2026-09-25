import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { buyItem, equipItem, fetchShop } from "../api/shop";

export default function Shop() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";

  useEffect(() => {
    fetchShop().then(setState).catch(() => setError(t("shop.loadError")));
  }, [t]);

  async function buy(id) {
    setError(null);
    try {
      setState(await buyItem(id));
    } catch (err) {
      setError(err.response?.data?.error || t("shop.fail"));
    }
  }

  async function wear(id) {
    setError(null);
    try {
      setState(await equipItem(id));
    } catch (err) {
      setError(err.response?.data?.error || t("shop.fail"));
    }
  }

  if (!state) return <p className="px-4 py-10 text-slate-400">{t("shop.loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{t("shop.title")}</h1>
      <p className="mb-6" data-testid="shop-balance">⭐ {state.star_balance}</p>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {state.items.map((item) => (
          <li key={item.id} className="bg-white text-slate-900 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-lg border border-slate-300 shrink-0"
                style={{ background: item.preview.cell || item.preview.room || item.preview.color }}
              />
              <div className="min-w-0">
                <p className="font-semibold">{lang === "en" ? item.name_en : item.name_tr}</p>
                <p className="text-sm text-slate-500">⭐ {item.price}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {item.owned ? (
                <button type="button" className="text-sm font-semibold text-brand-700" onClick={() => wear(item.id)}>
                  {item.equipped ? t("shop.equipped") : t("shop.equip")}
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`buy-${item.id}`}
                  className="text-sm font-semibold text-brand-700"
                  onClick={() => buy(item.id)}
                >
                  {t("shop.buy")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

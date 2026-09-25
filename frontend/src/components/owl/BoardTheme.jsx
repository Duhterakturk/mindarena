import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchShop } from "../../api/shop";

const EQUIP_EVENT = "mindarena:equipped";

function apply(items) {
  const root = document.documentElement;
  const theme = items.find((item) => item.equipped && item.type === "theme");
  const background = items.find((item) => item.equipped && item.type === "background");
  const preview = { ...(background?.preview || {}), ...(theme?.preview || {}) };
  if (theme) root.dataset.boardTheme = theme.id;
  else delete root.dataset.boardTheme;
  for (const key of ["cell", "ink", "line", "room"]) {
    if (preview[key]) root.style.setProperty(`--${key}`, preview[key]);
    else root.style.removeProperty(`--${key}`);
  }
}

export default function BoardTheme() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      apply([]);
      return undefined;
    }
    let alive = true;
    fetchShop()
      .then((data) => {
        if (alive) apply(data.items || []);
      })
      .catch(() => {});
    function onEquip(event) {
      apply(event.detail?.items || []);
    }
    window.addEventListener(EQUIP_EVENT, onEquip);
    return () => {
      alive = false;
      window.removeEventListener(EQUIP_EVENT, onEquip);
    };
  }, [user]);

  return null;
}

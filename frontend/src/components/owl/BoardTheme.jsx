import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchShop } from "../../api/shop";
import { rememberEquipped } from "../shop/themeTrial";

const EQUIP_EVENT = "mindarena:equipped";

function apply(items) {
  rememberEquipped(items);
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

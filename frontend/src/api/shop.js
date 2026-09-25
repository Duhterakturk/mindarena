import apiClient from "./client";

const EQUIP_EVENT = "mindarena:equipped";

export async function fetchShop() {
  const { data } = await apiClient.get("/shop");
  return data;
}

export async function buyItem(itemId) {
  const { data } = await apiClient.post("/shop/buy", { item_id: itemId });
  window.dispatchEvent(new CustomEvent(EQUIP_EVENT, { detail: data }));
  window.dispatchEvent(new CustomEvent("mindarena:stars", { detail: { star_balance: data.star_balance } }));
  return data;
}

export async function equipItem(itemId) {
  const { data } = await apiClient.post("/shop/equip", { item_id: itemId });
  window.dispatchEvent(new CustomEvent(EQUIP_EVENT, { detail: data }));
  return data;
}

export async function fetchProfile() {
  const { data } = await apiClient.get("/profile");
  return data;
}

export async function chooseTitle(title) {
  const { data } = await apiClient.post("/profile/title", { title });
  return data;
}

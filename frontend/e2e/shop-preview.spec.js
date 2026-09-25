import { expect, test } from "@playwright/test";

const user = { id: "u1", full_name: "Ada", role: "student", star_balance: 40, active_title: null };
const items = [
  {
    id: "theme-space",
    type: "theme",
    slot: "theme",
    name_tr: "Uzay",
    name_en: "Space",
    price: 30,
    preview: { cell: "#1b2436", ink: "#f4efe6", line: "#8ea0c0", room: "#121826" },
    owned: false,
    equipped: false,
  },
  {
    id: "hat-red",
    type: "accessory",
    slot: "hat",
    name_tr: "Kırmızı şapka",
    name_en: "Red hat",
    price: 15,
    preview: { color: "#dc2626" },
    owned: false,
    equipped: false,
  },
  {
    id: "bg-ink",
    type: "background",
    slot: "background",
    name_tr: "Mürekkep",
    name_en: "Ink",
    price: 20,
    preview: { room: "#1a1c28" },
    owned: false,
    equipped: false,
  },
];

test("every shop card previews, and try changes the owl", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "test-token"));
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/src/")) return route.continue();
    if (url.includes("/auth/me")) return route.fulfill({ json: user });
    if (url.includes("/health")) return route.fulfill({ json: { status: "ok" } });
    if (url.includes("/profile")) {
      return route.fulfill({ json: { stage: "chick", equipped: [], full_name: "Ada", star_balance: 40 } });
    }
    if (url.includes("/shop")) return route.fulfill({ json: { star_balance: 40, items } });
    return route.fulfill({ json: {} });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dukkan");

  for (const key of ["theme", "accessory", "background"]) {
    await page.getByTestId(`tab-${key}`).click();
    const card = page.locator("[data-testid=preview]");
    await expect(card).toBeVisible();
    await expect(page.locator("svg[data-testid=preview], [data-testid=preview] svg").first()).toBeVisible();
    const box = await page.getByTestId(/^card-/).boundingBox();
    expect(box.width).toBeLessThan(390);
  }

  const mine = page.locator("[data-shop-owl] path[fill='#dc2626']");
  await expect(mine).toHaveCount(0);
  await page.getByTestId("tab-accessory").click();
  await page.getByTestId("card-hat-red").click();
  const dialog = page.getByTestId("preview-dialog");
  await dialog.getByRole("button", { name: "Dene" }).click();
  await expect(mine).toBeVisible();
});

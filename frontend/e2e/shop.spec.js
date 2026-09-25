import { expect, test } from "@playwright/test";

const user = { id: "u1", full_name: "Ada", role: "student", star_balance: 40, active_title: null };
const space = {
  id: "theme-space",
  type: "theme",
  slot: "theme",
  name_tr: "Uzay",
  name_en: "Space",
  price: 30,
  preview: { cell: "#1b2436", ink: "#f4efe6", line: "#8ea0c0", room: "#121826" },
  owned: false,
  equipped: false,
};

test("buying a theme paints the puzzle board", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "test-token"));
  let bought = false;
  const worn = { star_balance: 10, items: [{ ...space, owned: true, equipped: true }] };
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/src/")) return route.continue();
    if (url.includes("/auth/me")) return route.fulfill({ json: user });
    if (url.includes("/health")) return route.fulfill({ json: { status: "ok" } });
    if (url.includes("/shop")) {
      if (route.request().method() === "POST") {
        bought = true;
        return route.fulfill({ json: worn });
      }
      return route.fulfill({ json: bought ? worn : { star_balance: 40, items: [space] } });
    }
    if (url.includes("/puzzles")) {
      return route.fulfill({
        json: {
          id: "attempt-kare",
          slug: "kare-karalamaca",
          difficulty: "easy",
          puzzle: { size: 5, rowClues: [[1], [1], [1], [1], [1]], colClues: [[1], [1], [1], [1], [1]] },
          hints: [],
          hint_balance: 3,
        },
      });
    }
    return route.continue();
  });

  await page.goto("/dukkan");
  await page.getByTestId("buy-theme-space").click();
  await expect(page.getByTestId("shop-balance")).toContainText("10");
  await page.goto("/games/kare-karalamaca");
  const cell = page.locator(".play-room .bg-white").first();
  await expect(cell).toBeVisible();
  await expect(cell).toHaveCSS("background-color", "rgb(27, 36, 54)");
});

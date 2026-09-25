import { expect, test } from "@playwright/test";

const user = { id: "u1", full_name: "Ada", role: "student", star_balance: 5, active_title: null };
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

async function mock(page) {
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "test-token"));
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/src/")) return route.continue();
    if (url.includes("/auth/me")) return route.fulfill({ json: user });
    if (url.includes("/profile")) return route.fulfill({ json: { stage: "chick", equipped: [], full_name: "Ada" } });
    if (url.includes("/shop")) return route.fulfill({ json: { star_balance: 5, items: [space] } });
    if (url.includes("/puzzles")) {
      return route.fulfill({
        json: {
          id: "attempt-kare",
          slug: "kare-karalamaca",
          difficulty: "easy",
          puzzle: { size: 5, rowClues: [[1], [1], [1], [1], [1]], colClues: [[1], [1], [1], [1], [1]] },
          hints: [],
        },
      });
    }
    return route.fulfill({ json: {} });
  });
}

const scenes = ["theme-space", "theme-candy", "theme-forest", "theme-sea", "theme-night", "bg-dawn", "bg-meadow", "bg-ink"];

test("each theme scene is visible on a phone", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "test-token"));
  const items = scenes.map((id) => ({
    id,
    type: id.startsWith("bg-") ? "background" : "theme",
    slot: id.startsWith("bg-") ? "background" : "theme",
    name_tr: id,
    name_en: id,
    price: 20,
    preview: { cell: "#fff", ink: "#111", line: "#333", room: "#eee" },
    owned: false,
    equipped: false,
  }));
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/auth/me")) return route.fulfill({ json: user });
    if (url.includes("/profile")) return route.fulfill({ json: { stage: "egg", equipped: [] } });
    if (url.includes("/shop")) return route.fulfill({ json: { star_balance: 5, items } });
    return route.continue();
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dukkan");
  for (const id of scenes) {
    await page.getByTestId(id.startsWith("bg-") ? "tab-background" : "tab-theme").click();
    const card = page.getByTestId(`card-${id}`);
    await expect(card.locator("svg").first()).toBeVisible();
    await card.screenshot({ path: `test-results/theme-${id}-390.png` });
  }
});

test("trying a theme is temporary", async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dukkan");
  await page.getByTestId("card-theme-space").click();
  await page.getByTestId("preview-dialog").getByRole("button", { name: "Dene" }).click();
  await expect(page.locator("body")).toHaveClass(/theme-space/);
  await expect(page.getByTestId("theme-trial")).toContainText("30 yıldız daha lazım");
  await page.screenshot({ path: "test-results/theme-space-390.png", fullPage: true });
  await page.getByRole("button", { name: "Vazgeç" }).click();
  await expect(page.locator("body")).not.toHaveClass(/theme-space/);
  await page.getByTestId("card-theme-space").click();
  await page.getByTestId("preview-dialog").getByRole("button", { name: "Dene" }).click();
  await page.evaluate(() => {
    window.history.pushState({}, "", "/games/kare-karalamaca");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.locator("body")).toHaveClass(/theme-space/);
  await page.reload();
  await expect(page.locator("body")).not.toHaveClass(/theme-space/);
});

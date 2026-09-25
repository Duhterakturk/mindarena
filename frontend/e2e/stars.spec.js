import { expect, test } from "@playwright/test";

const puzzle = {
  id: "attempt-kare",
  slug: "kare-karalamaca",
  difficulty: "easy",
  puzzle: {
    size: 5,
    rowClues: [[1], [1], [1], [1], [1]],
    colClues: [[1], [1], [1], [1], [1]],
  },
  hints: [],
  hint_balance: 3,
};

test("a solved puzzle shows the star card", async ({ page }) => {
  await page.route("**/api/puzzles**", (route) => {
    if (route.request().url().includes("/check")) {
      return route.fulfill({
        json: { correct: true, stars: { earned: 2, pieces: ["solve", "no_hint"] } },
      });
    }
    return route.fulfill({ json: puzzle });
  });
  await page.route("**/api/health**", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.goto("/games/kare-karalamaca");
  await page.getByRole("button", { name: "Kontrol Et" }).click();
  const card = page.getByTestId("star-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("İpucusuz +1");
  await expect(card).toContainText("Yıldızlarını saklamak için giriş yap");
});

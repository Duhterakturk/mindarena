import { expect, test } from "@playwright/test";

const puzzle = {
  id: "attempt-kare",
  slug: "kare-karalamaca",
  difficulty: "hard",
  puzzle: {
    size: 7,
    rowClues: [[1, 2], [3], [1], [2], [4], [1, 1], [7]],
    colClues: [[2], [1, 1], [3], [1], [2, 2], [4], [1]],
  },
  hints: [],
  hint_balance: 3,
};

test("the shading board fits a 390px screen", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "yalnızca 390px");
  await page.route("**/api/puzzles**", (route) => route.fulfill({ json: puzzle }));
  await page.route("**/api/health**", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.goto("/games/kare-karalamaca");
  const board = page.getByTestId("shade-board");
  await expect(board).toBeVisible();
  const fit = await page.evaluate(() => {
    const node = document.querySelector("[data-testid='shade-board']");
    const rect = node.getBoundingClientRect();
    return {
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      left: rect.left,
      right: rect.right,
    };
  });
  expect(fit.scroll).toBeLessThanOrEqual(fit.client + 1);
  expect(fit.left).toBeGreaterThanOrEqual(-1);
  expect(fit.right).toBeLessThanOrEqual(fit.client + 1);
});

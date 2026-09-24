import { expect, test } from "@playwright/test";

const puzzle = {
  id: "attempt-abc",
  slug: "abc-baglama",
  difficulty: "easy",
  puzzle: {
    rows: 5,
    cols: 5,
    fixedCells: {
      "0-0": "A",
      "0-2": "A",
      "1-0": "B",
      "1-2": "B",
    },
  },
  hints: [],
  hint_balance: 3,
};

async function boot(page) {
  await page.route("**/api/puzzles**", (route) => route.fulfill({ json: puzzle }));
  await page.route("**/api/health**", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.goto("/games/abc-baglama");
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 0/2");
}

async function center(page, key) {
  const box = await page.locator(`[data-cell="${key}"]`).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test("drag links A and clicks link B", async ({ page }) => {
  await boot(page);
  const start = await center(page, "0-0");
  const mid = await center(page, "0-1");
  const end = await center(page, "0-2");
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(mid.x, mid.y, { steps: 8 });
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 1/2");

  await page.locator('[data-cell="1-0"]').click();
  await page.locator('[data-cell="1-1"]').click();
  await page.locator('[data-cell="1-2"]').click();
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 2/2");
});

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

async function boot(page, issued = puzzle) {
  await page.route("**/api/puzzles**", (route) => route.fulfill({ json: issued }));
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

const flowPuzzle = {
  ...puzzle,
  puzzle: {
    rows: 5,
    cols: 5,
    fixedCells: {
      "0-0": "A",
      "0-4": "A",
      "2-0": "B",
      "4-2": "B",
    },
  },
};

async function point(page, key) {
  return center(page, key);
}

async function stroke(page, keys, { steps = 1 } = {}) {
  await page.locator(`[data-cell="${keys[0]}"]`).scrollIntoViewIfNeeded();
  const points = [];
  for (const key of keys) points.push(await point(page, key));
  const touch = page.context()._options?.hasTouch || test.info().project.use.hasTouch;
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: points[0].x, y: points[0].y, id: 1 }],
    });
    for (const next of points.slice(1)) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: next.x, y: next.y, id: 1 }],
      });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    return;
  }
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const next of points.slice(1)) await page.mouse.move(next.x, next.y, { steps });
  await page.mouse.up();
}

test("a fast drag fills the skipped cells", async ({ page }) => {
  await boot(page, flowPuzzle);
  await stroke(page, ["0-0", "0-4"]);
  await expect(page.getByTestId("path-A")).toHaveAttribute("data-length", "5");
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 1/2");
});

test("an L shaped drag fills both legs", async ({ page }) => {
  await boot(page, flowPuzzle);
  await stroke(page, ["2-0", "2-2", "4-2"]);
  await expect(page.getByTestId("path-B")).toHaveAttribute("data-length", "5");
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 1/2");
});

test("dragging back shortens the line to that cell", async ({ page }) => {
  await boot(page, flowPuzzle);
  await stroke(page, ["0-0", "0-3"]);
  await expect(page.getByTestId("path-A")).toHaveAttribute("data-length", "4");
  await stroke(page, ["0-3", "0-1"]);
  await expect(page.getByTestId("path-A")).toHaveAttribute("data-length", "2");
  await expect(page.getByTestId("link-progress")).toContainText("Bağlanan: 0/2");
});

test("letter marks sit on their cells", async ({ page }, testInfo) => {
  await boot(page);
  for (const key of ["0-0", "0-2", "1-0", "1-2"]) {
    const cellBox = await page.locator(`[data-cell="${key}"]`).boundingBox();
    const markBox = await page.locator(`[data-mark="${key}"]`).boundingBox();
    const dx = Math.abs(cellBox.x + cellBox.width / 2 - (markBox.x + markBox.width / 2));
    const dy = Math.abs(cellBox.y + cellBox.height / 2 - (markBox.y + markBox.height / 2));
    expect(dx).toBeLessThanOrEqual(2);
    expect(dy).toBeLessThanOrEqual(2);
  }
  await page.screenshot({ path: testInfo.outputPath("board.png") });
});

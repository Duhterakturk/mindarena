import { expect, test } from "@playwright/test";

const themes = {
  "theme-space": { cell: "#1b2436", ink: "#f4efe6", line: "#8ea0c0", room: "#121826", file: "space.webp" },
  "theme-night": { cell: "#16141c", ink: "#f6f1e8", line: "#a89880", room: "#0e0c12", file: "night.webp" },
  "bg-ink": { cell: "#14161f", ink: "#f4efe6", line: "#a78bfa", room: "#1a1c28", file: "ink.webp" },
  "theme-forest": { cell: "#e7f3e4", ink: "#14241a", line: "#3d6b4f", room: "#d5ead0", file: "forest.webp" },
  "theme-candy": { cell: "#10241f", ink: "#e7fff4", line: "#7dcea0", room: "#0c1c18", file: "aurora.webp" },
};

const meadow = { cell: "#f7fee7", ink: "#14240c", line: "#3f6212", room: "#e5f6d8" };
const zeros = Array.from({ length: 9 }, () => Array(9).fill(0));
zeros[0][0] = 5;

const puzzles = {
  sudoku: { givens: zeros },
  kendoku: {
    givens: [[4, 0], [0, 0]],
    cageId: [[0, 0], [1, 1]],
    cageAnchor: [[0, 0], [1, 1]],
    cageClues: ["6+", "3"],
  },
  futoshiki: {
    givens: [[5, 0], [0, 0]],
    horizontal: [{ r: 0, c: 0, sign: "<" }],
    vertical: [{ r: 0, c: 0, sign: "v" }],
  },
  kakuro: {
    size: 3,
    grid: [
      [{ type: "block" }, { type: "clue", down: 4 }, { type: "clue", down: 3 }],
      [{ type: "clue", right: 5 }, { type: "white", given: 2 }, { type: "white" }],
      [{ type: "clue", right: 3 }, { type: "white" }, { type: "white", given: 1 }],
    ],
  },
};

function shopItems(activeId, extra = []) {
  const items = Object.entries(themes).map(([id, preview]) => ({
    id,
    type: id.startsWith("bg-") ? "background" : "theme",
    slot: id.startsWith("bg-") ? "background" : "theme",
    name_tr: id,
    name_en: id,
    price: 20,
    preview,
    owned: true,
    equipped: id === activeId,
  }));
  return [...items, ...extra];
}

async function install(page, activeId, extra = []) {
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "access"));
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/src/")) return route.continue();
    if (url.includes("/auth/me")) return route.fulfill({ json: { id: "u1", full_name: "Ada", role: "student" } });
    if (url.includes("/shop")) return route.fulfill({ json: { star_balance: 5, items: shopItems(activeId, extra) } });
    if (url.includes("/progress/unlocked")) {
      return route.fulfill({ json: { unlocked: { easy: true, medium: true, hard: true }, progress: { easy: 5, medium: 5, hard: 0 }, threshold: 5 } });
    }
    if (url.includes("/puzzles")) {
      let slug = "sudoku";
      try {
        slug = route.request().postDataJSON()?.slug || slug;
      } catch { /* open uses a json body */ }
      return route.fulfill({ json: { id: "p1", slug, difficulty: "easy", puzzle: puzzles[slug] || puzzles.sudoku, hints: [] } });
    }
    return route.fulfill({ json: {} });
  });
}

test("dark themes keep digits readable and the panel leaves the photo", async ({ page }, info) => {
  test.setTimeout(120000);
  const width = info.project.name === "mobile" ? 390 : 1280;
  await page.setViewportSize({ width, height: info.project.name === "mobile" ? 844 : 800 });
  for (const [id, preview] of Object.entries(themes)) {
    await install(page, id);
    for (const slug of ["sudoku", "kendoku", "futoshiki", "kakuro"]) {
      await page.goto(`/games/${slug}`);
      const sample = page.locator("input").first();
      await expect(sample).toBeVisible();
      const colors = await sample.evaluate((node) => {
        const style = getComputedStyle(node);
        return { color: style.color, background: style.backgroundColor };
      });
      expect(colors.color).not.toBe("rgb(0, 0, 0)");
      expect(colors.background).not.toBe("rgb(255, 255, 255)");
      if (slug === "futoshiki") await expect(page.getByTestId("futo-sign").first()).toBeVisible();
      if (slug === "kendoku") await expect(page.getByTestId("cage-label").first()).toBeVisible();
      await page.screenshot({ path: `test-results/ink-${id}-${slug}-${width}.png` });
      const ink = preview.ink;
      const painted = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
      expect(painted.toLowerCase()).toBe(ink);
    }
  }
});

test("an equipped background supplies the photo and the theme supplies the colors", async ({ page }) => {
  await install(page, "theme-space", [{
    id: "bg-meadow",
    type: "background",
    slot: "background",
    name_tr: "Çayır",
    name_en: "Meadow",
    price: 20,
    preview: meadow,
    owned: true,
    equipped: true,
  }]);
  await page.goto("/games/sudoku");
  await expect(page.getByTestId("theme-scene").locator("img")).toHaveAttribute("src", "/themes/meadow.webp");
  await expect(page.locator("body")).toHaveClass(/theme-space/);
  const ink = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
  expect(ink.toLowerCase()).toBe("#f4efe6");
  await page.screenshot({ path: "test-results/ink-space-meadow.png" });
  await page.goto("/dukkan");
  await page.getByTestId("card-theme-forest").click();
  await page.getByTestId("preview-dialog").getByRole("button", { name: "Dene" }).click();
  await expect(page.getByTestId("theme-scene").locator("img")).toHaveAttribute("src", "/themes/meadow.webp");
  const tried = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
  expect(tried.toLowerCase()).toBe("#14241a");
});

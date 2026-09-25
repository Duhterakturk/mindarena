import { expect, test } from "@playwright/test";

const games = [
  { id: 1, slug: "kakuro", name_tr: "Kakuro", name_en: "Kakuro", min_grade_level: 4 },
  { id: 2, slug: "sudoku", name_tr: "Sudoku", name_en: "Sudoku", min_grade_level: 3 },
  { id: 3, slug: "yildiz-savaslari", name_tr: "Yıldız Savaşları", name_en: "Star Battle", min_grade_level: 3 },
  { id: 4, slug: "amiral-batti", name_tr: "Amiral Battı", name_en: "Battleships", min_grade_level: 3 },
  { id: 5, slug: "cit", name_tr: "Çit", name_en: "Fence Loop", min_grade_level: 4 },
];

test("book names show on the catalog, a game, homework, and the exam", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("mindarena_access_token", "access");
    localStorage.setItem("mindarena_refresh_token", "refresh");
  });
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/auth/me")) {
      return route.fulfill({ json: { id: "t1", full_name: "Ayse Hoca", role: "teacher" } });
    }
    if (url.includes("/games") && !url.includes("/games/")) return route.fulfill({ json: games });
    if (url.includes("/classrooms/mine")) {
      return route.fulfill({ json: [{ id: "c1", name: "4-A", join_code: "ABCD" }] });
    }
    if (url.includes("/assignment")) return route.fulfill({ json: { assignments: [] } });
    if (url.includes("/progress/students")) return route.fulfill({ json: [] });
    if (url.includes("/exams/current")) {
      return route.fulfill({
        json: {
          exam: {
            id: "e1",
            elapsed_seconds: 0,
            limit_seconds: 900,
            finished_at: null,
            games: [
              { id: "g1", slug: "kakuro", name_tr: "Kakuro", done: false },
              { id: "g2", slug: "sudoku", name_tr: "Sudoku", done: false },
              { id: "g3", slug: "yildiz-savaslari", name_tr: "Yıldız Savaşları", done: false },
            ],
          },
        },
      });
    }
    if (url.includes("/puzzles")) {
      return route.fulfill({
        json: {
          id: "p1",
          puzzle: { grid: [[{ type: "block" }, { type: "clue", down: 3 }], [{ type: "clue", right: 3 }, { type: "white" }]], size: 2 },
          hints: [],
        },
      });
    }
    return route.fulfill({ json: {} });
  });

  await page.goto("/games");
  await expect(page.getByRole("heading", { name: "Kakuro" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sudoku" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yıldız Savaşları" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Amiral Battı" })).toBeVisible();
  await expect(page.getByText("Çapraz Toplam")).toHaveCount(0);

  await page.goto("/games/kakuro");
  await expect(page.getByRole("heading", { name: "Kakuro" })).toBeVisible();

  const titles = {
    kakuro: "Kakuro",
    sudoku: "Sudoku",
    "bolgesel-sudoku": "Bölgesel Sudoku",
    kendoku: "Kendoku",
    futoshiki: "Futoshiki",
    "amiral-batti": "Amiral Battı",
    "yildiz-savaslari": "Yıldız Savaşları",
    pentominolar: "Pentominolar",
    "abc-baglama": "ABC Bağlama",
    metaforms: "Metaforms",
    numbers: "Numbers",
    colours: "Colours",
  };
  for (const [slug, title] of Object.entries(titles)) {
    await page.goto(`/board/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  await page.goto("/teacher");
  await expect(page.getByRole("button", { name: "Kakuro" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yıldız Savaşları" })).toBeVisible();

  await page.goto("/exam");
  await expect(page.getByRole("link", { name: "1. Kakuro" })).toBeVisible();
  await expect(page.getByRole("link", { name: "2. Sudoku" })).toBeVisible();
  await expect(page.getByRole("link", { name: "3. Yıldız Savaşları" })).toBeVisible();
});

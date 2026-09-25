import { expect, test } from "@playwright/test";

const user = { id: "u1", full_name: "Ada", role: "student", star_balance: 200, active_title: null };

const stages = [
  { solved: 0, stage: "egg", name: "Yumurta", file: "egg.webp", next: { stage: "chick", remaining: 10 } },
  { solved: 10, stage: "chick", name: "Yavru", file: "owlet.webp", next: { stage: "young", remaining: 40 } },
  { solved: 50, stage: "young", name: "Peçeli Baykuş", file: "barn.webp", next: { stage: "wise", remaining: 100 } },
  { solved: 150, stage: "wise", name: "Kar Baykuşu", file: "snowy.webp", next: { stage: "legend", remaining: 250 } },
  { solved: 400, stage: "legend", name: "Puhu", file: "eagle.webp", next: null },
];

const shopItems = [
  {
    id: "owl-short-eared",
    type: "owl",
    slot: "collection",
    name_tr: "Kır Baykuşu",
    name_en: "Short-eared Owl",
    price: 18,
    rarity: "common",
    photo: "short-eared.webp",
    fact_tr: "Kulak tüyleri çok kısadır ve açık arazide gündüz de avlanır.",
    fact_en: "Its ear tufts are very short, and it also hunts by day over open ground.",
    preview: {},
    owned: true,
    equipped: false,
  },
  {
    id: "owl-snowy",
    type: "owl",
    slot: "collection",
    name_tr: "Kar Baykuşu",
    name_en: "Snowy Owl",
    price: 80,
    rarity: "legendary",
    photo: "snowy.webp",
    fact_tr: "Kuzey kutup tundrasında yaşar ve tüyleri neredeyse bembeyazdır.",
    fact_en: "It lives on the Arctic tundra, and its feathers are nearly all white.",
    preview: {},
    owned: true,
    equipped: false,
  },
  {
    id: "owl-great-horned",
    type: "owl",
    slot: "collection",
    name_tr: "Boynuzlu Baykuş",
    name_en: "Great Horned Owl",
    price: 50,
    rarity: "rare",
    photo: "great-horned.webp",
    fact_tr: "Kulak tüyleri boynuz gibi durur; Kuzey ve Güney Amerika'da yaşar.",
    fact_en: "Its ear tufts look like horns, and it lives in North and South America.",
    preview: {},
    owned: true,
    equipped: false,
  },
];

test("each growth stage shows its photo and name", async ({ page }) => {
  test.skip(page.viewportSize().width !== 390, "stage shots are checked at 390px");
  await page.addInitScript(() => localStorage.setItem("mindarena_access_token", "test-token"));
  let current = stages[0];
  await page.route(/\/api\/(?!.*\.js)/, (route) => {
    const url = route.request().url();
    if (url.includes("/src/")) return route.continue();
    if (url.includes("/auth/me")) return route.fulfill({ json: user });
    if (url.includes("/certificates")) return route.fulfill({ json: [] });
    if (url.includes("/profile")) {
      return route.fulfill({
        json: {
          stage: current.stage,
          solved: current.solved,
          next: current.next,
          equipped: [],
          full_name: "Ada",
          star_balance: 200,
          collection: { owned: 3, total: 12 },
          titles: [],
          records: [],
          active_title: null,
        },
      });
    }
    if (url.includes("/shop")) return route.fulfill({ json: { star_balance: 200, items: shopItems } });
    return route.fulfill({ json: {} });
  });

  for (const row of stages) {
    current = row;
    await page.goto("/profil");
    const owl = page.getByTestId("owl");
    await expect(owl).toHaveAttribute("data-stage", row.stage);
    await expect(owl).toContainText(row.name);
    await expect(owl.locator("img")).toHaveAttribute("src", `/owls/${row.file}`);
  }

  await page.goto("/dukkan");
  await page.getByTestId("tab-collection").click();
  for (const item of shopItems) {
    const card = page.getByTestId(`card-${item.id}`);
    await expect(card).toContainText(item.name_tr);
    const img = card.locator("img");
    await expect(img).toHaveAttribute("data-owned", "1");
    await expect(img).not.toHaveClass(/grayscale/);
    await expect(img).toHaveAttribute("src", `/owls/${item.photo}`);
  }
});

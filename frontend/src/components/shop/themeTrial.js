const ACCENT = {
  "theme-space": "#c084fc",
  "theme-forest": "#15803d",
  "theme-sea": "#0284c7",
  "theme-candy": "#34d399",
  "theme-night": "#fbbf24",
  "bg-dawn": "#ea580c",
  "bg-meadow": "#65a30d",
  "bg-ink": "#c4b5fd",
};

const DARK = new Set(["theme-space", "theme-candy", "theme-night", "bg-ink"]);

let savedItems = [];
let equippedId = null;
let trial = null;
let timer = null;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn(trial));
}

export function subscribeTrial(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function currentTrial() {
  return trial;
}

function equippedTheme() {
  return savedItems.find((item) => item.equipped && item.type === "theme") || null;
}

function equippedBackground() {
  return savedItems.find((item) => item.equipped && item.type === "background") || null;
}

function colorItem() {
  if (trial?.type === "theme") return trial;
  const theme = equippedTheme();
  if (theme) return theme;
  if (trial?.type === "background") return trial;
  return equippedBackground();
}

export function activePhotoId() {
  if (trial?.type === "background") return trial.id;
  const background = equippedBackground();
  if (background) return background.id;
  if (trial?.type === "theme") return trial.id;
  return equippedTheme()?.id || null;
}

function paint(preview, id) {
  const root = document.documentElement;
  [...document.body.classList].forEach((name) => {
    if (name.startsWith("theme-") || name === "theme-light" || name === "theme-dark") {
      document.body.classList.remove(name);
    }
  });
  if (!id) {
    delete root.dataset.boardTheme;
    for (const key of ["cell", "ink", "line", "room", "accent"]) root.style.removeProperty(`--${key}`);
    return;
  }
  root.dataset.boardTheme = id;
  document.body.classList.add(id, DARK.has(id) ? "theme-dark" : "theme-light");
  const colors = preview || {};
  for (const key of ["cell", "ink", "line", "room"]) {
    if (colors[key]) root.style.setProperty(`--${key}`, colors[key]);
  }
  root.style.setProperty("--accent", ACCENT[id] || "#2461f7");
}

function paintSaved() {
  const source = colorItem();
  equippedId = activePhotoId();
  paint(source?.preview || null, source?.id || null);
  emit();
}

export function rememberEquipped(items) {
  savedItems = items || [];
  if (!trial) paintSaved();
}

export function startTrial(item) {
  clearTimeout(timer);
  trial = item;
  paintSaved();
  timer = setTimeout(() => clearTrial(), 60000);
}

export function clearTrial() {
  clearTimeout(timer);
  timer = null;
  trial = null;
  paintSaved();
  emit();
}

export function trialKeeps(pathname) {
  return pathname === "/dukkan" || pathname === "/games" || /^\/games\/[^/]+$/.test(pathname);
}

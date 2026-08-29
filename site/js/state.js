// Persistent client-side state: favorites, shopping-list selection, language, theme. All localStorage-backed.

const LS_KEYS = {
  favorites: "bakestack:favorites",
  shoppingPicks: "bakestack:shopping-picks",
  shoppingChecked: "bakestack:shopping-checked",
  lang: "bakestack:lang",
  theme: "bakestack:theme",
};

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable — ignore */ }
}

const appState = {
  lang: readLS(LS_KEYS.lang, "en"),
  theme: readLS(LS_KEYS.theme, null), // null = follow system
  favorites: new Set(readLS(LS_KEYS.favorites, [])), // set of "recipe:<id>" / "tip:<id>"
  shoppingPicks: readLS(LS_KEYS.shoppingPicks, {}), // { "recipe:<id>": multiplier }
  shoppingChecked: new Set(readLS(LS_KEYS.shoppingChecked, [])), // set of ingredient nameKey, marked as bought
};

function setLang(lang) {
  appState.lang = lang;
  writeLS(LS_KEYS.lang, lang);
}

function setTheme(theme) {
  appState.theme = theme;
  writeLS(LS_KEYS.theme, theme);
  applyTheme();
}

function applyTheme() {
  const root = document.documentElement;
  if (appState.theme === "dark") root.setAttribute("data-theme", "dark");
  else if (appState.theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
}

function isFavorite(kind, id) { return appState.favorites.has(`${kind}:${id}`); }
function toggleFavorite(kind, id) {
  const key = `${kind}:${id}`;
  if (appState.favorites.has(key)) appState.favorites.delete(key);
  else appState.favorites.add(key);
  writeLS(LS_KEYS.favorites, [...appState.favorites]);
  return appState.favorites.has(key);
}
function getFavoriteIds(kind) {
  return [...appState.favorites]
    .filter((k) => k.startsWith(`${kind}:`))
    .map((k) => k.slice(kind.length + 1));
}

function isPicked(id) { return id in appState.shoppingPicks; }
function togglePick(id, defaultMultiplier = 1) {
  if (id in appState.shoppingPicks) delete appState.shoppingPicks[id];
  else appState.shoppingPicks[id] = defaultMultiplier;
  writeLS(LS_KEYS.shoppingPicks, appState.shoppingPicks);
  return id in appState.shoppingPicks;
}
function setPickMultiplier(id, multiplier) {
  if (id in appState.shoppingPicks) {
    appState.shoppingPicks[id] = multiplier;
    writeLS(LS_KEYS.shoppingPicks, appState.shoppingPicks);
  }
}
function clearPicks() {
  appState.shoppingPicks = {};
  writeLS(LS_KEYS.shoppingPicks, appState.shoppingPicks);
  appState.shoppingChecked = new Set();
  writeLS(LS_KEYS.shoppingChecked, []);
}

function isChecked(nameKey) { return appState.shoppingChecked.has(nameKey); }
function toggleChecked(nameKey) {
  if (appState.shoppingChecked.has(nameKey)) appState.shoppingChecked.delete(nameKey);
  else appState.shoppingChecked.add(nameKey);
  writeLS(LS_KEYS.shoppingChecked, [...appState.shoppingChecked]);
  return appState.shoppingChecked.has(nameKey);
}


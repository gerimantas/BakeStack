// Data layer: fetches recipes/tips (EN+LT) and prices, exposes a small typed API.

const DATA_URLS = {
  en: { recipes: "data/recipes.json", tips: "data/tips.json" },
  lt: { recipes: "data/recipes_lt.json", tips: "data/tips_lt.json" },
  tags: "data/tags.json",
  tagsLt: "data/tags_lt.json",
  tagsEn: "data/tags_en.json",
  prices: "data/prices.json",
  density: "data/density.json",
};

const store = {
  recipes: { en: null, lt: null },
  tips: { en: null, lt: null },
  tags: null,
  tagsLt: null,
  tagsEn: null,
  prices: null,
  density: null,
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function loadAll() {
  const [recipesEn, recipesLt, tipsEn, tipsLt, tags, tagsLt, tagsEn, prices, density] = await Promise.all([
    fetchJSON(DATA_URLS.en.recipes),
    fetchJSON(DATA_URLS.lt.recipes),
    fetchJSON(DATA_URLS.en.tips),
    fetchJSON(DATA_URLS.lt.tips),
    fetchJSON(DATA_URLS.tags),
    fetchJSON(DATA_URLS.tagsLt).catch(() => ({ category: {}, flavor_theme: {} })),
    fetchJSON(DATA_URLS.tagsEn).catch(() => ({ category: {}, flavor_theme: {} })),
    fetchJSON(DATA_URLS.prices).catch(() => ({})),
    fetchJSON(DATA_URLS.density).catch(() => ({})),
  ]);
  // EN and LT recipe files are edited independently and are not guaranteed to hold the
  // same recipes in the same order (e.g. EN can gain new entries LT hasn't been
  // translated for yet), so each list's id is derived from its own title — never from
  // the other language's array position, which would silently mismatch across languages.
  store.recipes.en = recipesEn.map((r, i) => ({ ...r, id: slugify(r.title, i) }));
  store.recipes.lt = recipesLt.map((r, i) => ({ ...r, id: slugify(r.title, i) }));
  store.tips.en = tipsEn.map((t, i) => ({ ...t, id: slugify(t.title, i) }));
  store.tips.lt = tipsLt.map((t, i) => ({ ...t, id: slugify(tipsEn[i]?.title ?? t.title, i) }));
  store.tags = tags;
  store.tagsLt = tagsLt;
  store.tagsEn = tagsEn;
  store.prices = prices;
  delete density._comment;
  store.density = density;
  window.INGREDIENT_DENSITY = density;
  return store;
}

/** Returns the display label for a category or flavor_theme tag slug, translated for lang "lt" or "en". */
function tagLabel(lang, kind, slug) {
  const dict = lang === "lt" ? store.tagsLt : store.tagsEn;
  const translated = dict?.[kind]?.[slug];
  if (translated) return translated;
  return slug;
}

/** Returns the display label for a free-form recipe/tip tag whose category (flavor_theme/ingredient/technique)
 * isn't known ahead of time — checks all three dictionaries in turn. */
function anyTagLabel(lang, slug) {
  const dict = lang === "lt" ? store.tagsLt : store.tagsEn;
  for (const kind of ["flavor_theme", "ingredient", "technique"]) {
    const translated = dict?.[kind]?.[slug];
    if (translated) return translated;
  }
  return slug;
}

function slugify(title, fallbackIndex) {
  const base = (title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${fallbackIndex}` : `recipe-${fallbackIndex}`;
}

function getRecipes(lang) { return store.recipes[lang] || []; }
function getTips(lang) { return store.tips[lang] || []; }
function getRecipeById(lang, id) { return getRecipes(lang).find((r) => r.id === id); }
function getTipById(lang, id) { return getTips(lang).find((t) => t.id === id); }

/** Scales a single ingredient amount by the multiplier. Handles null, number, and {min,max} ranges. */
function scaleAmount(amount, multiplier) {
  if (amount == null) return null;
  if (typeof amount === "number") return amount * multiplier;
  if (typeof amount === "object" && "min" in amount) {
    return { min: amount.min * multiplier, max: amount.max * multiplier };
  }
  return amount;
}

function formatAmount(amount, decimals = 1) {
  if (amount == null) return null;
  const round = (n) => {
    const r = Math.round(n * 10 ** decimals) / 10 ** decimals;
    return r % 1 === 0 ? r.toFixed(0) : r.toFixed(decimals);
  };
  if (typeof amount === "number") return round(amount);
  return `${round(amount.min)}–${round(amount.max)}`;
}

/** Formats a gram/milliliter amount, switching to kg/L (2 decimals) once the amount
 * reaches 500 — matches how a baker actually reads a scale ("0.65 kg" not "650 g"). */
function formatWeightVolume(amount, unit) {
  if (amount == null) return "";
  const bigUnit = unit === "g" ? "kg" : "L";
  if (typeof amount === "number") {
    return amount >= 500 ? `${formatAmount(amount / 1000, 2)} ${bigUnit}` : `${formatAmount(amount, 0)} ${unit}`;
  }
  const big = amount.min >= 500;
  const div = big ? 1000 : 1;
  return `${formatAmount({ min: amount.min / div, max: amount.max / div }, big ? 2 : 0)} ${big ? bigUnit : unit}`;
}

/** Looks up a per-100g/ml price for an ingredient name from prices.json, resolving pack-size to unit price. */
function unitPriceFor(ingredientName) {
  if (!store.prices) return null;
  const entry = store.prices[ingredientName];
  if (!entry || !entry.price || !entry.packSize) return null;
  return entry.price / entry.packSize; // EUR per gram/ml
}

/** Computes the total price of a recipe's ingredients at the given multiplier. Returns null if no priced ingredients found. */
function recipePrice(recipe, multiplier) {
  let total = 0;
  let priced = 0;
  for (const ing of recipe.ingredients) {
    const perUnit = unitPriceFor(ing.name);
    if (perUnit == null) continue;
    const amt = ing.amount_ml ?? ing.amount;
    if (typeof amt !== "number") continue;
    total += perUnit * amt * multiplier;
    priced += 1;
  }
  if (priced === 0) return null;
  return { total, priced, of: recipe.ingredients.length };
}

/** Aggregates ingredients across multiple recipes (each with its own multiplier) into one
 * shopping list. A shopping list needs ONE unit per ingredient — you buy flour by weight,
 * not by the teaspoon — so a tsp/tbsp entry that already carries a gram conversion
 * (amount_conv/unit_conv, computed when the recipe was authored) is grouped and summed in
 * grams alongside any plain gram entries of the same ingredient from other recipes. An
 * entry with no unit at all (a count — "1 egg", "2 lemons") is grouped and summed as
 * pieces. Anything else (no numeric amount, or a unit with no known gram equivalent) keeps
 * its original unit and is only combined with an exact same-name-and-unit match. */
function buildShoppingList(items, pieceUnitLabel = "pcs") {
  // items: [{ recipe, multiplier }]
  const map = new Map();
  for (const { recipe, multiplier } of items) {
    for (const ing of recipe.ingredients) {
      // Collapse hyphen/space variation ("all-purpose flour" vs "all purpose flour") so
      // the same ingredient written inconsistently across recipes still groups together —
      // the source docx isn't consistent about this, e.g. recipe-010 drops the hyphen.
      const nameKey = ing.name.toLowerCase().trim().replace(/[\s-]+/g, " ");
      const isRange = ing.amount != null && typeof ing.amount === "object" && "min" in ing.amount;
      if (ing.amount == null || (typeof ing.amount !== "number" && !isRange)) {
        const key = `${nameKey}::text`;
        if (!map.has(key)) map.set(key, { id: key, name: ing.name, unit: null, amount: null, isText: true });
        continue;
      }
      const hasConv = ing.amount_conv != null && ing.unit_conv != null;
      const unit = hasConv ? ing.unit_conv : (ing.unit || pieceUnitLabel);
      const key = `${nameKey}::${unit}`;
      const base = hasConv ? ing.amount_conv : ing.amount;
      // Ranges collapse to their midpoint for shopping-list totals — a pack is bought either way.
      const baseNum = typeof base === "number" ? base : (base.min + base.max) / 2;
      const scaled = baseNum * multiplier;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.amount += scaled;
        existing.isApprox = existing.isApprox || hasConv;
      } else {
        map.set(key, { id: key, name: ing.name, unit, amount: scaled, isText: false, isApprox: hasConv });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

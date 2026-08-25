// Data layer: fetches recipes/tips (EN+LT) and prices, exposes a small typed API.

const DATA_URLS = {
  en: { recipes: "data/recipes.json", tips: "data/tips.json" },
  lt: { recipes: "data/recipes_lt.json", tips: "data/tips_lt.json" },
  tags: "data/tags.json",
  tagsLt: "data/tags_lt.json",
  prices: "data/prices.json",
};

const store = {
  recipes: { en: null, lt: null },
  tips: { en: null, lt: null },
  tags: null,
  tagsLt: null,
  prices: null,
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function loadAll() {
  const [recipesEn, recipesLt, tipsEn, tipsLt, tags, tagsLt, prices] = await Promise.all([
    fetchJSON(DATA_URLS.en.recipes),
    fetchJSON(DATA_URLS.lt.recipes),
    fetchJSON(DATA_URLS.en.tips),
    fetchJSON(DATA_URLS.lt.tips),
    fetchJSON(DATA_URLS.tags),
    fetchJSON(DATA_URLS.tagsLt).catch(() => ({ category: {}, flavor_theme: {} })),
    fetchJSON(DATA_URLS.prices).catch(() => ({})),
  ]);
  store.recipes.en = recipesEn.map((r, i) => ({ ...r, id: slugify(r.title, i) }));
  store.recipes.lt = recipesLt.map((r, i) => ({ ...r, id: slugify(recipesEn[i]?.title ?? r.title, i) }));
  store.tips.en = tipsEn.map((t, i) => ({ ...t, id: slugify(t.title, i) }));
  // FIXME: tips.json (EN) was corrected to merge mis-split subsections
  // (306 entries); tips_lt.json (LT) is still the old, uncorrected
  // translation (363 entries) - index-based EN/LT pairing is temporarily
  // misaligned past entry 306 until the LT pass is redone. Fall back to
  // the LT entry's own title so this doesn't throw.
  store.tips.lt = tipsLt.map((t, i) => ({ ...t, id: slugify(tipsEn[i]?.title ?? t.title, i) }));
  store.tags = tags;
  store.tagsLt = tagsLt;
  store.prices = prices;
  return store;
}

/** Returns the display label for a category or flavor_theme tag slug, translated when lang is "lt". */
function tagLabel(lang, kind, slug) {
  if (lang === "lt") {
    const translated = store.tagsLt?.[kind]?.[slug];
    if (translated) return translated;
  }
  return slug;
}

/** Returns the display label for a free-form recipe/tip tag whose category (flavor_theme/ingredient/technique)
 * isn't known ahead of time — checks all three dictionaries in turn. */
function anyTagLabel(lang, slug) {
  if (lang === "lt") {
    for (const kind of ["flavor_theme", "ingredient", "technique"]) {
      const translated = store.tagsLt?.[kind]?.[slug];
      if (translated) return translated;
    }
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
 * not by the teaspoon — so tsp/tbsp/cup entries are converted to grams via the density
 * table in density.js (ml value × g/ml density) whenever that ingredient's density is
 * known, landing in the same bucket as any gram entries of the same ingredient from other
 * recipes. When density isn't known for that ingredient, the entry keeps its original
 * unit (tsp/tbsp/g/etc.) rather than showing a meaningless raw ml figure — still separate
 * from a same-name gram entry, since without density there's no correct way to combine
 * them, but at least not misleadingly relabeled as "ml". */
function buildShoppingList(items) {
  // items: [{ recipe, multiplier }]
  const map = new Map();
  for (const { recipe, multiplier } of items) {
    for (const ing of recipe.ingredients) {
      const nameKey = ing.name.toLowerCase().trim();
      const isRange = ing.amount != null && typeof ing.amount === "object" && "min" in ing.amount;
      if (ing.amount == null || (typeof ing.amount !== "number" && !isRange)) {
        const key = `${nameKey}::text`;
        if (!map.has(key)) map.set(key, { name: ing.name, unit: null, amount: null, isText: true });
        continue;
      }
      const density = ing.amount_ml != null ? densityFor(ing.name) : null;
      const useGrams = density != null;
      const unit = useGrams ? "g" : (ing.unit || "");
      const key = `${nameKey}::${unit}`;
      const base = useGrams ? ing.amount_ml * density : ing.amount;
      // Ranges collapse to their midpoint for shopping-list totals — a pack is bought either way.
      const baseNum = typeof base === "number" ? base : (base.min + base.max) / 2;
      const scaled = baseNum * multiplier;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.amount += scaled;
        existing.isApprox = existing.isApprox || useGrams;
      } else {
        map.set(key, { name: ing.name, unit, amount: scaled, isText: false, isApprox: useGrams });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

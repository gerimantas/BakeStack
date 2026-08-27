// Ingredient density lookup (g per ml) for converting tsp/tbsp/cup volume
// measures into grams for the shopping list — a shopping list needs one
// consistent unit per ingredient (you buy flour by weight, not by the
// teaspoon), unlike the recipe detail page where the original tsp/tbsp/cup
// stays shown alongside its ml value for the person actively cooking.
// The table itself lives in data/density.json; data.js loads it into
// window.INGREDIENT_DENSITY before this function is called.

// Free-form names in the data carry qualifiers ("vanilla paste or extract",
// "lemon juice or 1/3 tsp. citric acid") that won't hit the table above
// directly — try the exact name first, then fall back to a substring match
// against the table's keys (longest key wins, so "vanilla paste" doesn't
// shadow a more specific future entry).
function densityFor(ingredientName) {
  const table = window.INGREDIENT_DENSITY || {};
  const key = (ingredientName || "").toLowerCase().trim();
  if (table[key] != null) return table[key];
  let bestMatch = null;
  for (const tableKey of Object.keys(table)) {
    if (key.includes(tableKey) && (!bestMatch || tableKey.length > bestMatch.length)) {
      bestMatch = tableKey;
    }
  }
  return bestMatch ? table[bestMatch] : null;
}

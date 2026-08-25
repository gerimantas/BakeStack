// Ingredient density table (g per ml) for converting tsp/tbsp/cup volume
// measures into grams for the shopping list — a shopping list needs one
// consistent unit per ingredient (you buy flour by weight, not by the
// teaspoon), unlike the recipe detail page where the original tsp/tbsp/cup
// stays shown alongside its ml value for the person actively cooking.
// Values are standard culinary density approximations (g/ml), not exact —
// flagged as approximate in the UI via the tilde.
const INGREDIENT_DENSITY = {
  "all-purpose flour": 0.53,
  "baking powder": 0.9,
  "baking soda": 0.9,
  "brown sugar": 0.82,
  "caster sugar": 0.85,
  "cinnamon": 0.56,
  "ground cinnamon": 0.56,
  "cornstarch": 0.6,
  "ground ginger": 0.53,
  "ground star anise": 0.53,
  "honey": 1.42,
  "instant coffee": 0.4,
  "instant espresso coffee": 0.4,
  "instant espresso powder": 0.4,
  "lemon juice": 1.03,
  "lemon/lime juice": 1.03,
  "mint powder": 0.4,
  "nutmeg": 0.48,
  "rock salt": 1.2,
  "salt": 1.2,
  "semolina": 0.6,
  "sugar": 0.85,
  "titanium dioxide": 1.0,
  "vanilla extract": 0.9,
  "vanilla paste": 1.1,
  "water": 1.0,
  // spirits/liqueurs are close enough to water density for a shopping-list estimate
  "amaretto": 0.94,
  "amaretto liquor": 0.94,
  "cointreau": 0.95,
  "dark rum": 0.95,
  "orange liqueur (cointreau)": 0.95,
  "rum": 0.95,
  "glucose or glucose-fructose syrup": 1.4,
};

// Free-form names in the data carry qualifiers ("vanilla paste or extract",
// "lemon juice or 1/3 tsp. citric acid") that won't hit the table above
// directly — try the exact name first, then fall back to a substring match
// against the table's keys (longest key wins, so "vanilla paste" doesn't
// shadow a more specific future entry).
function densityFor(ingredientName) {
  const key = (ingredientName || "").toLowerCase().trim();
  if (INGREDIENT_DENSITY[key] != null) return INGREDIENT_DENSITY[key];
  let bestMatch = null;
  for (const tableKey of Object.keys(INGREDIENT_DENSITY)) {
    if (key.includes(tableKey) && (!bestMatch || tableKey.length > bestMatch.length)) {
      bestMatch = tableKey;
    }
  }
  return bestMatch ? INGREDIENT_DENSITY[bestMatch] : null;
}

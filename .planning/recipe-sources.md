# Recipe sources — where new recipes come from and how to import them

Written S24 (2026-09-29). The site is used only by the family (user, S24), which is
why third-party recipes and photos are imported at all.

## Rules for every import

- **Complete recipes only.** A recipe whose source omits a component (e.g. Cloudy
  Kitchen's chocolate cheesecake names a raspberry balsamic glaze it never gives) is
  skipped, not imported with `is_complete: false` — user decision, S24.
- **Hand-written, not converted by script** (`recipes-audit` skill). Fetching the source
  card by script is fine; writing the BakeStack entry is done by reading it.
- **Check for duplicates against Marusya first**, by comparing gram amounts of the
  same dish type. S24 found none: the sources overlap in dish, not in recipe.
- EN/LT parity check before appending (ids, field sets, amounts, units, tag vocabulary,
  step counts), then `json.dumps(indent=2, ensure_ascii=False) + "\n"` so the diff is
  pure insertion. Photo: 335 px wide JPEG, quality 82, `site/images/recipe-NNN.jpg`.
- Source slips are fixed and named in the commit message (wrong in→cm pan conversions
  recur: "9x13 in = 20x30 cm" appeared twice; the right value is 23 × 33 cm).

## Cloudy Kitchen (cloudykitchen.com) — 39 imported, ~340 left

- Full post list with categories: WordPress REST API,
  `https://cloudykitchen.com/wp-json/wp/v2/posts?per_page=100&page=N&_fields=id,slug,title,categories,featured_media,link,date`
  (431 posts, 5 pages; categories at `/wp-json/wp/v2/categories`). Every post has a photo.
- Recipe card: the `tasty-recipes` block holds section headings; the ld+json `Recipe`
  holds a flat ingredient list and the full-size `image` (last entry of the list).
- Remaining by BakeStack group (S24 count, sweet only): cookies/brownies ~122, pies and
  pastry ~67, cakes ~57, other sweets (doughnuts, macarons, ice cream) ~56, buns (see below),
  fillings ~19. Cheesecakes and cupcakes are exhausted.
- Buns (S25): sweet buns are nearly exhausted. Left in categories 255/412/426/1540:
  Roasted Apple Hot Cross Buns (unread; a third hot cross bun variant) and Sourdough
  Cinnamon Rolls (skipped: needs a sourdough starter the card does not give). The rest of
  those categories are doughnuts and savoury rolls.
- The ld+json `image` is sometimes a pre-bake shot (raw babka twist, unbaked rolls). Look at
  the photo; if it is not the finished bake, pick one from the post body instead;
  if the post has none, import with `image: null` (recipe-121).
- `source_url` containing `cloudykitchen.com` is what puts a recipe under the Source
  filter's "Cloudy Kitchen" chip (`RECIPE_SOURCES` in `site/js/data.js`).

## Instagram @marusya.manko — via BrowserOS neo only

- Instagram's robots.txt forbids automated collection; webparser and plain HTTP see no
  posts. BrowserOS neo (the user's logged-in browser, MCP at `http://127.0.0.1:9010/mcp`)
  can read them. User asked for it explicitly in S24; read slowly, 3 posts per run.
- Captions are truncated until the "more" button is clicked; click it inside the page
  and wait for the `h1` text to grow, then read the longest `h1`.
- **Read through:** every post from `DbvYHPrKwPF` (merged S23) to `Dd1KkBYin6t`
  (2026-09-28). Only 3 held a full recipe; `DdY03MjK879` duplicates recipe-013. The
  rest are promotions, courses or paid recipe cards. Start the next pass after
  `Dd1KkBYin6t`.

## Evaluated and not used (S24)

- marusyamanko.com — recipes are paid PDFs; only descriptions are public.
- Andy Chef (andychef.ru) — blocks non-browser requests (JS challenge); untried with
  BrowserOS neo. Beatos virtuvė (LT) and Klopotenko (UA) have ld+json `Recipe` but are
  home cooking rather than pastry. Sally's Baking returns 403 to plain HTTP.

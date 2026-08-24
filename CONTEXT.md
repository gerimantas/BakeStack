# BakeStack — Context

## Status
active — planning complete, no code written yet for the dashboard itself.
GitHub repo live and public: https://github.com/gerimantas/BakeStack
(renamed from local "Receptai" this session; old local folder at
`C:\Users\retco\Projects\Receptai` is stale/unused — could not be deleted
mid-session, locked by another process; safe to remove by hand).

Next session: start at "Next tasks" below, step 1 (tag vocabulary) — the
plan in this file is complete enough to implement directly, no further
discussion needed unless something in the plan turns out to be wrong
once real parsing starts.

## What this project is
BakeStack: a recipe/pastry-tips database and calculator, starting from
two Instagram-recipe-export Word documents (pastry/baking recipes and
technique tips) converted to clean Markdown for LLM processing. Renamed
from "Receptai" once the project scope grew from "convert two docs" to
"build an interactive dashboard" — see Goal below.

## Current state
- `Receptai.docx` / `Patarimai.docx` — original source files, untouched.
- `Receptai.md` / `Patarimai.md` — converted Markdown: headings/sub-headings
  reconstructed, emoji removed (converted to real Markdown lists/numbering
  or the word they stood in for, e.g. 🍋→lemon; purely decorative emoji
  deleted), Instagram screenshot metadata (author handle, song caption,
  like counts) stripped out.
- `scripts/` — the conversion pipeline used to produce the .md files, with
  a verification script. See `scripts/README.md` for usage. Re-run this
  pipeline if the source .docx files change, or reuse it for a similar
  future document (README explains what needs re-tuning per document).

## Verified
Both .md files checked character-by-character against their source .docx
(scripts/docx_verify.py) — no recipe text, ingredient, or step lost.
Structural check also done separately: recipe sub-sections (Ingredients,
Instructions, Frosting, etc.) confirmed at the correct heading level
(### under the recipe's ##, not sibling ## headings).

## Goal: interactive static dashboard (GitHub Pages)
Decided after a brainstorm session (see Decisions below). Target: a static,
interactive site — no backend, no database server. Runs entirely in the
browser off pre-generated JSON. Future data updates happen by re-running
the conversion scripts locally and `git push`-ing a new JSON — not by
writing back from the page itself.

Longer-term direction (not yet in scope): a Telegram bot with a real
database, so recipes/tips can be added and browsed from any device with
data staying in sync. The static site is a deliberate first experiment
before investing in that.

### Data pipeline needed (not yet built)
1. `Receptai.md` → `recipes.json`: one object per recipe — `title`,
   `category` (inferred from title), `servings` (base yield, if stated in
   source; otherwise null), `ingredients: [{amount, unit, name}]` (parsed
   from lines like "300 g blueberries"; lines without a parseable
   quantity, e.g. "a pinch of salt", get `amount: null` and stay
   display-only), `steps: []`, `tags: []` (auto-derived from title +
   ingredient names, from a shared vocabulary — see Decisions),
   `image: null` (placeholder — see Photos note below).

   **Parse coverage checked**: roughly 5-10% of ingredient lines
   genuinely have no quantity in the source ("a pinch of salt", "Nutella
   (for filling)", "cocoa for sprinkling") — these always stay
   `amount: null`, no regex fixes that, the source itself doesn't
   specify an amount. The rest (numbers written as fractions like "⅔
   tsp", count-nouns like "2 large eggs" or "10 Ferrero Rocher candies",
   bullet-prefixed lines like "•500 g mascarpone") are parseable with a
   real parser handling those forms — expect ~90-95% coverage, not the
   ~70% a naive "number+unit only" regex gets.

   **Range quantities** ("300–400 g red lentils", "150–200 g"): checked
   the source — a real, common pattern (~20-45 occurrences depending on
   dash-character counting), not a rare edge case. `amount` becomes
   `{min, max}` instead of a single number when the source gives a
   range; the multiplier scales both ends ("300–400 g" × 2 = "600–800
   g"), keeping it a range rather than collapsing to one number, since
   the range itself is information the source author chose to give.

   `category` and `tags` are two separate axes, not one flat pile —
   checked the titles: almost every one names both a **format** (cupcake,
   roll, cheesecake, ganache, tea cake, brownie — what physical thing it
   is, single-valued) and a **flavor/theme** (chocolate, lemon, tiramisu,
   caramel, baileys — can be more than one, e.g. "Tiramisu Cheesecake" is
   category="cheesecake" + tags=["tiramisu","baileys"], not a category
   conflict). UI gets two separate filters ("Type" and "Flavor/Theme")
   that can be combined, instead of one undifferentiated tag search.
2. `Patarimai.md` → `tips.json`: **not** restructured into article/
   sub-article hierarchy — decided against that (254 headings mix real
   article titles with sub-sections like "PART 2", "TIP #1", "TEXTURE" at
   the same Markdown heading level; too inconsistent to reliably regroup
   automatically). Instead, every `##`/`###` block becomes its own
   flat searchable record with its own text and auto-derived `tags`.
   Findability comes from full-text search (client-side, e.g. Fuse.js or
   Lunr.js) plus tag filtering — not from browsing a rebuilt hierarchy.

   **Duplicate-title handling** (checked: "CAKE COATING. COMMON
   PROBLEMS" appears 5x, "HOW TO MAKE A PERFECT CHEESECAKE" 4x — this is
   the source author revisiting the same topic across separate Instagram
   posts over time, confirmed by reading the actual text: e.g. one block
   opens with "Yesterday we discussed the possible reasons..."):
   - Consecutive `##` blocks sharing the exact same title are the literal
     continuation of one post split across paragraphs — merge into a
     single tip record.
   - The same title reappearing *non-consecutively* elsewhere in the file
     is a separate later post on the same topic — keep as its own
     record, but suffix the displayed title with a number ("CAKE
     COATING. COMMON PROBLEMS — 2") so search results are distinguishable
     instead of showing identical-looking duplicates.
   - Auto-derived tags (see point 3 below) help disambiguate further
     even between same-numbered entries, since two posts sharing a title
     usually cover different specifics (e.g. air bubbles vs. whey
     leaking) that show up as different tags.
3. Shared tag vocabulary (chocolate, gelatin, cream cheese, cheesecake,
   flour, meringue, tempering, citrus, etc.) used for both files, so a
   recipe and a tip with an overlapping tag can be cross-linked in the UI
   ("related tips" block on a recipe page) automatically — no manual
   linking between the two files.
4. Ingredient name normalization, two separate layers:
   - **Spelling-only variants merge automatically**: "heavy cream 33–36%"
     / "heavy cream 33-36%" / "heavy cream (33–36%)" / "heavy cream
     33–36%(1)" are the same product written differently (en-dash vs
     hyphen, parens, the "(1)"/"(2)" multi-dose labels within one
     recipe) — collapse to one canonical name.
   - **Real product variants stay separate**: "dark chocolate 54.5%" and
     "dark chocolate 70%" are genuinely different products at different
     price points — each keeps its own canonical name (and later, its
     own price entry). Same for butter salted/unsalted if the source
     distinguishes them; "melted"/"soft"/"cold" butter are just a *state*
     of the same product, not separate ones, and merge like the
     spelling-only case.

### Site features needed (not yet built)
- **Mobile-first responsive layout from the start**, not a later
  retrofit. Ties directly to the earlier stated goal of eventually using
  this on Android/iOS (before deciding on the Telegram bot direction) —
  building responsive now is cheaper than reworking a desktop-only
  layout once real usage on a phone is expected.
- **Dark/light theme**: defaults to the OS/browser preference
  (`prefers-color-scheme`), with a manual toggle so the user can
  override it regardless of system setting.
- Recipe list with category/keyword filter.
- Recipe detail page: ingredients with a **multiplier** (0.5x, 1x, 1.5x,
  2x, 3x, ...) that scales every ingredient amount proportionally. Not a
  "servings" input — most recipes here aren't unit-count recipes (cakes,
  cinnamon rolls, ganaches don't have a meaningful "servings" number; a
  cinnamon roll recipe always yields "8 rolls" because the dough amount
  is sized for one baking dish, not because you'd want to scale roll
  count independently of dough amount). Where the source states a yield
  ("~12 cupcakes", "yields ~650 g frosting") show it as informational
  text next to the multiplier, not as a separate recalculated field.
- **Instruction-step quantities that also need to scale**: checked all
  113 numbered steps in Receptai.md — only 5 mention a specific gram/ml
  amount inline (as opposed to temperature/time, which never need
  scaling). Those 5 get the amount marked as a variable in the step text
  (e.g. "Pour {{amount}} g of cream...") so it recalculates with the
  multiplier too, instead of silently staying at the 1x value while the
  ingredient list above it updates — found by grep, exact lines:
  - `Pour 100 g of cream (1) into a saucepan...` (Baileys ganache)
  - `...Add the blueberry filling (set aside 20 g).` (Blueberry-Lemon Rolls)
  - `...300–400 g of rinsed lentils. Simmer...` (Pumpkin Cream Soup)
  - `...half (~175–200 g) of the Savoiardi biscuits...` (Matcha Strawberry Tiramisu)
  - `...half (~175–200 g) of the Savoiardi biscuits...` (Baileys Tiramisu)
  All other numbers in step text (temperatures, minutes/hours, "10-12
  hours", oven settings) are left as plain text — they don't scale with
  batch size and marking them as variables would be wrong.
- Tips: searchable (full-text + tags), not necessarily browsable by
  article hierarchy.
- "Related tips" block on recipe pages via shared tags.
- EN/LT language toggle for the whole page (UI strings AND recipe/tip
  content — titles, ingredients, steps). Content translation is
  pre-generated once (not live/API-based), same reasoning as the static
  data pipeline: no backend to call a translation API from.
- Volume units (tsp/tbsp/cup) shown with an ml conversion alongside the
  original unit, in both languages — not replaced by it. E.g. "1 tsp
  vanilla extract" displays as "1 tsp (5 ml)". Conversion table:
  tsp=5ml, tbsp=15ml, cup=240ml (US cup, approximate — flag as such in
  the UI). Gram amounts already in the source are shown as-is; no
  cup/tbsp-to-gram conversion (that depends on ingredient density, not
  a fixed factor, so it's not attempted).
- Ingredient unit price field is a placeholder for later — not building
  cost calculation yet, but the `ingredients` JSON shape (separate
  amount/unit/name) is chosen specifically so it can be added later
  without reshaping the data again.
- **Photos**: source text frequently references photos/carousel that
  existed on the original Instagram posts ("swipe through the carousel
  and enjoy...") but no actual image files came with the .docx exports.
  `image: null` reserved on every recipe/tip record now so a photo can
  be attached later (by filename/path) without another JSON reshape.
  Not fetching or attaching any images in this phase — no image files
  exist to attach yet, and the referencing text in the recipe body is
  left as-is (that's the original author's writing, not something to
  edit out).
- Ingredients with no parseable quantity (`amount: null`, ~5-10% of
  lines — "a pinch of salt" etc.) are displayed as plain text, untouched
  by the multiplier, with no "missing data" warning styling — this is
  expected/normal (the source recipe itself doesn't quantify them), not
  a parsing failure to flag to the user.

### Translation quality check (3 layers, not a single pass)
1. **Automated structural check**: after translating, verify the LT JSON
   has the same recipe count, same ingredient count per recipe, and the
   same numeric amount/unit per ingredient as EN (a translation pass
   must never change "300 g" into "300 ml" or drop an ingredient) —
   catches technical corruption, not meaning errors.
2. **Fixed terminology glossary, built before translating**: baking terms
   (fold in → švelniai sumaišyti, whisk → plakti šluoteliu, heavy cream →
   plaktukė grietinėlė, baking soda → soda, etc.) get one agreed LT term
   used consistently across all 85 recipes — not re-decided per recipe.
   Inconsistent terms for the same ingredient would break search and
   (later) cost matching between recipes.
3. **Manual spot-check by the user on a sample** (~5-10 recipes across
   different types), not a full review of all 85 — meaning-level
   correctness needs a human, but reviewing everything isn't the bar;
   the glossary is what keeps the other ~75 consistent with the
   spot-checked sample.

## Decisions
- 2026-08-24: Static GitHub Pages site first, Telegram bot later. Reason:
  cheap way to validate the idea before investing in a 24/7-hosted bot +
  database.
- 2026-08-24: Patarimai.md tags/search over rebuilt article hierarchy.
  Reason: the heading levels in the source don't reliably distinguish
  "article title" from "sub-section" — hand-fixing 254 headings wasn't
  worth it versus flat full-text search + tags.
- 2026-08-24: Recipes and tips cross-link via a shared tag vocabulary, not
  manual per-recipe links. Reason: keeps the connection automatic as new
  recipes/tips are added, no upkeep burden.
- 2026-08-24: Full EN/LT translation (UI + recipe/tip content), generated
  once ahead of time rather than via a live translation API. Reason: no
  backend on a static site to call an API from; a one-time high-quality
  pass (done by Claude, aware of pastry terminology) beats generic machine
  translation anyway.
- 2026-08-24: tsp/tbsp/cup shown alongside an ml conversion, not replaced
  by a Lithuanian word ("šaukštelis" etc alone). Reason: "cup" has no
  precise LT kitchen equivalent, and silently converting risks misleading
  quantities — showing both the unit and its ml value removes the
  ambiguity instead of picking a side.
- 2026-08-24: Recipe scaling uses a plain multiplier (0.5x/1x/2x/...)
  applied to every ingredient, not a "servings" field. Reason: checked
  the source — only ~8-10 of 85 recipes have a real unit yield ("~12
  cupcakes"); the rest (cakes, rolls, ganaches) don't have a meaningful
  servings count, only a dough/batch size tied to one baking dish or a
  weight yield. A multiplier works uniformly for all of them; a
  "servings" input would only make sense for the minority.
- 2026-08-24: Ingredient normalization keeps real product variants
  (chocolate cocoa %, salted/unsalted butter) as separate canonical
  entries, only merging pure spelling differences (dashes, parens, "(1)"/
  "(2)" dose labels). Reason: chocolate % genuinely changes price — a
  single "chocolate" price entry would make cost calculation wrong for
  every recipe using a different %. Costs more upfront price-entry effort
  later, but the alternative silently produces incorrect recipe costs.
- 2026-08-24: Duplicate Patarimai.md titles — merge only when
  consecutive (same post continuing), keep as separate numbered entries
  ("— 2", "— 3") when the same title reappears elsewhere in the file.
  Reason: verified by reading the actual text that non-consecutive
  repeats are the author revisiting a topic in a later, separate
  Instagram post (one literally opens with "Yesterday we discussed...")
  — they are not the same content duplicated, so merging them would lose
  distinct tips; leaving them identically-titled and unnumbered would
  make search results indistinguishable.
- 2026-08-24: Recipes get two separate classification axes — a
  single-valued `category` (format: cupcake/roll/cheesecake/ganache/...)
  and a multi-valued `tags` (flavor/theme: chocolate/lemon/tiramisu/
  baileys/...), not one flat tag pile. Reason: checked the titles —
  nearly all name both a format and a flavor (e.g. "Tiramisu Cheesecake
  with Baileys"); a single category field can't hold "cheesecake" and
  "tiramisu" at once without one of them being lost or arbitrarily
  chosen, and a flat tag pile can't answer "show me only cheesecakes"
  without also matching every recipe merely flavored like a cheesecake.
- 2026-08-24: Translation QA is 3 layers — automated structural diff
  (amounts/units/counts unchanged), a fixed terminology glossary built
  upfront (consistent LT term per baking term across all recipes), and a
  user spot-check on a sample rather than a full review of all 85.
  Reason: meaning-level correctness needs a human and reviewing
  everything isn't practical; the glossary is what makes a sample check
  representative of the rest instead of each recipe being independently
  risky.
- 2026-08-24: Accepted that ~5-10% of ingredient lines will have no
  parseable quantity and stay display-only text, not blocked on fixing
  every line. Reason: measured against the actual source text — those
  lines genuinely have no quantity written ("a pinch of salt"), so no
  parser improvement can extract one; treating it as expected rather
  than a defect avoids chasing an unreachable 100%.
- 2026-08-24: The 5 instruction steps (out of 113) that mention a
  specific gram/ml amount get that number marked as a scalable variable,
  rather than leaving instruction text un-scaled everywhere. Reason:
  small enough to hand-fix now (5 cases, identified exactly) while it's
  cheap — the alternative is a visible, confusing mismatch between the
  scaled ingredient list and a stale number in the instructions for
  those specific recipes.
- 2026-08-24: Mobile-first responsive layout from the first build, not
  a later retrofit. Reason: ties directly to the stated eventual goal
  of using this on Android/iOS — building responsive now is cheaper
  than reworking a desktop-only layout once real phone usage matters.
  (Renamed project to BakeStack around the same time, reflecting the
  same shift from "convert two docs" to "build the actual app".)
- 2026-08-24: Dark/light theme follows the OS preference by default,
  with a manual override toggle. Reason: standard expectation for a
  personal-use app opened at various times of day; a toggle covers the
  case where the user wants to override the system default.
- 2026-08-24: Range-quantity ingredients ("300–400 g") scale both ends
  of the range with the multiplier, rather than collapsing to a single
  averaged number. Reason: checked the source — ranges are common
  (~20-45 occurrences), not rare; the author chose to give a range on
  purpose (e.g. "however much fits"), and averaging would silently
  discard that intent.
- 2026-08-24: Reserve `image: null` on every recipe/tip record now,
  don't attach any images yet. Reason: source text references photos
  that existed on the original Instagram posts but no image files came
  with the .docx exports — nothing to attach in this phase — but the
  field shape is settled now (same reasoning as the price-field
  placeholder) so attaching photos later doesn't require another data
  reshape.

## Next tasks
1. Design the tag vocabulary (ingredients + techniques) shared by both
   recipes.json and tips.json.
2. Write the Receptai.md → recipes.json parser (ingredient
   amount/unit/name extraction is the hard part — expect a manual-review
   pass for lines the regex can't parse).
3. Write the Patarimai.md → tips.json parser (flat, one record per
   heading block).
4. Build the EN→LT baking terminology glossary (fold in, whisk, heavy
   cream, baking soda, etc. — one fixed term each) before translating.
5. Generate the LT translation pass for both JSON files (titles,
   ingredients, steps, tip text) plus the UI string dictionary, using
   the glossary; run the structural diff check; user spot-checks a
   sample.
6. Build the static site (list + detail + servings recalculation + tips
   search + related-tips linking + EN/LT toggle + unit ml display).

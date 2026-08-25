# BakeStack — Context

## Status
active — static site in `site/`, live on GitHub Pages:
**https://gerimantas.github.io/BakeStack/** (public repo, deploy via
`.github/workflows/deploy.yml`, auto-updates on every push to master that
touches `site/**`). 73 recipes / ~310 tips (2 empty tips deleted, 1 new
tip split out — see S7 Archive for exact count), EN and LT kept in
array-index sync on every data edit.

**S6's "QA compare findings all confirmed as known/harmless" claim was false —
corrected in S7.** QA Compare only ever diffed recipe/tip titles, never
ingredients/steps/body text, so it structurally could not have caught real
content bugs. A full audit (S7) found 13 previously-undocumented bugs plus
several more found while fixing those — all fixed; full list in S7 Archive
and `FIX_PLAN.md`. Do not cite "QA confirmed" as evidence of data quality —
QA Compare still only checks titles; strengthening it to a real content-diff
is `FIX_PLAN.md` step 0, not yet done.

Known open data-quality gaps (deliberately unfixed, see `FIX_PLAN.md` final
section): `tags_lt.json` has no LT entry for ~16 hyphenated tag slugs (UI
falls back to showing the raw English slug on ≥26 tips), and the dictionary's
own entries are inconsistent with phrasing already used in the data in a few
places (sour-cherry, whipping-cream, baking-soda). Needs a dedicated
dictionary audit pass, not a fix made in passing.

Session S7 closed 2026-08-26.

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
  original unit, in both languages — not replaced by it. ml is the
  primary/larger display value, original unit shown smaller in
  parentheses below it. E.g. "1 tsp vanilla extract" displays as
  "5 ml (1 tsp)". Conversion table: tsp=5ml, tbsp=15ml, cup=240ml (US
  cup, approximate — flag as such in the UI). Gram amounts already in
  the source are shown as-is; no cup/tbsp-to-gram conversion (that
  depends on ingredient density, not a fixed factor, so it's not
  attempted). Implemented in the data: every `ingredients[]` entry
  whose source `unit` was tsp/tbsp/cup/cups now also carries an
  `amount_ml` field (number or `{min,max}` for ranges) alongside the
  untouched original `amount`/`unit` — both `recipes.json` and
  `recipes_lt.json` carry this field identically.
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
- 2026-08-24: Repo stays public (GitHub Pages from a public repo, no
  Pro plan needed). Reason: personal hobby project, no sensitive data
  in the recipes/tips — recipe content being visible in git history
  forever is acceptable.
- 2026-08-24: Not sizing the search index (Fuse.js/Lunr, full EN+LT
  text) upfront — will measure the real bundle size after the parser
  and translation steps produce actual JSON, decide then if it needs
  trimming. Reason: 85 recipes + 254 tips is not large; premature to
  design around a guessed size.
- 2026-08-24: Ingredient price field stays a `null` placeholder with no
  planned fill-in date or task. Reason: not part of the current scope;
  will be filled manually if/when cost calculation becomes a real need,
  not scheduled now.
- 2026-08-24: JSON build step (Receptai.md/Patarimai.md → recipes.json/
  tips.json) stays a manual local script run + git push, not a GitHub
  Action. Reason: hobby project, infrequent updates, simplicity over
  automation.
- 2026-08-24: Parser output gets the same structural-diff QA as the
  translation pass (recipe/ingredient counts, and every amount value —
  number/range/null — checked against a source-verified reference)
  before commit. Reason: same corruption risk as translation (e.g.
  parser turning "300 g" into the wrong number) — same check catches
  it, run right after the parser instead of only at the translation
  step.
- 2026-08-24: recipes.json/tips.json structure is NOT being designed
  for a future DB import (Telegram bot phase). Reason: bot phase hasn't
  started; the JSON shape is already reasonable (separate fields, not
  flat text) and a future DB import can adapt then — no need to guess
  a schema now.

## Done Log
- 2026-08-26 (S7): Full data audit found and fixed 13 previously-undocumented
  bugs (section-grouping loss on 43/73 recipes, cross-file duplicate, typo
  regressions, leftover conversion glyphs, empty tips, mis-parsed lines) plus
  several more found while testing fixes (cost-estimate block removed,
  category mis-inference, duplicate recipe title, tag substring-matching
  bug). Self-inflicted LT tag corruption caught and reverted same session.
  Disproved S6's "QA confirmed" claim — QA Compare only checks titles, never
  content. Nav polish (hamburger position, mobile auto-close, About page)
  also done this session. Full detail in Archive entry below and `FIX_PLAN.md`.
- 2026-08-25 (S6): LT translation fully redone (73/312, matches EN exactly),
  5 original-.docx typos fixed at the source, 6 LT glossary-consistency
  fixes, nav sticky bug + nav lang-switch bug fixed, QA tool wired into the
  deployed site, GitHub Pages deploy live via GitHub Actions. Full detail
  in Archive entry below.

## Next tasks
1. Strengthen QA Compare to do a real content diff (ingredients/steps/body
   text), not just title-matching — `FIX_PLAN.md` step 0. This is what let
   13 real bugs go undocumented for 2 sessions; doing this first would catch
   the next one automatically instead of waiting for the user to spot it.
2. Audit `tags_lt.json` deliberately: ~16 hyphenated tag slugs have no LT
   entry (falls back to raw English on ≥26 tips), and a few existing entries
   contradict phrasing already used in the data (sour-cherry, whipping-cream,
   baking-soda). Full list in `FIX_PLAN.md`'s "Found but NOT fixed" section.
3. Optional: add real photos later (`image` field already reserved
   null on every recipe/tip record per the original plan).
4. Optional: expand `site/js/density.js`'s ~30-entry density table if a
   shopping-list unit still shows unmerged for a common ingredient — not
   exhaustively checked against all 41 distinct volume-unit ingredient
   names in the data, only spot-checked (cornstarch, baking soda).

## Archive

### Session 2026-08-26 (S7) — full data audit disproved S6's "QA confirmed" claim, 13 real bugs found and fixed, LT tag corruption self-inflicted and reverted

Started from nav polish (hamburger menu position, mobile auto-close, About page) — see
those commits first. Then the user spotted "sugar" appearing 4 times in one recipe's
ingredient list and asked why. That question unwound S6's central claim: "QA compare
tool findings all confirmed as known/harmless." **That claim was false.** QA Compare only
ever diffs recipe/tip **titles** between source and JSON — it never compared ingredients,
steps, or body text, so it could not have caught any of what this session found. Dispatched
a wide Explore-agent audit (all 73 recipes, 40+ tip samples) against the actual source .md
files. Result: 13 confirmed, previously undocumented bugs — not variance, not noise.

**Fixed, in order, each its own commit (see `FIX_PLAN.md` for the full write-up):**
1. **Section-grouping loss (43/73 recipes)** — multi-part recipes (Dough/Filling/Curd/
   Icing/Frosting) lost their part labels during parsing; all ingredients flattened into
   one list, making "sugar" look like a duplicate when it's 4 separate amounts for 4
   separate parts. Added a `section` field to the parser, grouped display in the recipe
   page, translated all 105 unique section labels to LT.
2. **"Basic Savory Crumble" cross-file duplicate** — same content existed as both a
   recipe and a tip. S6's own exclusion comment blamed the wrong cause (claimed content
   was "copied from a different recipe" — false; verified by direct read, not assumption).
   Kept as a recipe (source has no ingredient list for it — flagged in the parser as a
   permanent hand-kept exception), removed the tip duplicate.
3. **"creamd" regression** — a past typo-fix pass corrupted "creamed" into "creamd" while
   trying to fix something else. Reverted.
4. **5 typos S6 claimed were "fixed at the source" were never actually applied to
   `Patarimai.md`** — only the JSON side was fixed. Patched the source file too.
5. **4 more "missing leading letter" typos** the S6 spellcheck pass missed (UGAR→SUGAR,
   dorless→odorless, radually→gradually, reparing→preparing).
6-8. **Leftover conversion glyphs (▪▫◾◽‼)** in 16 tip titles, 49 tip bodies, 5 recipe
   step lists — fixed the parser gap (bullet-stripping never applied to recipe steps),
   cleaned all affected records both languages. Found and fixed a related defect at wider
   scope while in there: many recipe steps had a redundant leading "- " duplicating the
   UI's own numbered-list marker ("1. - Mix..." instead of "1. Mix...") — 308 LT step
   lines alone.
9. **2 empty "or" tips** — source wrote combined titles ("X or Y"), conversion split them
   into 2 headings, leaving "or" as one tip's entire body. Deleted both languages.
10. **Bare `##` heading bug** — a `##` with no space and no title wasn't recognized as a
    heading at all, leaking literal `##` into one tip's body mid-paragraph. Fixed the
    parser regex, split the orphaned content into its own titled tip ("Cake Coating.
    Common Problems — 3"), translated to LT.
11. **2 ingredients missing their unit** ("125 caster sugar", "65 heavy cream 33-36%" —
    both needed "g"). Fixed at the source.
12. **A section label mis-parsed as an instruction step** ("- Buttercream for coating").
13. **A min/max range stored backwards** when source wrote it high-to-low. Parser now
    always normalizes min <= max.

**Found while testing the fixes, not in the original audit — also fixed:**
- Cost-estimate block removed entirely from recipe pages (was showing a misleading
  partial price — "0.25 € — 1 of 29 ingredients priced" — whenever a recipe happened to
  use the one placeholder-priced ingredient in `prices.json`; feature isn't finished, a
  partial number is worse than none).
- 10 recipes had a redundant generic "Ingredients"/"INGREDIENTS" section label duplicating
  the page's own `<h2>` — cleared when it's a recipe's only section.
- Category inference matched vocabulary terms in list order, not accuracy: "Basic Savory
  Crumble..." and "Perfect Cheesecake Crumble" were tagged `cheesecake` because that term
  sorts before `crumble` in the vocab and both words appear in the titles. Fixed both to
  `crumble`, added a title-based override in the parser.
- "swirls" → category alias mapped to `cinnamon-roll` even for the one swirls recipe with
  no cinnamon in it (Tart Cherry-Coconut Swirls). Remapped to the generic `roll` category.
- Two entirely different recipes shared the exact title "BANANA TEA CAKE WITH DATES AND
  NUTS" (two real, separate Instagram posts in the source — not a bug, but indistinguishable
  in the UI). Renamed the second to "... — 2" in both languages.
- **Tag inference used bare substring matching, not word-boundary** — "rum" matched inside
  "crumble", "salt" inside "salted"/"salty", "butter" inside "buttercream", "milk" inside
  "milky", "gelatin" inside "gelatinization". Affected 9 recipes + 19 tips. Fixed to
  word-boundary regex with an explicit plural allowance (`e?s?`) — a first attempt was too
  strict and silently dropped correct tags on every plural ingredient name ("hazelnuts"
  no longer matching "hazelnut"), caught only by re-diffing against real ingredient text
  before trusting the fix.

**Self-inflicted bug, found and reverted before session end:** the tag-substring fix above
was applied to LT files by copying the *corrected EN slugs* directly into `tags`, instead
of translating them — overwriting already-correct Lithuanian words ("Baileys likeris",
"rūgšti vyšnia") with raw English slugs ("baileys", "tart-cherry") across all 9 recipes and
19 tips the fix touched. Caught by the user asking "was the LT translation done after this
change" — a direct EN/LT tags-array comparison confirmed the corruption. Reverted LT tags to
their pre-corruption state, reapplied only the same removals by array position (no
dictionary rewrite), and hand-translated the one set of newly-added tags using the most
common existing LT phrasing elsewhere in the dataset — not the dictionary, because
`tags_lt.json`'s own entries turned out inconsistent with established usage (see below).

**Found but deliberately NOT fixed this session** (see `FIX_PLAN.md`'s final section):
- 26 tips have at least one tag with no LT translation in `tags_lt.json` (`pectin-nh`,
  `cream-cheese`, `food-coloring`, etc. — UI falls back to showing the raw English slug).
  Predates this session (confirmed present at commit `3687893`).
- `tags_lt.json`'s own entries are internally inconsistent with phrasing already used in
  the data (`sour-cherry`/`tart-cherry` → "vyšnia", dropping "sour"; `whipping-cream`
  translated two different ways in different recipes; `baking-soda` → "soda" vs. the more
  common "valgomoji soda"). Needs a deliberate dictionary audit, not a fix made in passing.
- "COLD INFUSION" tip's body ends with a "Part 3" paragraph that's actually "THE HOT
  METHOD"'s intro — source puts a transition paragraph between two `##` headings, and the
  block-splitter attaches it to the preceding tip. Not checked for other occurrences of the
  same pattern elsewhere in `Patarimai.md`.

**Why this matters beyond the 13 bugs:** the session's own first attempt at documenting a
fix plan had real gaps (a first pass wrongly resolved the Basic Savory Crumble ownership
question, missed a commit-strategy, missed a mid-way verification step) — caught by a
critical self-review before execution, not after. QA Compare needs a real content-diff
capability (title-matching alone missed every one of these 13 bugs) — flagged in
`FIX_PLAN.md` step 0 but not yet built.

**Code:** `scripts/parse_recipes.py`, `scripts/parse_tips.py` (parser fixes), all 4 data
files (`recipes.json`/`recipes_lt.json`/`tips.json`/`tips_lt.json`, root + `site/data/`
copies), `site/js/app.js` (section-grouped ingredient rendering, cost-block removal),
`site/js/i18n.js` (About page expansion), `site/css/app.css` (nav + section-label styles),
`FIX_PLAN.md` (new — full audit findings + decision log, kept in the repo for reference).
**Entry point:** `python scripts/parse_recipes.py Receptai.md <out.json>` and
`python scripts/parse_tips.py Patarimai.md <out.json>` regenerate from source — but note
several fields (`amount_ml`, the Basic Savory Crumble recipe's content, the "— 2"/"— 3"
disambiguation renames) are NOT reproduced by the parser and must be reapplied by hand
after any regeneration, per the comments left in the parser files.
**Not measured:** whether the 6 unfixed `tags_lt.json` issues (26 tips + dictionary
inconsistency) extend beyond what was sampled — no full page-by-page audit was done for
those two. QA Compare's content-diff capability (step 0 of `FIX_PLAN.md`) was never built.

### Session 2026-08-25 (S6) — LT translation redo (73 recipes, 312 tips) to match S5 EN structure, nav bugs fixed, GitHub Pages deploy live

Redid the full LT translation from scratch since S5's dedup/merge/categoryGroup/topic
changes broke the old EN↔LT array-index pairing that `site/js/data.js` relies on
(recipes/tips are matched by position, not id — order and count must match exactly).
Dispatched 8 parallel background agents (4 recipe chunks, 4 tip chunks) mirroring the
S2 approach. One tips chunk (78 entries — pectin/eggs/gelatin/food-coloring theory
articles) had the agent refuse 3 times over the source's personal-voice content and a
third-party-looking handle (`@ma_rusya_manko`); the user confirmed ownership directly,
and rather than re-prompting a fresh agent with no way to verify that confirmation, I
translated that chunk myself in-session. Merged all 8 chunks into `recipes_lt.json`/
`tips_lt.json` (73/312, matching EN exactly) — structural validation (ingredient/step/
tag counts, amount/unit/amount_ml values, categoryGroup/topic fields) passed with zero
mismatches against EN.

**Bugs found via user-directed spot-checks, not automated scanning:**
- One EN recipe title had a typo in the *original .docx* itself ("ANANA TEA CAKE" —
  missing "B"), silently carried through every pipeline stage since S1. Found by user
  screenshot. Traced to the source docx via `office/unpack.py`, confirmed it wasn't a
  parser artifact. Same root cause found in 3 tip titles ("ORMING"/"ECTIN"/"NFUSION" —
  each missing a leading letter). Fixed in `recipes.json`/`tips.json` AND in
  `Receptai.md`/`Patarimai.md` (the actual .docx-derived source), so re-running the
  parser from scratch won't reintroduce them. A spellchecker pass (`pyspellchecker`)
  over all recipe/tip text then found 5 more real typos in tip body text
  (properattachment, thatstarch, cofee, specifed, creame) among ~240 flagged tokens
  (rest were legitimate pastry terms/brands/British spelling).
- LT-specific quality issues the user's "brownie" spot-check triggered a systematic
  glossary-consistency check for: `tags` arrays used glossary.json terms correctly but
  6 titles/ingredients didn't (MANGO→MANGŲ ×3, GORGONZOLA→GORGONZOLOS SŪRIU, 2×
  "CUSTARD KREMĄ"→"kremą (custard)" format mismatch). "BROWNIE" itself researched via
  web search (real LT sites use both "brownie" and "braunis") and left as-is per user
  call. 32 recipe steps had literal English "minutes"/"hours" left untranslated by one
  agent — fixed via regex sweep.
- **Nav bar didn't stay sticky when scrolling.** Root cause: `position:sticky` was
  correct CSS, but the header was rendered inside an empty `#nav-slot` wrapper div
  whose height exactly matched the header's own height — a sticky element needs scroll
  range *within* its containing block to have something to stick against; zero range
  means it just scrolls away. Reproduced in an isolated minimal HTML file to rule out
  flex/overflow-x:clip before finding the real cause. Fixed by making `#nav-slot` BE
  the `<header class="nav">` itself instead of wrapping it.
- **Nav menu text (Recipes/Tips/etc.) didn't update on EN↔LT switch without a hard
  reload.** The nav renders once per page load (intentional, from S4, so the search
  input never loses focus mid-keystroke) and is patched via `updateNavState()` on every
  route/lang change — but that function only ever touched `aria-current`/`aria-pressed`,
  never the link text itself or the search placeholder. Fixed by having it also set
  `textContent`/`placeholder`/`aria-label` on every call.
- User reported the fix wasn't working in Chrome (worked in Firefox) — root cause was
  Chrome caching the local dev server's `app.js` aggressively even past hard refresh;
  confirmed not a real bug (same code, same headless-Chromium test passed both times).

**QA compare tool wired into the deployed site:** copied `tools/qa-compare.html` +
regenerated `qa-compare-data.json` into `site/tools/` (GitHub Pages only serves
`site/`, so the tool wasn't reachable there before), added a "QA" nav link (external,
opens in new tab). Adding it as a 4th `NAV_LINKS` entry initially broke the lang-switch
text update (index-based lookup miscounted), fixed by giving it a
`nav__link--external` class excluded from that logic. Also hid "Shopping list" from
the nav per user request (route still works, just not promoted).

**Investigated every remaining QA-tool "missing/extra" finding** (after fixing the 4
typo-caused ones): all trace to either the already-documented S1 sub-recipe merge
(CRUST/CREAM CHEESE LAYER/PANA-COTTA folded into "VANILLA PANA-COTTA CHEESECAKE") or
the QA tool's strict `##`-title matching missing content that legitimately lives under
a nested `###` sub-heading's title instead (e.g. "Agar" tip = the `###` sub-section of
"## TERMS AND CONDITIONS OF STORAGE"). No actual data loss found in either recipes or
tips.

**GitHub Pages deploy live.** User asked to make repo private first (has GitHub Pro);
did so via `gh repo edit --visibility private`, pushed all 8 pending commits. Then
discovered Pages doesn't support a custom `/site` source path (only `/` or `/docs`) —
rather than renaming `site/` to `docs/` (would ripple through every script/doc
reference for no real gain, flagged by user as a "cheap fix that costs more later"
pattern to avoid), used the supported GitHub Actions deploy method instead:
`.github/workflows/deploy.yml` (upload-pages-artifact + deploy-pages, triggered on
push to master when `site/**` changes), Pages configured via `gh api` with
`build_type=workflow`. Verified live at
**https://gerimantas.github.io/BakeStack/** (200 status, no login, fresh browser
context). User then asked for a private repo → realized private Pages has no
shareable link for non-collaborators (GitHub hard limit, not a setting) → repo flipped
back to public per user's explicit choice, since recipe content was already decided
non-sensitive in S1.

Also generated `bakestack-qr.png` (QR code to the live URL, project root, untracked —
personal file, not a project asset) and a shareable Claude Artifact (QR + copyable
link card, styled off the site's own amber/warm token palette) at the user's request.

**Code:** `recipes_lt.json`, `tips_lt.json`, `site/data/recipes_lt.json`,
`site/data/tips_lt.json` (full LT regen); `recipes.json`, `tips.json`,
`site/data/recipes.json`, `site/data/tips.json`, `Receptai.md`, `Patarimai.md` (5
source typo fixes, EN-side); `site/index.html`, `site/js/app.js` (nav-slot sticky fix,
nav-state i18n fix, QA link, shopping-list nav removal), `site/js/data.js` (removed
stale FIXME); `site/tools/qa-compare.html`, `site/tools/qa-compare-data.json` (new —
copied in for Pages); `tools/qa-compare-data.json` (regenerated);
`.github/workflows/deploy.yml` (new).
**Entry point:** Site: `cd site && python -m http.server <port>` (local) or
https://gerimantas.github.io/BakeStack/ (live). LT regen: no single command — was
8 parallel agent dispatches with per-chunk prompts, see this session's transcript if
redoing. QA tool: `node scripts/build-qa-compare.js` regenerates
`tools/qa-compare-data.json`, then copy to `site/tools/` for the tool to reflect
current data.
**Not measured:** whether any other original-.docx typos exist beyond the 5 the
spellchecker pass caught (spellchecker flagged real words used as typos in domain
context could still slip through — e.g. a wrong-but-valid ingredient word); real
ingredient prices still not filled in (`site/data/prices.json` — one placeholder
entry); `site/js/density.js`'s ~30-entry unit-merge table still not exhaustively
checked against all volume-unit ingredients (carried over from S5, unchanged).

### Session 2026-08-25 (S5) — QA compare tool built, tips mis-split bug found and fixed (393→312), recipe category groups + topic-aware related-tips, shopping-list unit-merge via density table, amount_ml regression fixed

Started from a user request to visually verify DOCx→JSON conversion. Built
`tools/qa-compare.html` (static, no server needed beyond a throwaway static file
server) — side-by-side DOCx-derived-.md vs JSON view per recipe/tip, with
missing/extra filters and live counts. This tool immediately surfaced a real bug,
not just confirmed the pipeline was fine.

**Root cause found**: `scripts/docx_to_markdown.py`'s `SECTION_WORDS` heuristic
(and the general "any short/generic line becomes a `###` heading" logic) doesn't
distinguish a real subtopic from a bare list item inside a longer article — e.g.
"In ganaches: — cream — water" had "cream" promoted to its own H3, severing it
from the sentence that introduced it. This wasn't caught in S1 because the
original QA only checked structural counts (recipe/ingredient/step counts diffing
clean), never whether individual `##`/`###` boundaries landed on real topic
breaks. 124 `###` blocks existed pre-fix; manually reviewed every one (not
regex-classified) against full body text, since an early attempt at a "merge if
previous line ends with `:`" heuristic caught only 26 of the real cases and
would have mis-merged unrelated blocks in others (found by reading, e.g. block 9
"Origin: traditional Italian cheese" ran on into an unrelated "Why baking soda ≠
baking powder?" opener with no heading at all — the reverse problem, a missed
heading). Decisions recorded per-block in `tools/h3-decisions.json`
(MERGE/KEEP/GROUP_CURDLE/GROUP_GANACHE + 4 hand-written text splits for blocks
that fused two unrelated articles); `tools/apply-fixes.js` applies them to
`Patarimai.md`. Result: 393 → 312 tips (`Patarimai.md`, `tips.json`,
`site/data/tips.json`).

**8 recipe-side "missing" sections reclassified**: QA also flagged 11 `##`
headings in `Receptai.md` with no matching JSON recipe. 3 (CRUST/CREAM CHEESE
LAYER/PANA-COTTA) turned out already merged into their parent recipe ("RECIPE
FOR 'VANILLA PANA-COTTA' CHEESECAKE") by the S1 parser — false alarm, QA tool
just doesn't see sub-recipe merges. The other 8 (STABILIZING WHIPPED CREAM +
2 sub-sections, chocolate drips how-to + 2 steps, BASIC SAVORY CRUMBLE, FLAVOR
PAIRING. STRAWBERRY) were genuinely dropped by `parse_recipes.py` — real content,
not shaped like a standalone recipe. Moved into `Patarimai.md`/`tips.json` as 4
new tip records (merging the sub-parts of each into one coherent tip) instead of
inventing a new "components" site category — `Receptai.md`/`recipes.json` lost
these 8 sections, 85→77 recipes at that point in the session.

**Duplicate recipe found and removed**: user-reported. "MANDARIN-PASSIONFRUIT
CUPCAKES" existed twice in `Receptai.md`, word-for-word identical, ~1000 lines
apart — confirmed a real copy-paste duplication in the source, not a parser
artifact (checked: text matched exactly). Removed the second occurrence from
`Receptai.md` and `recipes.json` (77→73... — see below, count net includes both
this and the 8-move above). Full-corpus duplicate sweep afterward (title match +
Jaccard word-set similarity on both recipes and tips) found no others; the 4
near-duplicate tip pairs the similarity check surfaced (e.g. "Rapid set pectin"
vs "Medium rapid set pectin") were confirmed as distinct entries with a shared
description template, not duplicates.

**Recipe category UI overhaul**: user found the "Type" filter's 24 raw
`category` values (many with only 1-2 recipes: roll, panettone, stollen...)
impractical for browsing. Added a new `categoryGroup` field (11 groups) layered
OVER the existing `category` — the raw category still shows on each card/detail
page, only the filter chip uses the group. Big categories (cupcake 15,
cheesecake 10) stayed standalone per user's explicit call; everything under ~7
recipes merged into a themed group (Pies & Pastry, Cookies & Brownies,
Tiramisu & Zephyr, Savory, Cakes & Loaf Cakes, Components & Fillings). Chips
also gained live counts (`chip__count`) — split into "other-filter-only" counts
so picking a Type doesn't collapse Flavor's own counts to zero and vice versa.

**Tips got a matching `topic` field** (8 topics: ingredients, techniques,
flavor-pairing, cheesecake, frostings-ganache, sponge-pastry, troubleshooting,
storage) via keyword classification + manual review (found and fixed ~20
misclassifications from an initial regex pass, e.g. "Flavor description"/"Aroma
profile" subsections were inconsistently split between flavor-pairing and their
generic-keyword topic before a full re-check). Used for a new Tips-page topic
dropdown (compact `<select>`, not a chip row — user explicitly rejected chips
here since 312 tips would need a chip row wider than the content itself) AND to
fix `findRelatedTips()` on the recipe detail page: it previously ranked purely
by raw tag-overlap count, which surfaced tips sharing only generic ingredients
(butter/sugar/milk) with a recipe instead of topically relevant ones — a
chocolate cheesecake recipe was showing "ganache"/"sour cream"/"crème anglaise
curdling" tips instead of cheesecake tips. Fixed via a `CATEGORY_GROUP_TO_TOPICS`
map: recipes whose group has a matching tip topic now rank those topic-matched
tips first, tag-overlap only breaks ties within that group (groups with no
topic match, e.g. cupcake, fall through to the old tag-overlap-only ranking
unchanged).

**No-photo card layout**: recipe/shopping-picker cards always rendered an empty
gray placeholder box for the (always-null-for-now) `image` field. Changed to
render the media slot only when `recipe.image` is actually set — compact card
layout automatically, no manual toggle, so a card switches to photo layout
the moment that one recipe gets a real image. Found and fixed a layout
regression from this in the shopping-picker view (the `pick-checkbox`'s
absolute positioning, previously anchored inside the media block, started
overlapping the category label once the media block was omitted) —
`.recipe-card--no-media` reserves top padding for it.

**Shopping-list favorites-gating**: user reported the shopping-list recipe
picker should only ever show favorited recipes, not all 73 — it previously
showed everything regardless of favorite status. Fixed in `renderShoppingView`
(filters `getRecipes()` through `getFavoriteIds("recipe")` first), added an
empty-state message pointing the user at Favorites when none are picked yet.
Also fixed the sidebar panel's duplicated "Shopping list" heading (renamed to
"Your list"/"Jūsų sąrašas") and added the current date next to it, and darkened
the `pick-checkbox`'s border/background (previously near-invisible — light
border on a near-matching card background) after a user screenshot showed it
essentially unreadable.

**`amount_ml` regression found and fixed — a bug this session itself
introduced**: while diagnosing why the shopping list showed "cornstarch — 5 ml"
and "cornstarch — 23.5 g" as two separate lines, discovered the *current*
`recipes.json` had ZERO `amount_ml` fields across all 118 tsp/tbsp/cup entries,
even though CONTEXT.md's S2 archive entry describes this field as already built
and populated. Traced via `git diff HEAD` — the field was present in the last
commit, but this session's own recipe edits (duplicate removal, `categoryGroup`
addition) had been applied on top of an in-memory copy of `recipes.json` that
had already lost the field somewhere in the session's earlier tool calls.
Rebuilt `recipes.json` from the last commit (which still had `amount_ml`
intact), re-applied this session's dedup + `categoryGroup` changes on top of
that correct base, instead of patching the already-broken working file.

**User then rejected the follow-on shopping-list fix on sight**: once
`amount_ml` was restored, the shopping list started showing "cornstarch — 5 ml"
as its OWN unit (ml is not something anyone shops for a dry ingredient in) next
to "cornstarch — 23.5 g" — same duplicate-looking problem, different unit. User
explicitly rejected an initial fix attempt that kept both original units
side-by-side ("display-only" merge) and stated the real requirement plainly:
one ingredient must always resolve to ONE unit, grams or ml, not both. Built
`site/js/density.js` — a ~30-entry g/ml density table (flour, sugar, salt,
spices, common liqueurs) — so `buildShoppingList()` converts tsp/tbsp/cup
entries to grams via density when known, merging into the same bucket as any
gram-based entry of that ingredient; unknown-density ingredients keep their
original unit (still unmerged from a same-name gram entry — no correct way to
combine without density) rather than showing a meaningless raw ml figure.
Merged entries get an `isApprox` flag, rendered with a `~` prefix in the UI
(density conversion is an approximation, not exact per-brand). This changes
Shopping-list display ONLY — the recipe detail page's "5 ml (1 tsp)" display
(the S2-decided behavior) is untouched, since that page shows the original
recipe unit for someone actively cooking, not a shopping quantity.

**LT translation is now further behind EN** than at session start: this
session's fixes (tips merge, recipe move, dedup, `categoryGroup`, `topic`) were
applied EN-only per explicit user instruction ("pirma EN, LT vėliau" — LT redo
deferred to a future session). `recipes_lt.json`/`tips_lt.json` still reflect
the pre-fix EN structure (74/363 counts, old category/no topic field) — a
guard was added in `site/js/data.js` (`tipsEn[i]?.title ?? t.title` fallback)
so the site doesn't throw when the EN/LT array lengths mismatch, but LT content
is stale relative to EN until re-translated.

**Code:** `tools/qa-compare.html`, `tools/apply-fixes.js`, `tools/h3-decisions.json`,
`tools/tip-topics.json`, `scripts/build-qa-compare.js` (new, kept as reusable
tooling); `Patarimai.md`, `Receptai.md`, `recipes.json`, `tips.json`,
`site/data/recipes.json`, `site/data/tips.json` (data changes — see above);
`site/js/density.js` (new); `site/js/app.js`, `site/js/data.js`, `site/js/i18n.js`,
`site/css/app.css`, `site/index.html` (site changes — recipe/tip topic filters,
related-tips ranking, no-media cards, shopping-list favorites gating + unit
merge + date + checkbox contrast).
**Entry point:** `node scripts/build-qa-compare.js` regenerates
`tools/qa-compare-data.json`, then serve `tools/` and open `qa-compare.html`
(no build step). Site itself: `cd site && python -m http.server <port>`.
**Not measured:** LT translation redo (recipes_lt.json/tips_lt.json need full
re-generation against the new EN structure — new categoryGroup/topic fields,
73 vs 74 recipe count, 312 vs 363 tip count); whether the ~30-entry density
table covers every tsp/tbsp/cup ingredient actually in use (spot-checked
cornstarch/baking soda, not exhaustively verified against all 41 distinct
volume-unit ingredient names); GitHub Pages deploy still not configured.

### Session 2026-08-24 — recipes.json + tips.json parsers built, EN→LT glossary fully web-verified

Built the two data-pipeline parsers CONTEXT.md's plan called for, then built and
rigorously verified the EN→LT terminology glossary needed for the translation pass.

**recipes.json parser** (`scripts/parse_recipes.py` + `scripts/verify_recipes.py`):
read all of Receptai.md by hand before writing regex, since the tag-vocabulary pass
earlier this session had already surfaced real formatting quirks (bullet variants,
fraction forms, dose labels). Output: 74 recipes from 85 `##` headings (4 merged as
mis-marked sub-sections of one multi-part recipe — e.g. "VANILLA PANA-COTTA
CHEESECAKE" had its CRUST/CREAM CHEESE LAYER/PANA-COTTA sub-parts wrongly marked `##`
instead of `###` in the source — 7 excluded as pure-technique articles with no recipe
shape). 1146 ingredient lines, 2.4% `amount: null` (real no-quantity lines only).
`verify_recipes.py` cross-checks every gram/ml/kg/l quantity in the source against the
parsed output; passes clean.

Found and fixed 7 real parser bugs by comparing output against source line-by-line,
not just aggregate stats: intro paragraph landing in `steps[0]` (now split into
`description`); 3 source lines where multiple ingredients got concatenated during the
earlier docx→markdown conversion (worst: 6 ingredients on one line in Hazelnut
Praline) — fixed via a literal per-line lookup after a general regex-boundary split
was tried and rejected (it corrupted ingredient names containing numbers); bare
"lemon zest" (no "zest of" prefix) silently dropped; a leading `~` before a quantity
breaking the regex; 3/4-style fraction quantities not recognized; an "of" between
unit and name leaking into 62 ingredient names ("of icing sugar" instead of "icing
sugar").

**tips.json parser** (`scripts/parse_tips.py` + `scripts/verify_tips.py`): 363 flat
tip records from 378 source headings (254 `##` + 124 `###`) minus 9 empty
section-umbrella headings with no body text of their own. Duplicate-title handling
per the existing CONTEXT.md decision: consecutive same-title blocks merged,
non-consecutive ones numbered ("— 2", "— 3"). One plan reversed mid-build: intended
to prefix a `###` sub-heading's title with its nearest `##` ancestor for readability,
measured it against the actual source and found it wrong 76 of 124 times (61%) — this
source frequently starts a new topic with plain prose instead of a heading, so
"nearest preceding `##`" often pointed at a stale, unrelated topic. Reverted to bare
`###` titles.

**glossary.json**: built from real usage (recipes.json/tips.json/tags.json), then
user required every term web-verified against actual Lithuanian recipe/confectionery
sites, not guessed. ~45 targeted searches covering all 214 terms found 14 wrong terms
the first draft had invented or mis-guessed (e.g. "plaktukė grietinėlė" for heavy
cream — zero real search hits — corrected to "riebi grietinėlė"; "roladas" for
roulade — not a real standalone LT term — corrected to "vyniotinis"; full list in the
glossary decision entry above). A second coverage pass against the full `tags.json`
vocabulary (not just terms currently used in recipes/tips output) found 21 more terms
missing from the glossary entirely; all researched and added. Final state: zero
missing, zero extra keys between `glossary.json` and `tags.json` — a re-runnable
set-difference check, not a self-report.

Also found and fixed a shared bug in both parsers' tag-matching: a hyphenated vocab
term like "flour-almond" only matched its literal word order ("almond flour"), but
this source titles flour articles the other way ("ALMOND FLOUR") — every flour-type
tag was silently never applied until the match was made bidirectional.

**Code:** `scripts/parse_recipes.py`, `scripts/verify_recipes.py`,
`scripts/parse_tips.py`, `scripts/verify_tips.py` (new); `tags.json` (gained ~15
category/technique terms discovered while parsing); `recipes.json`, `tips.json`,
`glossary.json` (new, generated output).
**Entry point:**
```
python scripts/parse_recipes.py Receptai.md recipes.json
python scripts/verify_recipes.py Receptai.md recipes.json
python scripts/parse_tips.py Patarimai.md tips.json
python scripts/verify_tips.py Patarimai.md tips.json
```
**Not measured:** the LT translation pass itself hasn't started — glossary is ready
but no translated JSON exists yet. ~145 of the 214 glossary terms were confirmed
correct via targeted search but not exhaustively cross-checked against multiple
sources each (time/scope trade-off, noted in the decision entry above).

### Session 2026-08-25 — LT translation pass complete (recipes_lt.json, tips_lt.json)

Translated all 74 recipes and 363 tips from `recipes.json`/`tips.json` into
`recipes_lt.json`/`tips_lt.json`, using `glossary.json` terminology. Ran via 8
parallel background agents (4 chunks of recipes, 4 chunks of tips) — first batch hit
a session token-limit mid-run and 4 of 8 agents failed before writing output; the
4 that had already written valid JSON were kept, the other 4 re-run after the limit
reset. All 8 final chunk outputs merged into the two output files.

**Structural QA**: automated diff confirmed recipe count (74), ingredient count per
recipe (1146 total), step count per recipe (649 total), and tip count (363) all
match EN↔LT exactly; zero amount/unit/tag mismatches. One cosmetic issue found and
fixed: a translated tip (`SHELF LIFE OF FROSTING`) had extra blank lines splitting
what was a single bullet list in the source — collapsed back to match.

**User spot-check**: built an HTML comparison page (4 full recipes + 2 full tips,
EN|LT side by side, all ingredients/steps shown — not a truncated excerpt) as a
Claude Artifact for review. User approved the translation quality and terminology
after two rounds of design fixes on the review page itself (unrelated to the
translated data).

**Unit display decision revised**: the existing CONTEXT.md plan (tsp/tbsp/cup shown
alongside an ml conversion) was confirmed still correct in principle, but the
*display order* changed based on user feedback during spot-check — ml is now the
primary/larger value, original tsp/tbsp/cup shown smaller in parentheses beneath it
(previously undefined which one led). Implemented directly in the data: every
`ingredients[]` entry with `unit` originally tsp/tbsp/cup/cups now carries an
`amount_ml` field (tsp=5ml, tbsp=15ml, cup=240ml) alongside the untouched original
`amount`/`unit` — both `recipes.json` and `recipes_lt.json` gained this field
identically (122 ingredient entries affected).

**Bug found and fixed during conversion**: one ingredient ("rock salt" in `RECIPE
FOR BANANA CUPCAKES WITH RUM`) had a range amount with `min > max` — traced to the
source itself writing `1/3–1/4 tsp. rock salt` (descending order, atypical for this
document), which the original parser preserved literally instead of normalizing.
Fixed by swapping to `min: 0.25, max: 0.333` in both `recipes.json` and
`recipes_lt.json`, with matching `amount_ml`.

**Code:** `recipes_lt.json`, `tips_lt.json` (new, generated output); `recipes.json`
(gained `amount_ml` field on tsp/tbsp/cup entries, one min/max range fix — ingredient
names/amounts otherwise untouched).
**Entry point:** translation was agent-generated, not script-generated — no
re-runnable command; re-running would require re-dispatching the same 8-chunk agent
prompt structure (see this session's conversation for the exact prompts if the
translation ever needs redoing).
**Not measured:** the static site itself hasn't started — `hallmark` skill run for
visual design is the next task now that real translated data exists.

### Session 2026-08-25 — static site built (Hallmark bespoke design), tag vocabulary translated, search rebuilt as command-palette + full results page

Built the entire static site in `site/` — vanilla JS, no build step, no framework.
Scope grew mid-session past the original plan (recipe list/detail/scaling/EN-LT toggle)
once the user asked for favorites, a multi-recipe shopping list, and ingredient-price
cost estimates; all three got scoped and built this session, not deferred.

**Design**: ran `hallmark` in bespoke-custom mode (this app has 5 real screens — list,
detail, tips, favorites, shopping — not a landing page, so none of the 20 catalog
themes/macrostructures fit). Vibe: "kitchen counter, warm, floury, no-nonsense", amber
accent (~50°), Cabinet Grotesk display + Switzer body + Geist Mono for prices/measurements.
Nav: top bar with hamburger on mobile (user's explicit pick over bottom-tab).

**Data layer** (`js/data.js`): fetches recipes/tips (EN+LT) + tags + prices from
`site/data/*.json` (copied from repo root). `scaleAmount`/`formatAmount` handle
null/number/{min,max}-range ingredient amounts under the multiplier. `recipePrice()`
sums `amount_ml ?? amount × unit-price` from `prices.json` (new file — pack-size based:
price per pack + pack size in g/ml, not price-per-100g, per user's explicit choice).
`buildShoppingList()` aggregates ingredients across multiple picked recipes, combining
same-name ingredients via their ml value when available so tsp/tbsp entries from one
recipe correctly sum with gram entries from another; range amounts collapse to their
midpoint for shopping-list totals (a pack gets bought either way).

**Tag translation gap found and closed**: the EN→LT glossary from S1 only covered
words appearing in recipe/tip *body text* — it never covered the `category` (27) /
`flavor_theme` (42) / `ingredient` (60) / `technique` (34) slug vocabulary from
`tags.json`, so every filter chip and recipe-card tag rendered in English even in LT
mode. Built `site/data/tags_lt.json` (163 terms across all 4 axes) and **web-verified
every entry** against real Lithuanian baking/confectionery sources (same discipline as
S1's glossary) — this surfaced and fixed real errors the first pass got wrong:
"brownie" → "braunis" (not "browniai", unattested); blueberry ≠ bilberry in Lithuanian
(šilauogė vs mėlynė — the first draft called both "mėlynė", botanically wrong);
"crumble" → "trupiniuotis" (not "trupinių pyragas"); "panna cotta" spelling fixed (was
"pana kota"); "roll" vs "roulade" split into "mielinis suktinukas" (yeast-dough) vs
"biskvito roladas" (sponge-roll) since the source data uses them for genuinely
different products, not just as spelling variants. `tagLabel()`/`anyTagLabel()` in
data.js resolve category-scoped vs. free-form (recipe.tags mixes all 4 axes) lookups.

**Search rebuilt twice mid-session, both times from real bugs, not preference**:
1. Original implementation debounced `location.hash` changes per keystroke → every
   letter typed triggered a full `render()` that rebuilt the entire nav (including the
   search `<input>` itself) from `innerHTML`, destroying focus mid-word. Root fix:
   nav now renders ONCE (`navRendered` flag in `render()`), `wireNavEvents()` runs once
   at first render, subsequent navigations only call `updateNavState()` (aria-current,
   theme icon, lang buttons) — the search input DOM node is never recreated.
2. User asked for "Google-style dropdown with keyboard nav" specifically (confirmed via
   brainstorm skill before building) — added `searchAll()` (title/category/tags for
   recipes, title/text/tags for tips) + a live dropdown (`renderSearchDropdown`) under
   the nav search box, capped at 8 results, arrow-key/Enter/Escape navigation, "Show
   all N results" row. First dropdown build had 4 user-reported bugs, all fixed same
   session: (a) dropdown width tracked the input's own shrink-to-fit-icons width →
   fixed to `width: max(100%, 26rem)`, anchored `position: fixed` to viewport on
   mobile so it doesn't inherit the input's narrow width; (b) `<mark>` highlight used
   a 30%-alpha accent overlay → nearly invisible in dark mode, changed to solid
   `var(--color-accent)` fill; (c) result rows used `flex-direction: column` with
   wrapping title text → multi-line rows forced a scrollbar for what should fit
   unscrolled; changed to a 2-col grid with `text-overflow: ellipsis`, one line each;
   (d) "Show all" button still pointed at the pre-existing `#/recipes?q=` filter route
   instead of the new `#/search?q=` full-results page — traced to a stale second
   occurrence of the same `goToSearchResult(...)` call left over from an interrupted
   edit; both occurrences now correct.
3. **Stale-URL bug found by user**: clearing the search box didn't clear the `?q=`
   already in the URL, so reloading the page silently re-applied the old filter (typed
   "bra", cleared it, reloaded — recipe list still showed only 4 "bra*" matches).
   Fixed with `syncQueryParam()` — every `input` event now also `history.replaceState`s
   the URL's `q` param to match (or removes it when empty), without triggering
   `hashchange` (so it doesn't fight the dropdown's own re-render or steal focus).

New `#/search?q=` route + `renderSearchView()` shows the *full* result set (no 8-cap),
recipes and tips in separate labelled sections with counts — reached via Enter (no
row selected) or the dropdown's "Show all" link.

**Verification**: every feature checked with Playwright against a local server, not
just eyeballed — multiplier scaling, ml-primary unit display, cost calc against the
one seeded `prices.json` entry, favorites persistence across reload, shopping-list
cross-recipe aggregation math, dark/light theme, EN/LT toggle, mobile at 320/375/768px
(zero horizontal scroll), and the full search flow (type → dropdown → arrow+Enter →
recipe page; type → show-all → full results page; clear → reload → filter gone).
Two real CSS bugs caught only by Playwright, not visual review: `minmax(0, minmax(...))`
(invalid nested minmax silently collapsed `.recipe-grid`/`.tip-mini-list` to a single
44,895px-tall column) and the search-input `min-width` starving the hamburger button
off-screen at 375px.

**Code:** `site/index.html`, `site/css/tokens.css`, `site/css/app.css`, `site/js/data.js`,
`site/js/i18n.js`, `site/js/state.js`, `site/js/app.js` (new); `site/data/*.json`
(copied from repo root) + `site/data/prices.json` (new, one seeded entry) +
`site/data/tags_lt.json` (new, 163 web-verified terms); `.hallmark/log.json` (new,
records the bespoke-custom design pick for future Hallmark diversification).
**Entry point:** `cd site && python -m http.server <port>`, open `http://localhost:<port>/`.
No build step — static files served as-is. GitHub Pages deploy not yet configured.
**Not measured:** real ingredient prices (only "unsalted butter" seeded in
`prices.json` — cost estimates elsewhere show the "add prices" placeholder message);
GitHub Pages hosting; whether the shopping-list ml/g cross-unit aggregation reads
clearly to the user in a real multi-recipe session (only checked programmatically).

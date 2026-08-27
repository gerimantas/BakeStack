# Recipes data work — plan

Status: discussed, not started. Four tasks agreed in session S11 (2026-08-27),
none implemented yet.

## Scope (confirmed with user)

Work right now touches ONLY the two MASTER audit files:
`.audit/rebuild/MASTER_rebuilt_tips.md` and
`.audit/rebuild_recipes/MASTER_rebuilt_recipes.md`. Live `recipes.json`/
`tips.json`/`site/data/*` are NOT read or edited yet — same scope-discipline
rule the tips-audit skill already established. Task 1 below produces a NEW
JSON file derived from the recipes MASTER; it is not an edit to the live
`recipes.json`.

**Why unify the schema now, before either MASTER is exported:** user's explicit
reasoning — get both MASTER files' JSON shape agreed before either is actually
exported, so the recipes JSON and a future tips JSON don't end up needing a
reconciliation pass later. Tips has never been exported to JSON at all yet
(`MASTER_rebuilt_tips.md` is text-only); this plan treats that as a matching,
still-to-do export once tips' own fix pass is further along — not started this
session, schema-only discussion so far.

## Shared JSON schema — fields common to both tips and recipes

| Field | Tips | Recipes | Why |
|---|---|---|---|
| `id` | new | new | stable key, independent of array position — the exact bug class that made the live `tips.json`/`recipes.json` fragile to begin with |
| `title` | already has | already has | — |
| `tags` | already has | already has | both already draw from the shared `tags.json` vocabulary |
| `source_docx_lines` | new | new (already planned in task 1) | line range in the raw `_docx_source.txt`, for verifying any entry against source without re-deriving |
| `is_complete` | new (tips has its own 4 incomplete entries: 021, 118, 172, 183) | new (already planned — 32 incomplete entries) | same meaning, same field name, both datasets |
| `variant_of` / `variant_label` | tips' existing `series_index.json` (Part X of Y) concept maps onto this | new (San Sebastian ×3, Banana Tea Cake ×2) | one shared mechanism for "these entries are a related group," not two separate concepts per dataset |

**`id` format decided:** prefixed string, e.g. `recipe-004`, `tip-001` — not a
bare number. Reasoning: a bare number needs a second `type` field carried
alongside it everywhere it's used (a cross-reference, a URL, a search index)
to know which dataset it points into. A prefixed string is self-describing on
its own — one value, no paired field required, no ambiguity if recipes and
tips ever both reach entry "4".

Fields that differ by content type stay content-type-specific, not forced into
a shared shape: tips keep `text` (free-form body); recipes keep `description`,
`servings`, `ingredients[]`, `steps[]`, `image`, `category`.

## Tag vocabulary linkage (tags.json)

`tags.json` is already the shared vocabulary for both datasets — its own
`_comment` field says so: 4 axes, `category` (recipes-only, single-valued),
`flavor_theme`, `ingredient`, `technique` (shared, multi-valued via each
entry's `tags[]`). This already works today in live `recipes.json`/`tips.json`
— e.g. recipe #2 Ferrero Rocher already carries `tags: ["baking-soda",
"butter", "chocolate", ...]`, all slugs drawn from `tags.json`'s `ingredient`
list.

**Gap found:** no automatic link exists between a recipe's free-text
ingredient name (`ingredients[].name`, e.g. "heavy whipping cream 33-36%")
and the matching `tags.json` `ingredient` slug (`heavy-whipping-cream`) — the
`tags[]` array is assigned by hand/by a prior script, not derived from
`ingredients[]`. This is the same gap as task 2's "normalized ingredient key"
candidate field.

**Decided for the export (task 1):** when MASTER content is converted to
JSON, each entry's `tags[]` must be assigned FROM the existing `tags.json`
vocabulary only — no new ad-hoc slugs invented during export. This keeps the
new recipes JSON pre-aligned with the existing dictionary instead of needing
a separate reconciliation pass afterward.

### Vocabulary audit findings (2026-08-27, read-only agent pass over both MASTER files)

Full `tags.json` (28 category / 42 flavor_theme / 60 ingredient / 34 technique)
checked against all 79 recipes and all 207 tips. Every finding below is cited
against source content, not guessed:

**Missing, confirmed real — add before export:**
- `category`: **mousse** (recipe #56 has a titled "Wild berry mousse"
  sub-component; tips.md Tip 051 defines mousse as a dessert/filling format).
  "souffle" and "tart" were checked and **rejected** — mentioned only in
  passing, no recipe is actually titled/structured as either.
- `ingredient`: **banana, apple, coconut, raisins** — all recur as raw
  ingredients across multiple recipes (cited: #17/#64 banana, #8/#46/#78 apple,
  #7/#29/#53/#78 coconut, #44/#52/#59/#73/#77 raisins). Currently `banana` and
  `coconut` exist only in `flavor_theme` (dessert-theme sense), with no
  ingredient-list slug — same gap shape as the existing `vanilla` split, just
  one-sided.
- `ingredient`: **crème fraîche** (tips.md 194/197/198/199 discuss it at
  length as a distinct dairy ingredient from sour cream). **Decided slug:
  `creme-fraiche`** (no diacritics, consistent with every other slug in the
  file).
- `technique`: nothing missing — the existing 34-entry list fully covers
  everything recurring in the 207 tips.

**Real duplication, needs a decision before export:**
- `sugar` vs `sugar-granulated` (`ingredient`) — confirmed interchangeable:
  the same base sweet-roll dough recipe (#7/#8/#9/#11/#12) uses both terms for
  the identical ingredient in the identical role.
- `creaming-butter` vs `creaming-method` (`technique`) — confirmed same
  technique under two names; tips.md Tip 021 itself uses both phrasings for
  one process.
- `caramelizing-sugar` vs `caramelization` (`technique`) — likely the same
  duplication, softer evidence (tips.md Tip 190/191 defines caramelization as
  exactly "sugar + heat," no separate non-sugar caramelization appears
  anywhere).
- **Not a duplication** (checked and cleared): `vanilla` in both
  `flavor_theme` and `ingredient` — genuinely different purposes (recipe
  *contains* vanilla vs. recipe *is themed around* vanilla), both needed.

**Decided (2026-08-27, brainstorm session):**
- `sugar` vs `sugar-granulated` → **keep `sugar`, drop `sugar-granulated`**.
  Reasoning: "granulated" isn't a distinguishing property the way `sugar-brown`
  and `sugar-powdered` are (those name genuinely different products) — plain
  sugar already implies granulated, so the qualifier adds no real information.
- `creaming-butter` vs `creaming-method` → **keep `creaming-method`, drop
  `creaming-butter`**. Reasoning: the source itself (tips.md Tip 021's own
  heading) uses "Creaming Method" as the formal technical term, with
  "creaming the butter" as conversational phrasing in the same text — the
  technical term is the better vocabulary entry.
- `caramelizing-sugar` vs `caramelization` → **keep both**, not a duplication
  after all — same shape as the `vanilla` split, just a closer call. Assign
  distinct purposes: `caramelization` for the science/explanation context
  (used in tips, explaining the chemistry), `caramelizing-sugar` for the
  hands-on kitchen step (used in recipe instructions). No merge needed.

Fix (removing `sugar-granulated` and `creaming-butter`, no change to the
caramelization pair) goes into `tags.json` itself when task 1's export
happens — not yet edited.

## 1. Export MASTER_rebuilt_recipes.md to JSON

`.audit/rebuild_recipes/MASTER_rebuilt_recipes.md` (79 entries after #26 dedup)
gets converted to a JSON file, manually (no parse script — same rule as the
docx rebuild itself), matching `recipes.json`'s existing per-recipe shape
(`title`/`category`/`description`/`servings`/`ingredients`/`steps`/`tags`/`image`,
`ingredients[]` as `amount`/`unit`/`name`/`section`) plus new audit-only fields:

- `source_docx_lines` — line range in `Receptai_docx_source.txt`
- `is_complete` — false for the 32 recipes with a reader-facing incomplete warning
- `is_technique` — true for the 5 non-dish entries
- `variant_of` / `variant_label` — for the San Sebastian (3 variants) and Banana
  Tea Cake (2 variants) groups

Purpose: makes the rebuilt ground truth directly comparable to live `recipes.json`
field-by-field, the way `MASTER_rebuilt_tips.md` never was until this session's
manual cross-check pass — this file exists so the recipes side starts as JSON,
not converted later under time pressure.

## 2. Additional fields for recipes/tips cross-referencing

Discussed 5 candidate fields when asked "what's missing to make recipes and tips
easy to search together":

**Correction (2026-08-27):** the "cross-reference field (recipe → related tip)"
candidate below was assumed to not exist yet — checked the live code and it
already does. `site/js/app.js` `findRelatedTips()` (line ~514) already matches
a recipe to tips by `tags[]` overlap plus a `categoryGroup`→`topic` map
(`CATEGORY_GROUP_TO_TOPICS`). So the real gap is narrower than first framed:
not "build a link," but "make sure both datasets' `tags[]` are drawn from the
same vocabulary consistently enough for that overlap-matching to actually find
things" — which is exactly what the vocabulary audit above is for.

- Calories / nutrition — no ingredient-level nutrition database exists yet; large
  separate effort, not started
- Price — regional/store-dependent, ages fast, flagged as risky to bake into
  static data
- Cross-reference field (recipe → related tip) — e.g. a recipe using "heavy
  whipping cream" could link to the "Stabilizing Whipped Cream" technique tip.
  No such link exists in any file today.
- Normalized ingredient key (slug) — `recipes.json` ingredient names are free text
  ("heavy whipping cream 33-36%"), `tags.json` uses slugs
  ("heavy-whipping-cream") — no shared key between the two today.
- Allergen / diet tags (gluten, nuts, dairy) — no field exists.

**Not yet decided** which of these to actually build. User's steer: prioritize
getting the data itself in order first (task 1, task 3) before deciding which
of these five to add.

**Decided (2026-08-27, brainstorm session): do NOT add empty/reserved
placeholder fields for any of these five now.** Considered reserving the
field names in the schema (e.g. `calories: null`) so the shape wouldn't need
to change later — rejected. Reasoning: `null` can't distinguish "not
calculated yet" from "doesn't apply," and none of the five candidates has a
confirmed plan to actually be filled — reserving space for an undecided
feature across 79 recipes + 207 tips is speculation, not data work. Add a
field only when it's actually being built and populated, not before.

## 3. Move ingredient density table from JS to JSON

Current state: `site/js/density.js` holds `INGREDIENT_DENSITY` (a ~30-entry
g-per-ml lookup table) plus `densityFor()`, a matching function used to convert
tsp/tbsp/cup amounts to grams for the shopping list. Used by `site/js/data.js`
and referenced in `site/index.html` (exact call sites not yet traced this
session — next step when this task starts).

**Decision so far:** move the *data* (the `INGREDIENT_DENSITY` object) out of JS
into a new `site/data/density.json` file. The *lookup/matching logic*
(`densityFor()`, the substring-fallback matching) stays in JS — it's runtime
behavior, not data. `data.js` fetches `density.json` instead of importing the
JS constant.

**Explicitly rejected alternative:** writing a computed gram-equivalent onto
every ingredient of every recipe in `recipes.json` directly — rejected because
it would require recalculating all ~75 recipes' ingredient units in one pass
and creates a duplication risk (the static gram value could drift from the
source `amount`/`unit` if a recipe is edited later without recalculating it).

**Done (S13, 2026-08-27):** call sites traced — `INGREDIENT_DENSITY` was only
read inside `density.js`'s own `densityFor()`, which is only called from
`data.js`'s `buildShoppingList()`; `index.html` loads `density.js` as a plain
`<script>` tag (no ES module), before `data.js`. Moved the 33-entry table to
`site/data/density.json`. `density.js` now keeps only `densityFor()`, reading
from `window.INGREDIENT_DENSITY` instead of a local const. `data.js`'s
`loadAll()` fetches `density.json`, strips its `_comment` key, and assigns it
to both `store.density` and `window.INGREDIENT_DENSITY`. Verified in a live
browser via Playwright: 33 entries loaded, no `_comment` leak, exact-match
and substring-fallback matching both still work (`sugar` → 0.85, "vanilla
paste or extract" → 1.1), unknown ingredient → null.

## 4. Archive the old, error-filled recipes/tips JSON once replaced

Once the `tips.json`/`tips_lt.json` fix pass (Next Task #1, ground truth:
`.audit/rebuild/MASTER_rebuilt_tips.md`) and the `recipes.json`/`recipes_lt.json`
fix pass (this session's `MASTER_rebuilt_recipes.md`, once task 1 above ships
it as JSON) are both complete and the corrected data is live in
`site/data/`, the OLD versions of these files — the ones with the known
structural defects (wrong-merges, wrong-splits, the 46/32 genuinely-missing
entries) — get moved out of the live path into an archive location, so a
future edit can't accidentally read or build on the broken version.

**Files in scope** (both root and `site/data/` copies are identical today,
confirmed by diff): `recipes.json`, `recipes_lt.json`, `tips.json`,
`tips_lt.json`. Root and `site/data/` currently hold identical copies of each —
whether both copies get archived or root is dropped entirely as a stray
duplicate is a decision for when this task starts, not now.

**Not in scope for archiving:** `tags.json`, `tags_lt.json`, `glossary.json`,
`prices.json` — these weren't flagged as containing the structural errors this
session's audits found; no reason yet to touch them.

**Blocked on:** tasks 1 and the tips.json fix pass (Next Tasks #1 in
`CONTEXT.md`) both landing first — there's nothing to archive until the
corrected replacements actually exist and are live.

## 5. Create tags_en.json (English label dictionary — new gap found)

Checked `site/js/data.js`: `tagLabel()`/`anyTagLabel()` (lines 46–64) already
translate a slug to a display label for Lithuanian via `tags_lt.json`, but for
English there is no equivalent dictionary — the function's fallback is
`return slug`, so an English-language visitor sees the raw slug
("creme-fraiche") with no human-readable label, ever, for any of the 164
existing slugs, not just the new `creme-fraiche` one.

**Trigger:** user wanted "crème fraîche (soured cream)" shown to English
readers instead of a bare slug. Since no English label mechanism exists at
all, this can't be a one-slug fix — it's a new dictionary file.

**Decided:** create `site/data/tags_en.json`, structured the same way as the
existing `tags_lt.json` (checked but not yet read this session — confirm its
exact shape before building `tags_en.json`, same nested-by-axis structure is
assumed: `{ flavor_theme: { slug: label }, ingredient: {...}, technique: {...} }`).
Update `tagLabel()`/`anyTagLabel()` in `site/js/data.js` to check
`store.tagsEn` the same way they check `store.tagsLt`, instead of falling
straight to the raw slug for English.

**Decided (2026-08-27, brainstorm session):** build labels for **all 164
existing slugs at once**, not just the new ones from this session's audit.
Reasoning: `tags_lt.json` already has full coverage for all 4 axes across
every slug — building `tags_en.json` to the same completeness keeps the two
language dictionaries structurally matched from the start, instead of
leaving a partial file that needs revisiting to fill remaining gaps later.

**Done (S13, 2026-08-27):** `site/data/tags_en.json` created (all 168 current
slugs — 164 planned + 4 net new from the vocabulary-audit fixes applied this
session). `tags_lt.json` was found out of sync with `tags.json` (missing
`mousse`/`banana`/`apple`/`coconut`/`raisins`/`creme-fraiche`, still had stale
`sugar-granulated`/`creaming-butter`) — fixed to match before building the EN
file, per user decision. `tagLabel()`/`anyTagLabel()` in `site/js/data.js`
rewired to pick `store.tagsEn` or `store.tagsLt` by `lang`, replacing the old
LT-only branch. Verified in a live browser via Playwright: EN labels resolve
correctly (e.g. `creme-fraiche` → "crème fraîche (soured cream)"), LT still
resolves, unknown slugs still fall back to the raw slug.

## Open before starting any of these

- Which of the 5 candidate fields in task 2 to actually build (or none yet)
- Order to tackle tasks 1–3 and 5 in (task 4 waits on 1 and on the separate
  tips.json fix pass regardless of ordering)

Resolved this session: the tags.json duplicate collapse (task above — keep
`sugar`/`creaming-method`, drop `sugar-granulated`/`creaming-butter`, keep the
caramelization pair split) and the `tags_en.json` scope (task 5 — build all
164 slugs, not just new ones).

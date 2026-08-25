# BakeStack — Data Fix Plan

Source: full audit of all 73 recipes + sample of 312 tips against `Receptai.md`/`Patarimai.md`.
13 confirmed issues. Nothing fixed yet — this is the decision document.

**Translation rule:** LT files (`recipes_lt.json`, `tips_lt.json`) are translated by hand/AI
from the EN JSON, and re-translating everything costs a full session each time. So: fix ALL
of EN first, get it fully confirmed correct, THEN do one final LT pass — not before. Each
item below states whether LT needs a small patch (fast) or must wait for the full pass.

**Why this plan changed after a first draft:** a first pass at this plan was reviewed
critically and had real gaps — logged here so they don't get silently dropped again:
- QA Compare (the site's existing check tool) only compares recipe/tip **titles** between
  source and JSON — it never looked at ingredients, steps, or text content. That's exactly
  why none of these 13 issues were caught earlier. Fixing 13 issues by hand again with no
  better tool just repeats the same risk of missing a 14th. **So step 0 below is strengthening
  QA Compare to do a real content diff, before touching any data.**
- Item #2's "keep in recipes" decision conflicts with what the audit found: the source
  `Receptai.md` block for this recipe has NO ingredient list at all — the real content lives
  in `Patarimai.md`. Keeping it in recipes means it's now permanently hand-maintained content
  with no source `##` block backing it. That's fine, but the parser's exclusion list must be
  updated to reflect "this recipe is intentionally hand-kept, not derived from source" or a
  future re-run of the parser will delete it again, silently.
- Items #6/#7/#8 (stray glyphs) touch 16 + 59 + 6 records — too many for one-by-one manual
  edits. These need one written script, not repeated manual Edit calls.
- No commit strategy was specified — 13 fixes touching parser code, source .md files, and
  JSON data in one giant commit would be hard to bisect if something breaks. Grouped commits
  per category (see "Order of operations" below).
- No mid-way check was specified — item #1 alone touches 43 of 73 recipes; it needs its own
  verification before layering 12 more fixes on top of a possibly-still-wrong data file.

---

## High impact

### 1. Multi-part recipes show one flat ingredient list — no section headings
**Affects:** 43 of 73 recipes.
Recipes with parts like Dough / Filling / Curd / Icing / Frosting lose those part names during
parsing. "Sugar" appearing 4 times looks like a mistake — it's actually 4 separate amounts for
4 separate parts, just unlabeled. This is the bug first spotted on Blueberry-Lemon Rolls.
**Fix:** parser change already written (uncommitted) — adds a `section` field per ingredient.
Needs: regenerate `recipes.json` with it, update the recipe page to show group headings.
**LT:** small patch IF AND ONLY IF the LT ingredient list is index-aligned 1:1 with the EN list
for every one of the 43 affected recipes — copying `section` by array position is only safe if
that holds. Confirm this alignment first (a script check, not an assumption) before copying
section labels over; do not assume "small patch" without that check.

### 2. "Basic Savory Crumble" exists twice — once as a recipe, once as a tip
**Affects:** 1 recipe + 1 tip, identical content.
**Decision:** stays in recipes (confirmed). Remove the tip-side duplicate.
**Fix:** delete the tip entry from `tips.json`. Also mark this recipe explicitly in
`parse_recipes.py` as a hand-kept exception with NO matching source `##` block (its real
ingredient/step content came from `Patarimai.md`, not `Receptai.md`) — otherwise the next
person who re-runs the parser from scratch will see it has no source block and delete it
again, same mistake repeating.
**LT:** delete the matching tip entry from `tips_lt.json` ("Bazinis sūrus trupinių pagrindas").

### 3. A previous typo fix broke a correct word
**Affects:** 1 tip ("WHISK"), 2 spots.
Source correctly says "creamed". A past fix changed it to "creamd".
**Fix:** revert to "creamed" in `tips.json`.
**LT:** check the LT tip's matching word wasn't affected (translation is a different word, likely
unaffected, but confirm).

### 4. 5 typos marked "fixed at the source" were never actually fixed in Patarimai.md
**Affects:** 5 spots in the raw source file only (JSON side already correct).
Not urgent by itself, but means re-running the tip parser from scratch would silently
reintroduce these 5 typos.
**Fix:** patch `Patarimai.md` so source and site agree.
**LT:** no action — doesn't touch JSON content, source-file hygiene only.

---

## Medium impact

### 5. 4 more typos the earlier spellcheck pass missed
**Affects:** 1 recipe title, 1 ingredient name, 2 tip bodies.
- "UGAR: HOW IT WORKS..." → "SUGAR: HOW IT WORKS..."
- "dorless oil" → "odorless oil"
- "radually pour" → "gradually pour"
- "reparing materials" → "preparing materials"
**Fix:** correct all 4 in `recipes.json`/`tips.json` + their `.md` source lines.
**LT:** check if the LT translation already reads correctly (translator may have silently
"auto-corrected" it) — if wrong there too, fix; if already right, no action needed.

### 6. Stray bullet symbols (▪▫◾◽‼) baked into tip titles
**Affects:** 16 of 312 tips.
Example: `▫INSUFFICIENT FAT CONTENT...`, `▪DEFINITION`, `‼HERE'S THE FORMULA:`.
**Fix:** strip the leading symbol from all 16 titles in `tips.json`.
**LT:** strip the same symbol from the matching 16 LT titles (same list, just translated text) —
small mechanical patch, not a re-translation.

### 7. Same stray symbols inside tip body text
**Affects:** 59 of 312 tips (19%).
E.g. a flour-types list reads `20◽Barley flour 21◽Brown rice flour...` instead of a clean list.
Cosmetic — no content lost.
**Fix:** clean the symbol out of all 59 tip bodies.
**LT:** same cleanup needed in the 59 matching LT tip bodies — mechanical find/replace, not
translation work.

### 8. Stray bullet symbols leak into recipe instruction steps
**Affects:** 6 of 73 recipes.
Code gap: bullets get stripped from ingredient lines but not from steps.
**Fix:** fix `strip_step_number()` in the parser + clean the 6 affected recipes' steps.
**LT:** clean the same symbol from the matching 6 recipes' LT steps — mechanical, not translation.

### 9. Two tips are meaningless — just the word "or"
**Affects:** 2 of 312 tips.
Original author wrote combined titles like "...PUFF PASTRY or FUNCTIONS OF FATS...". The
conversion split this into two tips, leaving "or" as one tip's entire content.
**Fix:** delete these 2 tips, or merge each into its neighboring tip.
**LT:** delete/merge the matching 2 LT tips the same way.

---

## Low impact — narrow, easy

### 10. A bare "##" with no title leaks into one tip's body text
**Affects:** 1 tip ("Cake Coating. Common Problems — 2").
**Fix:** fix the tip parser to recognize a heading-less `##`/`###` line; clean this one tip.
**LT:** check if the matching LT tip has the same leaked `##` — if yes, remove it too.

### 11. Two ingredients are missing their unit ("g")
**Affects:** 2 ingredient lines, in 2 different recipes.
`"125 caster sugar"` and `"65 heavy cream 33–36%"` — every other occurrence has "g", these don't.
**Fix:** add the missing "g" in `Receptai.md` + `recipes.json`.
**LT:** add the same missing "g" to the 2 matching LT ingredient lines.

### 12. A section label got parsed as an instruction step
**Affects:** 1 recipe (Wild Berry Cake).
Step 1 currently reads `"- Buttercream for coating"` — a section label, not an instruction.
**Fix:** remove this line from `steps`.
**LT:** remove the matching stray step line from the LT recipe.

### 13. One min/max range showed backwards (low listed as high)
**Affects:** 1 ingredient ("rock salt").
Source wrote the range high-to-low; parser didn't reorder it, so min > max in the data.
**Fix:** already fixed in code (uncommitted) — just needs applying with everything else.
**LT:** no action — this is a number field, not translated text.

---

## Not yet checked (flagged for later, not blocking)

- Whether "ingredient (1)" / "(2)" staged-addition labels (e.g. butter added twice at different
  steps) need their own visual treatment — currently invisible in the ingredient list.
- One recipe (Wild Berry Cake) has zero method steps for 4 of its 5 parts — likely true of other
  recipes too, not yet counted how many.
- QA Compare tool only checks that recipe/tip **titles** match between source and JSON — it does
  not compare actual content, which is why none of the 13 issues above were caught by it. Worth
  strengthening later so this class of bug gets caught automatically next time.

---

## Found but NOT fixed — pre-existing, outside this session's scope

Found while chasing other bugs. Real, still broken, deliberately left alone because fixing them
means editing `tags_lt.json` itself (the translation dictionary), and that file's quality/scope
was never audited this session — changing it blind risks the same kind of regression this
session already made once (see the LT tag corruption entry in git history, commit 124ce36).

- **26 tips have at least one untranslated hyphenated tag** — `tags_lt.json` has no LT entry for
  slugs like `pectin-nh`, `egg-whites`, `cream-cheese`, `cocoa-butter`, `sour-cream`,
  `whipping-cream`, `cake-coating`, `food-coloring`, `glucose-syrup`, `maillard-reaction`,
  `nut-paste`, `flavor-pairing`, `sugar-powdered`, `greek-yogurt`, `cottage-cheese`,
  `baking-soda`. The LT page silently falls back to showing the raw English slug for these —
  confirmed this predates the current session (present as far back as commit `3687893`, which
  is before any work in this session touched tags). Affects both recipes and tips wherever these
  slugs are used, not just the 26 tips found — a full page-by-page tag audit hasn't been done.
- **`tags_lt.json`'s own entries are internally inconsistent with what's already used elsewhere**
  — discovered while trying to translate the 9 recipes' new tags: the dictionary's current
  `sour-cherry`/`tart-cherry` -> "vyšnia" (drops "rūgšti"/"sour"), `whipping-cream` alternates
  between "riebi grietinėlė" and "riebi plakama grietinėlė" depending which recipe you check, and
  `baking-soda` -> "soda" is used in the dictionary but "valgomoji soda" is the more common
  existing phrasing across the actual recipe data. None of these were fixed — the dictionary
  itself needs a deliberate pass against the phrasing already used in `recipes_lt.json`/
  `tips_lt.json`, not a quick edit made in passing while chasing an unrelated bug.
- **"COLD INFUSION" tip's body ends with a paragraph that belongs to a different tip.** Source
  (`Patarimai.md` lines 84-86) has "Part 3 / Continuing to explore the topic of flavor infusion,
  today we'll look at the hot method..." positioned between the `## COLD INFUSION` and
  `## THE HOT METHOD` headings — it reads as HOT METHOD's intro, but the block-splitting logic
  attaches it to the end of COLD INFUSION instead, since it appears before the next `##`. Result:
  the COLD INFUSION tip card ends with a stray "Part 3" and a sentence introducing a different
  topic. Same root cause likely affects other places in `Patarimai.md` where a transition
  paragraph sits between two `##` headings — not checked beyond this one instance. Not fixed:
  requires deciding whether to delete the stray paragraph or move it to the following tip, and a
  broader check for the same pattern elsewhere hasn't been done.

---

## Order of operations

**0. Strengthen QA Compare first, before fixing anything.**
Today it only checks that recipe/tip titles match between source and JSON — that's why all 13
issues above went unnoticed. Add a real content diff: ingredient/step text comparison, a check
for the stray-glyph characters, a check for section-heading loss. Do this before step 1 so
every fix below gets verified by the tool, not just by eye again.

**1. Fix EN in 3 grouped batches, each its own commit, each re-checked with QA Compare before
moving to the next:**
   - **Batch A — structural** (items #1, #2, #12, #13): parser changes, `section` field,
     recipe move/exclusion. Highest risk, touches the most data — verify with QA Compare
     before touching anything else.
   - **Batch B — text corrections** (items #3, #4, #5, #11): typo fixes in JSON + source .md
     files.
   - **Batch C — glyph cleanup** (items #6, #7, #8, #9, #10): one script that strips the stray
     bullet symbols (▪▫◾◽‼) from titles/bodies/steps across all affected records, plus the
     2 parser gaps (bare `##`, bullet-in-steps) and the 2 empty "or" tips. Batching these
     because 16+59+6 records is too many for one-by-one manual edits.

**2. Apply the small, confirmed-safe LT patches** (see per-item LT notes above) — symbol
cleanup and deletions are mechanical; the item #1 section-label copy only after its alignment
check passes.

**3. Re-check EN one more time with the strengthened QA Compare — confirm 0 findings.**

**4. Only if EN changed further after step 3, do a full LT re-pass — otherwise the LT patches
from step 2 are the last LT work needed.**

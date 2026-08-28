---
name: recipes-audit
description: Audit, export, and verify BakeStack's recipes.json data-quality pipeline — the manual conversion of .audit/rebuild_recipes/MASTER_rebuilt_recipes.md into .audit/rebuild_recipes/recipes_export.json, and the checking method for it. Use this whenever the user asks to export recipes to JSON, check/verify/compare a recipe against the source, mentions MASTER_rebuilt_recipes.md, recipes_export.json, Receptai_docx_source.txt, or asks "ar sutampa su originalu" / "patikrink receptą" / "tikrink json" style questions about recipes. Also load this before writing any script that touches recipe data — it documents why scripted checks were banned for this file.
---

# BakeStack recipes.json export & audit workflow

## The rule this skill exists to enforce

**No script for checking or converting recipe data. Ever. Read the file, read it with your
own eyes, compare by hand.** This is not a style preference — it is a direct response to two
confirmed failures in this exact task, both from scripted/pattern-based shortcuts, both missed
by the script and only caught by a human re-reading the source line by line:

1. **Range-averaging bug.** Source ingredient lines like `"700–800 g turkey thigh"` were
   converted to a single averaged number (`750`) with no indication a range existed. This
   silently changes the recipe's content, not just its structure. Found only when the user
   asked for a manual line-by-line comparison against the raw docx — a regex sweep for range
   patterns was run *after* the fact to confirm scope, not to catch it in the first place.
2. **Header-format ingredient silently dropped.** Source line `"For 2.0–3.0 L of water:"` is
   an ingredient (the soup's water) but is written as a header/lead-in, not a plain
   `amount unit name` list line. A section-by-section ingredient count, done by counting list
   lines only, missed it — it took the user directly asking "isn't THIS also important?" to
   catch it. **A count-based check that assumes ingredients only ever appear as plain list
   lines will systematically miss this class of entry.**

Both bugs are the same shape: a mechanical pass (regex, count-and-compare, substring match)
looks thorough but silently encodes an assumption about what the source "should" look like.
The source doesn't follow one consistent format across 79 recipes — some list ingredients as
`amount unit name`, some as a header-prefixed range, some with emoji bullets, some with a
parenthetical serving count folded into a section title. **Only reading the actual text catches
which format a given line is.**

## What "read it with your own eyes" means in practice

- Use `Read` or `sed -n 'START,ENDp'` to pull the exact source line range for one recipe from
  `Receptai_docx_source.txt` — never a grep/regex sweep across the whole file as the primary
  check. A targeted grep to *locate* a title's line number (once, to build the range table) is
  fine; a regex used to *validate content* is not.
- Read the pulled text top to bottom, as a person would, including anything that isn't a
  clean `amount unit name` ingredient line: a lead-in sentence ("For 2–3 L of water:"), a
  parenthetical after a section header ("Shortcrust dough (large portion for ~3–4
  cheesecakes)"), a trailing unlabeled line after a section ("+ extra caramel for drizzling").
  Every one of these is either an ingredient, a `servings` value, or discardable — decide which
  by reading it, not by whether it matches a list-line pattern.
- Then read the JSON entry you produced, side by side, and confirm every distinct thing named
  in the source has a home in the JSON (as an ingredient, in `servings`, in `description`, or
  explicitly and deliberately dropped — e.g. social-media metadata between posts).
- A python one-liner to validate JSON syntax (`json.load(...)`) after editing is fine — that's
  a mechanical parser check, not a content-correctness check, and doesn't replace the read.

## Why a script keeps looking tempting, and why it still isn't the move here

79 recipes, ~30 ingredients each, is exactly the scale where a script feels like it should pay
for itself. It doesn't here, because the actual risk isn't "did I mistype a number" — it's "did
I correctly *interpret* which piece of source text is an ingredient, a range, a section header,
or noise," and that's a reading-comprehension judgment call the source text itself doesn't
mark consistently. A script can only check for the failure modes you already anticipated when
you wrote it; both bugs above are exactly the shape of failure a script's author wouldn't think
to check for, because the script's whole premise (count list-lines, average ranges) IS the bug.

If a mechanical pass is genuinely useful (e.g. confirming a line-count total, or locating a
title's line number to build the source-range table), treat its output the same way
`tips-audit`'s method treats a flagged script result: **a candidate to manually verify, never a
verdict to trust.**

## File map

| File | Role | Editable? |
|---|---|---|
| `.audit/rebuild_recipes/Receptai_docx_source.txt` | Raw docx-extracted text, 3633 lines. Ground truth. | **Never edit.** Read-only. |
| `.audit/rebuild_recipes/MASTER_rebuilt_recipes.md` | 79-recipe (numbered 1–80, #26 dropped as duplicate) intermediate ground truth, merged from 5 batch rebuilds, with MERGE NOTES documenting every seam/duplicate/incomplete-entry decision. | Yes, if a new defect is found — cite the exact source line first. |
| `.audit/rebuild_recipes/recipes_export.json` | The JSON export being built from MASTER, one batch at a time. Target shape: matches live `recipes.json`'s fields (`title`/`category`/`description`/`servings`/`ingredients`/`steps`/`tags`/`image`) plus audit fields (`id`, `source_docx_lines`, `is_complete`, `is_technique`, `variant_of`/`variant_label`). | Yes — this is the file being built. |
| `.audit/PLAN_recipes_json_work.md` | The 5-task plan (tags.json vocab, this export, tags_en.json, density.json, archiving) agreed in S11's brainstorm session. | Read for scope/schema decisions; append if a new decision is made. |
| `tags.json` / `site/data/tags.json` | Shared tag vocabulary both files draw `tags[]` from. Keep both copies identical (diff after editing). | Yes, per the plan's vocabulary decisions. |

## Source text formats seen so far — not exhaustive, read for more

Confirmed variations across the 16 recipes checked in batch 1 (there will be more in later
batches — add to this list when found, don't assume it's complete):

- Plain list line: `"190 g unsalted butter"` — the common case.
- Header-prefixed range as the ingredient itself: `"For 2.0–3.0 L of water:"` — this IS an
  ingredient (water), not just a section lead-in.
- Section header with parenthetical serving info: `"Shortcrust dough (large portion for
  ~3–4 cheesecakes)"` — the parenthetical is metadata about the recipe, not a new ingredient.
- Section header with cupcake-count serving info: `"BATTER ~24 cupcakes"` — the count belongs
  in `servings`, the rest is a section name.
- Trailing unlabeled line after a section's normal list, no bullet/prefix: `"+ extra caramel
  for drizzling"` (after Icing's 3 normal lines in recipe #8).
- Ingredient amount given as a range: `"80–100 g caramel sauce"`. **Do not average.** Keep the
  full range in `name`, set `amount`/`unit` to `null` — this preserves the source's actual
  claim instead of inventing a precision the source doesn't have.
- Social-media metadata between recipes (account handle, song credit, "Liked by..." line) —
  confirmed noise, both batch agents independently discarded it (recipe #4→#5 seam). Discard,
  but only after confirming via MERGE NOTES or direct read that it isn't recipe content.

## `id` and cross-recipe fields — decided shape

- `id`: `"recipe-NNN"`, zero-padded to 3 digits, matching MASTER's original numbering (1–80,
  skipping #26). Not sequential-after-compaction — keeps a stable reference to MERGE NOTES.
- `variant_of` / `variant_label`: for the San Sebastian trio (#16, #62, #80) and Banana Tea
  Cake pair (#15, #70) — see MASTER's MERGE NOTES `### Totals` section for the full reasoning.
  Earlier-numbered variant points forward to the later one it's a variant of (e.g. #15's
  `variant_of` is `"recipe-070"`) — this means the batch that writes #15 will reference an id
  that doesn't exist in the file yet. That's fine, it's just a string; don't invent a
  workaround or placeholder for it.
- `source_docx_lines`: `"START-END"` string. Built once per recipe by locating its title's
  exact line in `Receptai_docx_source.txt` (grep the title, confirm by reading context — titles
  can repeat for reposts, pick the occurrence in that recipe's expected document-order
  position) and taking the next recipe's start line minus 1 as this one's end.

## Verifying against the live site (not the export pipeline)

If the check is "does the LIVE `site/data/recipes_lt.json` match source" (not the
export-building workflow above), the same no-script-shortcut rule applies one level higher:
**never call something a bug because a screenshot looks wrong. Read the actual JSON field
value first.** Confirmed failure (2026-08-28, S18): a screenshot of a rendered recipe card
appeared to be missing the "(1)"/"(2)" markers next to duplicated ingredient names (narrow
column, text truncated visually) — reported as a translation bug before checking the source
JSON, which had the markers correctly in place. The screenshot was never wrong evidence of
rendering; it was insufficient evidence of content. A rendered page can visually truncate,
wrap, or omit text no bug in the data. Always `Read`/`Grep` the exact JSON entry's field
values as the last step before asserting a discrepancy — a visual read is a lead, not a
verdict, exactly as the mechanical-check rule above already says.

## Known state as of the session that built this skill (2026-08-27, S12)

- Batch 1 (recipes #1–16) exported and fully manually verified against source, twice — once
  via 5-recipe spot check, once via a complete pass after the two bugs above were found. All
  16 now match source exactly, including the water and extra-caramel fixes.
- `tags.json` already updated per the plan: `sugar-granulated` and `creaming-butter` removed,
  `mousse`/`banana`/`apple`/`coconut`/`raisins`/`creme-fraiche` added. `site/data/tags.json`
  kept in sync (diff-confirmed identical).
- Remaining work: batches 2–5 (recipes #17–80, minus #26) not yet exported. Do them the same
  way — pull the source range, read it fully, write the JSON entry, then re-read both side by
  side before moving to the next recipe. Don't batch the writing far ahead of the checking.

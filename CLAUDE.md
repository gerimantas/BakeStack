# BakeStack

Static site (no build step, no framework, no npm). Vanilla JS + CSS in `site/`,
served straight from disk. Live at https://gerimantas.github.io/BakeStack/ —
`.github/workflows/deploy.yml` deploys on every push to `master` touching `site/**`.

## Commands

- `python site/serve.py` — local preview on http://localhost:8792 (sends `no-store`;
  stock `http.server` caches and makes stale files look like data bugs)
- `python scripts/docx_verify.py input.docx output.md` — character-level check that a
  Markdown extract lost nothing vs the `.docx`; see `scripts/README.md` for the pipeline

## Version bump — required on every `site/` change

Three places must move together, or browsers serve stale files:

1. `site/index.html` — every `?v=NN` (2 CSS + 4 JS links)
2. `site/sw.js` — `const BUILD = "vNN"` (PRECACHE derives its `?v=` from it)
3. Both must match, and the number only ever goes up.

## Data files — edit `site/data/` only

The site loads exactly four files, all under `site/data/`:

- `recipes.json` + `recipes_lt.json` — 79 recipes, EN and LT
- `tips.json` + `tips_lt.json` — 206 tips, EN and LT

An EN/LT pair must be edited together. `id` (`recipe-001`, `tip-001`) is the join key
across the pair and is the source of truth — never re-derive an id from a title.

Tip numbering skips 174 on purpose — it was a de-duplication pointer to Tip 167, not a
tip. 206 tips, not 207. Any new export must skip pointer entries, not just their numbers.

## Photos

`site/images/recipe-NNN.jpg`. Adding one means setting `image` in both
`site/data/recipes.json` and `site/data/recipes_lt.json`, then bumping the version.
26 of 79 done; the rest carry `image: null` and render a placeholder.

## Theme state has three values

`appState.theme` is `"dark"`, `"light"` or `null` (follow system). Code deciding what the
user is *looking at* must resolve `null` via
`matchMedia("(prefers-color-scheme: dark)")`, never compare the raw value.

## Audit data — no scripts

`.audit/rebuild/MASTER_rebuilt_tips.md` and `.audit/rebuild_recipes/MASTER_rebuilt_recipes.md`
are hand-verified ground truth. Scripted checks against them are banned: a normalization bug
class already broke two separate scripts. Load the `recipes-audit` or `tips-audit` skill
(`.claude/skills/`) before touching this data.

## Session state

`CONTEXT.md` is the running project record — Status, Next Tasks, Archive. Read it for
anything not covered here; keep it updated instead of this file.

# BakeStack — Context

## Status
active — static site in `site/`, live on GitHub Pages:
**https://gerimantas.github.io/BakeStack/** (public repo, deploy via
`.github/workflows/deploy.yml`, auto-updates on every push to master that
touches `site/**`). The site is used only by the family (user, S24).

**Local master is well ahead of the live site (S25).** Live serves v53
(91 recipes) — pushed by mistake in S24. Local is v59 with 133 recipes; the
user asked to keep v54–v59 local until they say "push".

**133 recipes: 86 Marusya Manko, 47 Cloudy Kitchen** (S25). 79 have photos
(`site/images/recipe-NNN.jpg`, 335 px, ~35 KB); 54 carry `image: null` and
render a placeholder (53 Marusya + recipe-121). 33 are `is_complete: false`
(all Marusya, including all 7 of her layer cakes). How new
recipes are sourced and imported — rules, Cloudy Kitchen's API, the Instagram
method via BrowserOS neo and where its last pass stopped:
`.planning/recipe-sources.md`. **Only complete recipes are imported.**

**The Source filter is derived, not stored** (S24): `recipeSource()` in
`site/js/data.js` maps `source_url` (anything on `cloudykitchen.com` →
Cloudy Kitchen, everything else → Marusya Manko). A new source is one entry in
`RECIPE_SOURCES`. Filter chips with a count of 0 are hidden unless active.

**A tag-vocabulary addition touches four files, not two** — `site/data/tags.json`,
the root `tags.json`, and the display-label files `tags_en.json` / `tags_lt.json`.
Miss the label files and `tagLabel()` silently renders the raw slug
(`chicken-liver`) instead of breaking.

**Known gap: `unit_conv` is never translated.** LT detail pages render
"0.5 tsp" and "2 tbsp" instead of "0,5 arb. š." and "2 v. š.". `name` and
`unit` are translated; `unit_conv` is emitted raw. Affects every recipe
carrying the field, not only the new five.

**A "Show/hide photos" toggle sits next to the Recipes heading** (S22). Off,
cards drop the media slot entirely and collapse to text, with the favourite
button moving onto the card itself. Persisted per browser as
`bakestack:show-photos`. **New visitors default to the dark theme** rather
than following the system setting.

**The theme state has three values and code must resolve, not compare.**
`appState.theme` is `"dark"`, `"light"` or `null` (follow system). Anything
deciding what the user is *looking at* must check
`matchMedia("(prefers-color-scheme: dark)")` when the value is `null` — S22
fixed both the toggle icon and the click cycle, which compared the raw value
and so needed two clicks to leave a system-dark page.

**Both languages are fully translated: all 133 recipes and 206 tips.** Only
samples have been read back as prose (S21: 11 recipes + 10 tips; S23: 5
recipes) — see those Archive entries for the defects found.

**Local preview: run `python serve.py` from inside `site/`** (S25). Started from
the repo root it serves the whole repo and the site sits at `/site/`. A browser
that visited earlier shows the old service worker's data until the update
prompt is accepted.

**Tips are 206, not 207.** MASTER numbers Tip 001–207, but Tip 174 is a
de-duplication pointer to Tip 167, not a tip; the export shipped it as a real
record and the live site carried the gelatin text twice. Removed from all four
data files. **Site tip numbering runs …172, 173, 175… and that gap is
intentional.** Any future export must skip pointer entries, not just their
numbers.

**Tip bodies no longer carry their Instagram origins** (S20): all 89
`#marusya_*` hashtags gone, cross-references rewritten to "ankstesnėse šios
serijos dalyse", and the leading "part N" markers dropped (the titles already
carry them). EN and LT now agree on those markers, which they did not before.

**Recipe/tip filter counts are correct** (S20): every chip row was counting
with its own filter applied, which drove non-selected chips to 0 while their
links had matches. Fixed in the Flavor row, the Type row and the
incomplete-recipes legend. `chocolate` is now an umbrella tag (5 → 27 recipes)
alongside dark/milk/white, matching how wild-berry and caramel already worked.
**Filters replace rather than combine**, so an umbrella cannot be narrowed —
accepted deliberately.

**Tips and recipes key off a stable `id` in their JSON** (`tip-001`…,
`recipe-001`…, identical across EN and LT). Data files are the source of truth
for ids; they must never be re-derived from titles.

**Incomplete recipes are marked on the site** (S19): each carries an
`incomplete_note`; the list shows a ⚠ badge and the legend filters to them.

**Browser-cache staleness is fixed at the root** (S19): `site/serve.py` sends
`no-store`, `fetchJSON` revalidates, and css/js carry a `?v=` query. **Bump the
`?v=` in `index.html` AND `BUILD` in `site/sw.js` together whenever anything
under `site/` changes** (both at v59). They are one version, split across two
files: `BUILD` names the cache, so changing it is what makes the browser install
a new worker and drop the old cache, while `?v=` is what makes the page request
the new assets. Bumping only one ships an update nobody receives — or a prompt
that changes nothing. A plain reload is enough locally; Firefox may need
Ctrl+Shift+R for a changed favicon.

**If a change ever fails to appear, check that `sw.js` PRECACHE and `BUILD`
still agree before blaming the browser** (PRECACHE derives from
`BUILD.slice(1)`; until S22 it was hardcoded and every bump shipped nothing).

**The site is an installable offline app** (S21). `site/sw.js` + `manifest.json`
+ three PNG icons: it installs from Chrome's "Install app", opens with no
connection, and uninstalls like any app. Caching differs per type — HTML network
first (the shell carries the `?v=`), data cache-first with background refresh,
css/js cache-first (already versioned). **`source.html`/`source_tips.html` are
deliberately never cached** (~1.4 MB for a page most readers never open), so
"View original source" needs a connection. **Updates are offered, never taken:**
`sw.js` does not `skipWaiting()` on install, so a new worker waits and the page
prompts; accepting posts `SKIP_WAITING` and reloads. Do not "simplify" that into
an automatic swap — it exists so a reader is not moved onto new code mid-recipe.
The About page documents the ~2 MB copy, the update prompt, uninstalling, and
that favourites/shopping list/language live only on the device.

**Only the language in use is loaded** (S21): `loadAll(lang)` fetches one
pair, the other is prefetched at idle. Detail in the S21 Archive entry.

**`site/source.html` and `site/source_tips.html` are NOT dead weight — do not
delete them.** Nothing in `js/`/`css/` mentions them, but the 79 docx-era
recipes and all 206 tips link into them via `source_url`
(`source.html#L…`), rendered as "View original source". Newer recipes link
to their Instagram post or Cloudy Kitchen page instead.

**A `<link rel=preload>` for the data files makes things worse, not better.**
`fetchJSON` sends `cache: "no-cache"`, which will not reuse a preloaded
response, so each file downloaded twice and first paint regressed 5694 ms →
8993 ms. Reverted; do not retry without changing the cache mode first.

**LT durations take the accusative** ("kepkite 20–25 minutes"), but
`po/per/kas` + genitive is correct and deliberately kept (S21).

(Earlier sessions: full detail in `## Archive` below.)


## Next tasks
1. **Push v54–v59 when the user says so.** Local commits with 42 Cloudy Kitchen
   recipes sit ahead of the live v53. After pushing, verify the live site
   serves v59 and 133 recipes.
2. **More recipes, if wanted: ~330 Cloudy Kitchen left (next: more layer cakes,
   bundt cakes); Instagram past `Dd1KkBYin6t`.** What is left per group, rules,
   API and method: `.planning/recipe-sources.md`.
3. **Photos for the remaining 53 recipes** (all Marusya, `image: null`). Drop
   `recipe-NNN.jpg` in `site/images/`, set `image` in both recipe files, bump
   the version in `site/index.html` and `site/sw.js`.
4. **Translate `unit_conv` on the LT side.** Detail pages render "0.5 tsp" and
   "2 tbsp" where LT wants "0,5 arb. š." and "2 v. š.". Found in S23, not
   attempted — decide whether to translate at render time in `js/` or store a
   translated field, then apply across every recipe carrying it.
5. **Finish the LT reader pass: ~68 docx-era recipes and ~196 tips unread**,
   plus a second read of the 25 recipes written in S24. Method and findings in
   the S21 and S23 Archive entries.
6. **Optional next perf step: defer `tips.json` off the boot path.** It is the
   single biggest file left (140 KB gzipped) and is fetched before first paint,
   but only the Tips list needs it in full. Not free: `searchAll` matches
   against tip body text and `findRelatedTips` runs on every recipe detail
   page, so deferring it degrades search and empties the related-tips block
   until a second fetch lands. Scope that behaviour change before starting.
7. Not yet scoped: whether/how to surface `series_index.json`'s cross-reference
   data as reader-visible "Part X of Y" navigation. Format/scope decision
   deferred by user (S9) — see `.audit/DECISIONS_review.md` section 10.
8. Known limitation: shopping-list "bought" checkboxes are keyed by ingredient
   name, so they reset (silently, no data loss) on an EN/LT switch mid-shop.
   Low priority unless reported as confusing.
9. Undecided: `site/data/glossary.json` (8.6 KB) is referenced by no code and
   fetched by nothing. Either a feature nobody built or a leftover — decide and
   act, rather than leaving it to be rediscovered a third time.

## Done Log
- **S25** — 24 Cloudy Kitchen recipes added (16 sweet buns and babkas, 8 layer
  cakes), 109 → 133, v57–v59 committed locally; `recipe-sources.md` records
  what is left per group.
- **S24** — 25 recipes added (23 Cloudy Kitchen, 2 new Instagram posts via
  BrowserOS neo), 84 → 109, all with photos; Source filter row added and
  zero-count chips hidden; recipe sources evaluated and recorded in
  `.planning/recipe-sources.md`; photo-publishing question closed (family-only
  site); v53 pushed by mistake, v54–v56 committed locally.
(S23 and earlier: see `## Archive`.)


## Archive

Older entries live in `CONTEXT-ARCHIVE.md` (moved there by session-end rotation, newest first). This section keeps the most recent 10 sessions.

### Session 2026-09-29 (S25) — 24 more Cloudy Kitchen recipes: sweet buns nearly exhausted, first layer cakes

- **Done:** recipe-111..134 added in EN and LT (8 buns + 2 babkas, 6 buns, 8 layer
  cakes), 109 → 133 recipes (47 Cloudy Kitchen); 23 photos, recipe-121 has none (post
  shows only unbaked rolls); v57, v58, v59 committed locally, not pushed.
- **Decided / overturned:** cakes go under `category: "cake"`, `categoryGroup:
  "cakes-loaf"`; a pre-bake ld+json photo is replaced from the post body, else `image:
  null`; skipped: sourdough rolls (no starter), Vanilla Cake (frosting elsewhere).
- **Code:** `site/data/recipes.json`, `site/data/recipes_lt.json`,
  `site/images/recipe-111..134.jpg` (not 121), `site/index.html`, `site/sw.js`,
  `.planning/recipe-sources.md` (what is left per group), plus the S24 follow-up
  commit `2d7b304` (`CLAUDE.md` push rule, `recipes-audit` skill, `.gitignore`).
- **Entry point:** `python serve.py` run from `site/` (from the repo root it serves the
  repo, and the site is at `/site/`); a stale count in the browser is the old service
  worker — accept the update prompt.
- **Not measured:** LT text of the 24 new recipes was written, not read back as a
  reader; Marusya's 7 layer cakes are all incomplete, so no duplicate check was needed.

### Session 2026-09-29 (S24) — two recipe sources opened up: 23 Cloudy Kitchen recipes and 2 new Instagram posts, plus a Source filter

- **Done:** 25 recipes added by hand, EN and LT, each with a 335 px photo (84 → 109;
  photos 31 → 56): 23 from Cloudy Kitchen (`recipe-086…090`, `093…110`) and 2 from
  @marusya.manko read through BrowserOS neo (`091`, `092`). Recipes list gained a
  **Source** row (Marusya Manko / Cloudy Kitchen); zero-count chips are now hidden
  unless active; the Flavor row shows the top 14 among the recipes the other filters leave.
- **Decided / overturned:** the site is family-only (user) — S23's open question about
  publishing author photos is closed. Incomplete recipes are skipped, not imported.
  Source is derived from `source_url`, not stored. **v53 was pushed by mistake**
  ("įkelkim" meant *add recipes*, not *deploy*); v54–v56 are local commits only.
- **Code:** `site/js/data.js` (`RECIPE_SOURCES`, `recipeSource`), `site/js/app.js`
  (Source row, zero-count hiding), `site/js/i18n.js` (`filterSource`),
  `site/data/recipes.json` + `recipes_lt.json`, `site/images/recipe-086…110.jpg`,
  `site/index.html` + `site/sw.js` (v49 → v56), `.planning/recipe-sources.md` (new:
  import rules, Cloudy Kitchen API, Instagram method, where the last pass stopped).
- **Entry point:** `cd site && python serve.py` → http://localhost:8792/#/recipes
- **Not measured:** the new LT prose was written, not re-read by a second pass; live
  site still at v53 until the three local commits are pushed.

### Session 2026-09-04 (S23) — five Instagram recipes merged after reading every line in both languages; the QA Compare tool deleted; a tag-label gap the handoff had missed

Two halves. The first (commit `bf51684`, earlier in the same session) removed
the QA Compare tool and the stale root-level data files, and added `CLAUDE.md`.
The second merged a prepared five-recipe package into the live data.

**The package arrived as `instagram_new/`, prepared but not merged.** Five
recipes from @marusya.manko with EN and LT JSON, 335 px photos, an extended
tag vocabulary, verbatim source texts, and two documents (`AGENT_HANDOFF.md`,
`MERGE_README.md`) recording every decision. Nothing in `site/` had been
touched. The handoff's own "what has been verified" list covered structure —
field sets, ingredient and step counts, EN/LT amount parity, id collisions —
and explicitly deferred four questions to a human.

**What the handoff verified held up.** 5 recipes, ids `recipe-081`…`085` with
no collision against the existing 79; field sets identical to the live files
(LT carrying `_needs_translation` and `_translation_source`); ingredient and
step counts equal across EN and LT; `tags_updated.json` additive only, nothing
removed; photos real JPEGs matching the `image` paths. All confirmed before
merging.

**What the handoff missed: `tags_en.json` and `tags_lt.json`.** It listed
`tags.json` (the vocabulary) and both its copies, but not the two display-label
files beside them. `tagLabel()` in `js/data.js:84` falls through to the raw
slug when a label is absent, so the site would not have broken — it would have
rendered `chicken-liver` and `pate` verbatim in both languages. Nine labels
added. **A vocabulary addition is a four-file change, not two:** `tags.json`,
the root copy, and both label files.

**`cherry` needed a distinct LT label.** The mostarda takes sweet white
cherries, so the slug is deliberately separate from the existing `sour-cherry`
/ `tart-cherry`. But `tart-cherry` is already labelled "vyšnia" in LT, so the
obvious label would have put two different slugs under one name. Chose
"saldžioji vyšnia".

**Sorting the label dictionaries alphabetically was a mistake, reverted.** The
first edit re-sorted each `kind` block, which turned a 9-line addition into a
~100-line diff of pure reordering. Redone append-only: +15 lines per file, and
what changed is readable at a glance. **Do not tidy an unrelated axis inside a
content change** — the diff is the review surface.

**The LT text had never been read.** `_needs_translation: false` and
`_translation_source: "fresh"` were set on all five, and the handoff's checks
were structural — counts and amounts, not prose. Read all 85 ingredients and
67 steps against the EN side. The translation is sound: terminology matches
the live files (kurdas, ganašas, kulis, bezė, paplotėliai for honey cake
layers), decimals are LT-style (82,5%), ranges left unaveraged. Three wording
defects found and fixed:

- "maltų kardamonų" to "malto kardamono" (singular, matching the turmeric line
  directly beside it)
- recipe-083 step 1: "Suberkite supjaustytas morkas" — `suberti` applies to dry
  goods, not chopped vegetables
- recipe-081 step 1: "Suberkite citrinų sultis" — the same verb was governing
  juice and leaves in one clause

**The first two fixes each created a second defect, caught by re-reading.**
Replacing the verb in 083 produced "sudėkite … Sudėkite" in consecutive
sentences; in 081 it left "Įpilkite … lapelius", pouring leaves. A single-word
substitution is not a safe edit in running prose.

**recipe-082 ships incomplete on purpose.** The source describes every
component but never the assembly. `is_complete: false` plus an
`incomplete_note` in both languages — the same treatment as the three other
honey cakes (042, 063, 071) and 29 more, now 33 of 84. Verified in the browser
that the warning renders with both the site's generic explanation and the
recipe-specific note.

**Missing base-ingredient tags on 082 turned out not to be a defect.** `tags`
omits `flour-all-purpose` and `sugar-powdered` while both are in the
ingredients. Checked against the live data before "fixing" it: 44 of the 53
recipes containing flour carry the tag, and 0 of the 4 containing powdered
sugar do. **The convention tags characteristic ingredients, not every
ingredient.** Separately, `egg-yolks` and `egg-whites` had 0 uses across 79
recipes but 12 and 11 across tips — valid slugs, first used on the recipe side
by this batch.

**The preview server serves its own working directory.** `site/serve.py` uses
`SimpleHTTPRequestHandler` with no directory argument, so running it from the
repo root served a directory listing and 404'd every asset. Two listeners also
bound port 8792 simultaneously — Windows permits this, and the older process
won every request, so restarting "correctly" changed nothing until both PIDs
were killed. **Run it as `cd site && python serve.py`.**

**Verified against the live site, not the local copy.** After the push and a
12-second Pages deploy: 84 recipes in both files, `?v=49` and `BUILD = "v49"`
in agreement, the new photos 200, and the LT labels serving the three new
category and flavour names.

**Found but not fixed: `unit_conv` is never translated.** The LT detail pages
render "0.5 tsp" and "2 tbsp" where they should read "0,5 arb. š." and
"2 v. š.". The ingredient `name` and `unit` fields are translated; `unit_conv`
is emitted raw. This predates this session and affects every recipe carrying
the field, not only the new five.

**`instagram_new/` deleted at the user's instruction after the merge**, along
with the Playwright scratch output. The originals (720–1284 px) are gone and
cannot be re-fetched — the environment has no Instagram network access. The
335 px copies in `site/images/` are what remains. The decisions those documents
recorded are preserved in the commit message and in this entry.

**Code:**
- `site/data/recipes.json`, `site/data/recipes_lt.json` — +5 recipes each (79 to 84)
- `site/data/tags.json`, `tags.json` — +9 vocabulary entries, both copies identical
- `site/data/tags_en.json`, `site/data/tags_lt.json` — +9 display labels each
- `site/images/recipe-081.jpg` … `recipe-085.jpg` — new, 28–55 KB (31 of 84 recipes now have photos)
- `site/index.html`, `site/sw.js` — v48 to v49

**Entry point:** `cd site && python serve.py` then http://localhost:8792/

**Not measured:**
- The LT prose of the other 79 recipes and 206 tips — still only S21's sample.
- `unit_conv` translation — found, scoped, not attempted.
- Whether publishing the author's own reel stills on a public site is
  acceptable — it applies to all 31 photos, not just these five, and was
  raised by the handoff without an answer.

### Session 2026-09-03 (S22) — the version bump was a no-op for six sessions, 26 photos went live, and dark became the default

**The service worker had been shipping stale assets since it was written.**
`sw.js` PRECACHE hardcoded `?v=30` on every css/js entry while `BUILD` was a
separate constant. Bumping `BUILD` renamed the cache (`bakestack-v31`,
`v32`, …) and `activate` dutifully deleted the old one — but `install` then
refilled the new cache with the *same v30 files*. Every version bump since
commit 83e6dde (the offline-app commit) was theatre. This is why several CSS
fixes this session "did not show up" in the browser and were re-attempted.
PRECACHE now derives from `BUILD.slice(1)`, so the two cannot drift again.

**A CSS rule was dimming the favourite heart to 35% and I blamed the cache
for it.** `.recipe-card__media svg { opacity: 0.35 }` was written for an old
placeholder icon. Earlier the same session I moved the favourite button
*inside* `.recipe-card__media`, so the rule started matching the heart. Three
colour "fixes" (accent → yellow → white → accent) failed before measuring
instead of guessing: `getComputedStyle` reported `svg_opacity = 0.35`, and a
PIL pixel read confirmed RGB (238, 201, 171) where the CSS asked for
(207, 99, 13). Rule deleted. **Lesson: read the computed style before
changing a colour value a second time.**

**The theme toggle needed two clicks and neither the icon nor the cycle knew
it.** `appState.theme` has three states — `"dark"`, `"light"`, `null`
(follow system). Both `themeIconSvg()` and the click handler tested the raw
value, so with `theme === null` on a dark system the page *looked* dark while
the code thought it was not: the icon showed a moon, and the first click only
wrote `null → "dark"` with no visible change. Both now resolve the actual
appearance via `matchMedia("(prefers-color-scheme: dark)")`. Separately,
`--color-accent-ink` was a dark colour in dark mode, so every accent-filled
button had dark-on-orange text; now white in all three theme blocks.

**Dead code, verified dead before deleting.** `densityFor()` was never
called, yet `density.json` was fetched on every boot into
`window.INGREDIENT_DENSITY`. Unit conversions are precomputed into the recipe
data as `amount_conv`/`unit_conv` at authoring time — `data.js:173` says so
explicitly. Deleted the function, the data file, the script tag and the
PRECACHE entry. Also removed `iconChef()`, the `topics` string table (EN+LT),
`recipesCount`/`tipsCount` (superseded by `totalResults`), and two orphan CSS
rules. **Kept `recipePrice()` and `prices.json`** — `app.js` explains cost
estimates are suppressed until the price table has real entries; that is an
unfinished feature, not litter.

**Photos are live.** 26 JPEGs (780 KB total, ~28 KB average) added under
`site/images/`, with `image` wired on 26 recipes across `recipes.json`,
`recipes_lt.json` and the root copy. Checked: no `image` path points at a
missing file. Considered WebP, not worth it at this size.

**Two visible additions.** Cards with no photo now render a placeholder at the
top of the card instead of letting the empty space drift to the middle. A
"Show/hide photos" toggle sits next to the Recipes heading — off, cards drop
the media slot entirely and collapse to text, with the favourite button
moving onto the card; persisted in `localStorage` as
`bakestack:show-photos`. New visitors now default to dark rather than
following the system.

**CI.** The four Pages actions targeted Node 20 (deprecated, already forced
onto Node 24). Bumped to `checkout@v7`, `configure-pages@v6`,
`upload-pages-artifact@v5`, `deploy-pages@v5` — all Node 24 native, no
breaking changes for this workflow. Deploy re-run: 16 s, clean, no warning.

**Code:** `site/sw.js` (precache version bug, density entry), `site/js/app.js`
(theme resolution, photo toggle, card media, `iconChef` gone),
`site/js/state.js` (`showPhotos` + `setShowPhotos`, dark default),
`site/js/data.js` (density fetch gone), `site/js/i18n.js` (photo-toggle
strings, dead tables gone), `site/css/app.css` (opacity rule, fav button size,
title row, orphan rules), `site/css/tokens.css` (`--color-accent-ink` white in
dark), `site/index.html` (v48, density script gone), `site/images/*.jpg` (26
new), `recipes.json` + `site/data/recipes*.json` (image fields),
`.github/workflows/deploy.yml`. Deleted: `site/js/density.js`,
`site/data/density.json`.
**Entry point:** `cd site && python -m http.server 8000` → http://localhost:8000
**Not measured:** whether removing the density fetch moved first paint (the
file was only ~1 KB, so any gain is noise). The photo toggle was not tested on
a real phone, only at 1440×900 in Chromium. `site/data/glossary.json` (8.6 KB)
is referenced by nothing and loaded by nothing — left in place, costs nothing,
but it is either a future feature or litter and nobody has decided which.

### Session 2026-08-30 (S21) — first paint halved by loading one language, three LT defects found by reading, and the site turned into an installable offline app

**Loading both languages was dead weight, and the thing that required it was
already gone.** Every visit fetched all four data files (1.5 MB) although one
language is ever shown. The blocker recorded in Next Tasks was
`remapStoredRecipeIdsForLangSwitch`, which compared both datasets to keep
favourites across a language switch. Checked it against the data rather than
trusting the note: ids are identical in EN and LT across all 79 recipes and 206
tips, so the function was a no-op and nothing reads the off-screen language.
`loadAll(lang)` now fetches one pair; the other is prefetched at idle after
first paint; the remap function is deleted rather than left unused.

**Measured, not estimated.** Chromium at ~1.6 Mbps / 150 ms RTT, first content
paint 9420 ms -> 5694 ms, data before paint 1522 KB -> 754 KB. On the live site
(GitHub Pages gzips) that is 204 KB transferred, down from ~390 KB.

**Two smaller costs on the same path.** `tokens.css` was pulled in by an
`@import` at the top of `app.css`, so the browser could not discover it until
app.css had been fetched and parsed — now a `<link>` ahead of app.css, landing
at 747 ms instead of 1422 ms. Space Grotesk was loaded from Google Fonts as a
"fallback while Fontshare loads" but no stack in tokens.css names it, and
`document.fonts` confirmed the browser never loaded it; dropped. Added
preconnects for both Fontshare hosts.

**A `<link rel=preload>` for the data files makes things WORSE — do not retry
it.** `fetchJSON` sends `cache: "no-cache"`, which will not reuse a preloaded
response, so each file downloaded twice and first paint regressed
5694 -> 8993 ms. Reverted the same session it was tried.

**`site/source.html` and `site/source_tips.html` look unused and are not.** I
proposed deleting them as 1.4 MB of dead weight in the deploy, having grepped
only `js/`, `css/` and `index.html`. All 79 recipes and all 206 tips carry a
`source_url` into them, rendered as "View original source" on both detail pages
— 285 links, verified live before anything was touched. They cost visitors
nothing: fetched only when that link is clicked. Recorded in Status so the next
reader does not repeat the mistake.

**LT reader pass — 11 recipes (one per categoryGroup) and 10 tips (5 of them
hand-rewritten in S20).** The prose is sound: fluent, terms right (kremjė,
ganašas, temperavimas), nothing invented or dropped. Three mechanical defects
surfaced and were fixed file-wide:

- 69 quoted phrases in 37 tips closed with a straight `"` instead of `“`. The
  EN files contain no `„` at all, so it entered in translation. The two
  digit-adjacent cases were checked by hand — quoted vote options („1", „2"),
  not inch marks.
- crème anglaise written "anglus/anglaus kremas" in tip-050 and tip-086, while
  tip-050 used the correct "angliškas kremas" four times in the same text.
- 66 durations in the genitive where Lithuanian wants the accusative.
  recipe-002 and recipe-017 translated the identical English sentence both
  ways. **The file had no usable internal precedent** — the split held after
  apie (14/22) and bent (2/12) — so this was fixed against the grammar rule,
  not the file's majority. 65 changed; recipe-042's "po 10–15 minučių" (a
  moment, not a span) is correct and preserved, with the same sentence's span
  changed.

**The site is now an installable offline app.** `sw.js` + `manifest.json` +
three PNG icons rendered from `icon.svg` via Chromium. Caching differs per type:
HTML network-first (the shell carries the `?v=`), data cache-first with
background refresh, css/js cache-first (already versioned by `?v=`). The two
source archives are deliberately never cached — ~1.4 MB for a page most readers
never open — so "View original source" needs a connection. **Updates are
offered, never taken:** `sw.js` does not `skipWaiting()` on install, so a new
worker waits and the page prompts; accepting posts SKIP_WAITING and reloads.
Verified end to end against a real install: prompt appears on a new build while
the page stays on the old one, and after accepting, v31 runs with the v30 cache
deleted.

**Transparent icon: built, reviewed, reverted at the user's request.** The plate
was removed and the middle tier darkened (it vanished on white), published as an
artifact for review, then reverted on request — dropped as the last unpushed
commit, so the icons are byte-identical to the version shipped with the PWA
work. The icon keeps its dark plate.

**A rotation complaint turned out not to be ours.** Landscape was reported
broken; nothing in css/js locks orientation and both 390x844 and 844x390 lay out
without overflow. It was the phone's system rotation lock. manifest
`orientation` is `"any"` so the reader's own lock decides.

**Code:** `site/sw.js` (new), `site/manifest.json` (new), `site/icon-192.png`,
`site/icon-512.png`, `site/icon-512-maskable.png` (new), `site/js/data.js`
(loadLang/prefetchLang/loadAll(lang)), `site/js/app.js` (async lang switch,
registerServiceWorker, About offline section), `site/js/state.js`
(remapStoredRecipeIdsForLangSwitch deleted), `site/js/i18n.js` (updateReady,
updateNow, aboutOffline* in EN+LT), `site/index.html` (manifest link,
tokens.css link, fonts trimmed, ?v=30), `site/css/app.css` (@import removed),
`site/data/recipes_lt.json` (durations), `site/data/tips_lt.json` (quotes,
anglaise).

**Entry point:** `cd site && python serve.py 8799` — but the service worker
needs https or localhost, and `serve.py` sends `no-store`, so PWA behaviour must
be tested against `http://localhost:8799/`, not a file:// path. Live:
https://gerimantas.github.io/BakeStack/

**Not measured:** the remaining 68 recipes and 196 tips were never read as
prose — the three fixes were applied file-wide by pattern. `tips.json`
(140 KB gzipped) is still fetched before first paint; deferring it is scoped in
Next Tasks and would degrade search and related-tips until a second fetch lands.
No iOS device was tested — Safari's PWA behaviour (no install prompt, different
storage eviction) is unverified.

### Session 2026-08-29 (S20) — every filter count was wrong in the same way; tip data cleaned of its Instagram origins; 50 commits finally shipped to the live site

**Filter counts — one bug shape in four places.** The user noticed the recipe
flavour row showing "citrina 0" next to "šokoladas 5" when lemon actually has
10 recipes. Each chip row was computing its counts using *its own* filter, so
selecting any chip drove every other chip in that row to 0 while its link
would still have shown matches. The comment above the code already stated the
correct rule ("not the chip's own filter") — the Flavor row violated it, and
so, unnoticed, did the Type row, which counted on `category` instead of `tag`
and therefore never responded to an active flavour filter at all. The
incomplete-recipes legend had the same defect, always reading the global 32.
Fixed all three, plus flavour chips now sort by count instead of an
alphabetical slice that surfaced one-recipe flavours while hiding vanilla (40).

**Flavour tags — 20 missing across 17 recipes.** Audited all 79 against their
own title and ingredient text. The largest gap: 7 recipes carried
`espresso-instant-coffee` in the *ingredient* namespace while the filter reads
`coffee-espresso` in the *flavour* namespace, so "coffee / espresso" matched
nothing though every tiramisu contains it. Also pumpkin (2, named in the
titles), salted-caramel (2), dark-chocolate (3), passionfruit (2), rum,
apricot, mandarin-orange, cointreau. All 42 flavour tags now match ≥1 recipe.

**`chocolate` made an umbrella tag: 5 → 27 recipes.** Recipes tagged only
dark/milk/white were invisible to it. This follows the pattern the data already
used elsewhere (recipe-056 carries wild-berry alongside raspberry/bilberry;
recipe-012 carries caramel alongside salted-caramel) — chocolate was the
inconsistent case. Note the filters *replace* rather than combine, so the
umbrella cannot be narrowed down; accepted deliberately at 27 recipes.

**tip-174 was never a tip — the export invented it.** Reading all 206 tips to
check the topic filters turned up two byte-identical gelatin entries. MASTER
already knew: its Tip 174 entry is a **de-duplication pointer** to Tip 167
stating "no new tip number is consumed". The export did not honour that and
emitted it as a record. Removed from all four data files; MASTER's header
("FINAL TOTAL TIP COUNT: 207") was itself counting the pointer and is corrected
to 206. **Site tip numbering now runs …172, 173, 175… and that gap is
intentional** — renumbering would shift 33 stable ids for nothing.

**Instagram residue removed from every tip body.** 89 `#marusya_*` hashtags in
three shapes, each handled differently and none by blanket substitution: 55
standalone lines dropped; 15 paragraphs whose entire content was a dead
cross-reference ("Pradžią rasite čia #marusya_about_ganache") dropped whole;
31 sitting inside live sentences rewritten by hand to point at "ankstesnėse
šios serijos dalyse". A trial automated removal was **rejected after seeing its
output** — it produced "from our earlier. Crème…", "previous posts — — we have
covered", and "about gelatin - pectin" with the conjunction lost. Also dropped
70 EN / 44 LT leading "part N" markers already present in the titles; the LT
translation had removed 25 of these already, so the two languages now agree.

**tip-113 was named after the wrong post.** Titled "Alt. Pastry Chef's Notes —
Varieties of Salt". "ALT. PASTRY CHEF'S NOTES" appears exactly once in the
source (line 3610) and heads a Ukraine charity acknowledgment preceding the
salt content, not the salt series. **I first told the user this was the
author's column name and should not be touched — that was wrong**, and checking
the source rather than restating the claim is what settled it. Retitled to
match its sibling tip-114.

**Topic filters audited by reading, not scripting.** All 22 subcategories across
7 groups check out as coherent; no series split across subcategories; no tag
without textual basis. One rename: "Tempering" held 2 egg-tempering tips and a
5-part crème anglaise series, so it is now "Tempering & Crème Anglaise". This
also required the first entry in the EN `topicLabels` dictionary, which was
empty because an English key is normally its own label.

**UI: jump-to-top/bottom buttons, and four browser-specific bugs behind them.**
(1) `element.ariaLabel` is unimplemented in older Firefox; assigning to it threw
*inside* the update function, before the buttons were ever shown — so they were
invisible in Firefox and fine in Chrome. (2) `html, body { overflow-x: clip }`
made the root the containing block for `position: fixed` in Firefox, laying the
buttons out against the document (x≈2400, scrolling with the page). Removing it
from `body` alone was not enough — the same rule on `html` does the same thing.
(3) A centred vertical position drifted on phones as the address bar collapsed;
now bottom-anchored, with hysteresis on the show/hide threshold because that
~100px viewport change flipped a single threshold repeatedly. (4) The buttons
flickered because `data-visible` was re-assigned on every call even when
unchanged, restarting the CSS transition; a scroll run plus four navigations
went from 10 writes to 2.

**Also:** the Favorites empty state was invisible — its icon, the only one in
any empty state, had no width and stretched to 1316px, pushing its own heading
to y=1248 on an 800px viewport. Mobile nav sheet made compact (fixed 2.75rem
rows instead of padding that grew with the reader's font: 28% of a 390×844
screen at default, 41% at 1.5×, versus over half before). Nav glow
strengthened. Site icon added (three-layer cake SVG, drawn for 16px first).
Dead code removed (`slugify`, `.nav__wordmark`, `.btn--ghost`) — `densityFor`,
`recipePrice` and `.price-summary` deliberately kept as the unfinished pricing
feature. `.docx` sources untracked and gitignored (they remain on disk and in
pushed history; a rewrite was considered and declined as not worth it).

**Shipped.** 50 commits pushed, deploy succeeded, live site verified: 206 tips,
zero hashtags, corrected tip-113 title, icon served. The site is no longer on
S7-era content.

**Code:** `site/js/app.js` (filter counts, jump nav, dropdown sizing),
`site/css/app.css` (jump nav, empty state, mobile sheet, nav glow, overflow),
`site/js/i18n.js`, `site/js/data.js`, `site/index.html`, `site/icon.svg` (new),
`site/data/{recipes,recipes_lt,tips,tips_lt}.json`,
`.audit/rebuild/{tips_export,tips_export_lt}.json`,
`.audit/rebuild/MASTER_rebuilt_tips.md`, `.audit/rebuild/series_index.json`,
`.claude/skills/tips-audit/SKILL.md`, `.gitignore`
**Entry point:** `python site/serve.py` → http://localhost:8792/ · live:
https://gerimantas.github.io/BakeStack/
**Not measured:** all four data files (1.5 MB) load on every visit though only
one language is ever shown — 735 KB wasted. Not a one-line fix: the language
switch compares both datasets to remap favourites. Firefox was never tested
directly (not installed for Playwright here); its two bugs were diagnosed from
user-supplied console output and confirmed by the user. The 31 rewritten
sentences and the umbrella-tag decision have not been read by a native speaker.

### Session 2026-08-29 (S19) — LT tips translation finished 207/207; the tips/recipes `id` field was never the primary key the data claimed; 32 incomplete recipes audited against source and surfaced to readers; browser-cache class of false bug eliminated

**LT tips translation finished: 207/207.** Continued S18's reuse+resplit method (never
re-translate from scratch) across three delegated runs — tip-101→134, →171, →207. Zero tips
needed fresh translation; every one was found in the old 310-entry LT corpus and re-split to
the new boundaries, including both 7-tip mega-merges (old indices 296, 298). Verified
independently of the agents' own reports: 207 entries in both `tips_export_lt.json` and
`site/data/tips_lt.json`, ids sequential, no entry still holding EN text, zero drift in
tags/topicGroup/topic. Two old-corpus errors corrected rather than propagated ("tanki ausią"
→ "tankiausia" tip-193; "yra tik vienas išeitis" → "viena išeitis" tip-173), and emoji markers
the old corpus had flattened to hyphens were restored from the EN structure.

**One agent stopped mid-tip.** The tip-121→ run wrote tip-134 to the export but never synced
it to the live file, leaving 134 vs 133. Caught by counting both files rather than trusting the
"consistent" claim in its report. Later briefs were amended to require both writes per tip
before moving on.

**The `id` field was decorative — found via a numbering bug, not by looking for it.** Adding
a visible card number exposed it: `data.js:47-48` overwrote every tip's and recipe's `id` at
load with `slugify(title, index)`. Consequences, all live until this session: tip ids differed
between EN and LT (which is why `remapStoredRecipeIdsForLangSwitch` had to exist at all), and
the number parsed out of a title-derived slug picked up digits from the title itself — "10
Critical Mistakes…" rendered as #10 rather than its real position, so the list appeared
randomly numbered. `site/data/tips.json`/`tips_lt.json` had never carried an `id` at all;
`recipes.json` did (`recipe-001`…`recipe-080`, #26 absent) and it was being discarded. Added
the field to both tips files (verified identical and index-aligned across languages), and
`data.js` now uses the JSON `id` as the key for both datasets. `slugify` is now unused but
left in place.

**A hardcoded `.slice(0, 100)` made 107 tips unreachable.** `renderTipsView` capped the list
at 100 while the heading read "207 tips". Removed; 207 render fine.

**32 incomplete recipes: the flag was real, the warning was never built.** `is_complete:
false` sat on 32 recipes and was read by nothing — `.audit/PLAN_recipes_json_work.md:137` had
specified a reader-facing warning that never shipped, so a reader could start one and discover
mid-bake that the method stops. Audited all 32 against `Receptai_docx_source.txt` by reading
each line range (no scripted classification, per the recipes-audit skill), plus two verified
by hand here. Result: **all 32 are STEPS_MISSING — ingredients complete in every case**, the
gap being steps that existed only in the original posts' photo carousels. The flag is correct
in all 32.

The audit also found the older MASTER notes **understate** the gap in six (043, 044, 054, 064,
065, 075). The sharpest signal is orphaned ingredients — listed but consumed by no surviving
step: poppy seeds and raisins in #44, three bananas in #75, and in #78 the white chocolate,
coconut and almonds that make a Raffaello a Raffaello. That signal comes from the source's own
internal consistency, so it catches gaps a section-header comparison cannot.

**Browser cache was producing false data bugs, repeatedly.** Several rounds were spent
diagnosing "the change is live in LT but not EN" and "the tips aren't translated" — each time
the file on disk and the bytes off the server were correct and the browser was serving its own
copy. Fixed at the root rather than by asking for hard reloads: `site/serve.py` (new preview
server sending `no-store`; stock `http.server` sends no cache headers at all), `fetch(url, {
cache: "no-cache" })` in `fetchJSON`, and a `?v=` query on css/js in `index.html`. **A plain
reload is now sufficient — do not ask the user for Ctrl+Shift+R again.**

**One false bug reported from a screenshot.** Read cards #45/#49 as wrongly flagged because
they sit beside red-tinted neighbours; the DOM showed neither the class, the badge, nor the
tint. Same failure the `recipes-audit` skill already documents — a rendered page is a lead,
never a verdict.

**Also shipped:** tips got source links matching the recipes (new `site/source_tips.html`,
`source_url` on all 207 in both languages); the tip Topic filter's group/subcategory names are
translated via a `topicLabels` dictionary while the filter key stays English; About was
rewritten (it claimed "73 recipes and 312 tips", called the working shopping list unbuilt, and
documented a QA tool the user does not want mentioned) and now avoids counts entirely so it
will not go stale; and a round of visual work — accent-coloured active nav/chips/multiplier, a
glowing nav underline, the incomplete warning de-boxed, page-heading counts removed, and the
incomplete legend turned into a working filter toggle.

**Code:**
- `site/data/tips.json`, `site/data/tips_lt.json` — `id` + `source_url` on all 207; LT fully translated
- `site/data/recipes.json`, `site/data/recipes_lt.json` — `incomplete_note` on the 32 (EN + LT)
- `.audit/rebuild/tips_export_lt.json` — 207/207
- `.audit/rebuild_recipes/INCOMPLETE_audit.md` (new) — per-recipe findings behind the notes
- `site/source_tips.html` (new), `site/serve.py` (new)
- `site/js/data.js` (id as primary key, no-cache fetch), `site/js/app.js`, `site/js/i18n.js`,
  `site/css/app.css`, `site/css/tokens.css`, `site/index.html`

**Entry point:** preview with `python site/serve.py 8792` from the repo root (or
`python serve.py 8792` from `site/`), then <http://localhost:8792/>. Bump the `?v=` in
`site/index.html` and `site/css/app.css` when changing css/js.

**Not measured:** no native-speaker read of any of the 207 LT tips (the same 3rd-QA-layer gap
the 79 LT recipes have). The 32 incomplete recipes' missing steps are named but not recovered —
they are not in the source text at all, so recovering them means going back to the original
posts' images. Whether `tags` should eventually be translated on LT tips (still EN-sourced by
deliberate scope choice). 28 commits remain unpushed — the live GitHub Pages site is still on
S7-era content.

### Session 2026-08-28 (S18) — LT tips translation started fresh (100/207 done), live-preview method established, two skills updated with this session's lessons

**Confirmed LT tips are stale, not just incomplete.** `site/data/tips.json` (EN, live) was
swapped to the verified 207-tip export on 2026-08-28 (same day, earlier commit). `tips_lt.json`
(LT) was last touched 2026-08-26 and still held the old 310-entry structure — index-misaligned
with the new EN file, not just missing translations. Confirmed by git log timestamp comparison,
not by trusting `## Status`.

**Translation method: reuse+resplit, not re-translate.** A read-only mapping script
(`.audit/rebuild/tips_export.json` vs `.audit/archive/tips_EN_pre_S15.json`, 10 sample points
per tip against the full old 310-entry corpus) showed all 207 new tips have at least partial
content already translated in the old 310-entry LT set — new tips are old ones merged,
resplit, or lightly edited, never wholesale new text. Confirmed the script's own known
false-negative/false-positive failure modes twice this session (missed an intermediate old
index for tip-023's first sub-point; wrongly matched a short common phrase for tip-087/088's
"chocolate type" section, which is genuinely new text found by full-corpus search, not
mapping-table trust). Every one of the 100 done so far was hand-verified against the actual
old LT text before writing, per `tips-audit` skill's core method — no exceptions taken on the
script's word.

**Old 310-entry LT file archived before it left the working tree.** It only existed live in
`site/data/tips_lt.json`, about to be overwritten — recovered via
`git show 124ce36:site/data/tips_lt.json` (the last commit touching it) and saved to
`.audit/archive/tips_LT_pre_S18.json`, matching the `..._pre_S15/S13/S16` archive pattern
already used for EN/recipe swaps.

**Live file structure: EN base + progressive LT overwrite, matching the recipes_lt.json
pattern.** `site/data/tips_lt.json` was rebuilt as a full 207-entry copy of live `tips.json`
(title/text/tags/topicGroup/topic), then each translated tip's `title`+`text` fields are
overwritten in place as it's finished — so the live site shows LT for done tips and EN
(readable, not broken) for the rest, exactly like the recipes translation looked mid-progress
in earlier sessions. `tags`/`topicGroup`/`topic` stay EN-sourced for all 207 (translating
those is out of scope for this pass).

**Local preview server used for the first time this session.** `python -m http.server` from
`site/` on a free port, Playwright screenshot to confirm the live page actually renders
correctly — caught two real bugs before they shipped: (1) a stale server process on port 8791
was silently serving `tools/qa-compare.html` as root instead of `index.html` — killed and
restarted on 8792; (2) SPA hash routing needs the real route segment (`#/recipe/<slug>`, not
`#/recipes/<id>` — singular, and by slug not the JSON `id` field) plus the correct localStorage
key (`bakestack:lang`, JSON-stringified value) — verified by reading `app.js`/`state.js`
directly rather than guessing, after a first guess loaded the wrong page.

**One false "bug" reported and retracted.** Read a screenshot's rendered ingredient list as
missing the "(1)"/"(2)" duplicate-ingredient markers seen in the source; the live JSON field
actually had them — narrow-column text rendering, not a data bug. Caught before any fix was
applied, but only after already telling the user "found a bug." `recipes-audit` skill amended
with an explicit rule: never assert a bug from a screenshot without confirming the underlying
field value first.

**Two skills updated with this session's confirmed lessons** (see Code below) —
`recipes-audit` (screenshot-vs-JSON verification rule) and `playwright` (no-venv-here
fallback to system Python, Windows terminal cp1252 crash on Lithuanian characters printed via
scraped-text `print()`, SPA hash-routing pitfalls).

**Code:**
- `site/data/tips_lt.json` — full 207-entry rebuild (EN base), 100 tips' title+text
  overwritten with verified LT translations (tip-001 through tip-100)
- `.audit/rebuild/tips_export_lt.json` (new) — the 100 done translations in the same schema
  as `tips_export.json`, built one tip at a time via hand-verified Edit calls, growing target
  for the remaining 107
- `.audit/archive/tips_LT_pre_S18.json` (new) — the old 310-entry LT file, recovered from git
  history before being overwritten
- `.claude/skills/recipes-audit/SKILL.md` — added "Verifying against the live site" section
- `C:\Users\retco\.ai-skills\playwright\SKILL.md` — added 3 pitfalls rows (global skill file,
  outside this repo, not in `git status` here)

**Entry point:** to continue the translation, read `.audit/rebuild/tips_export.json` for the
next untranslated tip (tip-101 onward), find its old-index mapping the same way (multi-sample
phrase search against `.audit/archive/tips_EN_pre_S15.json`, cross-checked by hand against
`.audit/archive/tips_LT_pre_S18.json`), write the LT text, append to
`.audit/rebuild/tips_export_lt.json`, then sync `site/data/tips_lt.json`'s matching index's
title+text fields. To preview: `python -m http.server <port>` from `site/`, force LT via
`localStorage.setItem('bakestack:lang', JSON.stringify('lt'))`, screenshot with Playwright.

**Not measured:** LT translation for tip-101 through tip-207 (107 remaining). Whether the
`tags` array should eventually be translated too (currently EN-sourced on every LT tip,
deliberately out of scope this pass — the site already resolves EN tag slugs through
`tags_lt.json` for display, same as the recipes side). No native-speaker spot-check has been
done on any of the 100 LT tips written this session (parallel to the recipes 3rd-QA-layer gap
already tracked below).

### Session 2026-08-28 (S17) — LT recipe translation finished (79/79), source-audit link added to every recipe, shopping list's data model fixed, two real EN/LT-switch bugs fixed in favorites and shopping-list state

**Finished the 5 recipes S16 left untranslated.** recipe-076 through recipe-080, translated
fresh from `.audit/rebuild_recipes/recipes_export.json` (title, description, every ingredient
name/section, every step) against `glossary.json`'s fixed terminology, following the same
method S16 used for the other 74 — never paired against old LT text. Verified structurally
(not just JSON-parsed): ingredient/step/tag counts and every amount/unit/servings value
checked to match the EN source exactly, so translation only touched text fields. Deleted the
root-level `recipes_lt.json` — confirmed via `site/js/data.js:5` that the site only ever reads
`site/data/recipes_lt.json`; the root copy was a stale duplicate nothing kept in sync, not a
second source of truth.

**Source-audit link, requested for visual EN/LT verification.** User wanted to open the
original recipe text next to the translation to check both the EN export and the LT
translation by eye. `source_docx_lines` (e.g. `"3425-3471"`) already existed per recipe but
pointed at line numbers in an internal-only file (`.audit/rebuild_recipes/Receptai_docx_source.txt`)
with no public URL to land on. Generated `site/source.html` — the same text, one `<div id="L<n">`
per line, dark/light-theme-aware, `:target` highlighting — and added `source_url` (e.g.
`"source.html#L3425"`) to every recipe in both `recipes.json` and `recipes_lt.json`. Surfaced as
a "View original source" link in the recipe header meta row (moved there after user feedback —
first placement was at the page bottom, effectively invisible).

**Shopping list was silently broken — real data-model bug, not a display issue.**
`buildShoppingList` (data.js) read `ing.amount_ml` and ran it through a `densityFor()` lookup in
`density.js` to convert tsp/tbsp to grams for merging — but no recipe record has ever carried an
`amount_ml` field; the actual field is `amount_conv`/`unit_conv` (pre-computed grams, added
whenever the recipe export needed to show a spoon measure's gram equivalent). The lookup silently
no-opped on every ingredient: tsp/tbsp entries never converted, and unit-less ingredients (egg,
lemon zest — `amount` a number, `unit: null`) fell through to an empty-string unit rather than
"pcs". Fixed `buildShoppingList` to use `amount_conv`/`unit_conv` directly and default the
piece-unit label (passed in from `app.js` as `t(lang, "pieceUnit")`, so it localizes). Also found
and fixed a real naming inconsistency in the source data: recipe-010 has `"all purpose flour"`
(no hyphen) while every other recipe has `"all-purpose flour"` — the grouping key now collapses
hyphen/space variation before matching, so these sum into one shopping-list line instead of two.
User pointed out mid-fix that summing ALL 79 recipes (a debug scenario, not real usage) produces
an absurd 7510 g line — confirmed this was a test artifact, not a bug: a real shopping list only
sums the recipes a user has actually picked.

**Shopping list UI, requested for usability on a long list**: numbered rows (CSS counter, not a
DOM-order dependency), a summary strip above the list (item count / total weight / total pieces,
each computed by filtering the aggregated list by unit), and a per-item bought-checkbox
(`localStorage`-persisted, keyed by the same `nameKey::unit` string the aggregation map already
uses as its dedup key — reused rather than inventing a second id). The checkbox does NOT survive
an EN/LT switch, since the key is derived from the ingredient's name text, which changes between
languages — flagged in Next Tasks as a known, low-priority limitation rather than fixed, since
fixing it would need a language-independent ingredient identity that doesn't exist anywhere in
the data model yet.

**Two real bugs found from user reports, both confirmed by reading the actual code rather than
guessing from the symptom description:**

1. *Un-favoriting on the Favorites page left the card visible until reload.* The heart-button
   click handler (`wireEvents`, shared by every card everywhere) only ever toggled the button's
   own icon — correct on Recipes/Search/detail pages, where the card's reason for being on screen
   doesn't depend on favorite status, but wrong on the Favorites page itself, where it does. Fixed
   by checking `route.name === "favorites"` in the handler and calling `render()` instead of the
   icon-only update in that one case. While in there: tip cards in list views gained the same
   heart button recipe cards already had (previously the only way to favorite a tip was opening
   its detail page), and Favorites now shows a live `(N)` count next to "Recipes" and "Tips".

2. *Switching EN↔LT silently wiped favorites and the shopping-list picks.* Traced with a direct
   Playwright repro rather than trusting the user's screenshot alone — `getRecipeById(lt, id)`
   returned `undefined` for every EN-favorited recipe. Root cause: `data.js:41-44`'s existing
   comment already documents WHY recipe ids are re-slugified per language from each title (EN and
   LT files aren't guaranteed to hold the same recipes in the same order) — but that decision's
   consequence for anything storing an id in `localStorage` was never handled. S16 had already
   patched the URL-hash case (switching language on a recipe/tip *detail page*) by remapping via
   array position; this session extended the identical fix to `favorites` and `shoppingPicks`,
   both remapped by array position in a new `remapStoredRecipeIdsForLangSwitch()` (state.js),
   called right before `setLang()` runs on every language-toggle click.

**Debugging note for future sessions: most of this session's apparent bugs were browser cache,
not code.** Several rounds of "the fix isn't showing up" traced back to stray `python -m
http.server` processes left running from earlier in the session (`Stop-Process` targeting a
stale `$p.Id` variable after re-launching) — multiple servers listening, browser connected to an
old one. Confirmed by hashing the served file against the on-disk file and by dumping the actual
function source loaded in a fresh Playwright page (`buildShoppingList.toString()`) rather than
re-reading the edited file and assuming it matched what was running. `Get-Process python | Stop-Process
-Force` before each restart resolved it. **When a user reports "nothing changed" after a fix that
tests confirm works, verify what's actually being served before re-investigating the fix.**

**Code:** `site/data/recipes.json`, `site/data/recipes_lt.json` (translation + source_url field),
`site/source.html` (new), `site/js/data.js` (buildShoppingList rewrite), `site/js/app.js`
(shopping list rendering, favorites re-render, tip card heart, source link), `site/js/state.js`
(remapStoredRecipeIdsForLangSwitch, shoppingChecked state), `site/js/i18n.js` (pieceUnit,
totalWeight*, shoppingListItemCount, viewSource strings), `site/css/app.css` (shopping list
numbering/summary/checkbox styles, tip-card fav button). Root `recipes_lt.json` deleted.
**Entry point:** `python -m http.server 8899` from `site/`, then `http://127.0.0.1:8899`.
**Not measured:** native-speaker read-through of the 5 newly-translated recipes (task 1, Next
tasks) — only structural/JSON checks were run this session.

### Session 2026-08-28 (S16) — LT translation for the 79-recipe set: method decided via brainstorm, glossary.json corrected, 74/79 recipes translated into a preview file, one real EN/LT ID-mismatch bug found and fixed in the language toggle

**Method decided before any translation work, via a brainstorm session (not the recipes-audit
skill's usual flow).** User asked to pair each of the 79 new EN recipes against the old
73-recipe `recipes_lt.json` (index-aligned to `.audit/archive/recipes_EN_pre_S13.json`) by
eye — a naive title-string match only found 39/79 because S13 rewrote titles during cleanup.
Manually diffed a first batch of 10 "identical" candidates field-by-field (not just
`ingredients`, which a script had wrongly flagged as sufficient) — **found that 0 of 79
recipes are byte-identical between old and new EN**: S13's steps rewrite (merging Instagram
fragments, dropping "P.S." engagement lines, removing carousel references) touched nearly
every recipe's `steps` array, even when `ingredients` matched exactly. Decision, confirmed by
user: **abandon the "reuse old LT + patch diffs" plan — translate all 79 fresh from the new
EN export**, using the old LT file only as terminology/style reference where a paired recipe
existed. This reversed the plan two brainstorm turns earlier in the same session; the old
plan's reasoning is superseded, not preserved, in `## Decisions` below.

**`glossary.json` (LT baking-term dictionary) audited against `tags.json` and actual usage in
both recipes and tips, and corrected — a data-integrity check the translation depended on.**
Found and fixed: 4 missing terms real content needed (`crumble`, `apple`, `raisins`,
`creme-fraiche`), 2 stale terms removed (`sugar-granulated`, `creaming-butter`, no longer in
`tags.json`). `site/data/glossary.json` kept byte-identical to the root copy (verified with a
diff after each edit, not by inspection).

**74 of 79 recipes translated into `.audit/preview_recipes_lt_10.json`**, a new file — not
written directly to `recipes_lt.json` during the session, only synced there after each
validated batch (JSON-parse check + `_needs_translation` flag count) to keep the localhost
preview live for the user throughout. Old `recipes_lt.json` (the pre-session 73-recipe file)
preserved at `.audit/archive/recipes_LT_pre_S16_preview.json` before the first overwrite.
Each recipe was translated directly from the new EN `recipes_export.json` content — title,
description, every ingredient name/section, every step — not just the fields that differed
from a matched old-LT counterpart. `_translation_source` tagged `"fresh"` on every entry (no
`"old_lt_adjusted"` entries survived once the fresh-translation decision was made — the 10
recipes translated before that point were later left as `fresh` too, since by the time the
full diff was measured their content had already been rewritten from EN, not reused).

**One real bug found and fixed in `site/js/app.js`, independent of the translation content
itself: switching language while on a recipe or tip detail page showed "Nothing found."**
Root cause: `data.js`'s `loadAll()` derives each language's `id` from its own title
(`slugify(title, i)`, an S13 decision to stop pairing EN/LT by array position) — so the same
recipe has a different URL slug in EN vs LT once the LT title is actually translated (this
was invisible before S16 because untranslated LT titles equaled EN titles, giving identical
slugs by coincidence). Fixed by remapping the hash by array position inside the
`[data-lang]` click handler in `wireNavEvents()` — verified both directions (LT→EN, EN→LT)
with Playwright, no console errors, content confirmed correct after each switch.

**LT toggle re-enabled for this preview** (`state.js`'s force-`"en"` override replaced with
`readLS(LS_KEYS.lang, "en")`, comment updated to state this is temporary), and the nav lang
buttons restored in `app.js` (`site/css/app.css` already had `.lang-toggle` styles from
before S13 hid them — no new CSS needed). This is a **visible, live change to the running
site** while translation is incomplete: untranslated recipes show EN content in LT mode,
`_needs_translation: true` in the data flags which ones. Not yet reverted or pushed.

**Not done — 5 recipes remain untranslated in `.audit/preview_recipes_lt_10.json`**:
`recipe-076` (Blueberry, Lemon and Almond Teacakes — ingredients section was mid-edit when the
session's context ran out, steps not yet touched), `recipe-077`, `recipe-078`, `recipe-079`,
`recipe-080`. All still carry `_needs_translation: true` and original EN content, so the next
session can find them with the same query used throughout this session:
```
node -e "const d=require('./.audit/preview_recipes_lt_10.json'); console.log(d.filter(r=>r._needs_translation).map(r=>r.id))"
```

**Code:** `CONTEXT.md` (this entry + Decisions), `glossary.json` + `site/data/glossary.json`
(4 terms added, 2 removed), `recipes_lt.json` + `site/data/recipes_lt.json` (74/79 translated,
overwritten from the preview file after each batch), `site/js/app.js` (+25/-? — lang-switch
hash remap fix, nav lang-toggle HTML restored), `site/js/state.js` (+13/-? — force-English
override lifted). New untracked: `.audit/preview_recipes_lt_10.json` (working file, 79
entries, 74 done), `.audit/archive/recipes_LT_pre_S16_preview.json` (old 73-recipe LT file,
preserved before first overwrite).

**Entry point:** to resume translation, read `.audit/preview_recipes_lt_10.json`, find the
first entry with `_needs_translation: true`, translate `title`/`description`/every
`ingredients[].name`/every `steps[]` from the matching entry in
`.audit/rebuild_recipes/recipes_export.json`, set `_needs_translation: false` and
`_translation_source: "fresh"`, then re-validate (JSON parse + flag count) and copy to both
`recipes_lt.json` and `site/data/recipes_lt.json` before moving to the next recipe. Localhost
preview server (if still running) was started with `python -m http.server 8420` from `site/`.

**Not measured:** whether the 74 already-translated recipes read naturally to a native
Lithuanian speaker beyond the translator's own read-through — no separate spot-check pass was
done this session (CONTEXT.md's 3-layer QA plan for translations — structural diff, glossary,
user spot-check — has only the structural-diff-equivalent layer done so far, via the
`_needs_translation` flag and JSON validation).

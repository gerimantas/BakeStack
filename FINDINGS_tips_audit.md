# Tips Content Audit — Findings

Method: 6 independent agents re-read the original `Patarimai.docx` (extracted to
`.audit/Patarimai_docx_source.txt`) from scratch, blind to `tips.json`, and derived 207
distinct tips (`.audit/rebuild/MASTER_rebuilt_tips.md`). 4 agents then compared those 207
tips against the live `site/data/tips.json` (310 entries). This file consolidates every
discrepancy found. Nothing has been fixed yet — this is the decision document for the next
session.

**Scale:** of 207 rebuilt tips, roughly 155 have some kind of structural problem in
tips.json (wrong merge, wrong split, or missing as a discoverable entry). Only ~52 are
clean 1:1 matches. Of those with problems, most are *granularity* issues (content intact
but glued to the wrong neighbor, or chopped up too fine) — real content loss is rarer but
confirmed in several places (list below).

---

## 1. Real content loss (highest priority — text is missing or wrong, not just misfiled)

| Tip | Problem |
|---|---|
| Tip 001 (Flavor Infusion) | "cream" dropped from the 3-item "in ganaches" ingredient list — only 2 of 3 remain |
| Tip 027 (Mousse mistakes) | "Base" dropped from the 3-item mousse-components list — text still says "three key components" but only 2 are listed |
| Tip 037 (Honey cake doneness) | ALL "Properly baked / Underbaked / Overbaked" labels stripped from two sub-sections — reader can no longer tell which paragraph describes which outcome |
| Tip 060 (Fat content in frosting) | Truncated — final punchline sentence "FAT MOLECULES ARE CARRIERS OF TASTE TO OUR TASTE RECEPTORS" is missing entirely, confirmed absent anywhere in tips.json |
| Tip 093 (Chocolate brands) | "IRCA (Italy)" dropped from the 6-brand bullet list (only mentioned once in passing prose afterward) |
| Tip 129 (Infusion) | "cream" dropped from the "in ganaches" list (same list as Tip 001, recurring elsewhere) |
| Tip 130 (Infusion methods) | "Cold" dropped from the 4-method enumeration (Cold/Hot/Decoction/Vacuum) — though the Cold section itself survives elsewhere |
| Tip 153 (Egg disinfection) | Unwanted "Russian @ma_rusya_manko" cross-promo line was NOT stripped (minor noise, not a big deal) |

## 2. 🚩 Off-topic content leaked into live site data — needs a decision

**Tip 155 ("About Food Colorings, Part 1")** — `tips.json` index 256, title "ABOUT FOOD
COLORINGS". The live text opens with a real-world passage referencing the Bucha massacre
(Ukraine war, 2022) and a charity-sale fundraising note, entirely unrelated to baking,
before transitioning into the actual pectin/colorings content via "Do you use food
colorings?". **This is confirmed present, verbatim, in the live site data right now.**
Needs a decision: strip this passage (keep only the baking content, starting at "Do you
use food colorings?"), or handle differently. A much milder, non-graphic Ukraine-fundraiser
mention also exists at Tip 113 (index 187) — that one reads as a normal brief
acknowledgment and probably doesn't need the same treatment, but flagging for the same
review.

## 3. Content of unknown origin — needs source verification, not a "bug" to fix blindly

**`tips.json` indices 305–309** (5 entries: "Stabilizing Whipped Cream", "How to Make
Perfect Chocolate Drips", "FLAVOR PAIRING. STRAWBERRY", "Flavor Description", "Aroma
Profile") have **no corresponding tip anywhere in the 207-tip rebuilt master** — i.e. they
don't exist in `Patarimai.docx` at all (confirmed at the raw XML level: none of these three
distinctive phrases exist in `word/document.xml`).

Checked against `Receptai.docx` next: **"FLAVOR PAIRING. STRAWBERRY" (with its Flavor
Description / Aroma Profile sub-sections) is confirmed to exist there**, verbatim, sitting
in the recipes source document, not the tips source document. "Stabilizing Whipped Cream"
and "Chocolate Drips" were NOT found in either `.docx` file, nor anywhere else in the
project except `Patarimai.md` and `tips.json` themselves.

**What this means:** at least the Strawberry pairing content was pulled from the wrong
source document during the original conversion (recipes source → tips.json), which is a
real bug, but not a text-corruption one — the content itself is accurate to its true source,
just filed as a "tip" when it actually belongs with/near a recipe. The other two entries'
origin is still unverified — they are not proven fabricated, but their source document
could not be located in this repo. **Before touching any of these 5 entries, verify against
`Receptai.docx` (already confirmed for Strawberry) and consider whether "Stabilizing
Whipped Cream" / "Chocolate Drips" belong there too or come from somewhere else entirely.**

## 4. Systemic structural bug: wrong merge/split at nearly every multi-part series boundary

This is the dominant pattern across all 207 tips, and it's the same defect family as the
already-confirmed "Cold Infusion" bug from a prior session: **the parser's split points are
off by one paragraph** at almost every place where one source post ends and the next
begins. Three concrete shapes this takes:

- **Wrong merge** — two or more unrelated tips fused into a single `tips.json` entry with
  no title/heading break, often because the transition sentence from tip N got attached to
  tip N+1's entry, or vice-versa. Worst cases (7 distinct tips crushed into ONE entry):
  - `tips.json` idx 296 ("WHAT YOU NEED TO KNOW ABOUT GANACHE") = master Tips 185–191
    (ganache series 185-189 **plus the entire unrelated Caramelization/Maillard series**
    190-191, confirmed by the tag list mixing ganache tags with `caramelization`/
    `maillard-reaction`)
  - `tips.json` idx 298 ("SOUR CREAM AND CREAM – LET'S HACK THE ISSUE!") = master Tips
    193–199 (the entire 7-part sour cream/crème fraîche educational series)
  - `tips.json` idx 38 (early "STORAGE" entry) = master Tips 024–028 (5 tips chained)
  - `tips.json` idx 292 ("CAKE COATING. COMMON PROBLEMS — 3") = master Tips 177+178+179
  - `tips.json` idx 295 ("LET'S FIND OUT MORE ABOUT CREAM CHEESES") = master Tips 181–184
    (includes a cliffhanger/payoff pair clearly published as 2 separate posts, fused anyway)
  - `tips.json` idx 300 ("HOW TO MAKE A PERFECT CHEESECAKE — 2") = master Tips 201+202+203
  - `tips.json` idx 221–223 (crème anglaise) = master Tips 133–137, and **Tips 135, 136, 137
    have NO title entry anywhere in tips.json** — fully undiscoverable as distinct tips
  - `tips.json` idx 245 ("Slow set pectin — 2") = master Tip 146 tail + Tips 147+148, with
    Tips 147/148 having no title entries at all
  - Several more 2-3 tip merges throughout (see full batch files for the complete list)

- **Wrong split** — one coherent master tip is broken into multiple JSON entries using an
  inline sub-header as a fake standalone title (e.g. "SHEET", "G1÷G2", "HERE'S THE
  FORMULA:", "Lifehack from Marusya" all became their own untitled-looking entries).
  Content itself is intact in these cases, just presented as several small disconnected
  tips instead of one. Examples: Tips 106, 168, 170, 180, and the entire multi-part "About
  Tastes" series (159-165, fragmented into ~17 tiny sub-header entries) and "About Food
  Colorings" series.

- **Missing as own entry** — content survives but only as an untitled tail buried inside a
  wrong neighboring entry, with no title of its own anywhere in the file. Affects at least:
  Tips 003, 005, 013, 018, 019, 025, 026, 027, 031, 044, 050, 053, 120, 132, 135, 136, 137,
  147, 148 — 19+ tips a title-based search or listing would never surface.

**Full per-tip detail for all of the above is in `.audit/compare/compare_batch1.md`
through `compare_batch4.md`** (992 lines total) — this summary compresses ~155 individual
findings into patterns; the batch files have the exact tips.json index, exact quote from
both sides, and category for every single one if line-by-line verification is needed
before fixing.

## 5. Non-chronological source document (context, not a bug)

The original `Patarimai.docx` is not in publish order — several posts explicitly reference
"the previous post" or "as promised" pointing at content that actually appears LATER in the
file (confirmed at ~10 distinct points: chocolate storage parts, hydrocolloids series,
flavor-pairing series, salt-functions/infusion interleaving, cake-coating problems series,
cheesecake hot/cold infusion). This doesn't affect correctness of any fix — the content
itself is fine — but explains why naively "fixing" boundaries by trusting in-file order can
still produce a version that reads oddly out of sequence relative to its own
cross-references. Full list of these in `MASTER_rebuilt_tips.md`'s own anomalies section.

---

## What this file does NOT do

No fixes have been applied. `tips.json` / `tips_lt.json` are untouched by this audit pass.
Next step is a separate planning/fix session using this document plus the 4 detailed
`compare_batch*.md` files as the source of truth.

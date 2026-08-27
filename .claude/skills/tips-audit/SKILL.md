---
name: tips-audit
description: Audit, verify, and fix BakeStack's tips.json data-quality pipeline — the multi-file workflow around .audit/rebuild/MASTER_rebuilt_tips.md (the verified ground truth) and its relationship to Patarimai_docx_source.txt (raw source) and site/data/tips.json (live site data, only 1 of 207 tips currently matches ground truth). Use this whenever the user asks to check, verify, compare, or fix tips against the source material, wants to continue the tips.json structural fix, mentions MASTER_rebuilt_tips.md, DECISIONS_review.md, or asks "ar sutampa su originalu" / "patikrink patarimą" / "taisom tips.json" style questions. Also load this before writing any read-only audit script for this project — it documents a normalization bug class that already bit two separate scripts this session.
---

# BakeStack tips.json audit & fix workflow

This project has a known data-quality problem in `site/data/tips.json` (310 entries) versus
the true source material (207 distinct tips in the original `.docx`). Session S9 (2026-08-27)
built and fully verified a ground-truth file to fix this from. This skill exists so a new
session doesn't have to re-derive the file map, the checking method, or the hard-won lessons
about what goes wrong when checking this kind of data.

## File map — what each file is and whether you may edit it

| File | Role | Editable? |
|---|---|---|
| `.audit/Patarimai_docx_source.txt` | Raw docx-extracted text. The actual, final ground truth — everything else is derived from or checked against this. | **NEVER edit.** Read-only, always. |
| `.audit/rebuild/MASTER_rebuilt_tips.md` | 207-tip intermediate ground-truth file, independently re-derived from the source by 6 subagents (S8), then fully audited and corrected (S9): 207/207 body text verified, 207/207 titles verified, 5 defects fixed, 4 tips flagged as permanently incomplete with a reader-visible warning. **This is what you copy from when fixing the live site.** | Yes, if you find a new defect — but only after citing the exact source line that proves it (see Method below). |
| `.audit/rebuild/series_index.json` | Structured index of 31 multi-part series (127 of 207 tips), built S9, for future "Part X of Y" navigation. Not yet wired into anything. | Yes, if extending series coverage — keep the same schema (see file itself for the shape). |
| `.audit/DECISIONS_review.md` | The full audit trail — every finding this session made, each cited with an exact source line number. Read this before re-auditing anything, so you don't redo work that's already done. | Append new sections; don't rewrite old ones (it's a decision log, not a draft). |
| `site/data/tips.json` / `site/data/tips_lt.json` | **The live site data.** This is the thing that ultimately needs fixing. As of S9, only 1 of 207 verified tips matches this exactly; 52 need re-merging/re-splitting; 154 need larger restructuring. | Only when the user has explicitly said the current task is fixing the live site — see Scope discipline below. |
| `FINDINGS_tips_audit.md` | S8's original summary (repo root). Superseded by `.audit/DECISIONS_review.md` as the primary reference, but still has useful per-tip evidence tables (`.audit/compare/compare_batch1-4.md`) that DECISIONS_review.md doesn't repeat. | Historical — don't edit, read for detail DECISIONS_review.md points to. |

## Scope discipline — the mistake this skill exists to prevent

During S9, the user had to stop the same slip multiple times: told to work on
`MASTER_rebuilt_tips.md` only, an in-progress line of reasoning would drift into opening
`site/data/tips.json` "just to check something real quick." Each time, the user caught it and
had to explicitly redirect back to scope.

The reason this matters isn't pedantry — `tips.json` is the live production file, and reading
it while mid-decision on the ground-truth file creates a real risk of anchoring a "fix" on
the current (broken) live structure instead of on the verified source. **Treat whichever file
the user names as the task's current scope as the only file you touch or inspect, until they
explicitly say the scope has changed.** If a question genuinely requires knowing something
about `tips.json` while working on `MASTER_rebuilt_tips.md`, say so and ask, rather than
opening it to check "just this once."

The same pattern showed up in a smaller form around proposing solutions: don't reach for
`AskUserQuestion` with options until you've actually gone and read what the source document
says. More than once, an options-based question got asked before the underlying fact was
checked, and the user's response was simply "kaip yra originale" (what does the original
actually say) — sending the work back a step. Check the source first; ask only once you have
a fact-grounded question to ask.

## The checking method

### Body-text verification

Normalize both sides (curly vs straight quotes, em/en-dash variants, the braille blank-line
placeholder `⠀` the source uses) and check exact substring containment. **Strip ALL
whitespace, don't just collapse it to single spaces.** This matters because the source
sometimes has zero space between a glyph and the following word ("✅Add the flavouring...")
while the rebuild consistently inserts one for readability ("✅ Add..."). A whitespace-collapse
normalization still treats these as different strings; a whitespace-strip normalization
correctly treats them as the same content. This exact bug cost a full false-negative rerun
during S9 before the difference was diagnosed.

### Title verification

Titles are almost never a verbatim copy of anything in the source — they're paraphrased,
abbreviated, or (for multi-part series) synthesized from a bare "PART N" heading plus the
series name found only in that series' first post. This means a script can locate *where* a
tip's content starts in the raw source and extract the raw text immediately preceding it, but
a human still has to read that extracted context and judge whether the title is faithful. Do
not try to make title-checking fully mechanical — it isn't, and every real defect found this
session was in a title, never in body text.

### The core lesson: don't trust a script's report at face value

Two separate scripts this session had real bugs that would have produced wrong conclusions if
trusted without manual cross-check:
- A concat-detector's title-echo-strip logic failed silently on case sensitivity.
- A title-lookup script, searching for a short marker string like "part 2" that repeats many
  times across a ~7000-line source file, twice anchored to the wrong occurrence and reported
  a false mismatch.

Both were only caught because every flagged row was manually read against the actual source,
not because the script self-reported an error. **A read-only checking script earns its keep
by locating candidates fast — it does not earn the right to be believed without a manual spot
check of what it flagged, especially anything it reports as a mismatch or anomaly.** When
writing a new audit script for this project, assume it has an undiscovered bug in exactly this
shape (matching the wrong occurrence of a repeated short string) and design the output to make
manual verification easy — print enough surrounding context that a human doesn't need to go
open the source file separately to sanity-check each row.

Keep scripts read-only and outside the tracked repo (a scratchpad, or at minimum something
`.gitignore`d) while doing an audit pass. Never have an audit script write directly to
`MASTER_rebuilt_tips.md` or `tips.json` — every fix in S9 was applied by hand, one Edit call
per confirmed defect, specifically so each change could be traced to the source line that
justified it.

## What counts as "a correct tip" — established by user decision, not assumed

A tip is correct if:
1. It has its own meaningful title — not a bare fragment like "Part 5" or "or" that means
   nothing without reading a different tip first.
2. It may have internal structure (paragraphs, "part N" markers within the body) — that's
   normal, not a defect.
3. Its meaning is self-contained: it doesn't cut off mid-sentence, and it doesn't open by
   continuing a thought that started in a different tip.

**A "next time I'll tell you more" style ending is fine, not a defect** — a social-media
author signing off one complete post with a teaser for a different, future post is normal
writing, and does NOT mean the current tip is incomplete. Only flag a tip as incomplete when
the tip's OWN subject — the thing it actually opened with — is left unresolved within itself.
Verify this by checking whether the very next tip in sequence actually answers what was left
hanging; if it does (even as a separate tip), the original isn't broken, it's just part of a
series. If it doesn't — if the thread genuinely dies with no resolution anywhere in the
corpus — that's a real defect.

## The core lesson, extended (S10): a per-tip script pass misses mega-merges

S9's `compare_master_vs_site.py` checked each MASTER tip against `tips.json` by exact match
and substring containment. S10 found this **systematically under-reports how much content
actually exists live** — when 5-7 originally separate posts get glued into one giant site
entry (the known `tips.json[296]` and `[298]` mega-merges are 17,000+ characters each), a
single MASTER tip's normalized body often fails the substring check even though the text is
sitting right there, because of small formatting drift (emoji vs. `-` bullets, curly vs.
straight quotes) accumulated across the whole merged block.

**Concretely, S10 measured this**: an initial per-tip pass flagged 95 of 207 MASTER tips as
"not located anywhere in tips.json." A direct phrase-search re-check (below) found 49 of
those 95 were actually present, just glued to neighbors. The true not-located count was 46,
not 95 — roughly half of the original "missing" list was a false negative from the matching
method, not missing content.

**The fix: direct phrase search, not exact/substring match, for anything the per-tip pass
flags as NO_MATCH.** Method: pick one distinctive ~60-70 character sentence from roughly the
middle of the MASTER tip's body (avoid the first line — it often echoes the title and isn't
unique), then search for that literal substring across every site entry's `text` + `title`
combined, no normalization. A hit is unambiguous proof the content exists somewhere in
`tips.json`, regardless of which entry it's glued into. Do this for every tip a script
reports NO_MATCH before treating it as content that needs to be recreated — it changes the
fix-pass scope substantially (fewer tips need genuinely new text copied in; more just need
re-splitting along existing, already-present content).

## `tips_lt.json` is index-aligned with `tips.json` — do not re-translate what already exists

**Verified S10**: `site/data/tips_lt.json[i]` is the Lithuanian translation of
`site/data/tips.json[i]` at the *same array index*, for every `i`. This means every site
index this project's audits map to a MASTER tip number on the EN side (a clean match, a
wrong-split fragment, a wrong-merge glue point) applies identically to the LT side at that
same index — the LT sentence is already sitting there, just as mis-boundaried as its EN
counterpart, not missing or wrong.

**Consequence for the fix pass**: for any MASTER tip whose EN content was located in
`tips.json` (whether cleanly, split, or merged), the corresponding LT text should be
**collected from `tips_lt.json` at the same index(es)**, never re-translated. Only the tips
whose EN content is genuinely absent from `tips.json` need a fresh LT translation decision —
and even then, check `tips_lt.json` separately first, since an EN gap and an LT gap are not
guaranteed to be the same set of tips.

This project has already redone the full LT translation at least twice (original pass, S6's
"LT translation redo") plus multiple `tags_lt.json` dictionary fixes (S7, S8) — a further
full re-translation during the tips.json fix pass would be a needless 5th pass over content
that in most cases hasn't actually changed, only moved.

## Scope drift still happens even with this skill loaded — watch for it actively

S10 caught itself drifting into `tips.json`-scope questions (proposing fix decisions,
opening AskUserQuestion about live-site edits) while the user's stated scope was still
audit/verification only, on this exact skill loaded. **Loading this skill is not itself a
guarantee against the drift it documents** — re-read the "Scope discipline" section above
mid-session if a line of reasoning starts proposing edits to `tips.json`/`tips_lt.json`
before the user has explicitly said the scope moved there.

## Compute counts with a script, never by hand, even for "just add these two numbers"

S10 made the same small arithmetic mistake twice in one session while reporting running
totals across audit batches (once reporting 61 instead of the correct 55; once writing "9
tips... actually 8" mid-sentence) — trivial by itself, but each error briefly wrote incorrect
figures into `DECISIONS_review.md`, the file this whole audit trail exists to make
trustworthy. **Any running total, count, or list-length claim going into the audit trail
must be computed by a script call** (`len(set(...))`, not mental addition), even when the
arithmetic looks simple enough to do in your head. The discipline this skill asks for on
content claims ("cite the exact source line") applies equally to the bookkeeping.

## Known state as of S9 (2026-08-27) — don't re-discover these

- **207/207 tip bodies and 207/207 tip titles in `MASTER_rebuilt_tips.md` have been checked**
  against `Patarimai_docx_source.txt`. Don't restart a from-scratch audit; read
  `.audit/DECISIONS_review.md` first to see what's already covered.
- **5 defects were found and fixed**: a false "9 not 10 items" anomaly note (deleted), and 4
  fabricated/dropped "Part N" numbers in titles (Tips 042, 066, 174, 180 — all corrected).
- **4 tips are permanently, intentionally incomplete**: Tips 021, 118, 172, 183. Each now
  carries a `[⚠ Note: ...]` warning at the top of its body text explaining why (cut off
  mid-sentence / promises unincluded content / unanswered question / cliffhanger resolved
  only in Tip 184). This is final — the source material itself is incomplete at these points,
  there's nothing left to fix, and the warning note is deliberately meant to ship to the live
  site as reader-facing text, not just an internal audit comment.
- **The live-site fix (`tips.json`/`tips_lt.json`) has not started, but all 207 MASTER tips
  have now been manually cross-checked against live `tips.json`, one by one (S10,
  `.audit/DECISIONS_review.md` sections 12-27)** — not just script-measured. Don't repeat
  this cross-check from scratch; read sections 12-27 for the per-tip findings before
  re-auditing. Summary: only 1 of 207 matches exactly (`tips.json[279]`); most of the rest
  fall into two classes — **clean or truncated wrong-splits** (content correct but
  fragmented, or fragmented AND missing the back half) and **wrong-merges with zero
  separators** (2 to 7 originally-distinct posts glued into one entry, including the two
  known 7-tip mega-merges at `tips.json[296]` and `[298]`, both confirmed S10 to contain
  their full content, just unseparated). **The true "genuinely missing, needs new text
  copied from MASTER" count is 46 of 207** (list: 7, 10, 20, 21, 22, 24, 26, 27, 39, 43, 48,
  55, 66, 68, 71, 74, 76, 79, 80, 82, 85, 89, 94, 96, 98, 101, 104, 105, 109, 124, 125, 126,
  127, 132, 134, 135, 136, 144, 148, 152, 153, 154, 171, 173, 177, 178) — section 27 has the
  method and caveat (a heuristic phrase-search lower bound; could be slightly lower still).
  The other ~161 need only re-splitting/re-merging of content that already exists live.
- Tip 155 ("About Food Colorings") has a confirmed, already-decided fix (strip an off-topic
  war/charity passage, keep only the baking content) applied to MASTER but **not yet** to live
  `tips.json`/`tips_lt.json`. **S10 found a second instance of the same class of defect**:
  Tip 113 also carries an off-topic Ukraine war/charity paragraph ahead of its real content
  (`tips.json[187]`) — no strip decision made yet for this one, needs the same kind of human
  call as Tip 155 before the fix pass touches it (section 20).

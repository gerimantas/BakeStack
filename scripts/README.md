# DOCX to Markdown scripts

Convert a Word `.docx` document to clean Markdown suitable for feeding to an
LLM, with emoji stripped and headings/lists reconstructed. Built for
Receptai.docx / Patarimai.docx; reusable for similar documents (Instagram
recipe/article exports with informal formatting) with some tuning per file.

## Pipeline

Run in this order:

```bash
python scripts/docx_extract.py input.docx > raw.txt
python scripts/docx_to_markdown.py raw.txt > draft.md
python scripts/strip_emoji.py draft.md > output.md
python scripts/docx_verify.py input.docx output.md
```

1. **docx_extract.py** — reads `input.docx` directly (no separate unpack
   step needed), outputs one line per Word paragraph with `**bold**` /
   `*italic*` markers preserved and a `[LIST]` prefix on real Word
   list paragraphs.
2. **docx_to_markdown.py** — turns that into Markdown: detects recipe/
   article titles (`##`), sub-section labels like Ingredients/Instructions/
   Frosting (`###`), and converts `[LIST]` lines to `- `.
3. **strip_emoji.py** — removes emoji. A leading emoji-as-bullet becomes a
   real `- ` list item; keycap digits (1⃣2⃣3⃣) become `1. 2. 3.`; a small
   set of emoji that stood in for an actual missing word (see
   `MEANINGFUL_PHRASE_FIXES` in the script) are replaced by that word;
   everything else is deleted.
4. **docx_verify.py** — compares the final Markdown's character content
   back against the source `.docx` (whitespace and emoji ignored on both
   sides) to confirm nothing was lost. Add `--word-diff` to see the actual
   phrases behind any nonzero difference instead of just character counts.

**find_emoji.py** is a standalone diagnostic, not part of the pipeline —
run it on a Markdown file to list every distinct emoji with a count and one
line of context:

```bash
python scripts/find_emoji.py draft.md
```

Use it before writing `MEANINGFUL_PHRASE_FIXES` for a new document: you
need to read the context of each emoji to know whether it is a decorative
bullet (safe to delete) or actually substitutes for a missing word (needs
a phrase-fix entry).

## Using this on a *different* document

The heading/section detection in `docx_to_markdown.py` and the phrase
fixes in `strip_emoji.py` were tuned by hand against these two files —
they are not a generic docx-to-markdown converter. Before trusting the
output on a new document:

1. Run the pipeline, then `python scripts/docx_verify.py` — a difference
   of more than roughly 0.1% of total characters (or any recognizable word
   forming in the "missing characters" list) means something real was
   lost, not just Markdown punctuation.
2. Skim the `##` / `###` headings it produced (`grep '^#' output.md`) —
   check that sub-section labels (Ingredients, Instructions, etc.) came
   out as `###`, not `##` (which would make them look like separate
   top-level entries). `STRONG_SECTION_WORDS` and `SECTION_WORDS` at the
   top of `docx_to_markdown.py` are where to add this document's own
   vocabulary if it uses different section names.
3. Run `find_emoji.py` on the draft and re-check `MEANINGFUL_PHRASE_FIXES`
   in `strip_emoji.py` — a new document will use different emoji, and the
   lemon-specific fixes there won't apply. Most emoji turn out to be
   decorative bullets (handled automatically); only add a phrase fix for
   ones that verifiably replace a missing word in context.
4. `NOISE_PATTERNS` and `TITLE_FIXES` near the top of `docx_to_markdown.py`
   strip this source's specific Instagram-screenshot metadata and fix two
   documents' worth of lost drop-cap letters — clear or replace them for a
   different source rather than leaving stale patterns that silently never
   match.

## Why not just use pandoc

pandoc was not installed in this environment, and this source needed
custom handling pandoc wouldn't do anyway (hyperlink-run text loss is a
common pitfall of naive `.//w:t` extraction, sub-section heading-level
detection from ALL-CAPS/emoji-prefixed lines, emoji-to-word phrase fixes).
If pandoc is available, `pandoc input.docx -o output.md` is worth trying
first for a simpler document — these scripts are for when you need the
finer control.

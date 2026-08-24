# Receptai — Context

## Status
active

## What this project is
Two Instagram-recipe-export Word documents (pastry/baking recipes and
technique tips) converted to clean Markdown for LLM processing.

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

## Next tasks
None currently — conversion and verification complete. Revisit only if
more source documents are added, or if the Markdown files are consumed by
something (e.g. a recipe database, a search index) that surfaces further
formatting issues.

"""Parse Patarimai.md into tips.json.

Usage: python scripts/parse_tips.py Patarimai.md tips.json

Every `##`/`###` heading starts a new flat tip record — no article/
sub-article hierarchy is rebuilt (decided in CONTEXT.md: the 254 `##`
blocks mix real article titles with sub-sections like "PART 2", "TIP #1"
at the same Markdown level, too inconsistent to reliably regroup).

A `###` sub-heading's title is NOT prefixed with its nearest `##`
ancestor's title. That was tried (e.g. "Meringue Stability —
Temperature") and measured wrong 76 of 124 times (61%): many topic
changes in this source start with a plain prose sentence, not a `##`
heading, so "nearest preceding `##`" often points at an unrelated,
stale topic (a "### Temperature" about meringue stability picked up
"RETAINING MOISTURE AND EXTENDING SHELF LIFE" — a sugar article several
paragraphs earlier — as its "parent"). A bare title is honest about
what the parser actually knows; a wrong prefix would look authoritative
while being misleading.

Duplicate-title handling (per CONTEXT.md):
- Consecutive same-level blocks sharing the exact same title are the
  literal continuation of one post split across paragraphs — merged into
  one tip record.
- The same title reappearing non-consecutively is a separate later post
  on the same topic — kept as its own record, with the displayed title
  suffixed " — N" (N = 2, 3, ...) so search results stay distinguishable.

Tags are auto-derived from the shared tags.json vocabulary (ingredient +
technique axes only — tips have no category/flavor_theme axis, since
they aren't recipes).
"""

import json
import re
import sys
from pathlib import Path

HEADING_RE = re.compile(r"^(#{2,3})\s*(.*)$")


def split_tips(text):
    """Split the source into raw (title, body_lines) blocks at every
    `##`/`###` heading, dropping an empty heading (e.g. a bare "##" with
    no title text) by folding its body into the previous block."""
    lines = text.split("\n")
    blocks = []
    current = None
    for line in lines:
        m = HEADING_RE.match(line)
        if m:
            title = m.group(2).strip()
            if not title:
                continue
            if current is not None:
                blocks.append(current)
            current = {"title": title, "lines": []}
            continue
        if current is not None:
            current["lines"].append(line)
        # (leading text before the first heading in the file, if any, is
        # discarded — Patarimai.md starts directly with a "##" heading)
    if current is not None:
        blocks.append(current)
    return blocks


def merge_consecutive_duplicates(blocks):
    merged = []
    for b in blocks:
        if merged and merged[-1]["title"] == b["title"]:
            merged[-1]["lines"].append("")  # keep a paragraph break
            merged[-1]["lines"].extend(b["lines"])
        else:
            merged.append({"title": b["title"], "lines": list(b["lines"])})
    return merged


def number_nonconsecutive_duplicates(blocks):
    """After consecutive merging, the same title can still repeat later
    in the file (a separate post revisiting the topic — confirmed by
    reading actual text, e.g. "Yesterday we discussed..."). Suffix the
    2nd+ occurrence's *displayed* title with " — N"; the underlying title
    field also gets the suffix so downstream tag/dedup logic sees them as
    distinct entries."""
    seen_count = {}
    for b in blocks:
        seen_count[b["title"]] = seen_count.get(b["title"], 0) + 1
        n = seen_count[b["title"]]
        if n > 1:
            b["title"] = f"{b['title']} — {n}"
    return blocks


def clean_body_text(lines):
    text = "\n".join(lines).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def infer_tags(title, body, tags_vocab):
    haystack = (title + " " + body).lower()
    found = set()
    for axis in ("ingredient", "technique"):
        for term in tags_vocab[axis]:
            words = term.split("-")
            needle = " ".join(words)
            # a "flour-X" vocab term (flour-flax) must also match this
            # source's "X FLOUR" word order (FLAX FLOUR) — Patarimai.md
            # consistently titles its flour-type articles that way, so a
            # forward-only match silently missed every one of them
            # (FLAX FLOUR, SESAME FLOUR, etc. all showed zero tags).
            needle_reversed = " ".join(reversed(words)) if len(words) > 1 else None
            # Word-boundary match, not bare substring — a short tag like "rum"
            # matches as a substring inside unrelated words (e.g. "crumble"),
            # same bug found and fixed in parse_recipes.py's infer_tags. The
            # optional trailing "s"/"es" is needed too, for the same reason:
            # plural forms in body text ("sugars", "oranges") must still match
            # their singular vocab term.
            pattern = r"\b" + re.escape(needle) + r"e?s?\b"
            pattern_reversed = r"\b" + re.escape(needle_reversed) + r"e?s?\b" if needle_reversed else None
            if re.search(pattern, haystack) or (pattern_reversed and re.search(pattern_reversed, haystack)):
                found.add(term)
    return sorted(found)


def parse_tip(block, tags_vocab):
    title = block["title"]
    body = clean_body_text(block["lines"])
    tags = infer_tags(title, body, tags_vocab)
    return {
        "title": title,
        "text": body,
        "tags": tags,
    }


def main():
    if len(sys.argv) != 3:
        print("usage: parse_tips.py Patarimai.md tips.json", file=sys.stderr)
        sys.exit(1)

    md_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    tags_path = md_path.parent / "tags.json"

    tags_vocab = json.loads(tags_path.read_text(encoding="utf-8"))
    text = md_path.read_text(encoding="utf-8")

    blocks = split_tips(text)
    blocks = merge_consecutive_duplicates(blocks)
    # Drop headings with zero body text — a small number of `##`
    # headings in this source are pure section umbrellas immediately
    # followed by another heading with no text of their own (e.g.
    # "## FATS & ACIDS" directly followed by "## LIPIDS", which carries
    # all the actual content) — 9 occurrences, confirmed by reading each
    # one's source context. An empty tip card would be dead weight in
    # the UI with nothing to show or search.
    blocks = [b for b in blocks if clean_body_text(b["lines"])]
    blocks = number_nonconsecutive_duplicates(blocks)

    tips = [parse_tip(b, tags_vocab) for b in blocks]

    out_path.write_text(
        json.dumps(tips, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Parsed {len(tips)} tips -> {out_path}")


if __name__ == "__main__":
    main()

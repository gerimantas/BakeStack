"""Structural QA for tips.json against Patarimai.md.

Usage: python scripts/verify_tips.py Patarimai.md tips.json

Checks:
1. Tip count matches source `##`/`###` heading count, minus empty
   headings and minus consecutive-duplicate merges (both applied by
   parse_tips.split_tips / merge_consecutive_duplicates, imported here
   so the expected count tracks the parser instead of being hardcoded).
2. No tip has empty body text (an empty-body heading should have been
   dropped by the parser, not turned into a dead card).
3. No duplicate titles in the final output — the merge/numbering step
   in parse_tips.py is supposed to make every title unique.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from parse_tips import split_tips, merge_consecutive_duplicates, clean_body_text


def main():
    if len(sys.argv) != 3:
        print("usage: verify_tips.py Patarimai.md tips.json", file=sys.stderr)
        sys.exit(1)

    md_path = Path(sys.argv[1])
    json_path = Path(sys.argv[2])

    text = md_path.read_text(encoding="utf-8")
    tips = json.loads(json_path.read_text(encoding="utf-8"))

    errors = []

    blocks = split_tips(text)
    blocks = merge_consecutive_duplicates(blocks)
    blocks = [b for b in blocks if clean_body_text(b["lines"])]
    expected_count = len(blocks)
    if len(tips) != expected_count:
        errors.append(
            f"Tip count mismatch: got {len(tips)}, expected {expected_count} "
            f"(source headings after empty-heading drop and consecutive-duplicate merge)"
        )

    for t in tips:
        if not t["text"].strip():
            errors.append(f"'{t['title']}': empty body text")

    seen = {}
    for t in tips:
        seen[t["title"]] = seen.get(t["title"], 0) + 1
    dupes = {title: n for title, n in seen.items() if n > 1}
    if dupes:
        errors.append(f"Duplicate titles in output (numbering failed): {dupes}")

    if errors:
        print(f"FAILED - {len(errors)} issue(s):\n")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print(f"OK - {len(tips)} tips, all structural checks passed.")


if __name__ == "__main__":
    main()

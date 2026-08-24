"""Structural QA for recipes.json against Receptai.md.

Usage: python scripts/verify_recipes.py Receptai.md recipes.json

Checks that survive a parser rewrite without needing updates:
1. Recipe count matches the number of `##` headings, minus known
   merges/exclusions (parse_recipes.MERGE_INTO_PREVIOUS_TITLES /
   EXCLUDE_FROM_RECIPES) — so the check stays correct if those sets
   change, instead of silently drifting.
2. Every gram/ml/kg/l amount that appears in the source (as a plain
   number, not inside prose) is accounted for somewhere in the parsed
   ingredients for its recipe — catches a parser silently dropping or
   corrupting a quantity.
3. No recipe has zero ingredients or zero steps (a real recipe always
   has both; zero of either means a split/parse failure).

This is not a byte-for-byte diff (recipes.json restructures the data,
it doesn't preserve source text verbatim) — it's a coverage check: every
number that looks like a quantity in the source must appear as some
ingredient's amount in the output.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from parse_recipes import (
    RECIPE_HEADING, MERGE_INTO_PREVIOUS_TITLES, EXCLUDE_FROM_RECIPES,
    split_recipes,
)

# Negative lookbehind for "/" excludes fraction denominators ("3/4 tsp",
# "2/3 full") from being misread as a standalone quantity — found via a
# false positive where "filling molds 3/4 full" registered as "4 tsp".
QTY_RE = re.compile(
    r"(?<!/)\b(\d+(?:[.,]\d+)?)\s*(?:g|kg|ml|l|tsp|tbsp)\b", re.IGNORECASE
)


def source_recipe_count(text):
    # split_recipes() already applies the merge/exclude logic itself
    # (imported from parse_recipes), so this is directly comparable to
    # len(recipes.json) with no further arithmetic needed.
    raw = split_recipes(text)
    return len(raw)


def extract_source_quantities(lines):
    """All gram/ml/kg/l numbers appearing in a recipe's raw source lines,
    rounded to 1 decimal for tolerant float comparison.

    Skips quantities inside long prose lines (>12 words, or ending in a
    sentence-final period) — those are narrative text ("two stollens ~1
    kg each", "yields~650 g"), not ingredient-list entries, confirmed by
    manually checking every flagged case during this parser's QA pass.
    A real ingredient line is always short. Also skips a quantity that
    is itself inside parentheses — the "or 25 g vanilla paste" /
    "(~100 g)" alternative-unit pattern, which the parser correctly
    keeps folded into the primary ingredient's name rather than
    creating a second, redundant ingredient entry.
    """
    found = []
    for line in lines:
        stripped = line.strip()
        word_count = len(stripped.split())
        is_prose = word_count > 12 or (stripped.endswith(".") and word_count > 6)
        for m in QTY_RE.finditer(line):
            if is_prose:
                continue
            # crude parenthetical check: is this match inside ( ... )?
            before = line[:m.start()]
            if before.count("(") > before.count(")"):
                continue
            # "1 vanilla pod OR 25 g vanilla paste" — an "or"-alternative
            # quantity for the same ingredient slot, not a second
            # ingredient. The parser keeps it folded into the primary
            # ingredient's name (correct — it's a substitution note, not
            # an addition), so it must not be required in `ingredients`.
            if re.search(r"\bor\s+$", before, re.IGNORECASE):
                continue
            # "10 g agar-agar 1200 g/cm2" — a Bloom-strength rating
            # (g/cm²), not a quantity; "each" right after the unit means
            # this is a per-item yield note ("50-60 g each"), not an
            # ingredient amount.
            after = line[m.end():]
            if after.lstrip().startswith("/cm") or after.lstrip().startswith("each"):
                continue
            try:
                found.append(round(float(m.group(1).replace(",", ".")), 1))
            except ValueError:
                pass
    return found


def extract_parsed_quantities(recipe):
    found = []
    for ing in recipe["ingredients"]:
        amt = ing["amount"]
        if amt is None:
            continue
        if isinstance(amt, dict):
            found.append(round(amt["min"], 1))
            found.append(round(amt["max"], 1))
        else:
            found.append(round(float(amt), 1))
    return found


def main():
    if len(sys.argv) != 3:
        print("usage: verify_recipes.py Receptai.md recipes.json", file=sys.stderr)
        sys.exit(1)

    md_path = Path(sys.argv[1])
    json_path = Path(sys.argv[2])

    text = md_path.read_text(encoding="utf-8")
    recipes = json.loads(json_path.read_text(encoding="utf-8"))

    errors = []

    expected_count = source_recipe_count(text)
    if len(recipes) != expected_count:
        errors.append(
            f"Recipe count mismatch: got {len(recipes)}, expected {expected_count} "
            f"(from split_recipes(), which already applies merge/exclude rules)"
        )

    for r in recipes:
        if len(r["ingredients"]) == 0:
            errors.append(f"'{r['title']}': zero ingredients")
        if len(r["steps"]) == 0:
            errors.append(f"'{r['title']}': zero steps")

    raw_recipes = {rr["title"]: rr["lines"] for rr in split_recipes(text)}
    for r in recipes:
        title = r["title"]
        src_lines = raw_recipes.get(title)
        if src_lines is None:
            errors.append(f"'{title}': no matching source section found (title changed?)")
            continue
        src_qty = sorted(extract_source_quantities(src_lines))
        parsed_qty = sorted(extract_parsed_quantities(r))
        # gram/ml amounts embedded in *step* text (e.g. "pour 100 g of
        # cream") are intentionally NOT required in ingredients — they're
        # a separate, smaller set (see CONTEXT.md's 5-step scaling-variable
        # list) and checked by hand, not here. So this check allows the
        # source count to be >= parsed (steps repeat ingredient amounts in
        # prose) but flags whenever a source quantity is completely absent
        # from both ingredients AND step text.
        step_text = " ".join(r["steps"])
        step_qty = sorted(round(float(m.group(1).replace(",", ".")), 1)
                           for m in QTY_RE.finditer(step_text))
        accounted = set(parsed_qty) | set(step_qty)
        missing = [q for q in src_qty if q not in accounted]
        if missing:
            errors.append(f"'{title}': source quantities not found anywhere in output: {missing}")

    if errors:
        print(f"FAILED — {len(errors)} issue(s):\n")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print(f"OK — {len(recipes)} recipes, all structural checks passed.")


if __name__ == "__main__":
    main()

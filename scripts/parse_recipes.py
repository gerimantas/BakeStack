"""Parse Receptai.md into recipes.json.

Usage: python scripts/parse_recipes.py Receptai.md recipes.json

Each `## Title` starts a new recipe. `###` (and bare ALL-CAPS/label lines
without a `#` prefix, e.g. "BATTER", "### Frosting") start a sub-section
within it: an ingredient list section, an instruction-steps section, or a
mixed one. Ingredient lines are recognized by a leading quantity/bullet
pattern; everything else in a sub-section is treated as instruction text.
"""

import json
import re
import sys
from pathlib import Path

FRACTIONS = {"¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3,
             "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875}

BULLET_PREFIX = re.compile(r"^[•▪▫◾◽·\-•▪▫◾◽+]\s*")

DOSE_SUFFIX = re.compile(r"\s*\((\d)\)\s*$")

UNIT_WORDS = {
    "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "cups", "pcs", "pc",
    "tsp.", "tbsp.",
}

NUMBER_RE = r"(?:\d+(?:[.,]\d+)?(?:/\d+)?|\d+/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])"
RANGE_SEP = r"[–‒\-]"

# Leading "~" ("approximately") before a quantity — e.g. "~200-220 g
# Savoiardi cookies" — is common in this source and carries no meaning
# for parsing (the amount is still exactly what follows); stripped, not
# captured, since the recipe's numbers are already often approximate.
APPROX_PREFIX = r"~?\s*"

AMOUNT_UNIT_RE = re.compile(
    rf"^{APPROX_PREFIX}(?P<amt1>{NUMBER_RE})\s*(?:{RANGE_SEP}\s*(?P<amt2>{NUMBER_RE}))?"
    rf"\s*(?P<unit>g|kg|ml|l|tsp\.?|tbsp\.?|cups?|pcs?\.?)\b\.?\s*"
    rf"(?:of\s+)?(?P<rest>.*)$",
    re.IGNORECASE,
)

# "2 large eggs", "10 Ferrero Rocher candies", "4-5 bananas" — count-noun,
# no unit word at all, just a bare number/range then the ingredient name.
COUNT_NOUN_RE = re.compile(
    rf"^{APPROX_PREFIX}(?P<amt1>{NUMBER_RE})\s*(?:{RANGE_SEP}\s*(?P<amt2>{NUMBER_RE}))?"
    rf"\s+(?P<rest>[A-Za-z].*)$"
)

# "Turkey thigh (700-800 g)" — name first, quantity trailing in parens.
# Rare in this source (one occurrence) but a real shape, not a one-off
# regex hack around a single line: any future ingredient list using
# "name (qty unit)" order needs this, not just this one soup recipe.
TRAILING_QTY_RE = re.compile(
    rf"^(?P<rest>[A-Za-z][\w\s'-]*?)\s*"
    rf"\((?P<amt1>{NUMBER_RE})\s*(?:{RANGE_SEP}\s*(?P<amt2>{NUMBER_RE}))?"
    rf"\s*(?P<unit>g|kg|ml|l|tsp\.?|tbsp\.?|cups?|pcs?\.?)\)$",
    re.IGNORECASE,
)

# `##` headings that are actually a sub-section of the PREVIOUS recipe, not
# a new recipe — the source is inconsistent and occasionally uses `##`
# where it uses `###` everywhere else. Found by manually checking every
# short/all-caps `##` heading against its context; not auto-detected
# because a length/case heuristic risks merging real short-titled recipes
# (e.g. "MANGO GANACHE" is a real standalone recipe, not a sub-section).
MERGE_INTO_PREVIOUS_TITLES = {
    "CRUST",
    "CREAM CHEESE LAYER",
    "PANA-COTTA",
    "BASIC SAVORY CRUMBLE",
}
# "STABILIZING WHIPPED CREAM" + "HOW TO USE A STABILIZER" + "GELATIN" form
# one technique article with no recipe shape at all (no title recipe to
# merge into) — excluded from recipes.json entirely, belongs in tips.json.
# "HOW TO MAKE PERFECT CHOCOLATE DRIPS" + its two STEP sub-headings and
# "FLAVOR PAIRING. STRAWBERRY" are pure technique/theory text, no
# ingredient list at all — same call. "HOMEMADE HAZELNUT PASTE" and
# "HOW TO MAKE VANILLA POWDER AT HOME" do have a short ingredient list
# (200g hazelnuts; 3g vanilla pods+30g sugar) so they stay IN recipes.json
# despite the "theory tips" framing in the source text — they're small
# usable recipes, the parser output for them was verified separately.
EXCLUDE_FROM_RECIPES = {
    "STABILIZING WHIPPED CREAM",
    "HOW TO USE A STABILIZER",
    "GELATIN",
    "HOW TO MAKE PERFECT CHOCOLATE DRIPS",
    "STEP 1. DARK CHOCOLATE DRIP ICING",
    "STEP 2. APPLYING THE DRIPS",
    "FLAVOR PAIRING. STRAWBERRY",
}

# "BASIC SAVORY CRUMBLE RECIPE FOR CHEESECAKE CRUST" is intentionally hand-kept in
# recipes.json even though its `## ` block in Receptai.md has NO ingredient list at
# all (just an Instagram-post intro) — its real ingredients/steps live under the
# same content in Patarimai.md ("Basic Savory Crumble"), which was previously
# duplicated as a tip too. Decision: keep it as a recipe (not a tip), remove the
# tip-side duplicate. Because this parser only reads Receptai.md, it can never
# reconstruct this recipe's content on its own — if recipes.json is ever
# regenerated from scratch, this title's ingredients/steps must be copied back in
# by hand from Patarimai.md's "Basic Savory Crumble" tip, not left empty.

RECIPE_HEADING = re.compile(r"^##\s+(.*)$")
SUBSECTION_HEADING = re.compile(r"^###\s+(.*)$")
# Bare label lines used as sub-section headers without a `#` prefix in the
# source, e.g. "BATTER ~24 cupcakes", "### FROSTING", "CARAMEL (yields~220g)".
BARE_LABEL_RE = re.compile(
    r"^[\W_]*(BATTER|FROSTING|FILLING|CARAMEL|GANACHE|ICING|GLAZE|CRUST|CRUMBLE|"
    r"DOUGH|SOAKING SYRUP|TOPPING|DECORATION|ASSEMBLY|METHOD|INSTRUCTIONS?|"
    r"PREPARATION)\b",
    re.IGNORECASE,
)

STEP_NUM_RE = re.compile(r"^(\d+)[.)]\s*")


def parse_number(token):
    token = token.strip()
    if token in FRACTIONS:
        return FRACTIONS[token]
    if "/" in token:
        num, denom = token.split("/")
        return float(num) / float(denom)
    return float(token.replace(",", "."))


def parse_amount(amt1, amt2):
    v1 = parse_number(amt1)
    if amt2:
        v2 = parse_number(amt2)
        # Source occasionally writes ranges high-to-low ("1/3-1/4 tsp.") —
        # normalize to min <= max regardless of the order in the text.
        return {"min": min(v1, v2), "max": max(v1, v2)}
    return v1 if v1 == int(v1) else v1


def clean_ingredient_name(name, dose_labels):
    name = name.strip()
    m = DOSE_SUFFIX.search(name)
    if m:
        dose_labels.append(m.group(1))
        name = DOSE_SUFFIX.sub("", name).strip()
    else:
        dose_labels.append(None)
    return name


def parse_ingredient_line(line):
    """Return an ingredient dict, or None if this line doesn't parse as
    an ingredient (falls back to a display-only, amount=null entry by the
    caller instead)."""
    raw = line
    line = BULLET_PREFIX.sub("", line).strip()
    if not line:
        return None

    m = AMOUNT_UNIT_RE.match(line)
    if m:
        unit = m.group("unit").rstrip(".").lower()
        if unit == "pc":
            unit = "pcs"
        dose_labels = []
        name = clean_ingredient_name(m.group("rest"), dose_labels)
        return {
            "amount": parse_amount(m.group("amt1"), m.group("amt2")),
            "unit": unit,
            "name": name,
        }

    m = COUNT_NOUN_RE.match(line)
    if m:
        dose_labels = []
        name = clean_ingredient_name(m.group("rest"), dose_labels)
        return {
            "amount": parse_amount(m.group("amt1"), m.group("amt2")),
            "unit": None,
            "name": name,
        }

    m = TRAILING_QTY_RE.match(line)
    if m:
        unit = m.group("unit").rstrip(".").lower()
        if unit == "pc":
            unit = "pcs"
        return {
            "amount": parse_amount(m.group("amt1"), m.group("amt2")),
            "unit": unit,
            "name": m.group("rest").strip(),
        }

    return None


# Numbered instruction steps ("2.Add eggs...", "1) Preheat...") — must be
# rejected as ingredient candidates even though they can be short, since a
# leading step number looks superficially like a quantity.
NUMBERED_STEP_RE = re.compile(r"^\d+[.)]\s*[A-Z]")

# No-quantity lines that are still unambiguously ingredient-list entries —
# whitelisted by shape rather than guessed from length/punctuation, since a
# blacklist of instruction verbs let free-text sentences slip through.
NO_QTY_INGREDIENT_RE = re.compile(
    r"^(zest of|juice of|a pinch of|pinch of|a dash of|seeds? of|"
    r"salt to taste|spices? to taste|salt and pepper to taste)\b"
    r"|^[A-Za-z][\w\s'-]{1,40}\s*\((?:for |to taste)[^)]*\)$"
    r"|^(salt|spices?|pepper)$"
    # bare "lemon zest" / "orange zest" with no leading "zest of" —
    # confirmed against source: always a standalone ingredient-list line
    # (e.g. Blueberry-Lemon Rolls has it 3x, each between other
    # ingredient lines, never as a sentence fragment).
    r"|^(lemon|orange|lime|mandarin) zest$"
    # bare single-word decoration ingredients with no quantity given at
    # all in the source ("Cocoa" as its own line in the Tiramisu
    # Cheesecake Decoration section) — a short whitelist, not a general
    # "any single capitalized word is an ingredient" rule, since that
    # would misclassify stray title-case words in prose.
    r"|^(Cocoa|Cinnamon)$",
    re.IGNORECASE,
)


# Two known source glitches where several separate ingredient lines got
# merged into a single line during the docx->markdown conversion. A
# general "split on every qty+unit boundary" regex was tried and rejected
# — it mis-split ingredient names that themselves contain numbers (e.g.
# "used vanilla pods 120 g" got cut mid-name) and even pulled in
# unrelated text from adjacent lines. Hand-verified literal replacements
# for the 2 confirmed occurrences instead; a manual-review pass (per
# CONTEXT.md's QA plan) is what would catch a third one, not a broader
# heuristic that risks corrupting the 1100+ lines that already parse
# correctly.
KNOWN_MERGED_LINES = {
    "1/2 tsp salt 240g kefir": ["1/2 tsp salt", "240g kefir"],
    "- 250 g hazelnuts 2 used vanilla pods 120 g sugar 45 g glucose syrup 35 g water 1 tsp Fleur de Sel or ½ tsp regular salt": [
        "250 g hazelnuts",
        "2 used vanilla pods",
        "120 g sugar",
        "45 g glucose syrup",
        "35 g water",
        "1 tsp Fleur de Sel or ½ tsp regular salt",
    ],
    "- 1 tsp. lemon juice or 1/3 tsp. citric acid 600 g all-purpose flour": [
        "1 tsp. lemon juice or 1/3 tsp. citric acid",
        "600 g all-purpose flour",
    ],
}


def split_known_merged_lines(lines):
    result = []
    for line in lines:
        replacement = KNOWN_MERGED_LINES.get(line.strip())
        if replacement:
            result.extend(replacement)
        else:
            result.append(line)
    return result


# "2g gelatin + 12 g cold water" is two ingredients joined with "+" in the
# source (3 occurrences, grep-confirmed) — split into two separate lines
# so both amounts land in `ingredients` (and both scale with the recipe
# multiplier) instead of the second quantity being buried, unscaled,
# inside the first ingredient's name string.
COMPOUND_PLUS_RE = re.compile(
    rf"^(?P<part1>{APPROX_PREFIX}{NUMBER_RE}\s*(?:{RANGE_SEP}\s*{NUMBER_RE})?"
    rf"\s*(?:g|kg|ml|l|tsp\.?|tbsp\.?)\s+[A-Za-z][\w\s'-]*?)"
    rf"\s*\+\s*"
    rf"(?P<part2>{APPROX_PREFIX}{NUMBER_RE}\s*(?:{RANGE_SEP}\s*{NUMBER_RE})?"
    rf"\s*(?:g|kg|ml|l|tsp\.?|tbsp\.?)\s+[A-Za-z][\w\s'-]*)$",
    re.IGNORECASE,
)


def split_compound_plus_lines(lines):
    result = []
    for line in lines:
        m = COMPOUND_PLUS_RE.match(line.strip())
        if m:
            result.append(m.group("part1").strip())
            result.append(m.group("part2").strip())
        else:
            result.append(line)
    return result


def is_ingredient_line(line):
    stripped = BULLET_PREFIX.sub("", line).strip()
    if not stripped:
        return False
    if NUMBERED_STEP_RE.match(stripped):
        return False
    if AMOUNT_UNIT_RE.match(stripped) or COUNT_NOUN_RE.match(stripped) or \
            TRAILING_QTY_RE.match(stripped):
        return True
    if NO_QTY_INGREDIENT_RE.match(stripped):
        return True
    return False


def strip_step_number(line):
    line = STEP_NUM_RE.sub("", line).strip()
    return BULLET_PREFIX.sub("", line).strip()


def split_recipes(text):
    lines = text.split("\n")
    recipes = []
    current = None
    for line in lines:
        m = RECIPE_HEADING.match(line)
        if m:
            title = m.group(1).strip()
            if title in MERGE_INTO_PREVIOUS_TITLES and current is not None:
                # this "##" is really a sub-section of the recipe already
                # being built — fold its heading in as a sub-section
                # marker instead of starting a new recipe entry.
                current["lines"].append("### " + title)
                continue
            if current is not None:
                recipes.append(current)
            current = {"title": title, "lines": []}
            continue
        if current is not None:
            current["lines"].append(line)
    if current is not None:
        recipes.append(current)
    return [r for r in recipes if r["title"] not in EXCLUDE_FROM_RECIPES]


def infer_category(title, tags_vocab):
    title_lower = title.lower()
    # A title like "... FOR CHEESECAKE CRUST" or "... CHEESECAKE CRUMBLE" is a crust/
    # crumble component recipe, not a full cheesecake — but "cheesecake" sorts earlier
    # in tags_vocab["category"] than "crumble", so the generic loop below would match
    # the wrong (broader dessert) category first. Only applies when "crumble" is paired
    # with another dessert name in the title (the false-match pattern) — a title like
    # "... CRUMBLE PIE" is a real pie with a crumble topping, not a crumble component,
    # so it's excluded and falls through to match "pie" normally.
    if "crumble" in title_lower and "pie" not in title_lower:
        return "crumble"
    for cat in tags_vocab["category"]:
        if cat.replace("-", " ") in title_lower or cat.replace("-", "") in title_lower.replace(" ", ""):
            return cat
    # a few explicit aliases the raw vocab term doesn't literal-match
    aliases = {
        "cinnamon roll": "cinnamon-roll", "swirls": "roll",
        "tea cake": "tea-cake", "teacake": "tea-cake", "teacakes": "tea-cake",
        "loaf": "loaf-cake", "honey cake": "honey-cake",
        "cupcakes": "cupcake", "cupcake": "cupcake",
        "cheesecake": "cheesecake", "pana-cotta": "pana-cotta",
        "kulich": "cake", "casserole": "casserole",
        "cookies": "cookie", "cookie": "cookie",
        "rolls": "roll", "ganache": "ganache",
        "zephyr": "zephyr", "praline": "praline",
        "panettone": "panettone", "stollen": "stollen",
        "quiche": "quiche", "soup": "soup",
        "compote": "compote", "brownie": "brownie",
        "bonbons": "brownie", "pastry": "shortbread",
        "shortbread": "shortbread", "pie": "pie",
        "roulade": "roulade",
        "brisée": "pastry-base", "brisee": "pastry-base",
        "namelaka": "component", "honeycomb": "component",
        "hazelnut paste": "component", "vanilla powder": "component",
    }
    for alias, cat in aliases.items():
        if alias in title_lower:
            return cat
    return None


def infer_tags(title, ingredient_names, tags_vocab):
    haystack = (title + " " + " ".join(ingredient_names)).lower()
    found = set()
    for axis in ("flavor_theme", "ingredient", "technique"):
        for term in tags_vocab[axis]:
            words = term.split("-")
            needle = " ".join(words)
            # "flour-almond" must also match "almond flour" word order —
            # ingredient lines in this source write it that way ("150 g
            # all-purpose flour"), so a forward-only match silently
            # missed every flour-type ingredient tag (same bug found and
            # fixed in parse_tips.py's infer_tags).
            needle_reversed = " ".join(reversed(words)) if len(words) > 1 else None
            if needle in haystack or (needle_reversed and needle_reversed in haystack):
                found.add(term)
    return sorted(found)


def parse_recipe(raw_recipe, tags_vocab):
    title = raw_recipe["title"]
    lines = split_known_merged_lines(raw_recipe["lines"])
    lines = split_compound_plus_lines(lines)

    ingredients = []
    steps = []
    description_lines = []
    servings = None
    seen_structure = False  # first sub-section heading or ingredient line
    current_section = None  # heading text of the ingredient sub-section we're in

    servings_re = re.compile(
        r"(~?\s*\d+[–\-]?\d*\s*(?:pcs?\.?|cupcakes?|rolls?|servings?))",
        re.IGNORECASE,
    )

    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        i += 1
        stripped = line.strip()
        if not stripped:
            continue

        sub_m = SUBSECTION_HEADING.match(stripped)
        bare_m = None if sub_m else BARE_LABEL_RE.match(stripped)
        if sub_m or bare_m:
            seen_structure = True
            heading_text = sub_m.group(1).strip() if sub_m else bare_m.group(1).strip()
            # A step/instructions heading closes the ingredients section — what
            # follows is steps, not another ingredient group ("### Instructions",
            # "METHOD"). Everything else (Dough, Filling, Frosting, ...) opens a
            # new ingredient group so its items don't fall into the previous
            # group or the flat list with no marker at all.
            if re.match(r"^(instructions?|method|preparation|assembly)\b", heading_text, re.IGNORECASE):
                current_section = None
            else:
                current_section = heading_text
            m = servings_re.search(stripped)
            if m and servings is None:
                servings = m.group(1).strip()
            continue

        if is_ingredient_line(stripped):
            seen_structure = True
            parsed = parse_ingredient_line(stripped)
            if not parsed:
                text = BULLET_PREFIX.sub("", stripped).strip()
                parsed = {"amount": None, "unit": None, "name": text}
            if current_section:
                parsed["section"] = current_section
            ingredients.append(parsed)
            continue

        if not seen_structure:
            # free-text lines before the first ingredients/sub-section
            # block are the recipe's Instagram-post intro, not a step.
            description_lines.append(stripped)
            continue

        step_text = strip_step_number(stripped)
        if step_text:
            steps.append(step_text)

    description = " ".join(description_lines).strip() or None

    category = infer_category(title, tags_vocab)
    tags = infer_tags(title, [ing["name"] for ing in ingredients], tags_vocab)

    return {
        "title": title,
        "category": category,
        "description": description,
        "servings": servings,
        "ingredients": ingredients,
        "steps": steps,
        "tags": tags,
        "image": None,
    }


def main():
    if len(sys.argv) != 3:
        print("usage: parse_recipes.py Receptai.md recipes.json", file=sys.stderr)
        sys.exit(1)

    md_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    tags_path = md_path.parent / "tags.json"

    tags_vocab = json.loads(tags_path.read_text(encoding="utf-8"))
    text = md_path.read_text(encoding="utf-8")

    raw_recipes = split_recipes(text)
    recipes = [parse_recipe(r, tags_vocab) for r in raw_recipes]

    out_path.write_text(
        json.dumps(recipes, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Parsed {len(recipes)} recipes -> {out_path}")


if __name__ == "__main__":
    main()

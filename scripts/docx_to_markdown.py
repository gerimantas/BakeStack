"""
Convert the line-per-paragraph output of docx_extract.py into Markdown.

Usage:
    python docx_extract.py input.docx | python docx_to_markdown.py /dev/stdin > output.md
    (or write the extract output to a file first and pass its path)

What it does:
- Detects recipe/article titles (isolated, short, capitalized lines after a
  blank-line gap) -> "## Title"
- Detects known recipe sub-section labels (Ingredients, Instructions,
  Frosting, Filling, ...) -> "### Label", even in ALL CAPS or prefixed with
  a leading emoji bullet
- Detects Title-Case sub-section lines that used an emoji bullet in the
  source (e.g. "Blueberry filling") -> "### Blueberry filling"
- Converts real Word list paragraphs (numPr) to "- item"
- Strips leading decorative marks (emoji, checkmarks, bullet characters)
  from any line before classifying it

This heuristic classification is NOT perfect for arbitrary input - it was
tuned against a specific pair of Instagram-recipe-export documents. When
running it against new source material, spot-check the ## / ### output
(see the grep recipes in README.md) and expect to adjust SECTION_WORDS /
STRONG_SECTION_WORDS below for that document's own vocabulary.
"""
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')

# --- vocabulary: extend this per-document, it is not universal ---

SECTION_WORDS = {
    'ingredients', 'instructions', 'method', 'preparation', 'dough',
    'filling', 'frosting', 'batter', 'caramel', 'icing', 'glaze',
    'assembly', 'decoration', 'base', 'topping', 'soaking syrup',
    'cream', 'coffee filling', 'mascarpone icing', 'lemon curd',
    'shaping the cookies', 'baking', 'storage',
}

# words that always mean "sub-section of a recipe", never a recipe title on
# their own - without this, an ALL-CAPS "FROSTING" sub-section gets promoted
# to the same heading level (##) as the recipe itself, which then reads as
# a separate top-level recipe in the rendered Markdown
STRONG_SECTION_WORDS = {
    'ingredients', 'instructions', 'method', 'preparation', 'filling',
    'filling:', 'frosting', 'frosting:', 'batter', 'caramel',
    'assembly', 'soaking syrup', 'decoration', 'preparation:',
    'instructions:', 'ingredients:',
}

# --- source-specific cleanup: adjust or empty out for a different document ---

# Instagram screenshot metadata (author handle / song caption / like count)
# that ends up embedded in the paragraph text - not part of the recipe
NOISE_PATTERNS = [
    re.compile(r'^\*{0,2}marusya\.manko\*{0,2}$'),
    re.compile(r'^Perry Como.*Magic Moments$'),
    re.compile(r'^Liked by\b'),
]

# Word's decorative drop-cap first letter sometimes lives outside the text
# run and gets lost on extraction (e.g. "RECIPE FOR..." -> "ECIPE FOR...").
# Fill in fixes here after spotting them with a diff against the source.
TITLE_FIXES = {
    'ECIPE FOR STRAWBERRY MOJITO ZEPHYR': 'RECIPE FOR STRAWBERRY MOJITO ZEPHYR',
    'ECIPE FOR CHOCOLATE CUPCAKES WITH SALTED CARAMEL': 'RECIPE FOR CHOCOLATE CUPCAKES WITH SALTED CARAMEL',
    'UTHENTIC NAMELAKA RECIPE FROM VALRHONA SCHOOL RESEARCH KITCHENS': 'AUTHENTIC NAMELAKA RECIPE FROM VALRHONA SCHOOL RESEARCH KITCHENS',
}

# --- generic helpers below this line should not need per-document changes ---

LEADING_MARK_RE = re.compile(
    r'^[\U0001F300-\U0001FAFF☀-➿←-⇿⬀-⯿✅✔️❤❗❓⬇➡\s•\-\*]+'
)

EMOJI_PREFIX_RE = re.compile(
    r'^[\U0001F300-\U0001FAFF☀-➿←-⇿⬀-⯿✅✔️❤❗❓⬇➡📌📍👉]'
)

COMMON_WORDS = {
    'a', 'an', 'the', 'to', 'of', 'for', 'and', 'or', 'is', 'my',
    'your', 'you', 'this', 'that', 'it', 'in', 'on', 'with', 'i',
}


def strip_leading_marks(s):
    return LEADING_MARK_RE.sub('', s).strip()


def clean(s):
    return s.replace('﻿', '').strip()


def is_bold(s):
    return s.startswith('**') and s.endswith('**') and len(s) > 4


def unbold(s):
    return s[2:-2] if is_bold(s) else s


def looks_like_heading(s):
    """ALL-CAPS-ish short line -> recipe/article title."""
    stripped = strip_leading_marks(clean(s))
    if not stripped:
        return False
    letters = [c for c in stripped if c.isalpha()]
    if not letters:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    word_count = len(stripped.split())
    return upper_ratio > 0.85 and word_count <= 10


def looks_like_section_label(s):
    stripped = strip_leading_marks(clean(s)).rstrip(':').strip()
    key = stripped.lower()
    if key in SECTION_WORDS:
        return True
    if len(stripped.split()) <= 4 and stripped.isupper():
        return True
    return False


def is_short_title_line(text):
    stripped = strip_leading_marks(clean(text))
    plain = unbold(stripped) if is_bold(stripped) else stripped
    if not plain:
        return False
    if plain.endswith(('.', ':', ',', ';')):
        return False
    word_count = len(plain.split())
    if word_count > 9:
        return False
    if re.match(r'^\d', plain):
        return False
    if re.search(r'\d+\s*(g|ml|kg|tsp|tbsp|cm|°|min)\b', plain, re.IGNORECASE):
        return False
    return True


def had_emoji_prefix(text):
    return bool(EMOJI_PREFIX_RE.match(text.strip()))


def is_title_case_subsection(text):
    """Title-Case phrase right after an emoji bullet -> sub-section heading.

    Guards against misclassifying an emoji-prefixed sentence (e.g. an
    "important note" line) as a heading: caps the phrase at 4 words, only
    checks the first word's case (source capitalizes inconsistently after
    that, e.g. "Tart cherry filling"), and rejects if any trailing word is
    a common English filler word (a strong signal it's prose, not a label).
    """
    stripped = strip_leading_marks(clean(text)).rstrip(':').strip()
    if not stripped:
        return False
    if stripped.endswith(('.', ',', ';')):
        return False
    main = re.sub(r'\s*\([^)]*\)\s*$', '', stripped).strip()
    if not main:
        return False
    words = main.split()
    if not (1 <= len(words) <= 4):
        return False
    if not words[0][0].isupper():
        return False
    if re.search(r'\d', main):
        return False
    lower_words = [w.lower().strip('.,!?') for w in words[1:]]
    if any(w in COMMON_WORDS for w in lower_words):
        return False
    return True


def gap_count(raw_lines, idx):
    n = 0
    j = idx - 1
    while j >= 0 and raw_lines[j].strip() == '':
        n += 1
        j -= 1
    return n


def is_noise(text):
    return any(p.match(text.strip()) for p in NOISE_PATTERNS)


def fix_title(plain):
    for broken, fixed in TITLE_FIXES.items():
        if plain.startswith(broken):
            return fixed + plain[len(broken):]
    return plain


def convert(raw_lines):
    blocks = []
    current = []
    for i, line in enumerate(raw_lines):
        is_list = line.startswith('[LIST]')
        if is_list:
            line = line[len('[LIST]'):]
        text = clean(line)
        if text == '':
            if current:
                blocks.append(current)
                current = []
            continue
        gap = gap_count(raw_lines, i)
        current.append((text, is_list, gap))
    if current:
        blocks.append(current)

    out = []
    for block in blocks:
        if len(block) == 1 and is_noise(block[0][0]):
            continue
        for pos, (text, is_list, gap) in enumerate(block):
            if is_noise(text):
                continue
            stripped = strip_leading_marks(text)
            plain = unbold(stripped) if is_bold(stripped) else stripped
            plain = fix_title(plain)

            is_recipe_title = pos == 0 and gap >= 2 and is_short_title_line(text)
            is_strong_section = (
                strip_leading_marks(clean(text)).lower().rstrip(':') in STRONG_SECTION_WORDS
            )
            is_emoji_titlecase_subsection = (
                pos == 0 and gap >= 1 and had_emoji_prefix(text)
                and is_title_case_subsection(text)
            )

            if is_strong_section:
                out.append(f'### {plain.rstrip(":").strip()}')
            elif is_recipe_title or looks_like_heading(plain):
                out.append(f'## {plain.strip()}')
            elif looks_like_section_label(plain):
                out.append(f'### {plain.rstrip(":").strip()}')
            elif is_emoji_titlecase_subsection:
                out.append(f'### {plain.rstrip(":").strip()}')
            elif is_list:
                out.append(f'- {text}')
            else:
                out.append(text)
        out.append('')

    return '\n'.join(out)


def main(path):
    with open(path, encoding='utf-8') as f:
        raw_lines = [line.rstrip('\n') for line in f]
    print(convert(raw_lines))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python docx_to_markdown.py raw.txt > output.md', file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])

"""
Remove emoji from a Markdown file produced by docx_to_markdown.py, while
preserving meaning:
- a leading emoji on a line (used as a bullet in the source instead of a
  real Word list) becomes a proper "- " Markdown list item
- keycap digit emoji (1-with-a-box, 2-with-a-box, ...) used as numbered
  steps become "1.", "2.", ...
- an emoji that stood in for an actual missing word mid-sentence (see
  MEANINGFUL_PHRASE_FIXES below) is replaced by that word
- everything else (mood/decorative emoji) is deleted outright
- logical arrows (->) used as "leads to" in running prose are NOT touched -
  they are punctuation, not emoji

Usage:
    python strip_emoji.py input.md > output.md
"""
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# --- source-specific: literal substrings where an emoji substitutes for a
# missing word mid-sentence, found by manually reading the emoji-frequency
# report (see find_emoji.py) and checking each one's context. Do NOT just
# map every fruit/ingredient emoji to its word - most are decorative bullets
# sitting next to text that already names the ingredient (e.g. "lemon zest
# 🍋"), so a blind mapping produces duplicated words. Only add an entry here
# after confirming the sentence is actually incomplete without it.
MEANINGFUL_PHRASE_FIXES = [
    ('zest of 2 \U0001F34B', 'zest of 2 lemons'),
    ('\U0001F34B zest', 'lemon zest'),
    ('40 g \U0001F34B pieces', '40 g lemon pieces'),
    ('40 g \U0001F34B juice', '40 g lemon juice'),
    ('10 g \U0001F34B juice', '10 g lemon juice'),
]

# --- generic below this line ---

# main emoji block ranges + misc symbol ranges commonly used as bullets in
# this kind of source, plus the variation-selector and ZWJ that ride along
# with composed emoji (e.g. the woman-cook emoji is base+ZWJ+cook symbol)
DECORATIVE_RE = re.compile(
    r'[\U0001F300-\U0001FAFF☀-➿⬀-⯿️‍]'
)

LEADING_BULLET_EMOJI_RE = re.compile(
    r'^[ \t]*[\U0001F300-\U0001FAFF☀-➿⬀-⯿️]+[ \t]*'
)

KEYCAP_RE = re.compile(r'([0-9])️?⃣')

STANDALONE_ARROW_LINE_RE = re.compile(r'^\s*[↘↙↗↖]+\s*$', re.MULTILINE)
BRAILLE_BLANK_RE = re.compile('⠀')


def replace_meaningful(text):
    for phrase, fixed in MEANINGFUL_PHRASE_FIXES:
        text = text.replace(phrase, fixed)
    text = KEYCAP_RE.sub(lambda m: f'{m.group(1)}.', text)
    return text


def convert_leading_bullets_to_markdown(text):
    """Turn 'EMOJI rest of line' into '- rest of line', skipping headings."""
    out_lines = []
    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('#'):
            out_lines.append(line)
            continue
        m = LEADING_BULLET_EMOJI_RE.match(line)
        if m and m.end() < len(line):
            rest = line[m.end():].strip()
            if rest:
                out_lines.append(f'- {rest}')
                continue
        out_lines.append(line)
    return '\n'.join(out_lines)


def strip_decorative(text):
    text = convert_leading_bullets_to_markdown(text)
    text = DECORATIVE_RE.sub('', text)
    # standalone arrow lines and braille-blank characters are Instagram-post
    # visual spacers with no content - safe to delete outright
    text = STANDALONE_ARROW_LINE_RE.sub('', text)
    text = BRAILLE_BLANK_RE.sub('', text)
    return text


def cleanup_whitespace(text):
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'^[ \t]+', '', text, flags=re.MULTILINE)
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)
    # collapse 3+ blank lines (left behind by removed standalone-arrow lines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text


def main(path):
    with open(path, encoding='utf-8') as f:
        text = f.read()
    text = replace_meaningful(text)
    text = strip_decorative(text)
    text = cleanup_whitespace(text)
    sys.stdout.write(text)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python strip_emoji.py input.md > output.md', file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])

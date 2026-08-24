"""
Verify that a converted Markdown file did not lose text from its source
.docx. Compares character content only (whitespace, Markdown structural
markers, and emoji ignored on both sides), so it works whether or not
strip_emoji.py was run.

Usage:
    python docx_verify.py input.docx output.md
    python docx_verify.py input.docx output.md --word-diff   (slower, shows
        the actual missing/added phrases instead of just character counts -
        use this when the character-count diff is bigger than a rounding
        error and you need to find out which sentence changed)

A small nonzero difference is normal and expected: Markdown heading markers
(#), list markers (-), and any deliberate emoji-to-word rewrite (see
strip_emoji.py's MEANINGFUL_PHRASE_FIXES) all show up as a few dozen
characters of "difference" without meaning anything was actually lost.
Read the character breakdown before concluding something is missing - it
almost always is just structural.
"""
import sys
import io
import re
import zipfile
import difflib
import xml.etree.ElementTree as ET
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

EMOJI_RE = re.compile(
    r'[\U0001F300-\U0001FAFF☀-➿⬀-⯿✅✔️❤❗❓⬇➡⃣⠀‍]'
)


def extract_docx_paragraphs(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_bytes = z.read('word/document.xml')
    root = ET.fromstring(xml_bytes)
    body = root.find('w:body', NS)
    texts = []
    for p in body.findall('w:p', NS):
        # .//w:t (not w:p/w:r/w:t) so hyperlinked runs are included too
        parts = [t.text for t in p.findall('.//w:t', NS) if t.text]
        texts.append(''.join(parts))
    return texts


def strip_md_markers(s):
    s = re.sub(r'^#{1,6}\s*', '', s, flags=re.MULTILINE)
    s = re.sub(r'^-\s+', '', s, flags=re.MULTILINE)
    s = s.replace('**', '')
    return s


def char_level_compare(docx_path, md_path, label):
    docx_text = ''.join(extract_docx_paragraphs(docx_path))
    with open(md_path, encoding='utf-8') as f:
        md_text = f.read()

    def normalize(s):
        s = strip_md_markers(s)
        s = EMOJI_RE.sub('', s)
        return re.sub(r'\s+', '', s)

    docx_norm = normalize(docx_text)
    md_norm = normalize(md_text)

    print(f'=== {label}: character-level check ===')
    print(f'DOCX chars (whitespace/emoji stripped): {len(docx_norm)}')
    print(f'MD chars   (whitespace/emoji stripped):  {len(md_norm)}')
    print(f'Difference:                              {len(docx_norm) - len(md_norm)}')

    c1, c2 = Counter(docx_norm), Counter(md_norm)
    only_docx, only_md = c1 - c2, c2 - c1
    print(f'\nCharacters in DOCX missing from MD (total {sum(only_docx.values())}):')
    for ch, n in sorted(only_docx.items(), key=lambda x: -x[1])[:20]:
        print(f'   {n:5d}x  {ch!r}')
    print(f'\nCharacters in MD not present in DOCX (total {sum(only_md.values())}):')
    for ch, n in sorted(only_md.items(), key=lambda x: -x[1])[:20]:
        print(f'   {n:5d}x  {ch!r}')
    print(
        '\nA handful of "#", "-", ":" here is just Markdown heading/bullet '
        'syntax - not lost content. Investigate only if you see letters '
        'accumulating into recognizable missing words.'
    )


def word_level_diff(docx_path, md_path, label):
    paragraphs = extract_docx_paragraphs(docx_path)
    docx_text = '\n'.join(paragraphs)
    with open(md_path, encoding='utf-8') as f:
        md_text = strip_md_markers(f.read())

    def normalize(s):
        s = s.replace('**', '')
        return re.sub(r'\s+', ' ', s).strip()

    docx_words = re.findall(r'\S+', normalize(docx_text))
    md_words = re.findall(r'\S+', normalize(md_text))

    sm = difflib.SequenceMatcher(None, docx_words, md_words, autojunk=False)
    missing, added = [], []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ('delete', 'replace'):
            missing.append(' '.join(docx_words[i1:i2]))
        if tag in ('insert', 'replace'):
            added.append(' '.join(md_words[j1:j2]))

    print(f'\n=== {label}: word-diff (for locating specific missing phrases) ===')
    print(f'DOCX words: {len(docx_words)}  MD words: {len(md_words)}')
    print(
        '\nNote: word counts commonly differ even with zero real content '
        'loss - a word glued to an adjacent emoji/number in the source '
        '(e.g. "flour22Oat") tokenizes as one word in DOCX but splits into '
        'several once Markdown adds spacing. Read the actual chunks below, '
        "don't just compare totals."
    )
    print('\n--- Missing chunks (longest first, top 20) ---')
    for c in sorted(missing, key=lambda c: -len(c))[:20]:
        if c.strip():
            print(f'  [{len(c.split())} words] {c[:200]}')
    print('\n--- Added chunks (longest first, top 10) ---')
    for c in sorted(added, key=lambda c: -len(c))[:10]:
        if c.strip():
            print(f'  [{len(c.split())} words] {c[:200]}')


def main():
    if len(sys.argv) < 3:
        print('Usage: python docx_verify.py input.docx output.md [--word-diff]', file=sys.stderr)
        sys.exit(1)
    docx_path, md_path = sys.argv[1], sys.argv[2]
    label = docx_path.rsplit('/', 1)[-1].rsplit('\\', 1)[-1]
    char_level_compare(docx_path, md_path, label)
    if '--word-diff' in sys.argv:
        word_level_diff(docx_path, md_path, label)


if __name__ == '__main__':
    main()

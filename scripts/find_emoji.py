"""
List every distinct emoji in one or more text/Markdown files, with a count
and one line of surrounding context - the first step before writing
MEANINGFUL_PHRASE_FIXES in strip_emoji.py for a new document (you need to
read the context to know which emoji are decorative bullets vs. actual
missing words).

Usage:
    python find_emoji.py file1.md file2.md ...
"""
import sys
import io
import re
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

EMOJI_RE = re.compile(
    r'[\U0001F300-\U0001FAFF☀-➿←-⇿⬀-⯿️]'
)


def main(paths):
    counter = Counter()
    contexts = {}
    for path in paths:
        with open(path, encoding='utf-8') as f:
            for line in f:
                for m in EMOJI_RE.finditer(line):
                    ch = m.group()
                    counter[ch] += 1
                    if ch not in contexts:
                        contexts[ch] = line.strip()[:80]

    for ch, n in sorted(counter.items(), key=lambda x: -x[1]):
        cp = f'U+{ord(ch):04X}'
        print(f'{ch}  {cp:8s}  {n:4d}x  | {contexts[ch]}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python find_emoji.py file1.md [file2.md ...]', file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1:])

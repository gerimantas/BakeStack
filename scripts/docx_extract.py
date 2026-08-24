"""
Extract text from a .docx file's word/document.xml, preserving bold/italic
markers, line breaks, and list-item detection needed by docx_to_markdown.py.

Usage:
    python docx_extract.py input.docx > raw.txt

Output format: one line per Word paragraph. Bold runs wrapped in **, italic
in *. A paragraph that used real Word list numbering (numPr) is prefixed
with [LIST] (stripped by docx_to_markdown.py, which turns it into "- ").
"""
import sys
import io
import zipfile
import xml.etree.ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}


def extract(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_bytes = z.read('word/document.xml')
    root = ET.fromstring(xml_bytes)
    body = root.find('w:body', NS)
    out = []
    for p in body.findall('w:p', NS):
        segments = []
        is_list = p.find('.//w:numPr', NS) is not None
        # .//w:r (not w:r) so runs inside w:hyperlink are not skipped -
        # missing this loses every hyperlinked word (e.g. "@username" credits)
        for r in p.findall('.//w:r', NS):
            bold = r.find('w:rPr/w:b', NS) is not None
            italic = r.find('w:rPr/w:i', NS) is not None
            for child in r:
                tag = child.tag.split('}')[-1]
                if tag == 't':
                    text = child.text or ''
                    if text:
                        segments.append((text, bold, italic))
                elif tag == 'br':
                    segments.append(('\n', False, False))
                elif tag == 'tab':
                    segments.append(('\t', False, False))
        out.append((segments, is_list))
    return out


def main(path):
    for segments, is_list in extract(path):
        line = ''
        for text, bold, italic in segments:
            t = text
            if bold and t.strip():
                t = f'**{t}**'
            if italic and t.strip():
                t = f'*{t}*'
            line += t
        marker = '[LIST]' if is_list else ''
        print(f'{marker}{line}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python docx_extract.py input.docx > raw.txt', file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])

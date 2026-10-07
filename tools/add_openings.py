"""Writes each pooja's and path's opening words into content/books.json as "opening".

The lists show them under the title, so people can recognise a text by how it begins
(two poojas can share a name but not a first line). Run again after adding or editing texts:

    python tools/add_openings.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "content" / "books.json"
# The shelves people recite from; stories and granths are left out.
CATEGORIES = {"nitya", "pooja-prarambh", "nitya-pooja", "tirthankar-pooja", "parv-pooja", "visarjan", "aarti", "path", "stotra"}
# Lines that are not the text itself (see parseBook in js/app.js).
NOT_TEXT = re.compile(r"^(@|(पद्य|गद्य|prose|लिंक|चित्र|सीख|moral|अन्वयार्थ|अर्थ|भावार्थ|विशेषार्थ|विशेष|meaning)\s*:)", re.I)
# Directions to the reader, such as ॥ पुष्पांजलिं क्षिपेत् ॥ or (छन्द ...), are not the text either.
RUBRIC = re.compile(r"^(॥.*|\(.*\)|\[.*\])$")
MAX = 90


def opening(path):
    """The first line of the first verse, without metre notes, verse numbers or dandas."""
    lines = []
    for raw in path.read_text(encoding="utf-8").replace("\r", "").split("\n"):
        line = raw.strip()
        if line.startswith("#"):
            continue
        if not line:
            if lines:
                break
            continue
        if NOT_TEXT.match(line) or RUBRIC.match(line):
            continue
        lines.append(line)
    if not lines:
        return ""
    text = lines[0]
    if text.endswith("-") and len(lines) > 1:      # a word split across lines, as in the Bhaktamar
        text = text[:-1] + lines[1]
    text = re.sub(r"[\s।॥|\d०-९]+$", "", text).strip(" ,;:")
    if len(text) > MAX:
        text = text[:MAX].rsplit(" ", 1)[0].rstrip(" ,;:") + "…"
    return text


def main():
    source = CATALOG.read_text(encoding="utf-8")
    books = json.loads(source)
    # Remove openings written before, then add each one after the book's author (or title) line.
    source = re.sub(r'\n[ \t]*"opening": ".*",', "", source)
    lines = source.split("\n")
    done = 0
    for book in books:
        if book.get("category") not in CATEGORIES:
            continue
        text = opening(ROOT / book["file"])
        if not text:
            continue
        start = next(i for i, l in enumerate(lines) if l.strip() == '"id": %s,' % json.dumps(book["id"], ensure_ascii=False))
        end = next((i for i in range(start + 1, len(lines)) if lines[i].lstrip().startswith('"id":')), len(lines))
        entry = range(start, end)
        at = next((i for i in entry if lines[i].lstrip().startswith('"author":')), None)
        if at is None:
            at = next(i for i in entry if lines[i].lstrip().startswith('"title":'))
        indent = lines[at][: len(lines[at]) - len(lines[at].lstrip())]
        lines.insert(at + 1, indent + '"opening": ' + json.dumps(text, ensure_ascii=False) + ",")
        done += 1
    out = "\n".join(lines)
    json.loads(out)
    CATALOG.write_text(out, encoding="utf-8", newline="")
    print("Openings written for", done, "texts")


if __name__ == "__main__":
    main()

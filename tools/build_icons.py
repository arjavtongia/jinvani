"""Builds js/icons-swadhyay.js from the Swadhyay icon pack in icons/ui/*.svg.

The pack is drawn in navy (#173A63) with a saffron accent (#E7A72B), plus sindoor red and green
for the ratnatraya. In the app the navy becomes currentColor, so each icon takes the colour of the
text around it and stays visible at night; the accents keep their colours (see --icon-accent in
css/app.css). "forward" is the back arrow mirrored.

Run after changing an icon:  python tools/build_icons.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "icons" / "ui"
OUT = ROOT / "js" / "icons-swadhyay.js"
COLOURS = {"#173A63": "currentColor", "#E7A72B": "var(--icon-accent)", "#C94B45": "var(--sindoor)", "#3D8B68": "var(--icon-green)"}


def inner(svg):
    body = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    body = re.sub(r"<title[^>]*>.*?</title>", "", body, flags=re.S)
    for old, new in COLOURS.items():
        body = re.sub(re.escape(old), new, body, flags=re.I)
    return body.strip()


def main():
    icons = {f.stem: inner(f.read_text(encoding="utf-8")) for f in sorted(SRC.glob("*.svg"))}
    icons["forward"] = '<g transform="matrix(-1 0 0 1 24 0)">' + icons["back"] + "</g>"
    lines = ["/* Swadhyay icon pack (icons/ui), built by tools/build_icons.py; do not edit by hand. */",
             "const PACK_ICONS = {"]
    lines += ["  %s: %s," % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in icons.items()]
    lines[-1] = lines[-1].rstrip(",")
    lines.append("};")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    print("Wrote", len(icons), "icons to", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()

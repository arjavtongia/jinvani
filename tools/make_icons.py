"""Draws the app icons (a lamp above an open book) into ../icons.

Run:  python tools/make_icons.py   (needs Pillow: pip install pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "icons"
SAFFRON = (154, 52, 18)
CREAM = (255, 244, 224)
GOLD = (255, 200, 87)
LINE = (233, 180, 138)
S = 4  # draw at 4x, then shrink for smooth edges


def curve(p0, p1, p2, steps=24):
    """Points along a quadratic curve."""
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts


def draw_art(d, cx, cy, scale):
    """Book and lamp centred on (cx, cy); scale 1.0 fills about 330px of a 512 canvas."""
    def P(x, y):
        return (cx + x * scale * S, cy + y * scale * S)

    # Open book: two pages with curved top and bottom edges.
    for side in (-1, 1):
        top = curve((6 * side, 40), (80 * side, 10), (160 * side, 24))
        bottom = curve((160 * side, 150), (80 * side, 136), (6 * side, 166))
        d.polygon([P(x, y) for x, y in top + bottom], fill=CREAM)
        for k in range(3):
            y0 = 62 + k * 28
            line = curve((30 * side, y0 + 6), (80 * side, y0 - 12), (136 * side, y0 - 2), 16)
            d.line([P(x, y) for x, y in line], fill=LINE, width=int(9 * scale * S), joint="curve")

    # Lamp flame above the book.
    flame = curve((0, -150), (60, -60), (0, -10)) + curve((0, -10), (-60, -60), (0, -150))
    d.polygon([P(x, y) for x, y in flame], fill=GOLD)
    inner = curve((0, -100), (28, -50), (0, -24)) + curve((0, -24), (-28, -50), (0, -100))
    d.polygon([P(x, y) for x, y in inner], fill=CREAM)


def make(size, maskable=False, rounded=True):
    big = 512 * S
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable or not rounded:
        d.rectangle([0, 0, big, big], fill=SAFFRON)
    else:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=112 * S, fill=SAFFRON)
    scale = 0.72 if maskable else 0.95
    draw_art(d, big / 2, big / 2 - 8 * S * scale, scale)
    resample = getattr(Image, "Resampling", Image).LANCZOS
    return img.resize((size, size), resample)


def main():
    OUT.mkdir(exist_ok=True)
    make(192).save(OUT / "icon-192.png")
    make(512).save(OUT / "icon-512.png")
    make(512, maskable=True).save(OUT / "icon-maskable-512.png")
    make(180, rounded=False).convert("RGB").save(OUT / "apple-touch-icon.png")
    print("Icons written to", OUT)


if __name__ == "__main__":
    main()

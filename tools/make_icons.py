"""Draws the app icons into ../icons: the Jain Prateek in sindoor on white marble.

The Prateek is the emblem adopted by all Jain traditions in 1974: the outline of the loka,
holding the siddhashila and the siddha, the three dots of ratnatraya, the swastik, and the
raised hand of ahimsa with the dharmachakra in the palm. Its colours are the app's own
(marble #f4f2ed, sindoor #a3301a; see DESIGN.md).

Run:  python tools/make_icons.py   (needs Pillow: pip install pillow)
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw
from PIL.PngImagePlugin import PngInfo

OUT = Path(__file__).resolve().parent.parent / "icons"
MARBLE = (244, 242, 237)
SINDOOR = (163, 48, 26)
S = 4                      # draw at 4x, then shrink for smooth edges
N = 512 * S
LANCZOS = getattr(Image, "Resampling", Image).LANCZOS
# Written into every icon, so each file says where it came from.
ORIGIN = ("Origin: drawn in code by tools/make_icons.py (Pillow) in the Swadhyay repository; no image generation and no "
          "sourced artwork. Subject: the Jain Prateek, the emblem adopted by all Jain traditions in 1974 (loka outline, "
          "siddhashila and siddha, ratnatraya, swastik, raised hand of ahimsa with the 24-spoked dharmachakra), redrawn "
          "in the app's sindoor #a3301a on white marble #f4f2ed.")
RADIAL = Image.radial_gradient("L")
EDGE = RADIAL.getpixel((128, 0)) or 1   # the gradient's value where its circle meets the box edge


def glow(img, cx, cy, radius, color, strength):
    """Soft light on the marble that fades to nothing at its rim."""
    g = RADIAL.point(lambda v: int(max(0.0, 1 - v / EDGE) ** 1.6 * 255 * strength))
    g = g.resize((int(radius * 2), int(radius * 2)), LANCZOS)
    img.paste(Image.new("RGB", g.size, color), (int(cx - radius), int(cy - radius)), g)


def capsule(p0, p1, r, n=18):
    """A finger or the thumb: a line from p0 to p1 with round ends."""
    a = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    pts = [(p1[0] + r * math.cos(a - math.pi / 2 + math.pi * i / n), p1[1] + r * math.sin(a - math.pi / 2 + math.pi * i / n)) for i in range(n + 1)]
    pts += [(p0[0] + r * math.cos(a + math.pi / 2 + math.pi * i / n), p0[1] + r * math.sin(a + math.pi / 2 + math.pi * i / n)) for i in range(n + 1)]
    return pts


def swastik(d, cx, cy, arm, w):
    """The swastik, arms turning to the right, with square ends."""
    for (ax, ay), (bx, by) in [((0, -arm), (0, arm)), ((-arm, 0), (arm, 0)), ((0, -arm), (arm, -arm)),
                               ((arm, 0), (arm, arm)), ((0, arm), (-arm, arm)), ((-arm, 0), (-arm, -arm))]:
        h = w / 2
        d.rectangle([cx + min(ax, bx) - h, cy + min(ay, by) - h, cx + max(ax, bx) + h, cy + max(ay, by) + h], fill=255)


def hand(img, cx, top, height, color, ground):
    """The raised palm, thumb to the viewer's left, with the 24-spoked dharmachakra in the palm."""
    k = height / 130
    P = lambda x, y: (cx + (x - 50) * k, top + y * k)
    m = Image.new("L", (N, N), 0)
    d = ImageDraw.Draw(m)
    for x, t in ((31, 20), (47.5, 9), (64, 14), (80.5, 27)):
        d.polygon(capsule(P(x, 72), P(x, t), 8.2 * k), fill=255)
    d.rounded_rectangle([P(22.8, 50), P(88.7, 118)], radius=int(27 * k), fill=255)
    d.polygon(capsule(P(25, 98), P(8, 64), 8.6 * k), fill=255)
    img.paste(Image.new("RGB", (N, N), color), (0, 0), m)
    d = ImageDraw.Draw(img)
    for x, t in ((39.2, 24), (55.7, 22), (72.2, 30)):
        d.line([P(x, t), P(x, 60)], fill=ground, width=max(int(2.2 * k), 2))
    wx, wy = P(56, 92)
    r = 17.5 * k
    d.ellipse([wx - r, wy - r, wx + r, wy + r], outline=ground, width=max(int(3 * k), 2))
    for i in range(24):
        a = 2 * math.pi * i / 24
        d.line([(wx + 6 * k * math.cos(a), wy + 6 * k * math.sin(a)), (wx + 15.5 * k * math.cos(a), wy + 15.5 * k * math.sin(a))],
               fill=ground, width=max(int(1.5 * k), 1))
    d.ellipse([wx - 5 * k, wy - 5 * k, wx + 5 * k, wy + 5 * k], fill=ground)


def prateek(img, cx, top, height, color, ground, line_w):
    """The Jain Prateek; it stands 1.485 times as tall as it is wide."""
    u = height / 1.485
    X = lambda x: cx + (x - 0.5) * u
    Y = lambda y: top + y * u
    # starts and ends half-way along the top edge, so the stroke closes without a step at a corner
    outline = [(X(0.5), Y(0)), (X(0.64), Y(0)), (X(0.824), Y(0.354)), (X(0.671), Y(0.735)), (X(1), Y(1.485)),
               (X(0), Y(1.485)), (X(0.329), Y(0.735)), (X(0.176), Y(0.354)), (X(0.36), Y(0)), (X(0.5), Y(0))]
    m = Image.new("L", (N, N), 0)
    d = ImageDraw.Draw(m)
    d.line(outline, fill=255, width=int(line_w), joint="curve")
    # siddhashila: a bowl hung from the top corners, filled as a band so its edges stay smooth
    h, depth = line_w * 0.42, 0.125 * u
    ts = [math.pi * i / 60 for i in range(61)]
    bowl = [(X(0.5) + (0.14 * u + h) * math.cos(t), Y(0) + (depth + h) * math.sin(t)) for t in ts]
    bowl += [(X(0.5) + (0.14 * u - h) * math.cos(t), Y(0) + (depth - h) * math.sin(t)) for t in reversed(ts)]
    d.polygon(bowl, fill=255)
    # the siddha, centred in the space between the top edge and the bowl
    r, sy = 0.02 * u, Y(0) + (line_w / 2 + depth - h) / 2
    d.ellipse([X(0.5) - r, sy - r, X(0.5) + r, sy + r], fill=255)
    r = 0.022 * u
    for x in (0.39, 0.5, 0.61):     # ratnatraya
        d.ellipse([X(x) - r, Y(0.2) - r, X(x) + r, Y(0.2) + r], fill=255)
    swastik(d, X(0.5), Y(0.47), 0.125 * u, 0.044 * u)
    img.paste(Image.new("RGB", (N, N), color), (0, 0), m)
    hand(img, X(0.5), Y(0.79), 0.58 * u, color, ground)


def art(scale):
    """The marble field with the Prateek centred; scale shrinks it (the maskable icon keeps it in the safe circle)."""
    img = Image.new("RGB", (N, N), MARBLE)
    glow(img, N / 2, N * 0.45, N * 0.6, (255, 255, 255), 0.6)
    h = 420 * scale * S
    prateek(img, N / 2, N / 2 - h / 2, h, SINDOOR, MARBLE, 14 * S * max(scale, 0.9))
    return img


def make(size, scale=1.0, rounded=True):
    img = art(scale).resize((size, size), LANCZOS)
    if not rounded:
        return img
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], radius=int(size * 4 * 112 / 512), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask.resize((size, size), LANCZOS))
    return out


def main():
    OUT.mkdir(exist_ok=True)
    info = PngInfo()
    info.add_text("impeccable:prompt", ORIGIN)
    make(192).save(OUT / "icon-192.png", pnginfo=info)
    make(512).save(OUT / "icon-512.png", pnginfo=info)
    # Android crops maskable icons to a circle or squircle: keep the emblem inside the central 80%.
    make(512, scale=0.78, rounded=False).save(OUT / "icon-maskable-512.png", pnginfo=info)
    # iOS rounds the corners itself and wants no transparency.
    make(180, scale=0.92, rounded=False).save(OUT / "apple-touch-icon.png", pnginfo=info)
    print("Icons written to", OUT)


if __name__ == "__main__":
    main()

"""Builds public/images/diego-portrait-mask.png (white = subject) from the portrait.

Run with: python -I scripts/make-portrait-mask.py
The backdrop is a light, low-saturation gray with a soft gradient. We keep only the
backdrop-like pixels connected to the image border (flood fill), so skin, the white
t-shirt and dark hair are never mistaken for backdrop.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'images' / 'diego-portrait.webp'
OUT = ROOT / 'public' / 'images' / 'diego-portrait-mask.png'

LUMA_MIN, LUMA_MAX = 0.50, 0.90  # backdrop spans roughly 0.64-0.81
SAT_MAX = 0.20
FEATHER = 2.5

img = Image.open(SRC).convert('RGB')
w, h = img.size
luma = img.convert('L')
_, sat, _ = img.convert('HSV').split()

lo, hi = int(LUMA_MIN * 255), int(LUMA_MAX * 255)
smax = int(SAT_MAX * 255)
candidate = ImageChops.multiply(
    luma.point(lambda v: 255 if lo <= v <= hi else 0),
    sat.point(lambda v: 255 if v <= smax else 0),
)
# Slight blur-then-threshold removes single-pixel hair strands from the candidate set.
candidate = candidate.filter(ImageFilter.MedianFilter(5))

marked = candidate.copy()
seeds = [(x, 0) for x in range(0, w, 8)] + [(0, y) for y in range(0, h, 8)]
seeds += [(w - 1, y) for y in range(0, h, 8)]
for seed in seeds:
    if marked.getpixel(seed) == 255:
        ImageDraw.floodfill(marked, seed, 128)

backdrop = marked.point(lambda v: 255 if v == 128 else 0)
subject = ImageChops.invert(backdrop)

# Close small holes, then open away specks; both with small kernels.
subject = subject.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
subject = subject.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
subject = subject.filter(ImageFilter.GaussianBlur(FEATHER))

assert subject.size == (900, 1125)
subject.save(OUT, optimize=True)
print(f'wrote {OUT} ({w}x{h})')

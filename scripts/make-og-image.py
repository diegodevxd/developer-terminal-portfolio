"""Builds public/og-image.png (1200x630) in the site's style: navy ground, electric frame,
Antonio name, mono eyebrow and the portrait on the right.

Run with: python -I scripts/make-og-image.py

Fonts: Antonio and JetBrains Mono ship as variable woff2 in node_modules. Pillow cannot read
woff2, so when fontTools + brotli are importable (pip install fonttools brotli) they are
converted to a static TTF in memory. Otherwise the script falls back to Windows system fonts
(Arial Narrow Bold / Consolas) and says so.
"""

import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'node_modules' / '@fontsource-variable'
PORTRAIT = ROOT / 'public' / 'images' / 'diego-portrait.webp'
OUT = ROOT / 'public' / 'og-image.png'

W, H = 1200, 630
BG = '#07081c'
ACCENT = '#2b2bff'
FG = '#f2f2f2'
MUTED = '#8a8db8'
LINE = '#23265a'
FRAME = 12


def static_font(woff2: Path, weight: int, size: int, fallbacks: list[str]) -> ImageFont.FreeTypeFont:
    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib import instancer

        font = instancer.instantiateVariableFont(TTFont(woff2), {'wght': weight})
        font.flavor = None
        buffer = io.BytesIO()
        font.save(buffer)
        buffer.seek(0)
        return ImageFont.truetype(buffer, size)
    except ImportError:
        for name in fallbacks:
            try:
                font = ImageFont.truetype(name, size)
                print(f'fontTools not available: using system font {name}')
                return font
            except OSError:
                continue
    return ImageFont.load_default(size)


def main() -> None:
    display = lambda size: static_font(
        FONTS / 'antonio' / 'files' / 'antonio-latin-wght-normal.woff2',
        700,
        size,
        ['ARIALNB.TTF', 'impact.ttf'],
    )
    mono = lambda size: static_font(
        FONTS / 'jetbrains-mono' / 'files' / 'jetbrains-mono-latin-wght-normal.woff2',
        500,
        size,
        ['consola.ttf', 'cour.ttf'],
    )

    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Portrait: grayscale, navy-tinted, 4:5, right side with a bracket frame.
    pw, ph = 440, 550
    px, py = W - FRAME - 64 - pw, (H - ph) // 2
    photo = Image.open(PORTRAIT).convert('L')
    photo = ImageOps.fit(photo, (pw, ph), method=Image.LANCZOS, centering=(0.5, 0.0))
    photo = ImageEnhance.Contrast(photo).enhance(1.15)
    tinted = ImageOps.colorize(photo, black=BG, white='#c9cbff')
    img.paste(tinted, (px, py))
    draw.rectangle((px, py, px + pw, py + ph), outline=LINE, width=1)
    arm = 22
    for cx, cy, dx, dy in (
        (px, py, 1, 1),
        (px + pw, py, -1, 1),
        (px, py + ph, 1, -1),
        (px + pw, py + ph, -1, -1),
    ):
        draw.line((cx, cy, cx + dx * arm, cy), fill=FG, width=3)
        draw.line((cx, cy, cx, cy + dy * arm), fill=FG, width=3)

    # Text column.
    left = FRAME + 72
    draw.text((left, 160), '// LEÓN, MX · DISPONIBLE', font=mono(24), fill=MUTED, anchor='ls')
    draw.text((left, 330), 'DIEGO', font=display(150), fill=FG, anchor='ls')
    draw.text((left, 483), 'MANCERA', font=display(150), fill=FG, anchor='ls')
    draw.rectangle((left, 520, left + 72, 524), fill=ACCENT)
    draw.text((left, 572), 'Full-Stack & Kernel Linux', font=mono(28), fill=MUTED, anchor='ls')

    # Electric frame.
    draw.rectangle((0, 0, W - 1, H - 1), outline=ACCENT, width=FRAME)

    img.save(OUT, optimize=True)
    print(f'wrote {OUT} ({OUT.stat().st_size // 1024} kB)')


if __name__ == '__main__':
    main()

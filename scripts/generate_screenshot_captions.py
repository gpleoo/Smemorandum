#!/usr/bin/env python3
"""
Generate captioned App Store screenshots.

Input:  store-metadata/screenshots/raw/*.png  (1170×2532 RGBA)
Output: store-metadata/screenshots/captioned/{locale}/*.png  (1170×2532 RGBA)

Layout
------
┌──────────────────────────┐ 0
│  gradient band  (~380px) │  ← #6C63FF → #4A42D6 (brand colors)
│     [TITLE bold]         │
│     [subtitle regular]   │
├──────────────────────────┤ 380
│                          │
│  screenshot (letterbox)  │  ← scaled to fit width 1170, centered
│  sidebar fill = #4A42D6  │
│                          │
└──────────────────────────┘ 2532

Run from repo root:
    python3 scripts/generate_screenshot_captions.py
"""

import json
import math
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("PIL not found — run: pip install Pillow")

# ── paths ──────────────────────────────────────────────────────────────────────
REPO_ROOT   = Path(__file__).resolve().parent.parent
RAW_DIR     = REPO_ROOT / "store-metadata/screenshots/raw"
OUT_DIR     = REPO_ROOT / "store-metadata/screenshots/captioned"
CAPTIONS    = REPO_ROOT / "store-metadata/screenshots/captions.json"

FONT_BOLD   = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG    = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# ── design constants ────────────────────────────────────────────────────────────
CANVAS_W, CANVAS_H = 1170, 2532
BAND_H             = 380          # px reserved for caption band
GRAD_TOP           = (108, 99, 255)   # #6C63FF
GRAD_BOT           = (74,  66, 214)   # #4A42D6
SIDEBAR_COLOR      = (*GRAD_BOT, 255) # letterbox fill = gradient end color
TEXT_COLOR         = (255, 255, 255, 255)
SHADOW_COLOR       = (0, 0, 0, 90)

TITLE_SIZE    = 76
SUBTITLE_SIZE = 42
LINE_GAP      = 20   # px between title baseline and subtitle top
SIDE_PAD      = 80   # horizontal padding for text


def make_gradient_band(width: int, height: int) -> Image.Image:
    """Create a vertical gradient image."""
    band = Image.new("RGBA", (width, height))
    pixels = band.load()
    for y in range(height):
        t = y / (height - 1)
        r = round(GRAD_TOP[0] + t * (GRAD_BOT[0] - GRAD_TOP[0]))
        g = round(GRAD_TOP[1] + t * (GRAD_BOT[1] - GRAD_TOP[1]))
        b = round(GRAD_TOP[2] + t * (GRAD_BOT[2] - GRAD_TOP[2]))
        for x in range(width):
            pixels[x, y] = (r, g, b, 255)
    return band


def draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: float,
    y: float,
    font: ImageFont.FreeTypeFont,
    shadow_offset: int = 2,
) -> None:
    draw.text((x + shadow_offset, y + shadow_offset), text, font=font, fill=SHADOW_COLOR, anchor="mt")
    draw.text((x, y), text, font=font, fill=TEXT_COLOR, anchor="mt")


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines, current = [], ""
    for word in words:
        candidate = (current + " " + word).strip()
        if font.getlength(candidate) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def composite_screenshot(raw: Image.Image, area_h: int) -> Image.Image:
    """
    Scale raw screenshot to fit within CANVAS_W × area_h (letterbox).
    Sidebar filled with SIDEBAR_COLOR.
    """
    scale = min(CANVAS_W / raw.width, area_h / raw.height)
    new_w = round(raw.width  * scale)
    new_h = round(raw.height * scale)
    resized = raw.resize((new_w, new_h), Image.LANCZOS)

    area = Image.new("RGBA", (CANVAS_W, area_h), SIDEBAR_COLOR)
    x_off = (CANVAS_W - new_w) // 2
    y_off = (area_h  - new_h) // 2
    area.paste(resized, (x_off, y_off))
    return area


def generate(locale: str, screenshots: list[dict]) -> None:
    locale_out = OUT_DIR / locale
    locale_out.mkdir(parents=True, exist_ok=True)

    font_title    = ImageFont.truetype(FONT_BOLD, TITLE_SIZE)
    font_subtitle = ImageFont.truetype(FONT_REG,  SUBTITLE_SIZE)
    gradient      = make_gradient_band(CANVAS_W, BAND_H)

    for item in screenshots:
        raw_path = RAW_DIR / item["file"]
        if not raw_path.exists():
            print(f"  [SKIP] {item['file']} not found")
            continue

        caption = item["captions"].get(locale)
        if not caption:
            print(f"  [SKIP] no {locale} caption for {item['file']}")
            continue

        raw = Image.open(raw_path).convert("RGBA")

        # ── build canvas ──
        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H))
        canvas.paste(gradient, (0, 0))

        screen_area = composite_screenshot(raw, CANVAS_H - BAND_H)
        canvas.paste(screen_area, (0, BAND_H))

        # ── draw text ──
        draw = ImageDraw.Draw(canvas)
        usable_w = CANVAS_W - 2 * SIDE_PAD
        cx = CANVAS_W // 2

        title_lines = wrap_text(caption["title"], font_title, usable_w)
        sub_lines   = wrap_text(caption["subtitle"], font_subtitle, usable_w)

        title_lh  = font_title.size + 8
        sub_lh    = font_subtitle.size + 6
        total_h   = (
            len(title_lines) * title_lh
            + LINE_GAP
            + len(sub_lines) * sub_lh
        )
        y = (BAND_H - total_h) // 2

        for line in title_lines:
            draw_text_with_shadow(draw, line, cx, y, font_title)
            y += title_lh
        y += LINE_GAP
        for line in sub_lines:
            draw_text_with_shadow(draw, line, cx, y, font_subtitle)
            y += sub_lh

        out_path = locale_out / item["file"]
        canvas.save(out_path, "PNG", optimize=False)
        print(f"  ✓ {locale}/{item['file']}")


def main() -> None:
    with open(CAPTIONS) as f:
        data = json.load(f)

    screenshots = data["screenshots"]
    locales = list(next(iter(screenshots))["captions"].keys())

    print(f"Generating {len(screenshots)} screenshots × {len(locales)} locales "
          f"→ {OUT_DIR.relative_to(REPO_ROOT)}/")

    for locale in locales:
        print(f"\n[{locale}]")
        generate(locale, screenshots)

    print("\nDone.")


if __name__ == "__main__":
    main()

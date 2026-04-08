"""
Smemorandum — Icon & Splash processor
Esegui questo script DOPO aver salvato:
  assets/icon_raw.png    <- icona quadrata originale
  assets/splash_raw.png  <- splash originale

Lo script produce:
  assets/icon.png                    (1024x1024, sfondo pieno, angoli dritti)
  assets/splash-icon.png             (512x512, logo su sfondo bianco)
  assets/android-icon-foreground.png (1024x1024, logo su trasparente)
  assets/android-icon-background.png (1024x1024, sfondo pieno)
  assets/favicon.png                 (48x48)
"""

from PIL import Image, ImageDraw
import os, sys

ASSETS = os.path.join(os.path.dirname(__file__), '..', 'assets')

def load(name):
    path = os.path.join(ASSETS, name)
    if not os.path.exists(path):
        print(f"ERRORE: file non trovato → {path}")
        print("Salva prima l'immagine nella cartella assets/ con il nome corretto.")
        sys.exit(1)
    return Image.open(path).convert('RGBA')

def get_bg_color(img):
    """Campiona il colore dei 4 angoli per rilevare il bordo bianco/grigio."""
    w, h = img.size
    corners = [img.getpixel((0,0)), img.getpixel((w-1,0)),
               img.getpixel((0,h-1)), img.getpixel((w-1,h-1))]
    r = sum(c[0] for c in corners)//4
    g = sum(c[1] for c in corners)//4
    b = sum(c[2] for c in corners)//4
    return (r, g, b, 255)

def trim_border(img):
    """Rimuove il bordo bianco/grigio attorno all'icona."""
    bg = get_bg_color(img)
    # Trova i pixel non-sfondo
    data = img.load()
    w, h = img.size
    tolerance = 30

    def is_bg(px):
        return all(abs(int(px[i]) - int(bg[i])) < tolerance for i in range(3))

    left, right, top, bottom = w, 0, h, 0
    for y in range(h):
        for x in range(w):
            if not is_bg(data[x, y]):
                left   = min(left, x)
                right  = max(right, x)
                top    = min(top, y)
                bottom = max(bottom, y)

    padding = 5
    left   = max(0, left - padding)
    top    = max(0, top - padding)
    right  = min(w, right + padding)
    bottom = min(h, bottom + padding)

    return img.crop((left, top, right, bottom))

def make_square_bg(img, size, bg_color):
    """Mette l'immagine su sfondo piatto quadrato, riempiendo tutto."""
    result = Image.new('RGBA', (size, size), bg_color)
    # Scala l'img per riempire tutto il quadrato
    img_square = img.resize((size, size), Image.LANCZOS)
    result.paste(img_square, (0, 0), img_square)
    return result

def detect_dominant_color(img):
    """Rileva il colore dominante (usato come sfondo Android)."""
    small = img.resize((50, 50)).convert('RGB')
    pixels = list(small.getdata())
    # Prendi la media dei pixel centrali (esclude bordi trasparenti)
    cx = [p for p in pixels if p[0] < 100 or p[1] < 100 or p[2] > 100]
    if not cx:
        return (59, 116, 200)  # fallback blu
    r = sum(p[0] for p in cx)//len(cx)
    g = sum(p[1] for p in cx)//len(cx)
    b = sum(p[2] for p in cx)//len(cx)
    return (r, g, b)

def save(img, name, size=None):
    if size:
        img = img.resize((size, size), Image.LANCZOS)
    out = img.convert('RGB') if name.endswith('.jpg') else img
    path = os.path.join(ASSETS, name)
    out.save(path, optimize=True)
    print(f"  ✓ {name} ({img.size[0]}x{img.size[1]})")

# --------------------------------------------------------------------------

print("\n🔧 Elaborazione icone Smemorandum...\n")

# --- ICON (app icon 1024x1024) ---
print("→ Elaboro icon_raw.png")
raw_icon = load('icon_raw.png')
trimmed  = trim_border(raw_icon)
bg_color = detect_dominant_color(trimmed) + (255,)
print(f"  Colore sfondo rilevato: rgb{bg_color[:3]}")

icon_1024 = make_square_bg(trimmed, 1024, bg_color)
save(icon_1024, 'icon.png')
save(icon_1024, 'favicon.png', size=48)

# --- ANDROID foreground (logo su trasparente) ---
fg = trimmed.resize((768, 768), Image.LANCZOS)   # 75% del quadrato 1024
android_fg = Image.new('RGBA', (1024, 1024), (0,0,0,0))
offset = (128, 128)  # centrato con margine
android_fg.paste(fg, offset, fg)
save(android_fg, 'android-icon-foreground.png')

# --- ANDROID background (sfondo pieno) ---
android_bg = Image.new('RGBA', (1024, 1024), bg_color)
save(android_bg, 'android-icon-background.png')

# --- ANDROID monochrome ---
mono = trimmed.convert('L').resize((768, 768), Image.LANCZOS)
mono_rgba = Image.new('RGBA', (1024, 1024), (0,0,0,0))
mono_layer = Image.new('RGBA', (768, 768), (255,255,255,255))
mono_layer.putalpha(mono)
mono_rgba.paste(mono_layer, (128, 128), mono_layer)
save(mono_rgba, 'android-icon-monochrome.png')

# --- SPLASH (512x512 logo su sfondo bianco) ---
print("\n→ Elaboro splash_raw.png")
raw_splash = load('splash_raw.png')

# Per la splash usiamo solo la parte centrale (il logo)
# Rileviamo e rittagliamo il bordo bianco
splash_trimmed = trim_border(raw_splash)
splash_512 = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
logo = splash_trimmed.resize((400, 400), Image.LANCZOS)
splash_512.paste(logo, (56, 56), logo)
save(splash_512, 'splash-icon.png')

print("\n✅ Tutte le icone elaborate con successo!")
print("   Verifica la cartella assets/ e poi esegui: expo start --web\n")

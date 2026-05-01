# Screenshots con caption overlay

Generati da `scripts/generate_screenshot_captions.py`.

- **Sorgente:** `../raw/*.png` (1170×2532 RGBA, iPhone 12)
- **Output:** `{locale}/*.png` (1170×2532 RGBA, stessa dimensione)
- **Caption data:** `../captions.json`

## Layout

```
┌──────────────────────┐ 0
│  gradient band 380px │  #6C63FF → #4A42D6
│  [TITOLO bold 76pt]  │
│  [sottotitolo 42pt]  │
├──────────────────────┤ 380
│                      │
│  screenshot letterbox│  scaled to fit, sidebar = #4A42D6
│                      │
└──────────────────────┘ 2532
```

## Locali disponibili

| Cartella | Lingua | Screenshot |
|----------|--------|-----------|
| `it/`    | Italiano | 8 |
| `en/`    | English  | 8 |
| `es/`    | Español  | 8 |
| `fr/`    | Français | 8 |
| `de/`    | Deutsch  | 8 |

## Step successivo

Upscale 1170→1290×2796 con `scripts/upscale_screenshots.py` (da creare)
oppure via [iloveimg.com](https://www.iloveimg.com/resize-image) → upload
la cartella `it/` per App Store Connect (bucket 6.7").

⚠️ `06-calendario.png` è da sostituire post 1 maggio (locale IT attivo).
Ri-scatta, sostituisci in `../raw/06-calendario.png` e riesegui lo script.

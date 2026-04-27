# Screenshot raw — Smemorandum

Cartella per i PNG nativi dell'iPhone prima dell'upscale.
Dimensione originale: **1170 × 2532 px** (iPhone 12, 6.1")
Formato richiesto App Store: **1290 × 2796 px** (6.7") → vedi `final/`

---

## Naming convention

| Nome file | Schermata | Note |
|-----------|-----------|------|
| `01-home.png` | Home screen | Greeting + sezione "Questa settimana" con eventi |
| `02-eventlist.png` | Lista eventi | Tab Eventi con filtri Tutti/Ricorrenze/Scadenze |
| `03-eventdetail-scadenza.png` | Dettaglio scadenza | "Revisione auto" con countdown e promemoria |
| `04-eventdetail-compleanno.png` | Dettaglio compleanno | Bottom con pulsanti WhatsApp e Condividi auguri |
| `05-whatsapp-auguri.png` | Modal auguri WhatsApp | 5 template di messaggi aperti |
| `06-calendario.png` | Calendario mensile | ⚠️ DA RIFARE dopo fix locale (deve dire "Aprile 2026" in IT) |
| `07-festivita.png` | Festività precaricate | Filtro Italia + lista Capodanno/San Valentino/... |
| `08-impostazioni-import.png` | Impostazioni | Voce "Importa compleanni dalla rubrica" visibile |

---

## Upscale → `final/`

Dopo aver caricato tutti i PNG qui, fare l'upscale a 1290 × 2796:

**Metodo rapido (online):**
1. Vai su [iloveimg.com/resize-image](https://www.iloveimg.com/resize-image)
2. Carica tutti i PNG
3. Resize by pixels: **1290 × 2796** — proporzioni: **disattivato**
4. Download ZIP → rinomina con gli stessi nomi e metti in `final/`

**Metodo qualità migliore (Waifu2x):**
1. [waifu2x.udp.jp](https://waifu2x.udp.jp/) — Noise: None, Scale: 1.5x
2. Output ~1755 × 3798 → ridimensiona a 1290 × 2796 con iloveimg
3. Salva in `final/`

---

## Upload App Store Connect

Usare i file da `final/` (non `raw/`).
Ordine upload: 01 → 02 → 03 → ... → 08
Device bucket: **iPhone 6.7" Display**

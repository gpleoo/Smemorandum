# Smemorandum — Roadmap

Lista delle cose da fare, in tre fasi. Spuntare `[x]` quando completato e
spostare nella sezione "✅ Completato" in fondo.

---

## 🔥 Fase 1 — Prerequisiti pubblicazione (BLOCKER App Store)

- [x] 1. Icona app finale 1024×1024 + varianti — `assets/icon.png` 1024×1024 RGBA, alpha 255 ovunque (zero trasparenza), angoli pieni. Conforme Apple.
- [~] 2. Screenshot App Store 6.7" e 6.5" — guida completa in `docs/screenshots-guide.md` con dati demo, checklist 5 screen, captions 5 lingue, flusso upscale iPhone 12 → 1290×2796. Manca solo scattare + upscalare + upload.
- [x] 3. Privacy policy online → **LIVE** su `https://gpleoo.github.io/Smemorandum/privacy-policy` (IT) + `/privacy-policy-en` (EN). GitHub Pages attivo da branch `main` /docs.
- [x] 4. Descrizione Store IT + EN con keyword ASO → vedi `APP_STORE.md`
- [x] 5. Email supporto attiva — `smemorandum.support@gmail.com` creata e attiva. Riferimenti aggiornati in 10 file (docs, APP_STORE, index.html, 5 locali i18n).
- [ ] 6. Test reale su iPhone fisico (primo avvio, importa contatti, festività, notifiche, tap-to-call)
- [x] 7. Fix titolo navigator "Settings ImportContacts" → tradotto
- [x] 8. Categoria App Store: Produttività + Stile di vita → Primary: Produttività / Secondary: Stile di vita (vedi `APP_STORE.md`)

## 🔎 Fase 1.5 — SEO, ASO & Deep Linking (pre-lancio, code-only)

Audit 2026-04-21: copertura attuale ~65% SEO, ~70% ASO. Base buona (JSON-LD SoftwareApplication + FAQ, meta OG/Twitter, metadata Store 5 lingue) ma mancano pezzi critici per "molto performante".

### 🔴 Priorità alta — BLOCKER SEO indicizzazione
- [ ] 31. **robots.txt + sitemap.xml** per GitHub Pages (`/docs/`). Senza, Google indicizza male la landing. Include URL canonici IT/EN + privacy policy + eventuali future sezioni.
- [ ] 32. **hreflang** sulla landing → `<link rel="alternate" hreflang="en" href="...">` + creare `docs/index-en.html` (o sottopath `/en/`) per targetizzare IT e EN separatamente su Google.
- [ ] 33. **Deep Linking iOS (Universal Links)** → `associated-domains` in `app.json` > `ios.infoPlist` + file `apple-app-site-association` in `docs/.well-known/`. Permette che cliccando un link `smemorandum.app/event/...` si apra l'app installata.
- [ ] 34. **Deep Linking Android (App Links)** → `intent-filters` in `app.json` > `android` + file `assetlinks.json` in `docs/.well-known/`. Stesso scopo, lato Android + verified.
- [ ] 35. **Schema URI custom** → `smemorandum://` definito in `app.json > scheme` per deep link interni (notifiche, share, widget tap).

### 🟡 Priorità media — Growth & installabilità
- [ ] 36. **PWA manifest + service worker** → `web/manifest.webmanifest` + SW minimale. Rende la web version installabile e offline-first.
- [ ] 37. **`apple-touch-icon` + `<link rel="icon">`** espliciti in `index.html` (oggi dipende solo da Expo default).
- [ ] 38. **Screenshot Store con caption overlay** — ora `docs/screenshots-guide.md` descrive i testi ma le immagini finali non li hanno sovrapposti. È il #2 fattore ranking App Store.
- [ ] 39. **Google Search Console verification** → meta tag `google-site-verification` in `index.html` per monitorare impressions/click.
- [ ] 40. **Google Play Store metadata** separato — oggi `store-metadata/` ha solo metadata App Store, Play Store ha requisiti diversi (short desc 80 char, full 4000, feature graphic 1024x500).

### 🟢 Nice to have — post-lancio
- [ ] 41. **Analytics privacy-friendly sulla landing** (Plausible o Simple Analytics, no cookie banner) per misurare conversioni click → download.
- [ ] 42. **Organization schema JSON-LD** in aggiunta a SoftwareApplication (name, logo, email, sameAs social profiles).
- [ ] 43. **Jekyll sitemap/SEO plugins** (`jekyll-seo-tag` + `jekyll-sitemap`) per auto-generazione se passiamo a build Jekyll completo.
- [ ] 44. **Bing Webmaster Tools verification** (meta `msvalidate.01`) — market minore ma zero-effort.

## 🚀 Fase 2 — Da fare prima del lancio (sprint 1–2 settimane)

- [x] 9. Onboarding 3 slide (illustrazioni + testo)
- [ ] 10. Widget iOS small + medium (prossimo evento + countdown)
- [x] 11. Share card auguri (genera immagine + condividi)
- [x] 12. Empty state illustrato (no icona generica)
- [~] 13. Sentry o Bugsnag (crash reporting) — scaffolding pronto, manca DSN + SDK vendor
- [ ] 14. Analytics base (PostHog / RevenueCat) — MAU, D7, conversion Premium
- [ ] 15. TestFlight beta 7–10 giorni con 10–20 tester
- [x] 16. Revisione i18n EN/ES/FR/DE da madrelingua o Claude

## 🌱 Fase 3 — Roadmap post-lancio (12 mesi)

### v1.1 "Cloud" — Mese 1–2
- [ ] 17. iCloud/CloudKit sync
- [ ] 18. Apple Watch complication
- [ ] 19. Auguri AI 1-tap (Claude API, 3 toni diversi)

### v1.2 "Family" — Mese 3–4 (più grosso growth lever)
- [ ] 20. Eventi condivisi coppia/famiglia
- [ ] 21. Apple Sign In + invito via link

### v1.3 "Gift" — Mese 5–6
- [ ] 22. Idee regalo + affiliate Amazon
- [ ] 23. App icon alternative Premium (4–5 varianti)
- [ ] 24. Suoneria custom upload Premium

### v1.4 "Home" — Mese 7–9
- [ ] 25. Preset scadenze casa/auto (revisione, bollo, assicurazione)
- [ ] 26. Categoria Animali + festività pet
- [ ] 27. Localizzazione PT-BR

### v1.5 "Ecosystem" — Mese 10–12
- [ ] 28. Web companion read-only (Next.js)
- [ ] 29. Calendar two-way sync con Apple Calendar
- [ ] 30. Localizzazione JA

### Continuo / sempre
- [ ] Rispondere a tutte le recensioni prime 4 settimane
- [ ] ASO mensile: 2 keyword nuove + misura ranking
- [ ] Push notification engagement (solo ricordi veri)
- [ ] 1 post Reddit/TikTok mensile

---

## ✅ Completato

- 2026-04-21 — **Ripeti avviso scadenze** (nuova feature): toggle per-reminder + intervallo (1/2/3/4/6h) che ripete la notifica fino a fine giornata (max 12 ripetizioni). Default globale attivabile in Impostazioni (auto-apply su reminder same-day delle scadenze). Badge 🔁 visibile su EventDetail. Logica scheduling estratta in funzione pura (`src/utils/reminderScheduling.ts`) con test case in `__tests__/`.
- 2026-04-21 — **Preset scadenze frequenti**: 12 template (bollette luce/gas/acqua, canone TV, RCA auto, bollo, revisione, assicurazione casa, IMU/TARI, abbonamento, visita medica, condominio) pre-compilano titolo + categoria + ricorrenza suggerita. Visibili come chip quando crei una nuova scadenza senza titolo. Localizzati in 5 lingue.


- 2026-04-19 — #9 Onboarding 3 slide con icone gradient (commit c01f420)
- 2026-04-19 — #11 Share card auguri snapshot + sheet OS (commit d1ebd7e)
- 2026-04-19 — #7 Titoli navigator tradotti (eventDetail/eventForm/premium/manageCategories/importContacts)
- 2026-04-19 — #12 Empty state Home con halo gradient + monogramma sparkle + CTA "Aggiungi il primo evento"
- 2026-04-19 — #16 Revisione i18n 5 locali: plurali i18next v4 su daysLeft/summaryToday/summaryNext/headlineSoon + fix stile IT/ES/DE (commit 03c578f)
- 2026-04-19 — #13 Scaffolding crash reporting: ErrorBoundary globale + crashReporting service + trigger debug (5 tap su versione in Impostazioni). Manca solo collegare SDK Sentry + DSN.
- 2026-04-19 — #4 + #8 Bozza App Store completa (`APP_STORE.md`): categoria, name/subtitle, keywords, descrizioni IT/EN, promo, release notes, checklist screenshot, privacy form, TestFlight welcome
- 2026-04-20 — #3 Privacy Policy IT + EN in `docs/` pronta per GitHub Pages (offline-first, permessi contatti/notifiche/calendario, AdMob consent, RevenueCat, GDPR diritti, CCPA). **URL live:** `https://gpleoo.github.io/Smemorandum/privacy-policy` (IT) + `/privacy-policy-en` (EN).
- 2026-04-20 — #5 Tutti i riferimenti email migrati da `giampietro.leonoro@gmail.com` a `smemorandum.support@gmail.com` in 10 file (docs, APP_STORE, index.html, 5 locali i18n). Account Gmail creato e attivo.
- 2026-04-20 — #2 (parziale) Guida screenshot `docs/screenshots-guide.md`: dati demo coerenti (Anna/Luca/Mario&Giulia), checklist 5 schermate, captions in IT/EN/ES/FR/DE, flusso upscale iPhone 12 (1170×2532) → 1290×2796 via Waifu2x/iloveimg/GIMP, upload App Store Connect. `eas.json` già configurato con profilo `preview` per TestFlight.
- 2026-04-20 — #1 Icona `assets/icon.png` verificata: 1024×1024 RGBA, alpha 255 ovunque (zero trasparenza), angoli pieni. Apple-compliant, pronta per upload App Store Connect.
- 2026-04-20 — #6 (parziale) Bug fix da test fisico iPhone 12:
  - **Calendario**: badge eventi visibili anche per mesi passati/futuri (finestra estesa ±12 mesi attorno al mese visibile in `CalendarScreen.tsx`), risolve ricorrenze annuali multi-anno.
  - **ImportContacts**: header non più troncato (flex:1 sul testo + flexShrink sul bottone), ora i contatti già importati sono ri-selezionabili per rimuoverli dall'app (bottone rosso "Rimuovi N" con conferma distruttiva).
  - **Settings**: switch "Riepilogo settimanale" non più tagliato (aggiunto `flex:1, marginRight` a `settingsRowLeft`).
  - **WhatsApp**: aggiunto `LSApplicationQueriesSchemes` in `app.json` (whatsapp, tel, telprompt, sms, mailto) per far riconoscere l'app a `canOpenURL`.
  - **Auguri templates**: usa solo nome proprio (helper `firstName` in `EventDetailScreen.tsx`, es. "Monica Amato" → "Monica") + rimosse slash gendered in IT/EN/ES/FR/DE (template 5: "il/la migliore" → "al top").

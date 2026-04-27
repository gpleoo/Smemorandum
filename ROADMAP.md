# Smemorandum — Roadmap

Lista delle cose da fare, in tre fasi. Spuntare `[x]` quando completato e
spostare nella sezione "✅ Completato" in fondo.

---

## 🔥 Fase 1 — Prerequisiti pubblicazione (BLOCKER App Store)

- [x] 1. Icona app finale 1024×1024 + varianti — `assets/icon.png` 1024×1024 RGBA, alpha 255 ovunque (zero trasparenza), angoli pieni. Conforme Apple.
- [~] 2. Screenshot App Store 6.7" e 6.5" — guida completa in `docs/screenshots-guide.md`. **7 raw screenshot catturati su iPhone fisico** (EventList, EventDetail scadenza, WhatsApp auguri modal, Calendario aprile, Festività precaricate, Impostazioni, EventDetail compleanno). **Da rifare/aggiungere:** (a) Home screen con sezione Oggi/Domani, (b) Importa contatti con lista+checkbox, (c) Calendario in italiano (device era in EN → "April 2026"). Poi upscale 1170→1290×2796 + upload App Store Connect.
- [x] 3. Privacy policy online → **LIVE** su `https://gpleoo.github.io/Smemorandum/privacy-policy` (IT) + `/privacy-policy-en` (EN). GitHub Pages attivo da branch `main` /docs.
- [x] 4. Descrizione Store IT + EN con keyword ASO → vedi `APP_STORE.md`
- [x] 5. Email supporto attiva — `smemorandum.support@gmail.com` creata e attiva. Riferimenti aggiornati in 10 file (docs, APP_STORE, index.html, 5 locali i18n).
- [ ] 6. Test reale su iPhone fisico (primo avvio, importa contatti, festività, notifiche, tap-to-call)
- [x] 7. Fix titolo navigator "Settings ImportContacts" → tradotto
- [x] 8. Categoria App Store: Produttività + Stile di vita → Primary: Produttività / Secondary: Stile di vita (vedi `APP_STORE.md`)

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
- 2026-04-27 — #2 (avanzamento) 7 raw screenshot catturati su iPhone fisico: EventList, EventDetail-scadenza, WhatsApp-auguri-modal, Calendario, Festività-precaricate, Impostazioni, EventDetail-compleanno. Da completare: Home screen, Importa-contatti screen, ri-scattare Calendario con device in IT (era in EN). Poi upscale + upload.
- 2026-04-20 — #1 Icona `assets/icon.png` verificata: 1024×1024 RGBA, alpha 255 ovunque (zero trasparenza), angoli pieni. Apple-compliant, pronta per upload App Store Connect.
- 2026-04-20 — #6 (parziale) Bug fix da test fisico iPhone 12:
  - **Calendario**: badge eventi visibili anche per mesi passati/futuri (finestra estesa ±12 mesi attorno al mese visibile in `CalendarScreen.tsx`), risolve ricorrenze annuali multi-anno.
  - **ImportContacts**: header non più troncato (flex:1 sul testo + flexShrink sul bottone), ora i contatti già importati sono ri-selezionabili per rimuoverli dall'app (bottone rosso "Rimuovi N" con conferma distruttiva).
  - **Settings**: switch "Riepilogo settimanale" non più tagliato (aggiunto `flex:1, marginRight` a `settingsRowLeft`).
  - **WhatsApp**: aggiunto `LSApplicationQueriesSchemes` in `app.json` (whatsapp, tel, telprompt, sms, mailto) per far riconoscere l'app a `canOpenURL`.
  - **Auguri templates**: usa solo nome proprio (helper `firstName` in `EventDetailScreen.tsx`, es. "Monica Amato" → "Monica") + rimosse slash gendered in IT/EN/ES/FR/DE (template 5: "il/la migliore" → "al top").

# App Store Connect — testi pronti per la pubblicazione

Bozza pronta da copiare/incollare in App Store Connect. Rispetta i limiti di
caratteri (iOS): Name 30, Subtitle 30, Keywords 100, Promo 170,
Description 4000. Rivedi tono/CTA prima di pubblicare.

---

## 1. Categoria

- **Primary:** Produttività (Productivity)
- **Secondary:** Stile di vita (Lifestyle)

Motivazione: l'app risolve un bisogno organizzativo ricorrente (promemoria,
scadenze, compleanni). La categoria Produttività ha meno competitor diretti
rispetto a "Utility" e un CPI medio più alto sulla keyword "promemoria".

---

## 2. App Name + Subtitle

### Italiano
- **Name (30):** `Smemorandum: Promemoria`
- **Subtitle (30):** `Compleanni & scadenze smart`

### English
- **Name (30):** `Smemorandum: Reminders`
- **Subtitle (30):** `Birthdays & deadlines made easy`

---

## 3. Keywords (100 caratteri, separate da virgola, NO spazi dopo virgola)

### Italiano
```
promemoria,compleanni,scadenze,agenda,calendario,ricorrenze,festività,onomastici,notifiche
```
(99 caratteri — verifica dopo edit)

### English
```
reminders,birthdays,deadlines,agenda,calendar,anniversary,holidays,namedays,notifications
```
(90 caratteri)

Note:
- NON ripetere parole già in Name/Subtitle (iOS le indicizza comunque)
- Evita plurali + singolari ("compleanno" + "compleanni"): Apple li
  indicizza insieme
- Ciclo ASO: cambia 2 keyword al mese nei primi 3 mesi e misura ranking
  (AppFigures, Sensor Tower free)

---

## 4. Promotional Text (170 caratteri, editabile senza review)

### Italiano
```
Non dimenticare più un compleanno o una scadenza. Importa dalla rubrica,
scegli le festività del tuo paese e ricevi promemoria sonori personalizzati.
```

### English
```
Never miss a birthday or deadline again. Import from contacts, pick your
country's holidays and get personalized sound reminders — all on-device.
```

---

## 5. Description (IT, max 4000 caratteri)

```
Smemorandum è l'agenda intelligente che ti ricorda tutto quello che conta:
compleanni, anniversari, scadenze, festività e ricorrenze personali.

Tutto sul tuo dispositivo: nessun account, nessun server, nessun dato
condiviso. I tuoi ricordi restano tuoi.

■ PERCHÉ SMEMORANDUM

• Importa i compleanni direttamente dalla rubrica iPhone con un tap
• Festività precaricate per paese e tradizione (cattolica, laica, ebraica,
  islamica, protestante)
• Promemoria personalizzabili: stesso giorno, giorno prima, settimana
  prima, fino a N giorni prima
• Suoni di notifica distinti per ogni categoria
• Calendario visuale con badge colorati per compleanni, ricorrenze e
  scadenze
• Manda gli auguri su WhatsApp con un tap
• Condividi una card augurale personalizzata sui social
• Tema chiaro, scuro e automatico
• Interfaccia in italiano, inglese, spagnolo, francese, tedesco

■ PERFETTO PER

• Chi vuole ricordare i compleanni di famiglia e amici senza essere
  dipendente da Facebook
• Chi gestisce scadenze di bollette, rinnovi auto, assicurazioni
• Chi segue festività religiose o civili specifiche del proprio paese
• Chiunque apprezzi app semplici, italiane, senza tracciamento

■ PREMIUM (opzionale)

• Categorie illimitate (gratis: massimo 3)
• Promemoria multipli per evento
• Tutti i suoni di notifica
• Zero pubblicità, per sempre
• Backup e ripristino illimitati
• Pacchetti festività di tutti i paesi e religioni

■ PRIVACY FIRST

Smemorandum non raccoglie dati personali. Tutti i tuoi eventi sono salvati
solo sul tuo iPhone. Gli annunci per gli utenti gratuiti possono essere
anonimi o personalizzati (scegli tu nelle Impostazioni).

Sviluppato in Italia da un indie developer.
Feedback, bug e richieste: smemorandum.support@gmail.com
```

---

## 6. Description (EN, max 4000 caratteri)

```
Smemorandum is the smart reminder app that keeps track of everything that
matters: birthdays, anniversaries, deadlines, holidays and personal
recurrences.

All on-device: no account, no cloud, no data shared. Your memories stay
yours.

■ WHY SMEMORANDUM

• Import birthdays directly from your iPhone contacts with one tap
• Pre-loaded holidays by country and tradition (catholic, secular,
  jewish, islamic, protestant)
• Flexible reminders: same day, day before, week before, up to N days
  before
• Distinct notification sounds per category
• Visual calendar with colored badges for birthdays, recurrences and
  deadlines
• Send birthday wishes on WhatsApp with one tap
• Share a personalized birthday card to social media
• Light, dark and automatic themes
• Available in Italian, English, Spanish, French, German

■ PERFECT FOR

• People who want to remember family and friends' birthdays without
  relying on Facebook
• Anyone managing bill due dates, car renewals, insurance deadlines
• Those who follow religious or civil holidays specific to their country
• Anyone who values simple, privacy-friendly apps

■ PREMIUM (optional)

• Unlimited categories (free: up to 3)
• Multiple reminders per event
• All notification sounds
• Zero ads, forever
• Unlimited backup and restore
• Holiday packs for all countries and religions

■ PRIVACY FIRST

Smemorandum does not collect personal data. All your events are stored on
your iPhone only. Ads for free users can be anonymous or personalized
(your choice in Settings).

Built in Italy by an indie developer.
Feedback, bugs, requests: smemorandum.support@gmail.com
```

---

## 7. What's New (release notes v1.0.0)

### Italiano
```
Benvenuto in Smemorandum!
• Importa compleanni dalla rubrica
• Festività precaricate per 5+ paesi
• Promemoria sonori personalizzabili
• Condividi auguri con una card
• Calendario visuale e statistiche
• Temi chiaro/scuro, 5 lingue
```

### English
```
Welcome to Smemorandum!
• Import birthdays from contacts
• Preloaded holidays for 5+ countries
• Personalized sound reminders
• Share wishes with a birthday card
• Visual calendar and stats
• Light/dark themes, 5 languages
```

---

## 8. Content Rating (Age Rating)

Tutti gli item sul questionario App Store Connect → **None**. Risultato atteso: **4+**.

---

## 9. Screenshots suggeriti (5 per 6.7" + 5 per 6.5")

Ordine consigliato (primi 3 sono decisivi in App Store search result):

1. **Home con eventi + hero message** — greeting + "Prossimo: ..." + lista oggi/settimana
2. **Dettaglio compleanno + CTA "Condividi auguri"** — mostra la card generata
3. **Calendario mensile** con badge colorati
4. **Festività pre-caricate** — schermata HolidayTemplates con filtri paese
5. **Importa contatti** — lista con checkbox + counter "N compleanni pronti"

Per ogni screenshot aggiungi overlay testuale (es. via Fastlane Screengrab o
manualmente): titolo di 3-4 parole + sottotitolo di 6-8 parole. Stile font
Inter bold, sfondo gradient primary→secondary.

---

## 10. Privacy / Data Collection Form (App Store Connect)

- **Data Types collected:** `None` (tutto on-device)
- **Tracking:** `No` (nessun IDFA, AdMob usa solo il DSID anonimo se
  l'utente ha scelto annunci personalizzati)
- Se attivi AdMob in produzione: dichiarare `Advertising Data` →
  `Third-Party Advertising` ma **senza tracking cross-app**

---

## 11. TestFlight beta — note di benvenuto (400 caratteri)

### Italiano
```
Grazie per testare Smemorandum! Prova a:
1) Importare i compleanni dalla rubrica (Impostazioni > Dati)
2) Aggiungere le festività del tuo paese
3) Creare un compleanno e usare "Condividi auguri"
4) Rimanere aperto la app e aspettare una notifica

Segnala bug a smemorandum.support@gmail.com — grazie!
```

---

## Checklist pre-submit

- [ ] Icona 1024×1024 senza trasparenza, no rounded corners (Apple li aggiunge)
- [ ] 5 screenshot 6.7" (iPhone 15/16 Pro Max) + 5 screenshot 6.5" (iPhone 11 Pro Max)
- [ ] Privacy Policy URL accessibile (GitHub Pages / Notion public)
- [ ] Support URL (mailto: è accettato ma GitHub Issues è meglio)
- [ ] Marketing URL (opzionale, può essere il repo o una landing page)
- [ ] Demo account (non serve — app offline)
- [ ] Review notes: "Questa app è completamente offline. Non richiede
  account. AdMob è attivo solo in build di produzione."

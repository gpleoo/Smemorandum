# Google Play Store metadata

Separate from `store-metadata/{it,en,...}/store-listing.json` (App Store iOS)
because Google Play has different limits and assets.

## Limits per locale

| Field             | Max chars |
|-------------------|-----------|
| Title             | 30        |
| Short description | 80        |
| Full description  | 4000      |
| Promo text        | 170       |
| Release notes     | 500       |

## Required graphic assets

| Asset                | Spec                                       |
|----------------------|--------------------------------------------|
| App icon             | 512×512 PNG, 32-bit, alpha                 |
| Feature graphic      | 1024×500 PNG/JPG, **no transparency**      |
| Phone screenshots    | min 2, max 8 — min 320px, max 3840px       |
| 7" tablet screens    | optional                                   |
| 10" tablet screens   | optional                                   |
| Promo video (YT URL) | optional, recommended for ranking          |

> **Feature graphic** is the #1 factor for Google Play CTR. It is shown at the
> top of the listing on mobile + featured collections. Plan: same gradient as
> app hero (`#6C63FF → #5A52D5`) + tagline "Mai più dimenticato".

## TODO before publishing

- [ ] Create feature graphic 1024×500 (`assets/store/feature-graphic.png`)
- [ ] Generate phone screenshots from `docs/screenshots-guide.md` flow
  (Google Play accepts the same captions as App Store; resize OK)
- [ ] Add localized listings for `fr`, `de`, `es` (copy IT structure)
- [ ] Set up Play Console → App content → Privacy Policy URL =
      `https://gpleoo.github.io/Smemorandum/privacy-policy`
- [ ] Data safety form (analogous to Apple privacy nutrition labels)
- [ ] Content rating (IARC questionnaire) → expect "Everyone / PEGI 3"

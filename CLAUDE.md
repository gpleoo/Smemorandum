# Smemorandum

React Native / Expo app for managing reminders and recurring events. Targets iOS and Android; a minimal web build exists for development only.

## Stack

- **Framework**: Expo SDK 52, React Native 0.76
- **Navigation**: React Navigation v7 (bottom tabs + native stacks)
- **Storage**: AsyncStorage (events, categories, settings)
- **Notifications**: expo-notifications
- **Purchases**: react-native-purchases (RevenueCat)
- **Ads**: react-native-google-mobile-ads
- **i18n**: i18next (it, en, fr, de, es)
- **Build/deploy**: EAS Build + EAS Submit

## Project structure

```
src/
  models/types.ts          # All shared TypeScript types (SEvent, Category, AppSettings, …)
  context/                 # React contexts: EventContext, PremiumContext, TutorialContext
  screens/                 # One file per screen
  components/              # Shared UI components
  services/                # Side-effect services (notifications, purchases, ads, backup, …)
  storage/                 # AsyncStorage helpers (eventStorage.ts, settingsStorage.ts)
  hooks/                   # Custom hooks (useEvents, useCategories)
  utils/                   # Pure helpers (dateUtils, recurrenceEngine, reminderScheduling, …)
  i18n/                    # Translation JSON files
  theme/                   # Colors, spacing, typography, ThemeContext
  navigation/              # AppNavigator (tabs + stacks)
data/                      # Static data (nameDays, holidayTemplates)
targets/                   # Native extension targets (widgets, etc.)
widget/                    # Widget source
specs/                     # Codegen specs
scripts/                   # Utility scripts (icon processing, screenshot captions)
```

## Key domain types

- `SEvent` – a single event/reminder with title, date, recurrence, reminders[], categoryId, soundId, timeCapsula
- `RecurrenceRule` – `none | yearly | monthly | weekly | custom`
- `Reminder` – daysBefore + time + optional repeat (hourly)
- `Category` – id, name, color (hex), icon (Ionicons name)
- `AppSettings` – language, theme, colorTheme, holidayCountries, holidayTraditions, …

## Build profiles (eas.json)

| Profile | Distribution | Notes |
|---------|-------------|-------|
| development | internal | APK / device |
| preview | internal | APK / device, OTA channel `preview` |
| staging | store | AAB, all-premium override, channel `staging` |
| production | store | AAB, channel `production` |

## Common commands

```bash
expo start              # Start dev server
expo start --ios        # Open in iOS simulator
expo start --android    # Open in Android emulator
eas build -p ios --profile preview
eas build -p android --profile preview
eas submit -p ios --profile production
```

## Bundle identifiers

- iOS: `com.gpleoo.smemorandum`
- Android: `com.gpleoo.smemorandum`

## i18n

All user-facing strings go through `i18next`. Translation files are in `src/i18n/{locale}.json`. The primary locale is Italian (`it`). Always add keys to all locale files when adding new strings.

## Notifications

Notification channels, categories (with quick-action buttons), and scheduling logic live in `src/services/notificationService.ts`. Sound files must be bundled in `assets/sounds/` and referenced in `app.json` under `ios.infoPlist` / `android`.

## Recurrence engine

`src/utils/recurrenceEngine.ts` computes all occurrences of a recurring event within a date range. `src/utils/reminderScheduling.ts` converts reminders into concrete notification trigger dates.

## Premium / ads

- Premium status managed via RevenueCat (`purchaseService.native.ts` / `.web.ts`)
- `EXPO_PUBLIC_ALL_PREMIUM=true` overrides premium check in staging builds
- Ads via AdMob (`adService.native.ts` / `.web.ts`); no-op on web

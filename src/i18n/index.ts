import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import it from './it.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';

const resources = {
  it: { translation: it },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'it';
const supportedLanguage = Object.keys(resources).includes(deviceLanguage)
  ? deviceLanguage
  : 'it';

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: 'it',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;

import { HolidayTradition } from '../models/types';

export type HolidayRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'easter'; offsetDays: number }
  | { type: 'nth-weekday'; month: number; weekday: number; nth: number }
  | { type: 'last-weekday'; month: number; weekday: number };

export interface HolidayTemplate {
  id: string;
  icon: string;
  /** Name in each supported language; falls back to 'en' then 'it' */
  names: { it: string; en: string; es: string; fr: string; de: string };
  rule: HolidayRule;
  countries: string[];
  traditions: HolidayTradition[];
  /** Date shifts each year (lunar calendar) — user should verify */
  approximate?: boolean;
}

export const HOLIDAY_TEMPLATES: HolidayTemplate[] = [
  // ─── ITALY SECULAR ─────────────────────────────────────────────────────────
  {
    id: 'it-capodanno',
    icon: '🎊',
    names: { it: 'Capodanno', en: "New Year's Day", es: 'Año Nuevo', fr: "Jour de l'An", de: 'Neujahr' },
    rule: { type: 'fixed', month: 1, day: 1 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular', 'catholic', 'protestant'],
  },
  {
    id: 'it-liberazione',
    icon: '🇮🇹',
    names: { it: 'Festa della Liberazione', en: 'Liberation Day (Italy)', es: 'Día de la Liberación (Italia)', fr: 'Fête de la Libération (Italie)', de: 'Befreiungstag (Italien)' },
    rule: { type: 'fixed', month: 4, day: 25 },
    countries: ['IT'],
    traditions: ['secular'],
  },
  {
    id: 'it-lavoro',
    icon: '🔨',
    names: { it: 'Festa del Lavoro', en: "International Workers' Day", es: 'Día del Trabajo', fr: 'Fête du Travail', de: 'Tag der Arbeit' },
    rule: { type: 'fixed', month: 5, day: 1 },
    countries: ['IT', 'ES', 'FR', 'DE'],
    traditions: ['secular'],
  },
  {
    id: 'it-repubblica',
    icon: '🇮🇹',
    names: { it: 'Festa della Repubblica', en: 'Republic Day (Italy)', es: 'Día de la República (Italia)', fr: 'Fête de la République (Italie)', de: 'Tag der Republik (Italien)' },
    rule: { type: 'fixed', month: 6, day: 2 },
    countries: ['IT'],
    traditions: ['secular'],
  },
  {
    id: 'it-ferragosto',
    icon: '☀️',
    names: { it: 'Ferragosto', en: 'Ferragosto (Italy)', es: 'Ferragosto (Italia)', fr: 'Ferragosto (Italie)', de: 'Ferragosto (Italien)' },
    rule: { type: 'fixed', month: 8, day: 15 },
    countries: ['IT'],
    traditions: ['secular', 'catholic'],
  },
  {
    id: 'it-natale',
    icon: '🎄',
    names: { it: 'Natale', en: 'Christmas', es: 'Navidad', fr: 'Noël', de: 'Weihnachten' },
    rule: { type: 'fixed', month: 12, day: 25 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular', 'catholic', 'protestant'],
  },

  // ─── ITALY CATHOLIC ────────────────────────────────────────────────────────
  {
    id: 'it-befana',
    icon: '🧙‍♀️',
    names: { it: 'Epifania / Befana', en: 'Epiphany', es: 'Reyes Magos / Epifanía', fr: 'Épiphanie', de: 'Heilige Drei Könige' },
    rule: { type: 'fixed', month: 1, day: 6 },
    countries: ['IT', 'ES', 'FR', 'DE'],
    traditions: ['catholic', 'protestant'],
  },
  {
    id: 'it-sanvalentino',
    icon: '❤️',
    names: { it: 'San Valentino', en: "Valentine's Day", es: 'San Valentín', fr: 'Saint-Valentin', de: 'Valentinstag' },
    rule: { type: 'fixed', month: 2, day: 14 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular', 'catholic', 'protestant'],
  },
  {
    id: 'it-pasqua',
    icon: '🐣',
    names: { it: 'Pasqua', en: 'Easter Sunday', es: 'Pascua', fr: 'Pâques', de: 'Ostersonntag' },
    rule: { type: 'easter', offsetDays: 0 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['catholic', 'protestant'],
  },
  {
    id: 'it-pasquetta',
    icon: '🐣',
    names: { it: 'Pasquetta', en: 'Easter Monday', es: 'Lunes de Pascua', fr: 'Lundi de Pâques', de: 'Ostermontag' },
    rule: { type: 'easter', offsetDays: 1 },
    countries: ['IT', 'DE', 'FR'],
    traditions: ['catholic', 'protestant'],
  },
  {
    id: 'it-ognissanti',
    icon: '🕯️',
    names: { it: 'Ognissanti', en: "All Saints' Day", es: 'Todos los Santos', fr: 'Toussaint', de: 'Allerheiligen' },
    rule: { type: 'fixed', month: 11, day: 1 },
    countries: ['IT', 'ES', 'FR', 'DE'],
    traditions: ['catholic'],
  },
  {
    id: 'it-immacolata',
    icon: '💐',
    names: { it: 'Immacolata Concezione', en: 'Immaculate Conception', es: 'Inmaculada Concepción', fr: 'Immaculée Conception', de: 'Mariä Empfängnis' },
    rule: { type: 'fixed', month: 12, day: 8 },
    countries: ['IT', 'ES', 'DE'],
    traditions: ['catholic'],
  },
  {
    id: 'it-stefano',
    icon: '🎁',
    names: { it: 'Santo Stefano', en: "St. Stephen's Day", es: 'San Esteban', fr: 'Saint-Étienne', de: '2. Weihnachtstag' },
    rule: { type: 'fixed', month: 12, day: 26 },
    countries: ['IT', 'DE'],
    traditions: ['catholic', 'protestant'],
  },

  // ─── USA SECULAR ──────────────────────────────────────────────────────────
  {
    id: 'us-stpatrick',
    icon: '🍀',
    names: { it: "San Patrizio", en: "St. Patrick's Day", es: 'San Patricio', fr: 'Saint-Patrick', de: 'St. Patrick' },
    rule: { type: 'fixed', month: 3, day: 17 },
    countries: ['US'],
    traditions: ['secular'],
  },
  {
    id: 'us-memorial',
    icon: '🇺🇸',
    names: { it: 'Memorial Day (USA)', en: 'Memorial Day', es: 'Día de los Caídos (EE.UU.)', fr: 'Memorial Day (USA)', de: 'Memorial Day (USA)' },
    rule: { type: 'last-weekday', month: 5, weekday: 1 },
    countries: ['US'],
    traditions: ['secular'],
  },
  {
    id: 'us-independence',
    icon: '🎆',
    names: { it: 'Festa Nazionale USA', en: 'Independence Day', es: 'Día de la Independencia (EE.UU.)', fr: "Fête de l'Indépendance (USA)", de: 'Unabhängigkeitstag (USA)' },
    rule: { type: 'fixed', month: 7, day: 4 },
    countries: ['US'],
    traditions: ['secular'],
  },
  {
    id: 'us-labor',
    icon: '👷',
    names: { it: 'Labor Day (USA)', en: 'Labor Day', es: 'Día del Trabajo (EE.UU.)', fr: 'Fête du Travail (USA)', de: 'Labor Day (USA)' },
    rule: { type: 'nth-weekday', month: 9, weekday: 1, nth: 1 },
    countries: ['US'],
    traditions: ['secular'],
  },
  {
    id: 'us-halloween',
    icon: '🎃',
    names: { it: 'Halloween', en: 'Halloween', es: 'Halloween', fr: 'Halloween', de: 'Halloween' },
    rule: { type: 'fixed', month: 10, day: 31 },
    countries: ['US', 'IT', 'ES', 'FR', 'DE'],
    traditions: ['secular'],
  },
  {
    id: 'us-thanksgiving',
    icon: '🦃',
    names: { it: 'Thanksgiving (USA)', en: 'Thanksgiving', es: 'Día de Acción de Gracias', fr: 'Thanksgiving (USA)', de: 'Thanksgiving (USA)' },
    rule: { type: 'nth-weekday', month: 11, weekday: 4, nth: 4 },
    countries: ['US'],
    traditions: ['secular'],
  },

  // ─── USA PROTESTANT ────────────────────────────────────────────────────────
  {
    id: 'us-goodfriday',
    icon: '✝️',
    names: { it: 'Venerdì Santo', en: 'Good Friday', es: 'Viernes Santo', fr: 'Vendredi Saint', de: 'Karfreitag' },
    rule: { type: 'easter', offsetDays: -2 },
    countries: ['US', 'IT', 'ES', 'FR', 'DE'],
    traditions: ['catholic', 'protestant'],
  },

  // ─── SPAIN SECULAR ────────────────────────────────────────────────────────
  {
    id: 'es-hispanidad',
    icon: '🇪🇸',
    names: { it: 'Giornata Hispanidad (Spagna)', en: 'Hispanic Day (Spain)', es: 'Día de la Hispanidad', fr: 'Fête Nationale (Espagne)', de: 'Hispanidad-Tag (Spanien)' },
    rule: { type: 'fixed', month: 10, day: 12 },
    countries: ['ES'],
    traditions: ['secular'],
  },
  {
    id: 'es-constitucion',
    icon: '📜',
    names: { it: 'Giorno della Costituzione (Spagna)', en: 'Constitution Day (Spain)', es: 'Día de la Constitución', fr: 'Jour de la Constitution (Espagne)', de: 'Verfassungstag (Spanien)' },
    rule: { type: 'fixed', month: 12, day: 6 },
    countries: ['ES'],
    traditions: ['secular'],
  },

  // ─── SPAIN CATHOLIC ────────────────────────────────────────────────────────
  {
    id: 'es-viernesanto',
    icon: '✝️',
    names: { it: 'Venerdì Santo', en: 'Good Friday', es: 'Viernes Santo', fr: 'Vendredi Saint', de: 'Karfreitag' },
    rule: { type: 'easter', offsetDays: -2 },
    countries: ['ES'],
    traditions: ['catholic'],
  },

  // ─── FRANCE SECULAR ────────────────────────────────────────────────────────
  {
    id: 'fr-victoire',
    icon: '🕊️',
    names: { it: 'Vittoria 1945 (Francia)', en: 'Victory in Europe Day (France)', es: 'Victoria 1945 (Francia)', fr: 'Victoire du 8 mai 1945', de: 'Tag des Sieges 1945 (Frankreich)' },
    rule: { type: 'fixed', month: 5, day: 8 },
    countries: ['FR'],
    traditions: ['secular'],
  },
  {
    id: 'fr-nationale',
    icon: '🎆',
    names: { it: 'Festa Nazionale Francese', en: 'Bastille Day', es: 'Día Nacional Francés', fr: 'Fête Nationale', de: 'Nationalfeiertag Frankreich' },
    rule: { type: 'fixed', month: 7, day: 14 },
    countries: ['FR'],
    traditions: ['secular'],
  },
  {
    id: 'fr-armistice',
    icon: '🕊️',
    names: { it: "Armistizio 1918 (Francia)", en: 'Armistice Day (France)', es: 'Armisticio (Francia)', fr: 'Armistice', de: 'Waffenstillstand 1918 (Frankreich)' },
    rule: { type: 'fixed', month: 11, day: 11 },
    countries: ['FR'],
    traditions: ['secular'],
  },

  // ─── FRANCE CATHOLIC ───────────────────────────────────────────────────────
  {
    id: 'fr-ascension',
    icon: '✝️',
    names: { it: 'Ascensione', en: 'Ascension Day', es: 'Día de la Ascensión', fr: 'Ascension', de: 'Christi Himmelfahrt' },
    rule: { type: 'easter', offsetDays: 39 },
    countries: ['FR', 'DE', 'IT'],
    traditions: ['catholic', 'protestant'],
  },
  {
    id: 'fr-pentecote',
    icon: '🕊️',
    names: { it: 'Pentecoste', en: 'Whit Monday', es: 'Pentecostés', fr: 'Lundi de Pentecôte', de: 'Pfingstmontag' },
    rule: { type: 'easter', offsetDays: 50 },
    countries: ['FR', 'DE'],
    traditions: ['catholic', 'protestant'],
  },
  {
    id: 'fr-assomption',
    icon: '💐',
    names: { it: 'Assunzione di Maria', en: 'Assumption of Mary', es: 'Asunción de María', fr: 'Assomption', de: 'Mariä Himmelfahrt' },
    rule: { type: 'fixed', month: 8, day: 15 },
    countries: ['FR', 'DE', 'ES'],
    traditions: ['catholic'],
  },

  // ─── GERMANY SECULAR ───────────────────────────────────────────────────────
  {
    id: 'de-einheit',
    icon: '🇩🇪',
    names: { it: 'Giorno Unità Tedesca', en: 'German Unity Day', es: 'Día de la Unidad Alemana', fr: "Jour de l'Unité Allemande", de: 'Tag der Deutschen Einheit' },
    rule: { type: 'fixed', month: 10, day: 3 },
    countries: ['DE'],
    traditions: ['secular'],
  },

  // ─── GERMANY PROTESTANT ────────────────────────────────────────────────────
  {
    id: 'de-reformation',
    icon: '✝️',
    names: { it: 'Giorno della Riforma (Germania)', en: 'Reformation Day', es: 'Día de la Reforma (Alemania)', fr: 'Jour de la Réforme (Allemagne)', de: 'Reformationstag' },
    rule: { type: 'fixed', month: 10, day: 31 },
    countries: ['DE'],
    traditions: ['protestant'],
  },

  // ─── GERMANY CATHOLIC ──────────────────────────────────────────────────────
  {
    id: 'de-fronleichnam',
    icon: '🙏',
    names: { it: 'Corpus Domini', en: 'Corpus Christi', es: 'Corpus Christi', fr: 'Fête-Dieu', de: 'Fronleichnam' },
    rule: { type: 'easter', offsetDays: 60 },
    countries: ['DE', 'ES'],
    traditions: ['catholic'],
  },

  // ─── INTERNATIONAL SECULAR ─────────────────────────────────────────────────
  {
    id: 'intl-womensday',
    icon: '♀️',
    names: { it: 'Festa della Donna', en: "International Women's Day", es: 'Día Internacional de la Mujer', fr: 'Journée internationale des femmes', de: 'Internationaler Frauentag' },
    rule: { type: 'fixed', month: 3, day: 8 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular'],
  },
  {
    id: 'intl-earth',
    icon: '🌍',
    names: { it: 'Giornata della Terra', en: 'Earth Day', es: 'Día de la Tierra', fr: 'Jour de la Terre', de: 'Tag der Erde' },
    rule: { type: 'fixed', month: 4, day: 22 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular'],
  },
  {
    id: 'intl-fathers',
    icon: '👨',
    names: { it: 'Festa del Papà', en: "Father's Day", es: 'Día del Padre', fr: 'Fête des Pères', de: 'Vatertag' },
    rule: { type: 'nth-weekday', month: 6, weekday: 0, nth: 3 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular'],
  },
  {
    id: 'intl-mothers',
    icon: '👩',
    names: { it: 'Festa della Mamma', en: "Mother's Day", es: 'Día de la Madre', fr: 'Fête des Mères', de: 'Muttertag' },
    rule: { type: 'nth-weekday', month: 5, weekday: 0, nth: 2 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['secular'],
  },

  // ─── JEWISH ────────────────────────────────────────────────────────────────
  {
    id: 'jewish-purim',
    icon: '🎭',
    names: { it: 'Purim', en: 'Purim', es: 'Purim', fr: 'Pourim', de: 'Purim' },
    rule: { type: 'fixed', month: 3, day: 13 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },
  {
    id: 'jewish-pesach',
    icon: '🍞',
    names: { it: 'Pesach (Pasqua Ebraica)', en: 'Passover (Pesach)', es: 'Pésaj', fr: 'Pessah', de: 'Pessach' },
    rule: { type: 'fixed', month: 4, day: 12 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },
  {
    id: 'jewish-shavuot',
    icon: '📜',
    names: { it: 'Shavuot', en: 'Shavuot', es: 'Shavuot', fr: 'Shavouot', de: 'Schawuot' },
    rule: { type: 'fixed', month: 6, day: 1 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },
  {
    id: 'jewish-roshhashanah',
    icon: '🍎',
    names: { it: 'Rosh Hashanah (Capodanno Ebraico)', en: 'Rosh Hashanah', es: 'Rosh Hashaná', fr: 'Roch Hachana', de: 'Rosch haSchana' },
    rule: { type: 'fixed', month: 9, day: 11 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },
  {
    id: 'jewish-yomkippur',
    icon: '🕍',
    names: { it: 'Yom Kippur', en: 'Yom Kippur', es: 'Yom Kipur', fr: 'Yom Kippour', de: 'Jom Kippur' },
    rule: { type: 'fixed', month: 9, day: 20 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },
  {
    id: 'jewish-hanukkah',
    icon: '🕎',
    names: { it: 'Hanukkah', en: 'Hanukkah', es: 'Janucá', fr: 'Hanoukka', de: 'Chanukka' },
    rule: { type: 'fixed', month: 12, day: 4 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['jewish'],
    approximate: true,
  },

  // ─── ISLAMIC ───────────────────────────────────────────────────────────────
  {
    id: 'islamic-ramadan',
    icon: '🌙',
    names: { it: 'Inizio Ramadan', en: 'Start of Ramadan', es: 'Inicio del Ramadán', fr: 'Début du Ramadan', de: 'Beginn des Ramadan' },
    rule: { type: 'fixed', month: 2, day: 18 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['islamic'],
    approximate: true,
  },
  {
    id: 'islamic-eidalfitr',
    icon: '🌙',
    names: { it: 'Eid al-Fitr', en: 'Eid al-Fitr', es: 'Eid al-Fitr', fr: 'Aïd al-Fitr', de: 'Eid al-Fitr' },
    rule: { type: 'fixed', month: 3, day: 20 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['islamic'],
    approximate: true,
  },
  {
    id: 'islamic-eidaladha',
    icon: '🌙',
    names: { it: 'Eid al-Adha', en: 'Eid al-Adha', es: 'Eid al-Adha', fr: 'Aïd al-Adha', de: 'Eid al-Adha' },
    rule: { type: 'fixed', month: 5, day: 27 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['islamic'],
    approximate: true,
  },
  {
    id: 'islamic-mawlid',
    icon: '🌙',
    names: { it: 'Mawlid al-Nabī', en: "Prophet's Birthday (Mawlid)", es: 'Mawlid al-Nabī', fr: "Mawlid al-Nabī", de: 'Maulid an-Nabī' },
    rule: { type: 'fixed', month: 8, day: 25 },
    countries: ['IT', 'ES', 'FR', 'DE', 'US'],
    traditions: ['islamic'],
    approximate: true,
  },
];

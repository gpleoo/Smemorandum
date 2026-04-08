import { Category, AppSettings } from '../models/types';

export const STORAGE_KEYS = {
  EVENTS: '@smemorandum/events',
  CATEGORIES: '@smemorandum/categories',
  SETTINGS: '@smemorandum/settings',
  PURCHASE_TOKEN: 'purchase_token',
} as const;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-family', name: 'Famiglia', color: '#FF6584', icon: 'heart' },
  { id: 'cat-work', name: 'Lavoro', color: '#6C63FF', icon: 'briefcase' },
  { id: 'cat-bills', name: 'Bollette', color: '#F59E0B', icon: 'receipt' },
];

export const SOUNDS = [
  { id: 'gentle-bell', name: 'Campanella', file: 'gentle-bell.mp3', premium: false },
  { id: 'urgent-alarm', name: 'Allarme urgente', file: 'urgent-alarm.mp3', premium: false },
  { id: 'celebration', name: 'Festa', file: 'celebration.mp3', premium: false },
  { id: 'piano-note', name: 'Nota di piano', file: 'piano-note.mp3', premium: true },
  { id: 'chime', name: 'Carillon', file: 'chime.mp3', premium: true },
  { id: 'harp', name: 'Arpa', file: 'harp.mp3', premium: true },
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'it',
  theme: 'auto',
  defaultSoundId: 'gentle-bell',
  hasSeenOnboarding: false,
  hasSeenTutorial: false,
  adsConsent: null,
};

export const FREE_PLAN_LIMITS = {
  MAX_EVENTS: 10,
  MAX_CATEGORIES: 3,
  MAX_REMINDERS_PER_EVENT: 1,
} as const;

export const CATEGORY_COLORS = [
  '#FF6584', '#6C63FF', '#F59E0B', '#10B981', '#00C9A7',
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6',
  '#F97316', '#84CC16',
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const;

export const AD_FREQUENCY_CAP = 5; // Show interstitial every N event operations

export const REVIEW_PROMPT_DAYS = 7; // Days before showing "Rate this app"

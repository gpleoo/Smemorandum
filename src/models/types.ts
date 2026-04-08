export type EventType = 'ricorrenza' | 'scadenza';

export type RecurrenceRule =
  | { type: 'none' }
  | { type: 'yearly' }
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'custom'; intervalDays: number };

export interface Reminder {
  id: string;
  daysBefore: number;
  time: string; // "HH:mm"
}

export interface SEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string; // ISO 8601 date "YYYY-MM-DD"
  recurrence: RecurrenceRule;
  categoryId: string;
  reminders: Reminder[];
  soundId: string;
  sourceContactId?: string;  // Phone contact ID, used to detect duplicates on re-import
  contactPhone?: string;     // Phone number for "Call" quick action on notifications
  sourceTemplateId?: string; // Holiday template ID, tracks which preset was used
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex "#FF6B6B"
  icon: string; // Ionicons name
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorTheme = 'purple' | 'blue' | 'green' | 'orange' | 'rose';
export type HolidayTradition = 'secular' | 'catholic' | 'protestant' | 'jewish' | 'islamic';

export interface AppSettings {
  language: string;
  theme: ThemeMode;
  colorTheme: ColorTheme;
  defaultSoundId: string;
  hasSeenOnboarding: boolean;
  hasSeenTutorial: boolean;
  adsConsent: boolean | null; // null = not asked yet
  weeklyDigestEnabled: boolean;
  holidayCountries: string[];          // ISO-3166 codes, e.g. ['IT']
  holidayTraditions: HolidayTradition[]; // e.g. ['secular','catholic']
}

export type RootStackParamList = {
  MainTabs: undefined;
  Onboarding: undefined;
  Premium: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  CalendarTab: undefined;
  EventsTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { eventId: string };
  EventForm: { eventId?: string };
};

export type CalendarStackParamList = {
  Calendar: undefined;
  EventDetail: { eventId: string };
  EventForm: { eventId?: string };
};

export type EventsStackParamList = {
  EventList: undefined;
  EventDetail: { eventId: string };
  EventForm: { eventId?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Premium: undefined;
  ManageCategories: undefined;
  ImportContacts: undefined;
  Stats: undefined;
  HolidayTemplates: undefined;
};

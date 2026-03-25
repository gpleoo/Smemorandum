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
  sourceContactId?: string; // Phone contact ID, used to detect duplicates on re-import
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

export interface AppSettings {
  language: string;
  theme: ThemeMode;
  defaultSoundId: string;
  hasSeenOnboarding: boolean;
  hasSeenTutorial: boolean;
  adsConsent: boolean | null; // null = not asked yet
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
};

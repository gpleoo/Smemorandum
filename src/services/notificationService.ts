import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SEvent } from '../models/types';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { subDays, setHours, setMinutes, isAfter } from 'date-fns';
import { getSettings } from '../storage/settingsStorage';

const MAX_SCHEDULED_NOTIFICATIONS = 54; // iOS limit is 64; leave room for 8 weekly digests

// ---------------------------------------------------------------------------
// Weekly digest helpers
// ---------------------------------------------------------------------------
const DIGEST_TITLES: Record<string, string> = {
  it: 'Questa settimana',
  en: 'This week',
  fr: 'Cette semaine',
  de: 'Diese Woche',
  es: 'Esta semana',
};

const DAY_NAMES: Record<string, string[]> = {
  it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  de: ['So',  'Mo',  'Di',  'Mi',  'Do',  'Fr',  'Sa'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

/** Returns the next Monday after `from`, offset by `weeksAhead` weeks. */
function getNextMonday(from: Date, weeksAhead: number): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0=Sun, 1=Mon…6=Sat
  const daysToMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysToMonday + weeksAhead * 7);
  d.setHours(9, 0, 0, 0);
  return d;
}

/**
 * Initialize notification handler and Android channel.
 * Call once at app startup, outside React components.
 */
export function initializeNotifications() {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('smemorandum-reminders', {
      name: 'Promemoria eventi',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
    Notifications.setNotificationChannelAsync('smemorandum-digest', {
      name: 'Riepilogo settimanale',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  // Register iOS notification category with "Call" quick action
  if (Platform.OS === 'ios') {
    Notifications.setNotificationCategoryAsync('reminder-with-call', [
      {
        identifier: 'call',
        buttonTitle: '📞 Chiama',
        options: { opensAppToForeground: false },
      },
    ]);
  }
}

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: true },
  });
  return status === 'granted';
}

/**
 * Cancel all existing notifications and reschedule from current events.
 */
export async function scheduleAllEventNotifications(events: SEvent[]): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const toSchedule: { date: Date; event: SEvent; daysBefore: number }[] = [];

  for (const event of events) {
    if (event.reminders.length === 0) continue;

    const nextOccurrence = getNextOccurrence(event, now);
    if (!nextOccurrence) continue;

    for (const reminder of event.reminders) {
      const timeParts = reminder.time.split(':').map(Number);
      if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) continue;
      const [hours, minutes] = timeParts;
      let triggerDate = subDays(nextOccurrence, reminder.daysBefore);
      triggerDate = setHours(triggerDate, hours);
      triggerDate = setMinutes(triggerDate, minutes);

      if (isAfter(triggerDate, now)) {
        toSchedule.push({ date: triggerDate, event, daysBefore: reminder.daysBefore });
      }
    }
  }

  // Sort by date and limit to MAX
  toSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  const limited = toSchedule.slice(0, MAX_SCHEDULED_NOTIFICATIONS);

  for (const item of limited) {
    try {
      // Custom sound files are not yet bundled; use the system default.
      // The user's soundId selection is still persisted on the event so it
      // will activate automatically once the mp3 assets + expo-notifications
      // plugin config are added.
      const body = item.daysBefore === 0
        ? `Oggi: ${item.event.title}`
        : item.daysBefore === 1
          ? `Domani: ${item.event.title}`
          : `Tra ${item.daysBefore} giorni: ${item.event.title}`;

      const hasPhone = !!item.event.contactPhone;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.event.title,
          body,
          sound: 'default',
          data: { eventId: item.event.id, contactPhone: item.event.contactPhone ?? null },
          ...(Platform.OS === 'ios' && hasPhone && { categoryIdentifier: 'reminder-with-call' }),
          ...(Platform.OS === 'android' && { channelId: 'smemorandum-reminders' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
        },
      });
    } catch (error) {
      console.error(`Failed to schedule notification for event ${item.event.id}:`, error);
    }
  }

  // Schedule weekly digest notifications
  try {
    const settings = await getSettings();
    await scheduleWeeklyDigest(events, settings.weeklyDigestEnabled ?? true, settings.language ?? 'it');
  } catch {}
}

// ---------------------------------------------------------------------------
// Weekly digest
// ---------------------------------------------------------------------------
export async function scheduleWeeklyDigest(
  events: SEvent[],
  enabled: boolean,
  language: string,
): Promise<void> {
  if (Platform.OS === 'web') return;

  // Cancel any previously scheduled digest notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.isDigest === true)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  if (!enabled || events.length === 0) return;

  const now = new Date();
  const days  = DAY_NAMES[language]    ?? DAY_NAMES.en;
  const title = DIGEST_TITLES[language] ?? DIGEST_TITLES.en;

  for (let i = 0; i < 8; i++) {
    const monday = getNextMonday(now, i);
    if (monday <= now) continue;

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekItems: { title: string; dayName: string }[] = [];
    for (const event of events) {
      const next = getNextOccurrence(event, monday);
      if (!next || next > sunday) continue;
      weekItems.push({ title: event.title, dayName: days[next.getDay()] });
    }
    if (weekItems.length === 0) continue;

    const first3 = weekItems.slice(0, 3).map((e) => `${e.title} (${e.dayName})`).join(', ');
    const extra  = weekItems.length > 3 ? ` +${weekItems.length - 3}` : '';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: first3 + extra,
          data: { isDigest: true },
          ...(Platform.OS === 'android' && { channelId: 'smemorandum-digest' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: monday,
        },
      });
    } catch {}
  }
}

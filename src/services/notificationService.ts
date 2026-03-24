import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SEvent } from '../models/types';
import { SOUNDS } from '../utils/constants';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { subDays, setHours, setMinutes, isAfter } from 'date-fns';

const MAX_SCHEDULED_NOTIFICATIONS = 60; // iOS limit is 64, keep margin

/**
 * Initialize notification handler and Android channel.
 * Call once at app startup, outside React components.
 */
export function initializeNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('smemorandum-reminders', {
      name: 'Promemoria eventi',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
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
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const toSchedule: { date: Date; event: SEvent; daysBefore: number }[] = [];

  for (const event of events) {
    if (event.reminders.length === 0) continue;

    const nextOccurrence = getNextOccurrence(event, now);
    if (!nextOccurrence) continue;

    for (const reminder of event.reminders) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
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
    const soundFile = SOUNDS.find((s) => s.id === item.event.soundId)?.file;
    const body = item.daysBefore === 0
      ? `Oggi: ${item.event.title}`
      : item.daysBefore === 1
        ? `Domani: ${item.event.title}`
        : `Tra ${item.daysBefore} giorni: ${item.event.title}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.event.title,
        body,
        sound: soundFile ?? 'default',
        data: { eventId: item.event.id },
        ...(Platform.OS === 'android' && { channelId: 'smemorandum-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.date,
      },
    });
  }
}

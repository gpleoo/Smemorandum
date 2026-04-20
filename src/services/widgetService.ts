import { Platform } from 'react-native';
import { SEvent } from '../models/types';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { daysUntil } from '../utils/dateUtils';
import { setWidgetString } from './appGroupService';

function formatShortDate(date: Date): string {
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Request widget update with fresh event data.
 * On iOS writes to App Group UserDefaults for WidgetKit.
 * Android widget support is temporarily disabled (requires react-native-android-widget reinstall).
 */
export async function updateWidget(events: SEvent[]): Promise<void> {
  const now = new Date();
  const upcoming: { id: string; title: string; date: string; daysLeft: number }[] = [];

  for (const event of events) {
    const next = getNextOccurrence(event, now);
    if (!next) continue;
    const days = daysUntil(next);
    if (days < 0) continue;
    upcoming.push({
      id: event.id,
      title: event.title,
      date: formatShortDate(next),
      daysLeft: days,
    });
  }

  upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
  const top5 = upcoming.slice(0, 5);

  // iOS widget update — write to App Group UserDefaults for WidgetKit
  if (Platform.OS === 'ios') {
    try {
      const widgetEvents = top5.map((e) => ({
        id: e.id,
        title: e.title,
        daysLeft: e.daysLeft,
        dateLabel: e.date,
      }));
      await setWidgetString('widget_events', JSON.stringify(widgetEvents));
    } catch {
      // Silently fail
    }
  }
}

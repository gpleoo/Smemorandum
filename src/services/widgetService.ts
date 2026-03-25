import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { UpcomingEventsWidget } from '../../widget/upcoming-events-widget';
import { SEvent } from '../models/types';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { daysUntil } from '../utils/dateUtils';
import React from 'react';

const WIDGET_NAME = 'UpcomingEvents';

function formatShortDate(date: Date): string {
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Request widget update with fresh event data.
 * Only runs on Android. No-op on other platforms.
 */
export async function updateWidget(events: SEvent[]): Promise<void> {
  if (Platform.OS !== 'android') return;

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

  try {
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => React.createElement(UpcomingEventsWidget, { events: top5 }),
    });
  } catch {
    // Widget not on home screen or not supported — ignore
  }
}

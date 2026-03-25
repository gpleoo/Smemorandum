import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { UpcomingEventsWidget } from './upcoming-events-widget';
import { STORAGE_KEYS } from '../src/utils/constants';

interface StoredEvent {
  id: string;
  title: string;
  date: string;
  recurrence: { type: string; [key: string]: any };
}

function getNextOccurrenceSimple(eventDate: string, recurrenceType: string): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const base = new Date(eventDate);

  if (recurrenceType === 'none') {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    return d >= today ? d : null;
  }

  if (recurrenceType === 'yearly') {
    let candidate = new Date(today.getFullYear(), base.getMonth(), base.getDate());
    if (candidate < today) {
      candidate = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
    }
    return candidate;
  }

  if (recurrenceType === 'monthly') {
    let candidate = new Date(today.getFullYear(), today.getMonth(), base.getDate());
    if (candidate < today) {
      candidate = new Date(today.getFullYear(), today.getMonth() + 1, base.getDate());
    }
    return candidate;
  }

  // weekly / custom — fallback: return event date or null
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  return d >= today ? d : null;
}

function daysUntil(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(date: Date): string {
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

async function getUpcomingEvents(): Promise<{ id: string; title: string; date: string; daysLeft: number }[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) return [];

    const events: StoredEvent[] = JSON.parse(raw);
    const upcoming: { id: string; title: string; date: string; daysLeft: number }[] = [];

    for (const event of events) {
      const next = getNextOccurrenceSimple(event.date, event.recurrence.type);
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
    return upcoming.slice(0, 5);
  } catch {
    return [];
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, renderWidget, clickAction, clickActionData } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const events = await getUpcomingEvents();
      renderWidget(<UpcomingEventsWidget events={events} />);
      break;
    }
    case 'WIDGET_DELETED':
      break;
    case 'WIDGET_CLICK':
      // Click handling is done via the app's deep link (OPEN_APP action)
      break;
  }
}

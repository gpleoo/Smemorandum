import { subDays, setHours, setMinutes, isAfter } from 'date-fns';
import { Reminder, SEvent } from '../models/types';
import { getNextOccurrence } from './recurrenceEngine';

export interface ScheduledTrigger {
  date: Date;
  event: SEvent;
  daysBefore: number;
  isRepeat: boolean;
}

export const MAX_REPEATS_PER_REMINDER = 12;

/**
 * Pure function — given events and a "now" reference, produces the full
 * ordered list of notification triggers (initial + repeat follow-ups),
 * filtered to future timestamps only. No I/O, safe to unit-test.
 */
export function computeEventTriggers(events: SEvent[], now: Date): ScheduledTrigger[] {
  const out: ScheduledTrigger[] = [];

  for (const event of events) {
    if (event.reminders.length === 0) continue;

    const nextOccurrence = getNextOccurrence(event, now);
    if (!nextOccurrence) continue;

    for (const reminder of event.reminders) {
      out.push(...computeReminderTriggers(reminder, event, nextOccurrence, now));
    }
  }

  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

export function computeReminderTriggers(
  reminder: Reminder,
  event: SEvent,
  nextOccurrence: Date,
  now: Date,
): ScheduledTrigger[] {
  const out: ScheduledTrigger[] = [];
  const timeParts = reminder.time.split(':').map(Number);
  if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) return out;

  const [hours, minutes] = timeParts;
  let triggerDate = subDays(nextOccurrence, reminder.daysBefore);
  triggerDate = setHours(triggerDate, hours);
  triggerDate = setMinutes(triggerDate, minutes);

  if (isAfter(triggerDate, now)) {
    out.push({ date: triggerDate, event, daysBefore: reminder.daysBefore, isRepeat: false });
  }

  if (reminder.repeatEnabled && reminder.repeatIntervalHours && reminder.repeatIntervalHours > 0) {
    const endOfDay = new Date(triggerDate);
    endOfDay.setHours(23, 59, 59, 999);
    const intervalMs = reminder.repeatIntervalHours * 60 * 60 * 1000;
    let next = new Date(triggerDate.getTime() + intervalMs);
    let count = 0;
    while (next.getTime() <= endOfDay.getTime() && count < MAX_REPEATS_PER_REMINDER) {
      if (isAfter(next, now)) {
        out.push({ date: new Date(next), event, daysBefore: reminder.daysBefore, isRepeat: true });
      }
      next = new Date(next.getTime() + intervalMs);
      count++;
    }
  }

  return out;
}

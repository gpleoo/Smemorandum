import {
  addYears,
  addMonths,
  addWeeks,
  addDays,
  setDate,
  getDaysInMonth,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  getDay,
} from 'date-fns';
import { SEvent, RecurrenceRule } from '../models/types';

/**
 * Returns the next occurrence of an event on or after referenceDate.
 * Returns null if no future occurrence exists (one-time event in the past).
 */
export function getNextOccurrence(event: SEvent, referenceDate: Date): Date | null {
  const baseDate = startOfDay(new Date(event.date));
  const ref = startOfDay(referenceDate);
  const rule = event.recurrence;

  if (rule.type === 'none') {
    return isAfter(baseDate, ref) || isEqual(baseDate, ref) ? baseDate : null;
  }

  if (rule.type === 'yearly') {
    return findNextYearly(baseDate, ref);
  }

  if (rule.type === 'monthly') {
    return findNextMonthly(baseDate, ref, rule.dayOfMonth);
  }

  if (rule.type === 'weekly') {
    return findNextWeekly(baseDate, ref, rule.dayOfWeek);
  }

  if (rule.type === 'custom') {
    return findNextCustom(baseDate, ref, rule.intervalDays);
  }

  return null;
}

/**
 * Returns all occurrences of an event within [start, end] range.
 */
export function getOccurrencesInRange(event: SEvent, start: Date, end: Date): Date[] {
  const occurrences: Date[] = [];
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);

  let current = getNextOccurrence(event, startDay);

  // Safety limit to prevent infinite loops
  let iterations = 0;
  const maxIterations = 400;

  while (current && (isBefore(current, endDay) || isEqual(current, endDay)) && iterations < maxIterations) {
    occurrences.push(current);
    iterations++;

    if (event.recurrence.type === 'none') break;

    // Advance to next occurrence after current
    const nextDay = addDays(current, 1);
    current = getNextOccurrence(event, nextDay);
  }

  return occurrences;
}

/**
 * Returns a human-readable description of a recurrence rule in the specified language.
 */
export function describeRecurrence(rule: RecurrenceRule, t: (key: string, options?: Record<string, unknown>) => string): string {
  switch (rule.type) {
    case 'none':
      return t('eventForm.recurrenceNone');
    case 'yearly':
      return t('eventForm.recurrenceYearly');
    case 'monthly':
      return t('eventForm.recurrenceMonthly');
    case 'weekly':
      return t('eventForm.recurrenceWeekly');
    case 'custom':
      return t('eventForm.everyNDays', { count: rule.intervalDays });
    default:
      return '';
  }
}

// --- Internal helpers ---

function findNextYearly(baseDate: Date, ref: Date): Date {
  let candidate = new Date(ref.getFullYear(), baseDate.getMonth(), baseDate.getDate());

  // Handle Feb 29 in non-leap years
  if (baseDate.getMonth() === 1 && baseDate.getDate() === 29) {
    const daysInFeb = getDaysInMonth(new Date(ref.getFullYear(), 1, 1));
    if (daysInFeb < 29) {
      candidate = new Date(ref.getFullYear(), 1, 28);
    }
  }

  if (isBefore(candidate, ref)) {
    const nextYear = ref.getFullYear() + 1;
    candidate = new Date(nextYear, baseDate.getMonth(), baseDate.getDate());
    if (baseDate.getMonth() === 1 && baseDate.getDate() === 29) {
      const daysInFeb = getDaysInMonth(new Date(nextYear, 1, 1));
      if (daysInFeb < 29) {
        candidate = new Date(nextYear, 1, 28);
      }
    }
  }

  return startOfDay(candidate);
}

function findNextMonthly(baseDate: Date, ref: Date, dayOfMonth: number): Date {
  let candidate = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const daysInCurrentMonth = getDaysInMonth(candidate);
  const day = Math.min(dayOfMonth, daysInCurrentMonth);
  candidate = new Date(ref.getFullYear(), ref.getMonth(), day);

  if (isBefore(candidate, ref)) {
    candidate = addMonths(new Date(ref.getFullYear(), ref.getMonth(), 1), 1);
    const daysInNextMonth = getDaysInMonth(candidate);
    const nextDay = Math.min(dayOfMonth, daysInNextMonth);
    candidate = new Date(candidate.getFullYear(), candidate.getMonth(), nextDay);
  }

  return startOfDay(candidate);
}

function findNextWeekly(baseDate: Date, ref: Date, dayOfWeek: number): Date {
  const currentDow = getDay(ref);
  let daysUntil = dayOfWeek - currentDow;
  if (daysUntil <= 0) daysUntil += 7;
  // If today is the target day, return today (ref) instead of next week
  if (dayOfWeek === currentDow) {
    return startOfDay(ref);
  }
  return startOfDay(addDays(ref, daysUntil));
}

function findNextCustom(baseDate: Date, ref: Date, intervalDays: number): Date {
  if (isAfter(baseDate, ref) || isEqual(baseDate, ref)) {
    return baseDate;
  }

  const diffMs = ref.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const periods = Math.ceil(diffDays / intervalDays);

  return startOfDay(addDays(baseDate, periods * intervalDays));
}

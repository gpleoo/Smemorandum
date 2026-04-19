import { HolidayTemplate, HolidayRule, HOLIDAY_TEMPLATES } from '../data/holidayTemplates';
import { AppSettings, HolidayTradition, SEvent } from '../models/types';
import { LANGUAGE_TO_COUNTRY } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

// ─── Easter calculation (Anonymous Gregorian algorithm) ──────────────────────
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// nth-weekday: e.g. 2nd Sunday of May (weekday=0, nth=2)
function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month - 1, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

// last weekday of month
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month, 0); // last day of month
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month - 1, last.getDate() - offset);
}

export function resolveHolidayDate(rule: HolidayRule, year: number): Date {
  switch (rule.type) {
    case 'fixed':
      return new Date(year, rule.month - 1, rule.day);
    case 'easter': {
      const easter = computeEaster(year);
      const d = new Date(easter);
      d.setDate(d.getDate() + rule.offsetDays);
      return d;
    }
    case 'nth-weekday':
      return nthWeekday(year, rule.month, rule.weekday, rule.nth);
    case 'last-weekday':
      return lastWeekday(year, rule.month, rule.weekday);
  }
}

/** Pad date to ISO string "YYYY-MM-DD" */
export function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Return the auto-detected country from app language */
export function getAutoCountry(language: string): string {
  return LANGUAGE_TO_COUNTRY[language] ?? 'IT';
}

/** Get effective countries for a user (empty array = use auto-detected) */
export function getEffectiveCountries(
  holidayCountries: string[],
  language: string
): string[] {
  if (holidayCountries.length === 0) return [getAutoCountry(language)];
  return holidayCountries;
}

/** Filter templates by selected countries and traditions */
export function filterTemplates(
  templates: HolidayTemplate[],
  countries: string[],
  traditions: HolidayTradition[]
): HolidayTemplate[] {
  return templates.filter(
    (t) =>
      t.countries.some((c) => countries.includes(c)) &&
      t.traditions.some((tr) => traditions.includes(tr))
  );
}

/** Get the template name in the given language */
export function getTemplateName(template: HolidayTemplate, language: string): string {
  const lang = language as keyof typeof template.names;
  return template.names[lang] ?? template.names.en ?? template.names.it;
}

/** Check if a template is already added to the user's events */
export function isTemplateAdded(template: HolidayTemplate, events: SEvent[]): boolean {
  return events.some((e) => e.sourceTemplateId === template.id);
}

/**
 * Build the SEvents that should be auto-added to match the user's current
 * country/tradition filter. Templates already present (tracked by
 * sourceTemplateId) are skipped. Nothing is removed here — users keep control
 * over deletions via the holiday templates screen.
 */
export function computeHolidaysToAdd(
  events: SEvent[],
  settings: AppSettings,
  language: string,
): SEvent[] {
  const countries = getEffectiveCountries(settings.holidayCountries, language);
  const traditions =
    settings.holidayTraditions && settings.holidayTraditions.length > 0
      ? settings.holidayTraditions
      : ['secular'];
  const targetTemplates = filterTemplates(HOLIDAY_TEMPLATES, countries, traditions);
  const existingTemplateIds = new Set(
    events.filter((e) => e.sourceTemplateId).map((e) => e.sourceTemplateId!),
  );

  const year = new Date().getFullYear();
  const now = new Date().toISOString();

  return targetTemplates
    .filter((t) => !existingTemplateIds.has(t.id))
    .map((template) => ({
      id: uuidv4(),
      title: getTemplateName(template, language),
      description: '',
      eventType: 'ricorrenza' as const,
      date: dateToISO(resolveHolidayDate(template.rule, year)),
      recurrence: { type: 'yearly' as const },
      categoryId: 'cat-family',
      reminders: [],
      soundId: 'gentle-bell',
      sourceTemplateId: template.id,
      createdAt: now,
      updatedAt: now,
    }));
}

/**
 * Return the ids of auto-added holiday events whose template no longer
 * matches the user's current country/tradition filter. Only events tracked
 * via `sourceTemplateId` are considered; events the user created by hand
 * (even starting from a template they later removed) are untouched.
 */
export function computeHolidaysToRemove(
  events: SEvent[],
  settings: AppSettings,
  language: string,
): string[] {
  const countries = getEffectiveCountries(settings.holidayCountries, language);
  const traditions =
    settings.holidayTraditions && settings.holidayTraditions.length > 0
      ? settings.holidayTraditions
      : ['secular'];
  const activeIds = new Set(
    filterTemplates(HOLIDAY_TEMPLATES, countries, traditions).map((t) => t.id),
  );
  return events
    .filter((e) => e.sourceTemplateId && !activeIds.has(e.sourceTemplateId))
    .map((e) => e.id);
}

/** Format rule description for display (month/day or "mobile date") */
export function describeRule(rule: HolidayRule, language: string): string {
  if (rule.type === 'fixed') {
    const d = new Date(2026, rule.month - 1, rule.day);
    return d.toLocaleDateString(language, { month: 'long', day: 'numeric' });
  }
  if (rule.type === 'easter') {
    if (rule.offsetDays === 0) return '🐣';
    return `Easter ${rule.offsetDays > 0 ? '+' : ''}${rule.offsetDays}d`;
  }
  return '📅';
}

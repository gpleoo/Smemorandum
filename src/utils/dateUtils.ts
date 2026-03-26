import {
  format,
  formatDistanceToNow,
  differenceInDays,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';
import { it, enUS, es, fr, de } from 'date-fns/locale';

type DateLocale = typeof it;

const locales: Record<string, DateLocale> = { it, en: enUS, es, fr, de };

export function getDateLocale(language: string): DateLocale {
  return locales[language] ?? it;
}

export function formatDate(date: Date | string, formatStr: string, language: string = 'it'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: getDateLocale(language) });
}

export function formatRelativeDate(date: Date | string, language: string = 'it'): string {
  const d = typeof date === 'string' ? startOfDay(new Date(date)) : startOfDay(date);
  const today = startOfDay(new Date());
  const locale = getDateLocale(language);

  if (isToday(d)) return language === 'it' ? 'Oggi' : 'Today';
  if (isTomorrow(d)) return language === 'it' ? 'Domani' : 'Tomorrow';

  const days = differenceInDays(d, today);
  if (days > 0 && days <= 7) {
    return formatDistanceToNow(d, { addSuffix: true, locale });
  }

  return format(d, 'dd MMM yyyy', { locale });
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? startOfDay(new Date(date)) : startOfDay(date);
  return differenceInDays(d, startOfDay(new Date()));
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

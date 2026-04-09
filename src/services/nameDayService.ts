import { NAME_DAYS, NameDay } from '../data/nameDays';

/**
 * Extract candidate first names from an event title.
 * e.g. "Compleanno di Marco" → ["Marco"]
 *      "Marco" → ["Marco"]
 *      "Anniversario di Luca e Sara" → ["Luca", "Sara"]
 */
function extractNames(title: string): string[] {
  // Remove common Italian prefixes
  const cleaned = title
    .replace(/\b(compleanno|anniversario|onomastico|festa|san|santa|di|del|della|e|&)\b/gi, ' ')
    .trim();
  // Collect words that start with an uppercase letter (likely proper names)
  return cleaned
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[A-ZÀÈÉÌÒÙÁÉÍÓÚ]/.test(w));
}

/**
 * Find the name day entry for a given first name (case-insensitive).
 * Returns the first match found, or null.
 */
export function findNameDayForName(firstName: string): NameDay | null {
  const lower = firstName.toLowerCase();
  return (
    NAME_DAYS.find((nd) =>
      nd.names.some((n) => n.toLowerCase() === lower)
    ) ?? null
  );
}

/**
 * From an event title, find all matching name days.
 */
export function findNameDaysFromTitle(title: string): Array<{ name: string; nameDay: NameDay }> {
  const names = extractNames(title);
  const results: Array<{ name: string; nameDay: NameDay }> = [];
  for (const name of names) {
    const nd = findNameDayForName(name);
    if (nd) results.push({ name, nameDay: nd });
  }
  return results;
}

/**
 * Format a name day as "YYYY-MM-DD" using the current or next year.
 */
export function nameDayToISO(nd: NameDay): string {
  const now = new Date();
  let year = now.getFullYear();
  const target = new Date(year, nd.month - 1, nd.day);
  if (target < now) year += 1;
  const m = String(nd.month).padStart(2, '0');
  const d = String(nd.day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Human-readable date like "25 aprile" for a NameDay.
 */
export function formatNameDay(nd: NameDay, language = 'it'): string {
  const d = new Date(2026, nd.month - 1, nd.day);
  return d.toLocaleDateString(language, { day: 'numeric', month: 'long' });
}

/** Milestone ages that deserve special treatment */
const MILESTONES = [18, 21, 25, 30, 40, 50, 60, 70, 80, 90, 100];

export function isMilestone(age: number): boolean {
  return MILESTONES.includes(age);
}

/**
 * Calculate the age someone will turn on their next birthday.
 * birthDateISO: "YYYY-MM-DD"
 */
export function nextAge(birthDateISO: string): number | null {
  const parts = birthDateISO.split('-');
  if (parts.length < 3) return null;
  const birthYear = parseInt(parts[0], 10);
  if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) return null;
  const now = new Date();
  const nextOccurrenceYear =
    new Date(now.getFullYear(), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)) >= now
      ? now.getFullYear()
      : now.getFullYear() + 1;
  return nextOccurrenceYear - birthYear;
}

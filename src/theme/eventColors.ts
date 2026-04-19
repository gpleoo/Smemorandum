import { SEvent } from '../models/types';
import { ColorScheme } from './colors';

export type EventKind = 'holiday' | 'birthday' | 'ricorrenza' | 'scadenza';

export function getEventKind(event: SEvent): EventKind {
  if (event.sourceTemplateId) return 'holiday';
  if (event.eventType === 'scadenza') return 'scadenza';
  if (event.eventType === 'ricorrenza' && event.recurrence.type === 'yearly') return 'birthday';
  return 'ricorrenza';
}

/**
 * Accent color for an event kind. Kept semantic so birthdays feel warm,
 * deadlines feel urgent, and holidays stand out from user events.
 */
export function getEventAccent(kind: EventKind, colors: ColorScheme): string {
  switch (kind) {
    case 'holiday':
      return colors.warning;
    case 'birthday':
      return colors.secondary;
    case 'scadenza':
      return colors.error;
    case 'ricorrenza':
    default:
      return colors.primary;
  }
}

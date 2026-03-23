import { useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { SEvent, EventType } from '../models/types';
import { getNextOccurrence } from '../utils/recurrenceEngine';

export function useEvents() {
  const context = useEventContext();

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return context.events
      .map((event) => ({
        event,
        nextDate: getNextOccurrence(event, now),
      }))
      .filter((item) => item.nextDate !== null)
      .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
  }, [context.events]);

  const filterByType = (type: EventType | 'all') => {
    if (type === 'all') return context.events;
    return context.events.filter((e) => e.eventType === type);
  };

  const filterByCategory = (categoryId: string | 'all') => {
    if (categoryId === 'all') return context.events;
    return context.events.filter((e) => e.categoryId === categoryId);
  };

  const searchEvents = (query: string) => {
    const lower = query.toLowerCase();
    return context.events.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.description.toLowerCase().includes(lower)
    );
  };

  const getEventById = (id: string): SEvent | undefined => {
    return context.events.find((e) => e.id === id);
  };

  return {
    ...context,
    upcomingEvents,
    filterByType,
    filterByCategory,
    searchEvents,
    getEventById,
  };
}

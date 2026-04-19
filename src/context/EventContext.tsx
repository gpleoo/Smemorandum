import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SEvent, Category } from '../models/types';
import * as eventStorage from '../storage/eventStorage';
import { requestPermissions, scheduleAllEventNotifications } from '../services/notificationService';
import { updateWidget } from '../services/widgetService';
import { getSettings } from '../storage/settingsStorage';
import { computeHolidaysToAdd, computeHolidaysToRemove } from '../services/templatesService';
import i18n from '../i18n';

interface EventState {
  events: SEvent[];
  categories: Category[];
  isLoading: boolean;
}

type EventAction =
  | { type: 'SET_EVENTS'; payload: SEvent[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_LOADING'; payload: boolean };

interface EventContextType extends EventState {
  addEvent: (event: SEvent) => Promise<void>;
  updateEvent: (event: SEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  syncHolidays: () => Promise<number>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, {
    events: [],
    categories: [],
    isLoading: true,
  });

  const syncHolidays = useCallback(async (): Promise<number> => {
    const [currentEvents, settings] = await Promise.all([
      eventStorage.getEvents(),
      getSettings(),
    ]);
    const toAdd = computeHolidaysToAdd(currentEvents, settings, i18n.language);
    const toRemoveIds = new Set(
      computeHolidaysToRemove(currentEvents, settings, i18n.language),
    );
    if (toAdd.length === 0 && toRemoveIds.size === 0) return 0;
    const merged = [
      ...currentEvents.filter((e) => !toRemoveIds.has(e.id)),
      ...toAdd,
    ];
    await eventStorage.saveEvents(merged);
    dispatch({ type: 'SET_EVENTS', payload: merged });
    scheduleAllEventNotifications(merged).catch(() => {});
    updateWidget(merged).catch(() => {});
    return toAdd.length;
  }, []);

  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const [events, categories] = await Promise.all([
      eventStorage.getEvents(),
      eventStorage.getCategories(),
    ]);
    dispatch({ type: 'SET_EVENTS', payload: events });
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
    dispatch({ type: 'SET_LOADING', payload: false });
    scheduleAllEventNotifications(events).catch(() => {});
    updateWidget(events).catch(() => {});
    syncHolidays().catch(() => {});
  }, [syncHolidays]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addEvent = useCallback(async (event: SEvent) => {
    await requestPermissions();
    const events = await eventStorage.addEvent(event);
    dispatch({ type: 'SET_EVENTS', payload: events });
    scheduleAllEventNotifications(events).catch(() => {});
    updateWidget(events).catch(() => {});
  }, []);

  const updateEvent = useCallback(async (event: SEvent) => {
    const events = await eventStorage.updateEvent(event);
    dispatch({ type: 'SET_EVENTS', payload: events });
    scheduleAllEventNotifications(events).catch(() => {});
    updateWidget(events).catch(() => {});
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    const events = await eventStorage.deleteEvent(eventId);
    dispatch({ type: 'SET_EVENTS', payload: events });
    scheduleAllEventNotifications(events).catch(() => {});
    updateWidget(events).catch(() => {});
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    const categories = await eventStorage.addCategory(category);
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  }, []);

  const updateCategory = useCallback(async (category: Category) => {
    const categories = await eventStorage.updateCategory(category);
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    const categories = await eventStorage.deleteCategory(categoryId);
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  }, []);

  return (
    <EventContext.Provider
      value={{
        ...state,
        addEvent,
        updateEvent,
        deleteEvent,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData,
        syncHolidays,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}

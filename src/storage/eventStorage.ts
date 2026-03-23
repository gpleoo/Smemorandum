import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEvent, Category } from '../models/types';
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../utils/constants';

// Events

export async function getEvents(): Promise<SEvent[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
  return json ? JSON.parse(json) : [];
}

export async function saveEvents(events: SEvent[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

export async function addEvent(event: SEvent): Promise<SEvent[]> {
  const events = await getEvents();
  events.push(event);
  await saveEvents(events);
  return events;
}

export async function updateEvent(updated: SEvent): Promise<SEvent[]> {
  const events = await getEvents();
  const index = events.findIndex((e) => e.id === updated.id);
  if (index !== -1) {
    events[index] = updated;
    await saveEvents(events);
  }
  return events;
}

export async function deleteEvent(eventId: string): Promise<SEvent[]> {
  const events = await getEvents();
  const filtered = events.filter((e) => e.id !== eventId);
  await saveEvents(filtered);
  return filtered;
}

// Categories

export async function getCategories(): Promise<Category[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (json) return JSON.parse(json);
  // Initialize with defaults on first load
  await saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export async function addCategory(category: Category): Promise<Category[]> {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
  return categories;
}

export async function updateCategory(updated: Category): Promise<Category[]> {
  const categories = await getCategories();
  const index = categories.findIndex((c) => c.id === updated.id);
  if (index !== -1) {
    categories[index] = updated;
    await saveCategories(categories);
  }
  return categories;
}

export async function deleteCategory(categoryId: string): Promise<Category[]> {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c.id !== categoryId);
  await saveCategories(filtered);
  return filtered;
}

import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smemorandum/review';
const MIN_EVENTS_BEFORE_PROMPT = 5; // Ask after user has saved 5+ events
const DAYS_BEFORE_PROMPT = 7;       // And at least 7 days after install

interface ReviewState {
  eventCount: number;
  firstLaunchDate: string;
  hasReviewed: boolean;
}

async function getState(): Promise<ReviewState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const state: ReviewState = {
    eventCount: 0,
    firstLaunchDate: new Date().toISOString(),
    hasReviewed: false,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

async function saveState(state: ReviewState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Call this after a user successfully saves a new event.
 * Will trigger the native review dialog if conditions are met.
 */
export async function trackEventSavedAndMaybePrompt(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const state = await getState();
    if (state.hasReviewed) return;

    state.eventCount += 1;
    await saveState(state);

    // Check conditions
    const daysSinceFirstLaunch =
      (Date.now() - new Date(state.firstLaunchDate).getTime()) /
      (1000 * 60 * 60 * 24);

    if (
      state.eventCount >= MIN_EVENTS_BEFORE_PROMPT &&
      daysSinceFirstLaunch >= DAYS_BEFORE_PROMPT &&
      (await StoreReview.hasAction())
    ) {
      await StoreReview.requestReview();
      state.hasReviewed = true;
      await saveState(state);
    }
  } catch {
    // Never crash over a review prompt
  }
}

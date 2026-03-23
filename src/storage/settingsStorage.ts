import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../models/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

export async function getSettings(): Promise<AppSettings> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (json) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<AppSettings> {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
  return settings;
}

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SEvent, Category } from '../models/types';
import { STORAGE_KEYS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackupData {
  version: number;
  exportedAt: string;
  events: SEvent[];
  categories: Category[];
}

/**
 * Read all app data and return as JSON string.
 */
export async function exportData(): Promise<string> {
  const [eventsRaw, categoriesRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
    AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    events: eventsRaw ? JSON.parse(eventsRaw) : [],
    categories: categoriesRaw ? JSON.parse(categoriesRaw) : [],
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Parse and validate backup JSON, then overwrite local storage.
 */
export async function importData(json: string): Promise<{ events: number; categories: number }> {
  let data: BackupData;

  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (!data.version || !Array.isArray(data.events) || !Array.isArray(data.categories)) {
    throw new Error('Invalid backup format');
  }

  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events)),
    AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories)),
  ]);

  return { events: data.events.length, categories: data.categories.length };
}

/**
 * Export backup and open native share sheet.
 */
export async function shareBackup(): Promise<void> {
  const json = await exportData();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `smemorandum-backup-${date}.json`;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Smemorandum Backup',
    UTI: 'public.json',
  });
}

/**
 * Open document picker, read the selected file, and restore data.
 */
export async function pickAndRestoreBackup(): Promise<{ events: number; categories: number }> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('cancelled');
  }

  const fileUri = result.assets[0].uri;
  const json = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return importData(json);
}

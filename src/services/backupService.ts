import {
  cacheDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
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
 * Export backup and open native share sheet (or download on web).
 */
export async function shareBackup(): Promise<void> {
  const json = await exportData();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `smemorandum-backup-${date}.json`;

  if (typeof document !== 'undefined') {
    // Web: trigger a file download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (!cacheDirectory) {
    throw new Error('Cache directory not available');
  }
  const fileUri = `${cacheDirectory}${filename}`;

  await writeAsStringAsync(fileUri, json, {
    encoding: EncodingType.UTF8,
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
  if (typeof document !== 'undefined') {
    // Web: use HTML file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) { reject(new Error('cancelled')); return; }
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const json = e.target?.result as string;
            resolve(await importData(json));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('read error'));
        reader.readAsText(file);
      };
      input.oncancel = () => reject(new Error('cancelled'));
      input.click();
    });
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('cancelled');
  }

  const fileUri = result.assets[0].uri;
  const json = await readAsStringAsync(fileUri, {
    encoding: EncodingType.UTF8,
  });

  return importData(json);
}

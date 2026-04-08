/**
 * Writes data to App Group UserDefaults so the iOS WidgetKit widget can read it.
 * Implemented via the AppGroupBridge native module injected by withAppGroupBridge plugin.
 */
import { NativeModules } from 'react-native';

const { AppGroupBridge } = NativeModules;

export async function setWidgetString(key: string, value: string): Promise<void> {
  if (!AppGroupBridge) return; // guard: not available in Expo Go
  AppGroupBridge.setString(key, value);
}

export async function getWidgetString(key: string): Promise<string | null> {
  if (!AppGroupBridge) return null;
  return AppGroupBridge.getString(key);
}

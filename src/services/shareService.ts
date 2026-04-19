import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Snapshot a view ref into a PNG and present the OS share sheet.
 * Returns true if the sheet opened, false on web or unsupported platforms.
 */
export async function shareViewSnapshot(
  ref: React.RefObject<any>,
  filename = 'smemorandum-card',
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!ref.current) return false;

  const uri = await captureRef(ref, {
    format: 'png',
    quality: 1,
    fileName: filename,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) return false;

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Smemorandum',
    UTI: 'public.png',
  });
  return true;
}

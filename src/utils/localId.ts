/**
 * Generate a non-cryptographic unique ID for local storage.
 *
 * Replaces `uuid` v11 which requires the `react-native-get-random-values`
 * polyfill on React Native. Without the polyfill, calling `uuidv4()` crashes
 * with "crypto.getRandomValues is not implemented" the first time it's invoked.
 *
 * Format: `<base36-timestamp>-<14-char-random>` (~22 chars), collision
 * probability negligible for single-device local storage.
 */
export function localId(): string {
  const ts = Date.now().toString(36);
  const r1 = Math.random().toString(36).slice(2, 11);
  const r2 = Math.random().toString(36).slice(2, 7);
  return `${ts}-${r1}${r2}`;
}

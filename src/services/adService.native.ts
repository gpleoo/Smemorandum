import { Platform } from 'react-native';
import MobileAds, {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { getSettings, updateSetting } from '../storage/settingsStorage';

// ---------------------------------------------------------------------------
// Ad Unit IDs
// Replace the production IDs with your real AdMob unit IDs before release.
// ---------------------------------------------------------------------------
export const AD_UNIT_IDS = {
  banner: {
    ios: __DEV__
      ? 'ca-app-pub-3940256099942544/2934735716'   // Google test banner (iOS)
      : 'YOUR_IOS_BANNER_AD_UNIT_ID',
    android: __DEV__
      ? 'ca-app-pub-3940256099942544/6300978111'   // Google test banner (Android)
      : 'YOUR_ANDROID_BANNER_AD_UNIT_ID',
  },
  interstitial: {
    ios: __DEV__
      ? 'ca-app-pub-3940256099942544/4411468910'   // Google test interstitial (iOS)
      : 'YOUR_IOS_INTERSTITIAL_AD_UNIT_ID',
    android: __DEV__
      ? 'ca-app-pub-3940256099942544/1033173712'   // Google test interstitial (Android)
      : 'YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID',
  },
};

export function getBannerAdUnitId(): string {
  return Platform.OS === 'ios'
    ? AD_UNIT_IDS.banner.ios
    : AD_UNIT_IDS.banner.android;
}

export function getInterstitialAdUnitId(): string {
  return Platform.OS === 'ios'
    ? AD_UNIT_IDS.interstitial.ios
    : AD_UNIT_IDS.interstitial.android;
}

// ---------------------------------------------------------------------------
// Initialization — cached promise so callers can safely await readiness
// ---------------------------------------------------------------------------
let initPromise: Promise<void> | null = null;

export function initializeAdMob(): Promise<void> {
  if (!initPromise) {
    initPromise = MobileAds()
      .initialize()
      .then(() => undefined)
      .catch(() => undefined);
  }
  return initPromise;
}

// ---------------------------------------------------------------------------
// Interstitial — frequency capped (every AD_FREQUENCY_CAP saves)
// ---------------------------------------------------------------------------
const AD_FREQUENCY_CAP = 5;
let actionsSinceLastAd = 0;

export async function showInterstitialIfDue(): Promise<void> {
  actionsSinceLastAd++;
  if (actionsSinceLastAd < AD_FREQUENCY_CAP) return;
  actionsSinceLastAd = 0;

  try {
    await initializeAdMob();
    const settings = await getSettings();
    const nonPersonalized = settings.adsConsent !== true;

    const adUnitId = getInterstitialAdUnitId();
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: nonPersonalized,
    });

    await new Promise<void>((resolve, reject) => {
      const unsubLoad = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          unsubLoad();
          interstitial.show().then(resolve).catch(reject);
        },
      );
      const unsubError = interstitial.addAdEventListener(
        AdEventType.ERROR,
        (e: Error) => {
          unsubError();
          reject(e);
        },
      );
      interstitial.load();
    });
  } catch {
    // Silently fail
  }
}

// ---------------------------------------------------------------------------
// Consent helpers
// ---------------------------------------------------------------------------
export async function setAdsConsent(value: boolean): Promise<void> {
  await updateSetting('adsConsent', value);
}

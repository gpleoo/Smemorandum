// Web stub — AdMob is not available on web. All functions are no-ops.

export const AD_UNIT_IDS = {
  banner: { ios: '', android: '' },
  interstitial: { ios: '', android: '' },
};

export function getBannerAdUnitId(): string { return ''; }
export function getInterstitialAdUnitId(): string { return ''; }
export async function initializeAdMob(): Promise<void> {}
export async function showInterstitialIfDue(): Promise<void> {}
export async function setAdsConsent(_value: boolean): Promise<void> {}

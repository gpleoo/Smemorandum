import { Platform } from 'react-native';
import Purchases, {
  PurchasesOffering,
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

// ---------------------------------------------------------------------------
// RevenueCat API Keys
// Replace with your real keys from https://app.revenuecat.com
// ---------------------------------------------------------------------------
const RC_API_KEYS = {
  ios: 'appl_YOUR_REVENUECAT_IOS_API_KEY',
  android: 'goog_YOUR_REVENUECAT_ANDROID_API_KEY',
};

export const ENTITLEMENT_ID = 'premium';

// Product identifiers (must match App Store Connect / Google Play Console)
export const PRODUCT_IDS = {
  YEARLY: 'smemorandum_yearly',   // e.g. €19.99/year
  MONTHLY: 'smemorandum_monthly', // e.g. €2.99/month
};

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
export async function configurePurchases(): Promise<void> {
  try {
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.WARN);
    }
    const apiKey =
      Platform.OS === 'ios' ? RC_API_KEYS.ios : RC_API_KEYS.android;
    await Purchases.configure({ apiKey });
  } catch {
    // Silently fail — purchases UI will show an error when attempted
  }
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------
const ALL_PREMIUM = process.env.EXPO_PUBLIC_ALL_PREMIUM === 'true';

export async function isPremiumUser(): Promise<boolean> {
  if (ALL_PREMIUM) return true;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Offerings
// ---------------------------------------------------------------------------
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Purchase
// Returns true if premium was activated, false if user cancelled, throws on error
// ---------------------------------------------------------------------------
export async function purchasePackage(packageIdentifier: string): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === packageIdentifier,
    );
    if (!pkg) throw new Error('Package not found: ' + packageIdentifier);
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    if (e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return false;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------
export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Listener
// ---------------------------------------------------------------------------
export function addCustomerInfoListener(
  callback: (info: CustomerInfo) => void,
): () => void {
  return Purchases.addCustomerInfoUpdateListener(callback);
}

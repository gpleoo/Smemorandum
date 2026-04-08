// Web stub — in-app purchases are not available on web.

export const ENTITLEMENT_ID = 'premium';
export const PRODUCT_IDS = { YEARLY: 'smemorandum_yearly', MONTHLY: 'smemorandum_monthly' };

export async function configurePurchases(): Promise<void> {}
export async function isPremiumUser(): Promise<boolean> { return false; }
export async function getOfferings() { return null; }
export async function purchasePackage(_id: string): Promise<boolean> { return false; }
export async function restorePurchases(): Promise<boolean> { return false; }
export function addCustomerInfoListener(_cb: any): () => void { return () => {}; }

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  configurePurchases,
  isPremiumUser,
  purchasePackage,
  restorePurchases,
  addCustomerInfoListener,
} from '../services/purchaseService';

interface PremiumContextType {
  isPremium: boolean;
  isLoadingPremium: boolean;
  purchase: (packageIdentifier: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isLoadingPremium: true,
  purchase: async () => false,
  restore: async () => false,
  refresh: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(true);

  const refresh = useCallback(async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      await configurePurchases();
      await refresh();
      setIsLoadingPremium(false);
    })();

    if (Platform.OS !== 'web') {
      unsub = addCustomerInfoListener((info) => {
        setIsPremium(info.entitlements.active['premium'] !== undefined);
      });
    }

    return () => unsub?.();
  }, [refresh]);

  const purchase = useCallback(async (packageIdentifier: string): Promise<boolean> => {
    const result = await purchasePackage(packageIdentifier);
    if (result) setIsPremium(true);
    return result;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const result = await restorePurchases();
    if (result) setIsPremium(true);
    return result;
  }, []);

  return (
    <PremiumContext.Provider
      value={{ isPremium, isLoadingPremium, purchase, restore, refresh }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}

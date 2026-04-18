import React, { useEffect, useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId, initializeAdMob } from '../services/adService';
import { usePremium } from '../context/PremiumContext';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AdBanner({ style }: Props) {
  const { isPremium } = usePremium();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initializeAdMob().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isPremium || !ready) return null;

  return (
    <View style={[{ alignItems: 'center', width: '100%' }, style]}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={() => {
          // Silently hide the banner on load failure
        }}
      />
    </View>
  );
}

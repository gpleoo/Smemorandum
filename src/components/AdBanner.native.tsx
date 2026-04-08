import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../services/adService';
import { usePremium } from '../context/PremiumContext';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AdBanner({ style }: Props) {
  const { isPremium } = usePremium();

  // Premium users see no ads
  if (isPremium) return null;

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

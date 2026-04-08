import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../services/adService';

interface Props {
  style?: StyleProp<ViewStyle>;
  nonPersonalized?: boolean;
}

export function AdBanner({ style, nonPersonalized = false }: Props) {
  return (
    <View style={[{ alignItems: 'center', width: '100%' }, style]}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: nonPersonalized }}
        onAdFailedToLoad={() => {
          // Banner silently disappears on failure — no crash
        }}
      />
    </View>
  );
}

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { updateSetting } from '../storage/settingsStorage';

const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

const slides: Slide[] = [
  {
    key: '1',
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Description',
    icon: 'calendar',
    color: '#6C63FF',
  },
  {
    key: '2',
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Description',
    icon: 'grid',
    color: '#FF6584',
  },
  {
    key: '3',
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Description',
    icon: 'notifications',
    color: '#00C9A7',
  },
];

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = async () => {
    await updateSetting('hasSeenOnboarding', true);
    navigation.goBack();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: item.color + '20' },
        ]}
      >
        <Ionicons name={item.icon as any} size={64} color={item.color} />
      </View>
      <Text style={[typo.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.xl }]}>
        {t(item.titleKey)}
      </Text>
      <Text
        style={[
          typo.body,
          {
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.md,
            paddingHorizontal: spacing.xl,
          },
        ]}
      >
        {t(item.descriptionKey)}
      </Text>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={handleFinish} style={{ padding: spacing.md }}>
          <Text style={[typo.body, { color: colors.textSecondary }]}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.textTertiary,
                width: index === currentIndex ? 24 : 8,
                borderRadius: 4,
              },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.lg,
            marginHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginBottom: spacing.xl,
          },
        ]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={[typo.button, { color: '#FFF' }]}>
          {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { alignItems: 'flex-end', paddingTop: 50 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    marginHorizontal: 4,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

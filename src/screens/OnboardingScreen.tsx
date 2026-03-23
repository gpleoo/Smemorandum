import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typo.h1, { color: colors.text, padding: spacing.lg }]}>
        {t('onboarding.slide1Title')}
      </Text>
      <Text style={[typo.body, { color: colors.textSecondary, paddingHorizontal: spacing.lg }]}>
        {t('onboarding.slide1Description')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

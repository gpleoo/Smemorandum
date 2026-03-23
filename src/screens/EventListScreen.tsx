import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

export function EventListScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typo.h1, { color: colors.text, padding: spacing.lg }]}>
        {t('events.title')}
      </Text>
      <Text style={[typo.body, { color: colors.textSecondary, paddingHorizontal: spacing.lg }]}>
        {t('events.noEventsDescription')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

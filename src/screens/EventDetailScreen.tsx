import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function EventDetailScreen() {
  const { colors, typography: typo, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typo.h1, { color: colors.text, padding: spacing.lg }]}>
        Dettaglio Evento
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

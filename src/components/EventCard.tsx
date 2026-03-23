import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SEvent } from '../models/types';
import { useCategories } from '../hooks/useCategories';
import { formatRelativeDate, daysUntil } from '../utils/dateUtils';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { useTranslation } from 'react-i18next';
import { CategoryBadge } from './CategoryBadge';

interface EventCardProps {
  event: SEvent;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { colors, spacing, borderRadius, typography: typo } = useTheme();
  const { getCategoryById } = useCategories();
  const { t, i18n } = useTranslation();
  const category = getCategoryById(event.categoryId);
  const nextDate = getNextOccurrence(event, new Date());
  const days = nextDate ? daysUntil(nextDate) : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderLeftColor: category?.color ?? colors.primary,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[typo.h3, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.meta, { marginTop: spacing.xs }]}>
            <Ionicons
              name={event.eventType === 'ricorrenza' ? 'repeat' : 'time'}
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[typo.bodySmall, { color: colors.textSecondary, marginLeft: 4 }]}>
              {nextDate ? formatRelativeDate(nextDate, i18n.language) : '—'}
            </Text>
          </View>
          {category && (
            <View style={{ marginTop: spacing.xs }}>
              <CategoryBadge category={category} />
            </View>
          )}
        </View>
        {days !== null && days >= 0 && (
          <View
            style={[
              styles.countdown,
              {
                backgroundColor: days === 0 ? colors.error : days <= 3 ? colors.warning : colors.primaryLight,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
              },
            ]}
          >
            <Text style={[typo.h2, { color: '#FFF', textAlign: 'center' }]}>
              {days}
            </Text>
            <Text style={[typo.caption, { color: '#FFF', textAlign: 'center' }]}>
              {days === 0
                ? t('home.todayLabel')
                : days === 1
                ? t('home.tomorrow')
                : t('home.daysLeft', { count: days })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdown: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

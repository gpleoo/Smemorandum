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
import { nextAge, isMilestone } from '../services/nameDayService';
import { getEventKind, getEventAccent } from '../theme/eventColors';
import { HOLIDAY_TEMPLATES } from '../data/holidayTemplates';

interface EventCardProps {
  event: SEvent;
  onPress: () => void;
}

function initials(title: string): string {
  const parts = title.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { colors, spacing, borderRadius, typography: typo } = useTheme();
  const { getCategoryById } = useCategories();
  const { t, i18n } = useTranslation();
  const category = getCategoryById(event.categoryId);
  const nextDate = getNextOccurrence(event, new Date());
  const days = nextDate ? daysUntil(nextDate) : null;
  const kind = getEventKind(event);
  const accent = getEventAccent(kind, colors);
  const avatarColor = kind === 'holiday' ? accent : category?.color ?? accent;
  const age = event.eventType === 'ricorrenza' && event.recurrence.type === 'yearly'
    ? nextAge(event.date)
    : null;
  const milestone = age !== null ? isMilestone(age) : false;
  const isHoliday = kind === 'holiday';
  const holidayTemplate = isHoliday
    ? HOLIDAY_TEMPLATES.find((h) => h.id === event.sourceTemplateId)
    : undefined;
  const countdownBg =
    days === 0 ? colors.error : days !== null && days <= 3 ? colors.warning : accent;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderLeftColor: avatarColor,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* Avatar: emoji template per festività, iniziali per il resto */}
        <View style={[styles.avatar, { backgroundColor: avatarColor + '25', marginRight: spacing.sm }]}>
          {holidayTemplate ? (
            <Text style={styles.avatarEmoji}>{holidayTemplate.icon}</Text>
          ) : (
            <Text style={[typo.bodySmall, { color: avatarColor, fontWeight: '700' }]}>
              {initials(event.title)}
            </Text>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[typo.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {event.title}
            </Text>
            {milestone && <Text style={styles.milestoneIcon}>🏆</Text>}
          </View>
          {isHoliday && (
            <View
              style={[
                styles.holidayPill,
                {
                  backgroundColor: colors.warning + '25',
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  marginTop: 2,
                },
              ]}
            >
              <Text style={[typo.caption, { color: colors.warning, fontWeight: '700' }]}>
                {t('calendar.holidayBadge')}
              </Text>
            </View>
          )}
          {age !== null && (
            <Text style={[typo.caption, { color: colors.primary, fontWeight: '700' }]}>
              {t('eventForm.ageLabel', { age })}
            </Text>
          )}
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
                backgroundColor: countdownBg + '1F',
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <Text style={[typo.h2, { color: countdownBg, textAlign: 'center', fontWeight: '800' }]}>
              {days}
            </Text>
            <Text style={[typo.caption, { color: countdownBg, textAlign: 'center', fontWeight: '600' }]}>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  holidayPill: {
    alignSelf: 'flex-start',
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

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { SEvent } from '../models/types';
import { formatDate } from '../utils/dateUtils';
import { nextAge } from '../services/nameDayService';

interface ShareCardProps {
  event: SEvent;
  /** Date of the next occurrence of the event (already computed by caller) */
  nextDate: Date;
  /** Days until the next occurrence (0 = today) */
  daysAway: number;
}

/**
 * Off-screen card rendered when the user taps "Condividi auguri" so we can
 * snapshot it via react-native-view-shot. Width matches a 9:16 share image
 * but is rendered at a comfortable on-screen size (the snapshot scales).
 */
export const ShareCard = forwardRef<View, ShareCardProps>(({ event, nextDate, daysAway }, ref) => {
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const { t, i18n } = useTranslation();

  const age = event.eventType === 'ricorrenza'
    && event.recurrence.type === 'yearly'
    && !event.sourceTemplateId
    ? nextAge(event.date)
    : null;

  const dateStr = formatDate(nextDate, 'd MMMM', i18n.language);
  const headline = daysAway === 0
    ? t('share.headlineToday')
    : t('share.headlineSoon', { count: daysAway });

  return (
    <View ref={ref} collapsable={false} style={styles.wrapper}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderRadius: borderRadius.xl, padding: spacing.xl }]}
      >
        <View style={styles.brandRow}>
          <View style={styles.monogram}>
            <Text style={styles.monogramLetter}>S</Text>
          </View>
          <Text style={[typo.bodySmall, { color: '#FFFFFF', marginLeft: 8, fontWeight: '600' }]}>
            Smemorandum
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={[typo.caption, { color: '#FFFFFFAA', letterSpacing: 1, marginBottom: spacing.xs }]}>
            {headline.toUpperCase()}
          </Text>
          <Text style={[styles.title]} numberOfLines={2}>
            {event.title}
          </Text>
          {age !== null && (
            <Text style={styles.age}>
              {t('share.ageLine', { age })}
            </Text>
          )}
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        <Text style={styles.footer}>
          {t('share.footer')}
        </Text>
      </LinearGradient>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  // Renders off the visible area but mountable so captureRef works
  wrapper: {
    position: 'absolute',
    top: -10000,
    left: 0,
  },
  card: {
    width: 540,
    height: 960,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monogram: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramLetter: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    lineHeight: 22,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -1,
  },
  age: {
    color: '#FFFFFFE6',
    fontSize: 28,
    marginTop: 12,
    fontFamily: 'Inter_500Medium',
  },
  date: {
    color: '#FFFFFFCC',
    fontSize: 22,
    marginTop: 16,
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    color: '#FFFFFFAA',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
});

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { daysUntil, formatDate } from '../utils/dateUtils';

const MONTH_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const { events } = useEvents();
  const { categories } = useCategories();

  const stats = useMemo(() => {
    const now = new Date();
    const totalEvents = events.length;
    const totalCategories = categories.length;

    // Next event
    const upcoming = events
      .map((e) => ({ event: e, next: getNextOccurrence(e, now) }))
      .filter((x) => x.next && daysUntil(x.next) >= 0)
      .sort((a, b) => daysUntil(a.next!) - daysUntil(b.next!));
    const nextEvent = upcoming[0] ?? null;

    // Events by month
    const byMonth = Array(12).fill(0);
    for (const e of events) {
      const next = getNextOccurrence(e, now);
      if (next) byMonth[next.getMonth()]++;
    }
    const maxMonth = Math.max(...byMonth, 1);
    const busiestMonthIdx = byMonth.indexOf(Math.max(...byMonth));

    // Events by category
    const byCat: Record<string, number> = {};
    for (const e of events) {
      byCat[e.categoryId] = (byCat[e.categoryId] ?? 0) + 1;
    }

    return { totalEvents, totalCategories, nextEvent, byMonth, maxMonth, busiestMonthIdx, byCat };
  }, [events, categories]);

  const monthNames: string[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(2024, i, 1);
      return d.toLocaleString(i18n.language, { month: 'short' });
    });
  }, [i18n.language]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typo.h1, { color: colors.text }]}>{t('stats.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>

        {/* Summary cards */}
        <View style={styles.cardsRow}>
          <StatCard
            icon="calendar" value={stats.totalEvents}
            label={t('stats.totalEvents')}
            colors={colors} typo={typo} spacing={spacing} borderRadius={borderRadius}
          />
          <StatCard
            icon="color-palette" value={stats.totalCategories}
            label={t('stats.totalCategories')}
            colors={colors} typo={typo} spacing={spacing} borderRadius={borderRadius}
          />
        </View>

        {/* Next event */}
        {stats.nextEvent && (
          <View style={[styles.nextCard, {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            marginBottom: spacing.lg,
          }]}>
            <Text style={[typo.label, { color: '#FFFFFF99' }]}>{t('stats.nextEvent')}</Text>
            <Text style={[typo.h2, { color: '#FFF', marginTop: 4 }]} numberOfLines={1}>
              {stats.nextEvent.event.title}
            </Text>
            <Text style={[typo.body, { color: '#FFFFFFCC', marginTop: 4 }]}>
              {formatDate(stats.nextEvent.next!, 'dd MMMM', i18n.language)}
              {' · '}
              {daysUntil(stats.nextEvent.next!) === 0
                ? t('home.todayLabel')
                : daysUntil(stats.nextEvent.next!) === 1
                ? t('home.tomorrow')
                : t('home.daysLeft', { count: daysUntil(stats.nextEvent.next!) })}
            </Text>
          </View>
        )}

        {/* Events by month chart */}
        <Text style={[typo.h3, { color: colors.text, marginBottom: spacing.md }]}>
          {t('stats.byMonth')}
        </Text>
        <View style={[styles.chartCard, {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }]}>
          <View style={styles.bars}>
            {stats.byMonth.map((count, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barWrapper]}>
                  <View style={[
                    styles.bar,
                    {
                      height: count > 0 ? Math.max(4, (count / stats.maxMonth) * 80) : 0,
                      backgroundColor: i === stats.busiestMonthIdx ? colors.primary : colors.primary + '55',
                      borderRadius: 3,
                    },
                  ]} />
                </View>
                <Text style={[typo.caption, { color: colors.textTertiary, fontSize: 9, textAlign: 'center' }]}>
                  {monthNames[i]}
                </Text>
                {count > 0 && (
                  <Text style={[typo.caption, { color: colors.primary, fontWeight: '700', fontSize: 9, textAlign: 'center' }]}>
                    {count}
                  </Text>
                )}
              </View>
            ))}
          </View>
          {stats.busiestMonthIdx >= 0 && stats.byMonth[stats.busiestMonthIdx] > 0 && (
            <Text style={[typo.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
              {t('stats.busiestMonth', { month: monthNames[stats.busiestMonthIdx] })}
            </Text>
          )}
        </View>

        {/* Events by category */}
        {categories.length > 0 && (
          <>
            <Text style={[typo.h3, { color: colors.text, marginBottom: spacing.md }]}>
              {t('stats.byCategory')}
            </Text>
            <View style={[{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.lg,
            }]}>
              {categories.map((cat) => {
                const count = stats.byCat[cat.id] ?? 0;
                const pct = stats.totalEvents > 0 ? count / stats.totalEvents : 0;
                return (
                  <View key={cat.id} style={{ marginBottom: spacing.sm }}>
                    <View style={[styles.catRow]}>
                      <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                      <Text style={[typo.bodySmall, { color: colors.text, marginLeft: 6, flex: 1 }]}>
                        {cat.name}
                      </Text>
                      <Text style={[typo.bodySmall, { color: colors.textSecondary, fontWeight: '700' }]}>
                        {count}
                      </Text>
                    </View>
                    <View style={[styles.catBar, { backgroundColor: colors.surfaceVariant, borderRadius: 3 }]}>
                      <View style={[styles.catBarFill, {
                        width: `${pct * 100}%`,
                        backgroundColor: cat.color,
                        borderRadius: 3,
                      }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {events.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
              {t('stats.empty')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, colors, typo, spacing, borderRadius }: any) {
  return (
    <View style={[{
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      marginHorizontal: 4,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }]}>
      <Ionicons name={icon} size={28} color={colors.primary} />
      <Text style={[typo.h1, { color: colors.text, marginTop: 4 }]}>{value}</Text>
      <Text style={[typo.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  cardsRow: { flexDirection: 'row', marginBottom: 16 },
  nextCard: {},
  chartCard: {},
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100 },
  barCol: { flex: 1, alignItems: 'center' },
  barWrapper: { height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%' },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  catBar: { height: 6, width: '100%' },
  catBarFill: { height: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
});

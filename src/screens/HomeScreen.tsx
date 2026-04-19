import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tapLight } from '../utils/haptics';

function CountBadge({ count, colors, typo }: { count: number; colors: any; typo: any }) {
  return (
    <View style={{
      backgroundColor: colors.primary + '20',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    }}>
      <Text style={[typo.caption, { color: colors.primary, fontWeight: '700' }]}>{count}</Text>
    </View>
  );
}
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { HomeStackParamList } from '../models/types';
import { daysUntil } from '../utils/dateUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../components/AdBanner';
import { Confetti } from '../components/Confetti';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const { upcomingEvents, isLoading } = useEvents();

  const todayEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) === 0
  );
  const hasTodayBirthday = todayEvents.some((item) => item.event.eventType === 'ricorrenza');
  const weekEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) > 0 && daysUntil(item.nextDate) <= 7
  );
  const monthEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) > 7 && daysUntil(item.nextDate) <= 30
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('home.greetingMorning');
    if (h < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  }, [t]);

  const nextEvent = useMemo(() => {
    const future = upcomingEvents
      .filter((i) => i.nextDate && daysUntil(i.nextDate) > 0)
      .sort((a, b) => daysUntil(a.nextDate!) - daysUntil(b.nextDate!));
    return future[0];
  }, [upcomingEvents]);

  const summary = useMemo(() => {
    if (todayEvents.length > 0) {
      return t('home.summaryToday', { count: todayEvents.length });
    }
    if (nextEvent && nextEvent.nextDate) {
      return t('home.summaryNext', {
        title: nextEvent.event.title,
        days: daysUntil(nextEvent.nextDate),
      });
    }
    return t('home.summaryNone');
  }, [todayEvents.length, nextEvent, t]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasEvents = upcomingEvents.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient
        colors={[colors.primary + '18', colors.primary + '04']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}
      >
        <Text style={[typo.caption, { color: colors.primary, fontWeight: '700', letterSpacing: 0.5 }]}>
          {t('home.title').toUpperCase()}
        </Text>
        <Text style={[typo.h1, { color: colors.text, marginTop: 2 }]}>{greeting}</Text>
        <Text style={[typo.bodySmall, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
          {summary}
        </Text>
      </LinearGradient>

      {!hasEvents ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={72} color={colors.textTertiary} />
          <Text style={[typo.h3, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
            {t('home.noEvents')}
          </Text>
          <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            {t('home.noEventsHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={{ padding: spacing.md }}
          ListHeaderComponent={
            <>
              {todayEvents.length > 0 && (
                <CollapsibleSection
                  title={t('home.today')}
                  rightElement={<CountBadge count={todayEvents.length} colors={colors} typo={typo} />}
                >
                  {todayEvents.map((item) => (
                    <EventCard
                      key={item.event.id}
                      event={item.event}
                      onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {weekEvents.length > 0 && (
                <CollapsibleSection
                  title={t('home.thisWeek')}
                  rightElement={<CountBadge count={weekEvents.length} colors={colors} typo={typo} />}
                >
                  {weekEvents.map((item) => (
                    <EventCard
                      key={item.event.id}
                      event={item.event}
                      onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {monthEvents.length > 0 && (
                <CollapsibleSection
                  title={t('home.thisMonth')}
                  rightElement={<CountBadge count={monthEvents.length} colors={colors} typo={typo} />}
                >
                  {monthEvents.map((item) => (
                    <EventCard
                      key={item.event.id}
                      event={item.event}
                      onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
                    />
                  ))}
                </CollapsibleSection>
              )}
            </>
          }
        />
      )}

      <Confetti visible={hasTodayBirthday} />
      <AdBanner style={{ marginBottom: 4 }} />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.full,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => {
          tapLight();
          navigation.navigate('EventForm', {});
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

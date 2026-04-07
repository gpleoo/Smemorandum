import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const { upcomingEvents, isLoading } = useEvents();

  const todayEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) === 0
  );
  const weekEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) > 0 && daysUntil(item.nextDate) <= 7
  );
  const monthEvents = upcomingEvents.filter(
    (item) => item.nextDate && daysUntil(item.nextDate) > 7 && daysUntil(item.nextDate) <= 30
  );

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
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typo.h1, { color: colors.text }]}>{t('home.title')}</Text>
      </View>

      {!hasEvents ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
          <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            {t('home.noEvents')}
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
                <CollapsibleSection title={t('home.today')}>
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
                <CollapsibleSection title={t('home.thisWeek')}>
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
                <CollapsibleSection title={t('home.thisMonth')}>
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
        onPress={() => navigation.navigate('EventForm', {})}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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

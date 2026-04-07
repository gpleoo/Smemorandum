import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
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
import { EventsStackParamList, EventType } from '../models/types';
import { getNextOccurrence } from '../utils/recurrenceEngine';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../components/AdBanner';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'EventList'>;
type FilterType = 'all' | EventType;

export function EventListScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const { events, isLoading } = useEvents();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    let result = events;
    if (filter !== 'all') {
      result = result.filter((e) => e.eventType === filter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.description.toLowerCase().includes(lower)
      );
    }
    return result.sort((a, b) => {
      const nextA = getNextOccurrence(a, new Date());
      const nextB = getNextOccurrence(b, new Date());
      if (!nextA) return 1;
      if (!nextB) return -1;
      return nextA.getTime() - nextB.getTime();
    });
  }, [events, filter, search]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('events.all') },
    { key: 'ricorrenza', label: t('events.ricorrenze') },
    { key: 'scadenza', label: t('events.scadenze') },
  ];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <Text style={[typo.h1, { color: colors.text }]}>{t('events.title')}</Text>
      </View>

      <View style={[styles.searchRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[typo.body, { color: colors.text, flex: 1, marginLeft: spacing.sm, paddingVertical: 10 }]}
            placeholder={t('events.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.filterRow, { paddingHorizontal: spacing.md, marginBottom: spacing.sm }]}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.xs,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                typo.bodySmall,
                { color: filter === f.key ? '#FFF' : colors.textSecondary, fontWeight: '600' },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredEvents.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
          <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {t('events.noEvents')}
          </Text>
          <Text style={[typo.bodySmall, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            {t('events.noEventsDescription')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {},
  searchRow: {},
  searchBox: { flexDirection: 'row', alignItems: 'center' },
  filterRow: { flexDirection: 'row' },
  filterChip: {},
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

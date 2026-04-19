import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { CalendarStackParamList } from '../models/types';
import { getOccurrencesInRange } from '../utils/recurrenceEngine';
import { toISODateString } from '../utils/dateUtils';
import { getEventKind, getEventAccent } from '../theme/eventColors';
import { addMonths } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<CalendarStackParamList, 'Calendar'>;

export function CalendarScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const { events, isLoading } = useEvents();
  const [selectedDate, setSelectedDate] = useState(toISODateString(new Date()));

  const markedDates = useMemo(() => {
    type Dot = { key: string; color: string };
    const marks: Record<
      string,
      { dots: Dot[]; selected?: boolean; selectedColor?: string }
    > = {};
    const start = new Date();
    const end = addMonths(start, 6);

    for (const event of events) {
      const kind = getEventKind(event);
      const dotColor = getEventAccent(kind, colors);
      const occurrences = getOccurrencesInRange(event, start, end);
      for (const date of occurrences) {
        const key = toISODateString(date);
        if (!marks[key]) marks[key] = { dots: [] };
        if (!marks[key].dots.some((d) => d.key === kind)) {
          marks[key].dots.push({ key: kind, color: dotColor });
        }
      }
    }

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] ?? { dots: [] }),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marks;
  }, [events, selectedDate, colors]);

  const eventsForDay = useMemo(() => {
    if (!selectedDate) return [];
    const day = new Date(selectedDate + 'T00:00:00');
    return events.filter((event) => {
      const occurrences = getOccurrencesInRange(event, day, day);
      return occurrences.length > 0;
    });
  }, [events, selectedDate]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typo.h1, { color: colors.text }]}>{t('calendar.title')}</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="multi-dot"
        firstDay={1}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textTertiary,
          dotColor: colors.primary,
          selectedDotColor: '#FFFFFF',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={{
          marginHorizontal: spacing.md,
          borderRadius: 12,
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      />

      <View style={[styles.legend, { paddingHorizontal: spacing.md, paddingTop: spacing.sm }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[typo.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {t('calendar.legendMine')}
          </Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: spacing.md }]}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text style={[typo.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {t('calendar.legendBirthday')}
          </Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: spacing.md }]}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={[typo.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {t('calendar.legendScadenza')}
          </Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: spacing.md }]}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={[typo.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {t('calendar.legendHoliday')}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={[typo.h3, { color: colors.text, marginBottom: spacing.sm }]}>
          {t('calendar.eventsForDay')}
        </Text>
      </View>

      {eventsForDay.length === 0 ? (
        <View style={[styles.emptyDay, { padding: spacing.lg }]}>
          <Ionicons name="calendar-clear-outline" size={32} color={colors.textTertiary} />
          <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('calendar.noEvents')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventsForDay}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {},
  emptyDay: { alignItems: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', rowGap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { HomeStackParamList } from '../models/types';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatDate, formatRelativeDate, daysUntil } from '../utils/dateUtils';
import { getNextOccurrence, describeRecurrence } from '../utils/recurrenceEngine';
import { SOUNDS } from '../utils/constants';
import { Share } from 'react-native';

type DetailRoute = RouteProp<HomeStackParamList, 'EventDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList, 'EventDetail'>;

export function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { getEventById, deleteEvent } = useEvents();
  const { getCategoryById } = useCategories();

  const event = getEventById(route.params.eventId);

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
          {t('events.noEvents')}
        </Text>
      </View>
    );
  }

  const category = getCategoryById(event.categoryId);
  const nextDate = getNextOccurrence(event, new Date());
  const days = nextDate ? daysUntil(nextDate) : null;
  const sound = SOUNDS.find((s) => s.id === event.soundId);

  const handleDelete = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm(t('events.deleteConfirm'))) return;
      await deleteEvent(event.id);
      navigation.goBack();
      return;
    }
    Alert.alert(t('events.delete'), t('events.deleteConfirm'), [
      { text: t('events.cancel'), style: 'cancel' },
      {
        text: t('events.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(event.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleShare = async () => {
    const dateStr = nextDate ? formatDate(nextDate, 'dd MMMM yyyy', i18n.language) : event.date;
    const daysStr = days !== null && days >= 0
      ? (days === 0 ? t('home.todayLabel') : days === 1 ? t('home.tomorrow') : t('home.daysLeft', { count: days }))
      : '';
    const msg = `📅 ${event.title} — ${dateStr}${daysStr ? ` (${daysStr})` : ''}\n\n${t('common.sharedVia')} Smemorandum`;
    Share.share({ message: msg, title: event.title }).catch(() => {});
  };

  const getReminderLabel = (daysBefore: number): string => {
    if (daysBefore === 0) return t('eventForm.sameDay');
    if (daysBefore === 1) return t('eventForm.dayBefore');
    if (daysBefore === 7) return t('eventForm.weekBefore');
    return t('eventForm.daysBefore', { count: daysBefore });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            padding: spacing.lg,
            borderBottomLeftRadius: borderRadius.lg,
            borderBottomRightRadius: borderRadius.lg,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Ionicons
            name={event.eventType === 'ricorrenza' ? 'repeat' : 'time'}
            size={24}
            color={colors.primary}
          />
          <Text style={[typo.h1, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
            {event.title}
          </Text>
        </View>

        {category && (
          <View style={{ marginTop: spacing.sm }}>
            <CategoryBadge category={category} size="medium" />
          </View>
        )}

        {nextDate && (
          <View
            style={[
              styles.nextDateBox,
              {
                backgroundColor: colors.primaryLight + '20',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[typo.label, { color: colors.textSecondary }]}>
              {t('eventDetail.nextOccurrence')}
            </Text>
            <Text style={[typo.h2, { color: colors.primary, marginTop: 2 }]}>
              {formatDate(nextDate, 'EEEE dd MMMM yyyy', i18n.language)}
            </Text>
            {days !== null && days >= 0 && (
              <Text style={[typo.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                {days === 0
                  ? t('home.todayLabel')
                  : days === 1
                  ? t('home.tomorrow')
                  : t('home.daysLeft', { count: days })}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Details section */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
        <DetailRow
          icon="calendar-outline"
          label={t('eventForm.date')}
          value={formatDate(event.date, 'dd MMMM yyyy', i18n.language)}
          colors={colors}
          typo={typo}
          spacing={spacing}
        />
        <DetailRow
          icon="repeat"
          label={t('eventDetail.recurrence')}
          value={describeRecurrence(event.recurrence, t)}
          colors={colors}
          typo={typo}
          spacing={spacing}
        />
        {sound && (
          <DetailRow
            icon="musical-note"
            label={t('eventDetail.sound')}
            value={sound.name}
            colors={colors}
            typo={typo}
            spacing={spacing}
          />
        )}

        {/* Reminders */}
        {event.reminders.length > 0 && (
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <Text style={[typo.h3, { color: colors.text, marginBottom: spacing.sm }]}>
              {t('eventDetail.reminders')}
            </Text>
            {event.reminders.map((r) => (
              <View
                key={r.id}
                style={[
                  styles.reminderRow,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <Ionicons name="notifications-outline" size={16} color={colors.primary} />
                <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
                  {getReminderLabel(r.daysBefore)} - {r.time}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {event.description.length > 0 && (
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <Text style={[typo.h3, { color: colors.text, marginBottom: spacing.sm }]}>
              {t('eventDetail.notes')}
            </Text>
            <Text style={[typo.body, { color: colors.textSecondary }]}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Metadata */}
        <View style={[styles.section, { marginTop: spacing.lg }]}>
          <Text style={[typo.caption, { color: colors.textTertiary }]}>
            {t('eventDetail.created')}: {formatDate(event.createdAt, 'dd/MM/yyyy HH:mm', i18n.language)}
          </Text>
          <Text style={[typo.caption, { color: colors.textTertiary, marginTop: 2 }]}>
            {t('eventDetail.modified')}: {formatDate(event.updatedAt, 'dd/MM/yyyy HH:mm', i18n.language)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={[styles.actions, { marginTop: spacing.xl }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                flex: 1,
                marginRight: spacing.sm,
              },
            ]}
            onPress={() => navigation.navigate('EventForm', { eventId: event.id })}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={[typo.button, { color: '#FFF', marginLeft: spacing.xs }]}>
              {t('events.edit')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.error,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                flex: 1,
              },
            ]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFF" />
            <Text style={[typo.button, { color: '#FFF', marginLeft: spacing.xs }]}>
              {t('events.delete')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.sm,
              marginTop: spacing.sm,
              justifyContent: 'center',
            },
          ]}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          <Text style={[typo.body, { color: colors.primary, marginLeft: spacing.xs, fontWeight: '600' }]}>
            {t('events.share')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
  typo,
  spacing,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
  typo: any;
  spacing: any;
}) {
  return (
    <View style={[detailStyles.row, { marginBottom: spacing.sm }]}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <View style={{ marginLeft: spacing.sm }}>
        <Text style={[typo.caption, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[typo.body, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  nextDateBox: {},
  section: {},
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

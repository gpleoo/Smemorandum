import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  Share,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { tapLight, notifySuccess, notifyWarning } from '../utils/haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { HomeStackParamList } from '../models/types';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatDate, daysUntil } from '../utils/dateUtils';
import { getNextOccurrence, describeRecurrence } from '../utils/recurrenceEngine';
import { SOUNDS } from '../utils/constants';
import { nextAge, isMilestone } from '../services/nameDayService';
import { getEventKind, getEventAccent } from '../theme/eventColors';
import { HOLIDAY_TEMPLATES } from '../data/holidayTemplates';
import { ShareCard } from '../components/ShareCard';
import { shareViewSnapshot } from '../services/shareService';

type DetailRoute = RouteProp<HomeStackParamList, 'EventDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList, 'EventDetail'>;

const WISH_TEMPLATE_KEYS = [
  'events.wishTemplate1',
  'events.wishTemplate2',
  'events.wishTemplate3',
  'events.wishTemplate4',
  'events.wishTemplate5',
] as const;

const WISH_TEMPLATE_ICONS = ['🎂', '🎁', '⚡', '🌟', '😄'] as const;

export function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { getEventById, deleteEvent } = useEvents();
  const { getCategoryById } = useCategories();

  const [showWishesModal, setShowWishesModal] = useState(false);
  const shareCardRef = useRef<View>(null);

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
  const kind = getEventKind(event);
  const accent = getEventAccent(kind, colors);
  const holidayTemplate = kind === 'holiday'
    ? HOLIDAY_TEMPLATES.find((h) => h.id === event.sourceTemplateId)
    : undefined;

  // Age & milestone (only for user-created yearly ricorrenza, never for holidays)
  const age = event.eventType === 'ricorrenza'
    && event.recurrence.type === 'yearly'
    && !event.sourceTemplateId
    ? nextAge(event.date)
    : null;
  const milestone = age !== null ? isMilestone(age) : false;
  const isToday = days === 0;

  const handleDelete = async () => {
    notifyWarning();
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

  const openWhatsApp = async (templateKey: string) => {
    setShowWishesModal(false);
    const message = encodeURIComponent(t(templateKey, { name: event.title }));
    const url = `whatsapp://send?text=${message}`;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (!canOpen) {
      Alert.alert('WhatsApp', t('events.whatsappNotInstalled'));
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', t('events.whatsappNotInstalled'));
    });
  };

  const handleShare = async () => {
    const dateStr = nextDate ? formatDate(nextDate, 'dd MMMM yyyy', i18n.language) : event.date;
    const daysStr =
      days !== null && days >= 0
        ? days === 0
          ? t('home.todayLabel')
          : days === 1
          ? t('home.tomorrow')
          : t('home.daysLeft', { count: days })
        : '';
    const msg = `📅 ${event.title} — ${dateStr}${daysStr ? ` (${daysStr})` : ''}\n\n${t('common.sharedVia')} Smemorandum`;
    Share.share({ message: msg, title: event.title }).catch(() => {});
  };

  const handleShareCard = async () => {
    tapLight();
    try {
      await shareViewSnapshot(shareCardRef, `smemorandum-${event.id}`);
    } catch {
      // Sharing cancelled or unavailable — silent
    }
  };

  const getReminderLabel = (daysBefore: number): string => {
    if (daysBefore === 0) return t('eventForm.sameDay');
    if (daysBefore === 1) return t('eventForm.dayBefore');
    if (daysBefore === 7) return t('eventForm.weekBefore');
    return t('eventForm.daysBefore', { count: daysBefore });
  };

  return (
    <>
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
              borderBottomLeftRadius: borderRadius.xl,
              borderBottomRightRadius: borderRadius.xl,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View
              style={[
                styles.titleIconBubble,
                { backgroundColor: accent + '25', marginRight: spacing.sm },
              ]}
            >
              {holidayTemplate ? (
                <Text style={styles.titleEmoji}>{holidayTemplate.icon}</Text>
              ) : (
                <Ionicons
                  name={event.eventType === 'ricorrenza' ? 'repeat' : 'time'}
                  size={22}
                  color={accent}
                />
              )}
            </View>
            <Text style={[typo.h1, { color: colors.text, flex: 1 }]}>
              {event.title}
            </Text>
          </View>

          {(category || kind === 'holiday') && (
            <View style={[styles.badgeRow, { marginTop: spacing.sm }]}>
              {kind === 'holiday' && (
                <View
                  style={[
                    styles.holidayChip,
                    {
                      backgroundColor: colors.warning + '25',
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      marginRight: spacing.xs,
                    },
                  ]}
                >
                  <Text style={[typo.caption, { color: colors.warning, fontWeight: '700' }]}>
                    {t('calendar.holidayBadge')}
                  </Text>
                </View>
              )}
              {category && <CategoryBadge category={category} size="medium" />}
            </View>
          )}

          {nextDate && (
            <LinearGradient
              colors={[accent + '20', accent + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.nextDateBox,
                {
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  marginTop: spacing.md,
                  borderWidth: 1,
                  borderColor: accent + '30',
                },
              ]}
            >
              <View style={styles.nextDateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typo.label, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                    {t('eventDetail.nextOccurrence')}
                  </Text>
                  <Text style={[typo.h2, { color: accent, marginTop: 4, fontWeight: '800' }]}>
                    {formatDate(nextDate, 'EEEE dd MMMM yyyy', i18n.language)}
                  </Text>
                  {days !== null && days >= 0 && (
                    <Text style={[typo.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
                      {isToday
                        ? age !== null
                          ? t('eventForm.birthdayToday')
                          : t('home.todayLabel')
                        : days === 1
                        ? t('home.tomorrow')
                        : t('home.daysLeft', { count: days })}
                    </Text>
                  )}
                </View>
                {days !== null && days >= 0 && !isToday && (
                  <View
                    style={[
                      styles.daysBadge,
                      {
                        backgroundColor: accent,
                        borderRadius: borderRadius.lg,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    <Text style={styles.daysNumber}>{days}</Text>
                    <Text style={styles.daysUnit}>
                      {days === 1 ? 'g' : 'gg'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Age & milestone badges */}
              {age !== null && (
                <View style={[styles.badgeRow, { marginTop: spacing.sm }]}>
                  <View style={[styles.ageBadge, { backgroundColor: accent + '20', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 }]}>
                    <Text style={[typo.bodySmall, { color: accent, fontWeight: '700' }]}>
                      {t('eventForm.ageLabel', { age })}
                    </Text>
                  </View>
                  {milestone && (
                    <View style={[styles.ageBadge, { backgroundColor: '#FFD700' + '30', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, marginLeft: spacing.xs }]}>
                      <Text style={[typo.bodySmall, { color: '#B8860B', fontWeight: '700' }]}>
                        {t('eventForm.milestoneLabel')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>
          )}
        </View>

        {/* Details section */}
        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <DetailRow
              icon="calendar-outline"
              label={t('eventForm.date')}
              value={formatDate(event.date, 'dd MMMM yyyy', i18n.language)}
              colors={colors}
              typo={typo}
              spacing={spacing}
              showDivider
            />
            <DetailRow
              icon="repeat"
              label={t('eventDetail.recurrence')}
              value={describeRecurrence(event.recurrence, t)}
              colors={colors}
              typo={typo}
              spacing={spacing}
              showDivider={!!sound}
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
          </View>

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
              <Text style={[typo.body, { color: colors.textSecondary }]}>{event.description}</Text>
            </View>
          )}

          {/* Capsula del tempo — revealed only on the event day */}
          {event.timeCapsula && isToday && (
            <View style={[
              styles.section,
              {
                marginTop: spacing.md,
                backgroundColor: colors.primary + '10',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.primary + '30',
                borderStyle: 'dashed',
              },
            ]}>
              <View style={[styles.badgeRow, { marginBottom: spacing.xs }]}>
                <Text style={{ fontSize: 20 }}>💌</Text>
                <Text style={[typo.h3, { color: colors.primary, marginLeft: spacing.xs }]}>
                  {t('eventForm.timeCapsula')}
                </Text>
              </View>
              <Text style={[typo.body, { color: colors.text, fontStyle: 'italic' }]}>
                {event.timeCapsula}
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
              onPress={() => {
                tapLight();
                navigation.navigate('EventForm', { eventId: event.id });
              }}
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

          {/* Birthday share card — image with name/age/date for socials */}
          {kind === 'birthday' && nextDate && days !== null && days >= 0 && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.sm,
                  justifyContent: 'center',
                },
              ]}
              onPress={handleShareCard}
            >
              <Ionicons name="image-outline" size={20} color="#FFF" />
              <Text style={[typo.body, { color: '#FFF', marginLeft: spacing.xs, fontWeight: '600' }]}>
                {t('share.shareCard')}
              </Text>
            </TouchableOpacity>
          )}

          {/* WhatsApp wishes — only for recurring events (birthdays/anniversaries) */}
          {event.eventType === 'ricorrenza' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: '#25D366',
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.sm,
                  justifyContent: 'center',
                },
              ]}
              onPress={() => setShowWishesModal(true)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={[typo.body, { color: '#FFF', marginLeft: spacing.xs, fontWeight: '600' }]}>
                {t('events.sendWishes')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* WhatsApp template picker modal */}
      <Modal
        visible={showWishesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWishesModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowWishesModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderRadius: borderRadius.xl },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.surfaceVariant }]} />

            <Text style={[typo.h2, { color: colors.text, marginBottom: spacing.xs }]}>
              {t('events.chooseWishTemplate')}
            </Text>
            <Text style={[typo.bodySmall, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              {t('events.chooseWishTemplateDesc', { name: event.title })}
            </Text>

            {WISH_TEMPLATE_KEYS.map((key, i) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.templateRow,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                ]}
                onPress={() => openWhatsApp(key)}
              >
                <Text style={styles.templateIcon}>{WISH_TEMPLATE_ICONS[i]}</Text>
                <Text style={[typo.bodySmall, { color: colors.text, flex: 1, marginLeft: spacing.sm }]}>
                  {t(key, { name: event.title })}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.xs,
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.surfaceVariant,
                },
              ]}
              onPress={() => setShowWishesModal(false)}
            >
              <Text style={[typo.body, { color: colors.textSecondary }]}>
                {t('events.cancel')}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Off-screen share card mounted only for birthdays so view-shot can snapshot it */}
      {kind === 'birthday' && nextDate && days !== null && days >= 0 && (
        <ShareCard ref={shareCardRef} event={event} nextDate={nextDate} daysAway={days} />
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
  typo,
  spacing,
  showDivider,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
  typo: any;
  spacing: any;
  showDivider?: boolean;
}) {
  return (
    <View
      style={[
        detailStyles.row,
        {
          paddingVertical: spacing.sm,
          borderBottomWidth: showDivider ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <View style={{ marginLeft: spacing.sm, flex: 1 }}>
        <Text style={[typo.caption, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[typo.body, { color: colors.text, marginTop: 2 }]}>{value}</Text>
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleEmoji: { fontSize: 22 },
  holidayChip: { alignSelf: 'flex-start' },
  nextDateBox: {},
  nextDateRow: { flexDirection: 'row', alignItems: 'center' },
  daysBadge: {
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  daysNumber: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 30,
  },
  daysUnit: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailCard: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  section: {},
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    padding: 24,
    paddingBottom: 36,
    margin: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: {
    fontSize: 22,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  ageBadge: {},
});

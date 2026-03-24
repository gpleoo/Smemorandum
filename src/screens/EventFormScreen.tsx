import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { ReminderPicker } from '../components/ReminderPicker';
import {
  HomeStackParamList,
  SEvent,
  EventType,
  RecurrenceRule,
  Reminder,
} from '../models/types';
import { SOUNDS, FREE_PLAN_LIMITS } from '../utils/constants';
import { toISODateString, formatDate } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

type FormRoute = RouteProp<HomeStackParamList, 'EventForm'>;

export function EventFormScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const { getEventById, addEvent, updateEvent } = useEvents();
  const { categories } = useCategories();
  const editId = route.params?.eventId;
  const existingEvent = editId ? getEventById(editId) : undefined;

  const [title, setTitle] = useState(existingEvent?.title ?? '');
  const [description, setDescription] = useState(existingEvent?.description ?? '');
  const [eventType, setEventType] = useState<EventType>(existingEvent?.eventType ?? 'ricorrenza');
  const [date, setDate] = useState<Date>(
    existingEvent ? new Date(existingEvent.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    existingEvent?.recurrence ?? { type: 'yearly' }
  );
  const [categoryId, setCategoryId] = useState(
    existingEvent?.categoryId ?? categories[0]?.id ?? ''
  );
  const [reminders, setReminders] = useState<Reminder[]>(existingEvent?.reminders ?? []);
  const [soundId, setSoundId] = useState(existingEvent?.soundId ?? 'gentle-bell');
  const [titleError, setTitleError] = useState(false);

  const isEditing = !!existingEvent;

  const recurrenceOptions: { type: RecurrenceRule['type']; label: string }[] = [
    { type: 'none', label: t('eventForm.recurrenceNone') },
    { type: 'yearly', label: t('eventForm.recurrenceYearly') },
    { type: 'monthly', label: t('eventForm.recurrenceMonthly') },
    { type: 'weekly', label: t('eventForm.recurrenceWeekly') },
  ];

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleRecurrenceChange = (type: RecurrenceRule['type']) => {
    switch (type) {
      case 'none':
        setRecurrence({ type: 'none' });
        break;
      case 'yearly':
        setRecurrence({ type: 'yearly' });
        break;
      case 'monthly':
        setRecurrence({ type: 'monthly', dayOfMonth: date.getDate() });
        break;
      case 'weekly':
        setRecurrence({ type: 'weekly', dayOfWeek: date.getDay() });
        break;
      default:
        setRecurrence({ type: 'none' });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const now = new Date().toISOString();
    const event: SEvent = {
      id: existingEvent?.id ?? uuidv4(),
      title: title.trim(),
      description: description.trim(),
      eventType,
      date: toISODateString(date),
      recurrence,
      categoryId,
      reminders,
      soundId,
      createdAt: existingEvent?.createdAt ?? now,
      updatedAt: now,
    };

    if (isEditing) {
      await updateEvent(event);
    } else {
      await addEvent(event);
    }

    navigation.goBack();
  };

  // TODO: restore premium filter before production release
  // const freeSounds = SOUNDS.filter((s) => !s.premium);
  const freeSounds = SOUNDS; // DEV: all sounds unlocked for testing

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
        {t('eventForm.title')}
      </Text>
      <TextInput
        style={[
          styles.input,
          typo.body,
          {
            color: colors.text,
            backgroundColor: colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            borderColor: titleError ? colors.error : 'transparent',
            borderWidth: titleError ? 1 : 0,
          },
        ]}
        placeholder={t('eventForm.titlePlaceholder')}
        placeholderTextColor={colors.textTertiary}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (text.trim()) setTitleError(false);
        }}
      />
      {titleError && (
        <Text style={[typo.caption, { color: colors.error, marginTop: 2 }]}>
          {t('eventForm.requiredField')}
        </Text>
      )}

      {/* Event Type */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.type')}
      </Text>
      <View style={styles.typeRow}>
        {(['ricorrenza', 'scadenza'] as EventType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              {
                backgroundColor: eventType === type ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                marginRight: spacing.sm,
              },
            ]}
            onPress={() => setEventType(type)}
          >
            <Ionicons
              name={type === 'ricorrenza' ? 'repeat' : 'time'}
              size={18}
              color={eventType === type ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                typo.body,
                {
                  color: eventType === type ? '#FFF' : colors.textSecondary,
                  marginLeft: spacing.xs,
                  fontWeight: '600',
                },
              ]}
            >
              {t(`eventForm.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.date')}
      </Text>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: spacing.md,
          },
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
          {formatDate(date, 'dd MMMM yyyy', i18n.language)}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* Recurrence */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.recurrence')}
      </Text>
      <View style={styles.recurrenceRow}>
        {recurrenceOptions.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={[
              styles.recurrenceChip,
              {
                backgroundColor: recurrence.type === opt.type ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.xs,
                marginBottom: spacing.xs,
              },
            ]}
            onPress={() => handleRecurrenceChange(opt.type)}
          >
            <Text
              style={[
                typo.bodySmall,
                {
                  color: recurrence.type === opt.type ? '#FFF' : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.category')}
      </Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: categoryId === cat.id ? cat.color : colors.surfaceVariant,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.xs,
                marginBottom: spacing.xs,
              },
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={14}
              color={categoryId === cat.id ? '#FFF' : cat.color}
            />
            <Text
              style={[
                typo.bodySmall,
                {
                  color: categoryId === cat.id ? '#FFF' : colors.text,
                  marginLeft: 4,
                  fontWeight: '600',
                },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminders */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.reminders')}
      </Text>
      <ReminderPicker
        reminders={reminders}
        onChange={setReminders}
        maxReminders={FREE_PLAN_LIMITS.MAX_REMINDERS_PER_EVENT}
      />

      {/* Sound */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.sound')}
      </Text>
      <View style={styles.soundRow}>
        {freeSounds.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={[
              styles.soundChip,
              {
                backgroundColor: soundId === sound.id ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.xs,
                marginBottom: spacing.xs,
              },
            ]}
            onPress={() => setSoundId(sound.id)}
          >
            <Ionicons
              name="musical-note"
              size={14}
              color={soundId === sound.id ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                typo.bodySmall,
                {
                  color: soundId === sound.id ? '#FFF' : colors.textSecondary,
                  marginLeft: 4,
                },
              ]}
            >
              {sound.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
        {t('eventForm.description')}
      </Text>
      <TextInput
        style={[
          styles.input,
          typo.body,
          {
            color: colors.text,
            backgroundColor: colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            minHeight: 80,
            textAlignVertical: 'top',
          },
        ]}
        placeholder={t('eventForm.descriptionPlaceholder')}
        placeholderTextColor={colors.textTertiary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
            marginTop: spacing.xl,
          },
        ]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark" size={22} color="#FFF" />
        <Text style={[typo.button, { color: '#FFF', marginLeft: spacing.sm }]}>
          {t('eventForm.save')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {},
  typeRow: { flexDirection: 'row' },
  typeButton: { flexDirection: 'row', alignItems: 'center' },
  dateButton: { flexDirection: 'row', alignItems: 'center' },
  recurrenceRow: { flexDirection: 'row', flexWrap: 'wrap' },
  recurrenceChip: {},
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: { flexDirection: 'row', alignItems: 'center' },
  soundRow: { flexDirection: 'row', flexWrap: 'wrap' },
  soundChip: { flexDirection: 'row', alignItems: 'center' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

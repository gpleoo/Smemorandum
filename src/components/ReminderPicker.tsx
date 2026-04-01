import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Reminder } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

interface ReminderPickerProps {
  reminders: Reminder[];
  onChange: (reminders: Reminder[]) => void;
  maxReminders?: number;
}

const REMINDER_OPTIONS = [
  { daysBefore: 0, key: 'sameDay' },
  { daysBefore: 1, key: 'dayBefore' },
  { daysBefore: 7, key: 'weekBefore' },
];

export function ReminderPicker({ reminders, onChange, maxReminders = 5 }: ReminderPickerProps) {
  const { colors, spacing, borderRadius, typography: typo } = useTheme();
  const { t } = useTranslation();
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate && editingReminderId) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      onChange(reminders.map((r) => (r.id === editingReminderId ? { ...r, time: newTime } : r)));
    }
    if (Platform.OS === 'android') {
      setEditingReminderId(null);
    }
  };

  const getTimePickerValue = (): Date => {
    const editing = reminders.find((r) => r.id === editingReminderId);
    const [h, m] = (editing?.time ?? '09:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const addReminder = (daysBefore: number) => {
    if (reminders.length >= maxReminders) return;
    if (reminders.some((r) => r.daysBefore === daysBefore)) return;

    onChange([
      ...reminders,
      { id: uuidv4(), daysBefore, time: '09:00' },
    ]);
  };

  const removeReminder = (id: string) => {
    onChange(reminders.filter((r) => r.id !== id));
  };

  const getReminderLabel = (daysBefore: number): string => {
    if (daysBefore === 0) return t('eventForm.sameDay');
    if (daysBefore === 1) return t('eventForm.dayBefore');
    if (daysBefore === 7) return t('eventForm.weekBefore');
    return t('eventForm.daysBefore', { count: daysBefore });
  };

  return (
    <View>
      {reminders.map((reminder) => (
        <View
          key={reminder.id}
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
          <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
            {getReminderLabel(reminder.daysBefore)} -
          </Text>
          {Platform.OS === 'web' ? (
            <View style={[styles.timeBadge, { backgroundColor: colors.primary + '20', borderRadius: borderRadius.sm, marginLeft: 4, paddingHorizontal: 8, paddingVertical: 4 }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <input
                type="time"
                value={reminder.time}
                onChange={(e: any) => {
                  if (e.target.value) {
                    onChange(reminders.map((r) => r.id === reminder.id ? { ...r, time: e.target.value } : r));
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: 600,
                  marginLeft: 4,
                  outline: 'none',
                  cursor: 'pointer',
                  width: 80,
                  height: 24,
                }}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setEditingReminderId(reminder.id);
                setShowTimePicker(true);
              }}
              style={[
                styles.timeBadge,
                {
                  backgroundColor: colors.primary + '20',
                  borderRadius: borderRadius.sm,
                  marginLeft: 4,
                },
              ]}
            >
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[typo.bodySmall, { color: colors.primary, fontWeight: '600', marginLeft: 2 }]}>
                {reminder.time}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => removeReminder(reminder.id)}>
            <Ionicons name="close-circle" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}

      {reminders.length < maxReminders && (
        <View style={styles.options}>
          {REMINDER_OPTIONS.filter(
            (opt) => !reminders.some((r) => r.daysBefore === opt.daysBefore)
          ).map((opt) => (
            <TouchableOpacity
              key={opt.daysBefore}
              style={[
                styles.addButton,
                {
                  borderColor: colors.primary,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  marginRight: spacing.xs,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => addReminder(opt.daysBefore)}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[typo.bodySmall, { color: colors.primary, marginLeft: 4 }]}>
                {getReminderLabel(opt.daysBefore)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={getTimePickerValue()}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});

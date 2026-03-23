import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Text style={[typo.body, { color: colors.text, flex: 1, marginLeft: spacing.sm }]}>
            {getReminderLabel(reminder.daysBefore)} - {reminder.time}
          </Text>
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
});

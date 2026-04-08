import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useEventContext } from '../context/EventContext';
import { usePremium } from '../context/PremiumContext';
import { SettingsStackParamList, HolidayTradition } from '../models/types';
import { HOLIDAY_TEMPLATES } from '../data/holidayTemplates';
import {
  filterTemplates,
  getTemplateName,
  isTemplateAdded,
  resolveHolidayDate,
  dateToISO,
  getEffectiveCountries,
} from '../services/templatesService';
import { getSettings, updateSetting } from '../storage/settingsStorage';
import { HOLIDAY_COUNTRIES } from '../utils/constants';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'HolidayTemplates'>;

const TRADITIONS: { key: HolidayTradition; icon: string }[] = [
  { key: 'secular', icon: '🌍' },
  { key: 'catholic', icon: '✝️' },
  { key: 'protestant', icon: '✝️' },
  { key: 'jewish', icon: '✡️' },
  { key: 'islamic', icon: '☪️' },
];

export function HolidayTemplatesScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<Nav>();
  const { events, addEvent, deleteEvent } = useEventContext();
  const { isPremium } = usePremium();

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTraditions, setSelectedTraditions] = useState<HolidayTradition[]>(['secular']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSelectedCountries(getEffectiveCountries(s.holidayCountries, i18n.language));
      setSelectedTraditions(s.holidayTraditions ?? ['secular']);
      setLoading(false);
    });
  }, [i18n.language]);

  const autoCountry = useMemo(
    () => getEffectiveCountries([], i18n.language)[0],
    [i18n.language]
  );

  const filtered = useMemo(
    () => filterTemplates(HOLIDAY_TEMPLATES, selectedCountries, selectedTraditions),
    [selectedCountries, selectedTraditions]
  );

  // Group by month of the resolved 2026 date
  const grouped = useMemo(() => {
    const map: Record<number, typeof filtered> = {};
    for (const tpl of filtered) {
      const date = resolveHolidayDate(tpl.rule, 2026);
      const month = date.getMonth(); // 0-indexed
      if (!map[month]) map[month] = [];
      map[month].push(tpl);
    }
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, templates]) => ({ month: Number(month), templates }));
  }, [filtered]);

  const toggleCountry = async (code: string) => {
    const isAuto = code === autoCountry;
    const isSelected = selectedCountries.includes(code);

    // Free users: only their auto-country, no extras
    if (!isPremium && !isAuto) {
      Alert.alert(t('common.premiumFeature'), t('templates.premiumCountries'));
      return;
    }

    let next: string[];
    if (isSelected && selectedCountries.length > 1) {
      next = selectedCountries.filter((c) => c !== code);
    } else if (!isSelected) {
      next = [...selectedCountries, code];
    } else {
      return; // can't deselect last country
    }

    setSelectedCountries(next);
    const stored = next.includes(autoCountry) && next.length === 1 ? [] : next;
    await updateSetting('holidayCountries', stored);
  };

  const toggleTradition = async (key: HolidayTradition) => {
    const isSelected = selectedTraditions.includes(key);

    // Free users: only secular
    if (!isPremium && key !== 'secular') {
      Alert.alert(t('common.premiumFeature'), t('templates.premiumTraditions'));
      return;
    }

    let next: HolidayTradition[];
    if (isSelected && selectedTraditions.length > 1) {
      next = selectedTraditions.filter((tr) => tr !== key);
    } else if (!isSelected) {
      next = [...selectedTraditions, key];
    } else {
      return; // can't deselect last tradition
    }

    setSelectedTraditions(next);
    await updateSetting('holidayTraditions', next);
  };

  const handleAdd = async (templateId: string) => {
    const template = HOLIDAY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const year = new Date().getFullYear();
    const date = resolveHolidayDate(template.rule, year);
    const name = getTemplateName(template, i18n.language);

    const event = {
      id: uuidv4(),
      title: name,
      description: template.approximate ? t('templates.approximate') : '',
      eventType: 'ricorrenza' as const,
      date: dateToISO(date),
      recurrence: { type: 'yearly' as const },
      categoryId: 'cat-family',
      reminders: [],
      soundId: 'gentle-bell',
      sourceTemplateId: template.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addEvent(event);
    Alert.alert('✓', t('templates.addedSuccess', { name }));
  };

  const handleRemove = async (templateId: string) => {
    const ev = events.find((e) => e.sourceTemplateId === templateId);
    if (!ev) return;
    const template = HOLIDAY_TEMPLATES.find((t) => t.id === templateId);
    const name = template ? getTemplateName(template, i18n.language) : ev.title;
    Alert.alert(
      name,
      t('templates.removeConfirm'),
      [
        { text: t('events.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteEvent(ev.id),
        },
      ]
    );
  };

  const monthName = (month: number) =>
    new Date(2026, month, 1).toLocaleDateString(i18n.language, { month: 'long' });

  if (loading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typo.h1, { color: colors.text, marginLeft: spacing.md, flex: 1 }]}>
          {t('templates.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
        {/* Country filter */}
        <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('templates.filterCountry')}
        </Text>
        <View style={styles.chipRow}>
          {HOLIDAY_COUNTRIES.map((c) => {
            const isSelected = selectedCountries.includes(c.code);
            const isLocked = !isPremium && c.code !== autoCountry;
            return (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    marginRight: spacing.xs,
                    marginBottom: spacing.xs,
                    opacity: isLocked ? 0.6 : 1,
                  },
                ]}
                onPress={() => toggleCountry(c.code)}
              >
                <Text>{c.flag}</Text>
                <Text
                  style={[
                    typo.bodySmall,
                    { color: isSelected ? '#FFF' : colors.text, marginLeft: 4, fontWeight: '600' },
                  ]}
                >
                  {c.name}
                </Text>
                {isLocked && (
                  <Ionicons name="lock-closed" size={11} color={isSelected ? '#FFF' : colors.textTertiary} style={{ marginLeft: 3 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tradition filter */}
        <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          {t('templates.filterTradition')}
        </Text>
        <View style={styles.chipRow}>
          {TRADITIONS.map(({ key, icon }) => {
            const isSelected = selectedTraditions.includes(key);
            const isLocked = !isPremium && key !== 'secular';
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    marginRight: spacing.xs,
                    marginBottom: spacing.xs,
                    opacity: isLocked ? 0.6 : 1,
                  },
                ]}
                onPress={() => toggleTradition(key)}
              >
                <Text>{icon}</Text>
                <Text
                  style={[
                    typo.bodySmall,
                    { color: isSelected ? '#FFF' : colors.text, marginLeft: 4, fontWeight: '600' },
                  ]}
                >
                  {t(`templates.${key}`)}
                </Text>
                {isLocked && (
                  <Ionicons name="lock-closed" size={11} color={isSelected ? '#FFF' : colors.textTertiary} style={{ marginLeft: 3 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Premium banner for free users */}
        {!isPremium && (
          <TouchableOpacity
            style={[
              styles.premiumBanner,
              {
                backgroundColor: colors.warning + '20',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginTop: spacing.md,
                borderWidth: 1,
                borderColor: colors.warning + '60',
              },
            ]}
            onPress={() => navigation.navigate('Premium')}
          >
            <Ionicons name="star" size={18} color={colors.warning} />
            <Text style={[typo.bodySmall, { color: colors.text, flex: 1, marginLeft: spacing.sm }]}>
              {t('templates.premiumBanner')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Template list grouped by month */}
        {grouped.length === 0 ? (
          <View style={[styles.empty, { marginTop: spacing.xl }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
              {t('templates.noResults')}
            </Text>
          </View>
        ) : (
          grouped.map(({ month, templates }) => (
            <View key={month}>
              <Text
                style={[
                  typo.h3,
                  { color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'capitalize' },
                ]}
              >
                {monthName(month)}
              </Text>
              {templates.map((template) => {
                const name = getTemplateName(template, i18n.language);
                const date = resolveHolidayDate(template.rule, 2026);
                const dateStr = date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });
                const added = isTemplateAdded(template, events);
                return (
                  <View
                    key={template.id}
                    style={[
                      styles.templateRow,
                      {
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.xs,
                      },
                    ]}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={[typo.body, { color: colors.text, fontWeight: '600' }]}>{name}</Text>
                      <Text style={[typo.caption, { color: colors.textSecondary }]}>
                        {dateStr}
                        {template.approximate && '  ⚠️ ' + t('templates.approximate')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.addBtn,
                        {
                          backgroundColor: added ? colors.success + '20' : colors.primary,
                          borderRadius: borderRadius.full,
                          paddingHorizontal: spacing.md,
                          paddingVertical: 6,
                        },
                      ]}
                      onPress={() => (added ? handleRemove(template.id) : handleAdd(template.id))}
                    >
                      {added ? (
                        <Ionicons name="checkmark" size={16} color={colors.success} />
                      ) : (
                        <Ionicons name="add" size={16} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center' },
  premiumBanner: { flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center' },
  templateRow: { flexDirection: 'row', alignItems: 'center' },
  templateIcon: { fontSize: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 36 },
});

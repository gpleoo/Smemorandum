import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { AppSettings, SettingsStackParamList, TabParamList, ThemeMode, ColorTheme } from '../models/types';
import { getSettings, updateSetting } from '../storage/settingsStorage';
import { SUPPORTED_LANGUAGES } from '../utils/constants';
import { COLOR_PALETTES } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTutorial } from '../context/TutorialContext';
import { useEventContext } from '../context/EventContext';
import { shareBackup, pickAndRestoreBackup } from '../services/backupService';
import { setAdsConsent } from '../services/adService';
import { scheduleWeeklyDigest } from '../services/notificationService';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius, setThemeMode, setColorTheme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { showTutorial } = useTutorial();
  const { events, refreshData } = useEventContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      if (s.colorTheme) setColorTheme(s.colorTheme);
    });
  }, []);

  const handleLanguageChange = async (code: string) => {
    await i18n.changeLanguage(code);
    const updated = await updateSetting('language', code);
    setSettings(updated);
  };

  const handleAdConsentChange = async (value: boolean) => {
    await setAdsConsent(value);
    const updated = await updateSetting('adsConsent', value);
    setSettings(updated);
  };

  const handleWeeklyDigestChange = async (value: boolean) => {
    const updated = await updateSetting('weeklyDigestEnabled', value);
    setSettings(updated);
    scheduleWeeklyDigest(events, value, updated.language).catch(() => {});
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    setThemeMode(theme);
    const updated = await updateSetting('theme', theme);
    setSettings(updated);
  };

  const handleColorThemeChange = async (theme: ColorTheme) => {
    setColorTheme(theme);
    const updated = await updateSetting('colorTheme', theme);
    setSettings(updated);
  };

  const handleExportBackup = async () => {
    try {
      await shareBackup();
    } catch {
      // User cancelled share sheet — ignore
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      t('backup.importConfirm'),
      t('backup.importConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.ok'),
          onPress: async () => {
            try {
              const result = await pickAndRestoreBackup();
              await refreshData();
              Alert.alert(
                t('backup.importSuccess'),
                t('backup.importedCount', { events: result.events, categories: result.categories }),
              );
            } catch (e: any) {
              if (e?.message === 'cancelled') return;
              Alert.alert(t('common.error'), t('backup.importError'));
            }
          },
        },
      ],
    );
  };

  const themes: { key: ThemeMode; label: string; icon: string }[] = [
    { key: 'light', label: t('settings.themeLight'), icon: 'sunny' },
    { key: 'dark', label: t('settings.themeDark'), icon: 'moon' },
    { key: 'auto', label: t('settings.themeAuto'), icon: 'phone-portrait' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typo.h1, { color: colors.text }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
        {/* General */}
        <SectionHeader title={t('settings.general')} colors={colors} typo={typo} spacing={spacing} />

        {/* Language */}
        <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('settings.language')}
        </Text>
        <View style={styles.chipRow}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.chip,
                {
                  backgroundColor: i18n.language === lang.code ? colors.primary : colors.surfaceVariant,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  marginRight: spacing.xs,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={{ marginRight: 4 }}>{lang.flag}</Text>
              <Text
                style={[
                  typo.bodySmall,
                  {
                    color: i18n.language === lang.code ? '#FFF' : colors.text,
                    fontWeight: '600',
                  },
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme */}
        <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          {t('settings.theme')}
        </Text>
        <View style={styles.chipRow}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.key}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    settings?.theme === theme.key ? colors.primary : colors.surfaceVariant,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  marginRight: spacing.xs,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => handleThemeChange(theme.key)}
            >
              <Ionicons
                name={theme.icon as any}
                size={14}
                color={settings?.theme === theme.key ? '#FFF' : colors.textSecondary}
              />
              <Text
                style={[
                  typo.bodySmall,
                  {
                    color: settings?.theme === theme.key ? '#FFF' : colors.text,
                    marginLeft: 4,
                    fontWeight: '600',
                  },
                ]}
              >
                {theme.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Theme */}
        <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
          {t('settings.colorTheme')}
        </Text>
        <View style={[styles.chipRow, { flexWrap: 'wrap' }]}>
          {(Object.entries(COLOR_PALETTES) as [ColorTheme, typeof COLOR_PALETTES[ColorTheme]][]).map(([key, palette]) => {
            const isActive = (settings?.colorTheme ?? 'purple') === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: palette.swatch,
                    borderRadius: borderRadius.full,
                    width: 36,
                    height: 36,
                    marginRight: spacing.sm,
                    marginBottom: spacing.xs,
                    borderWidth: isActive ? 3 : 0,
                    borderColor: colors.text,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={() => handleColorThemeChange(key)}
              >
                {isActive && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Statistics */}
        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
              marginTop: spacing.md,
            },
          ]}
          onPress={() => navigation.navigate('Stats')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="bar-chart" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('stats.title')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Replay Tutorial */}
        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginTop: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => {
            navigation.getParent<BottomTabNavigationProp<TabParamList>>()?.navigate('HomeTab');
            setTimeout(() => showTutorial(), 300);
          }}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.replayTutorial')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Notifications */}
        <SectionHeader title={t('settings.notifications')} colors={colors} typo={typo} spacing={spacing} />

        <View
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={[typo.body, { color: colors.text }]}>
                {t('settings.weeklyDigest')}
              </Text>
              <Text style={[typo.bodySmall, { color: colors.textSecondary }]}>
                {t('settings.weeklyDigestDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={settings?.weeklyDigestEnabled ?? true}
            onValueChange={handleWeeklyDigestChange}
            trackColor={{ false: colors.surfaceVariant, true: colors.primary + '80' }}
            thumbColor={settings?.weeklyDigestEnabled ? colors.primary : colors.textTertiary}
          />
        </View>

        {/* Festività */}
        <SectionHeader title={t('templates.holidays')} colors={colors} typo={typo} spacing={spacing} />

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => navigation.navigate('HolidayTemplates')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="globe" size={20} color={colors.primary} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[typo.body, { color: colors.text }]}>
                {t('templates.browseHolidays')}
              </Text>
              <Text style={[typo.bodySmall, { color: colors.textSecondary }]}>
                {t('templates.browseHolidaysDesc')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Categories */}
        <SectionHeader title={t('settings.categories')} colors={colors} typo={typo} spacing={spacing} />

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => navigation.navigate('ManageCategories')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="color-palette" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.manageCategories')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Data */}
        <SectionHeader title={t('settings.data')} colors={colors} typo={typo} spacing={spacing} />

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => navigation.navigate('ImportContacts')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.importContacts')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={handleExportBackup}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="cloud-upload" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.exportBackup')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={handleImportBackup}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="cloud-download" size={20} color={colors.primary} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.importBackup')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Premium */}
        <SectionHeader title={t('settings.premium')} colors={colors} typo={typo} spacing={spacing} />

        <TouchableOpacity
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          onPress={() => navigation.navigate('Premium')}
        >
          <View style={styles.settingsRowLeft}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
              {t('settings.goPremium')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Privacy */}
        <SectionHeader title={t('settings.privacy')} colors={colors} typo={typo} spacing={spacing} />

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={[typo.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.yourDataDescription')}
          </Text>
        </View>

        {/* Ad Consent */}
        <Text style={[typo.label, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          {t('settings.adConsent')}
        </Text>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
          <Text style={[typo.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.adConsentInfo')}
          </Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { value: false, label: t('settings.adConsentNonPersonalized') },
            { value: true, label: t('settings.adConsentPersonalized') },
          ].map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    settings?.adsConsent === opt.value ? colors.primary : colors.surfaceVariant,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  marginRight: spacing.xs,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => handleAdConsentChange(opt.value)}
            >
              <Text
                style={[
                  typo.bodySmall,
                  {
                    color: settings?.adsConsent === opt.value ? '#FFF' : colors.text,
                    fontWeight: '600',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Policy */}
        <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('settings.privacyPolicy')}
        </Text>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={[typo.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.privacyPolicyText')}
          </Text>
        </View>

        {/* Cookie Policy */}
        <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('settings.cookiePolicy')}
        </Text>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name="globe-outline" size={20} color={colors.primary} />
          <Text style={[typo.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.cookiePolicyText')}
          </Text>
        </View>

        {/* Owner */}
        <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {t('settings.owner')}
        </Text>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
          <Text style={[typo.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.ownerDescription', { name: t('settings.ownerName'), email: t('settings.ownerEmail') })}
          </Text>
        </View>

        {/* About */}
        <SectionHeader title={t('settings.about')} colors={colors} typo={typo} spacing={spacing} />

        <View
          style={[
            styles.settingsRow,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[typo.body, { color: colors.textSecondary }]}>
            {t('settings.version')}
          </Text>
          <Text style={[typo.body, { color: colors.text }]}>1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  colors,
  typo,
  spacing,
}: {
  title: string;
  colors: any;
  typo: any;
  spacing: any;
}) {
  return (
    <Text
      style={[
        typo.h3,
        { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center' },
  colorSwatch: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start' },
});

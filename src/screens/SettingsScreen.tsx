import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { AppSettings, SettingsStackParamList, TabParamList, ThemeMode } from '../models/types';
import { getSettings, updateSetting } from '../storage/settingsStorage';
import { SUPPORTED_LANGUAGES } from '../utils/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTutorial } from '../context/TutorialContext';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius, setThemeMode } = useTheme();
  const navigation = useNavigation<Nav>();
  const { showTutorial } = useTutorial();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleLanguageChange = async (code: string) => {
    await i18n.changeLanguage(code);
    const updated = await updateSetting('language', code);
    setSettings(updated);
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    setThemeMode(theme);
    const updated = await updateSetting('theme', theme);
    setSettings(updated);
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
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start' },
});

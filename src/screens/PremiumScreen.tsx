import React from 'react';
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
import { useTheme } from '../theme/ThemeContext';

const features = [
  { icon: 'infinite', key: 'unlimitedEvents' },
  { icon: 'color-palette', key: 'unlimitedCategories' },
  { icon: 'notifications', key: 'multipleReminders' },
  { icon: 'musical-notes', key: 'allSounds' },
  { icon: 'ban', key: 'noAds' },
  { icon: 'cloud-upload', key: 'backup' },
];

export function PremiumScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.warning + '20' },
          ]}
        >
          <Ionicons name="star" size={48} color={colors.warning} />
        </View>
        <Text style={[typo.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
          {t('premium.title')}
        </Text>
        <Text
          style={[
            typo.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
          ]}
        >
          {t('premium.subtitle')}
        </Text>
      </View>

      {/* Features */}
      <View style={{ marginTop: spacing.xl }}>
        {features.map((feature) => (
          <View
            key={feature.key}
            style={[
              styles.featureRow,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.featureIcon,
                {
                  backgroundColor: colors.primary + '15',
                  borderRadius: borderRadius.md,
                  padding: spacing.sm,
                },
              ]}
            >
              <Ionicons name={feature.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.md, flex: 1 }]}>
              {t(`premium.${feature.key}`)}
            </Text>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          </View>
        ))}
      </View>

      {/* Pricing buttons */}
      <View style={{ marginTop: spacing.xl }}>
        <TouchableOpacity
          style={[
            styles.priceButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => Alert.alert(t('premium.title'), t('premium.comingSoon'))}
        >
          <Text style={[typo.button, { color: '#FFF' }]}>
            {t('premium.subscribe')} - {t('premium.yearlyPrice', { price: '€19.99' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.priceButton,
            {
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.md,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => Alert.alert(t('premium.title'), t('premium.comingSoon'))}
        >
          <Text style={[typo.button, { color: colors.text }]}>
            {t('premium.subscribe')} - {t('premium.monthlyPrice', { price: '€2.99' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restore */}
      <TouchableOpacity style={{ alignItems: 'center', marginTop: spacing.lg }}>
        <Text style={[typo.bodySmall, { color: colors.primary }]}>
          {t('premium.restore')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { alignItems: 'center', paddingTop: 20 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIcon: {},
  priceButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

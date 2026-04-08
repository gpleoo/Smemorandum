import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { getOfferings } from '../services/purchaseService';
import { PRODUCT_IDS } from '../services/purchaseService';

const FEATURES = [
  { icon: 'ban',           key: 'noAds' },
  { icon: 'color-palette', key: 'unlimitedCategories' },
  { icon: 'notifications', key: 'multipleReminders' },
  { icon: 'musical-notes', key: 'allSounds' },
  { icon: 'cloud-upload',  key: 'backup' },
];

export function PremiumScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const { isPremium, purchase, restore } = usePremium();

  const [yearlyPrice, setYearlyPrice]   = useState<string>('€19.99');
  const [monthlyPrice, setMonthlyPrice] = useState<string>('€2.99');
  const [loadingId, setLoadingId]       = useState<string | null>(null);

  // Fetch real prices from RevenueCat (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    getOfferings().then((offering) => {
      if (!offering) return;
      for (const pkg of offering.availablePackages) {
        if (pkg.identifier === PRODUCT_IDS.YEARLY) {
          setYearlyPrice(pkg.product.priceString);
        } else if (pkg.identifier === PRODUCT_IDS.MONTHLY) {
          setMonthlyPrice(pkg.product.priceString);
        }
      }
    });
  }, []);

  const handlePurchase = async (packageId: string) => {
    if (Platform.OS === 'web') {
      Alert.alert(t('premium.title'), t('premium.webNotSupported'));
      return;
    }
    setLoadingId(packageId);
    try {
      const success = await purchase(packageId);
      if (success) {
        Alert.alert(t('premium.title'), t('premium.purchaseSuccess'));
      }
    } catch {
      Alert.alert(t('common.error'), t('premium.purchaseError'));
    } finally {
      setLoadingId(null);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') return;
    setLoadingId('restore');
    try {
      const success = await restore();
      Alert.alert(
        t('premium.title'),
        success ? t('premium.restoreSuccess') : t('premium.restoreNotFound'),
      );
    } catch {
      Alert.alert(t('common.error'), t('premium.purchaseError'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 48 }}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
          <Ionicons name="star" size={48} color={colors.warning} />
        </View>
        <Text style={[typo.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
          {t('premium.title')}
        </Text>
        <Text style={[typo.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {isPremium ? t('premium.alreadyPremium') : t('premium.subtitle')}
        </Text>
      </View>

      {/* Features list */}
      <View style={{ marginTop: spacing.xl }}>
        {FEATURES.map((feature) => (
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
                { backgroundColor: colors.primary + '15', borderRadius: borderRadius.md, padding: spacing.sm },
              ]}
            >
              <Ionicons name={feature.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={[typo.body, { color: colors.text, marginLeft: spacing.md, flex: 1 }]}>
              {t(`premium.${feature.key}`)}
            </Text>
            <Ionicons
              name={isPremium ? 'checkmark-circle' : 'lock-closed-outline'}
              size={22}
              color={isPremium ? colors.success : colors.textTertiary}
            />
          </View>
        ))}
      </View>

      {/* Purchase buttons — hidden if already premium */}
      {!isPremium && (
        <View style={{ marginTop: spacing.xl }}>
          {/* Yearly (highlighted) */}
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
            onPress={() => handlePurchase(PRODUCT_IDS.YEARLY)}
            disabled={loadingId !== null}
          >
            {loadingId === PRODUCT_IDS.YEARLY ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={[typo.button, { color: '#FFF' }]}>
                  {t('premium.subscribe')} — {t('premium.yearlyPrice', { price: yearlyPrice })}
                </Text>
                <Text style={[typo.caption, { color: '#FFFFFF99', marginTop: 2 }]}>
                  {t('premium.yearlyBadge')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Monthly */}
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
            onPress={() => handlePurchase(PRODUCT_IDS.MONTHLY)}
            disabled={loadingId !== null}
          >
            {loadingId === PRODUCT_IDS.MONTHLY ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[typo.button, { color: colors.text }]}>
                {t('premium.subscribe')} — {t('premium.monthlyPrice', { price: monthlyPrice })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Restore link */}
      {!isPremium && (
        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: spacing.lg }}
          onPress={handleRestore}
          disabled={loadingId !== null}
        >
          {loadingId === 'restore' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[typo.bodySmall, { color: colors.primary }]}>
              {t('premium.restore')}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Legal note */}
      <Text
        style={[
          typo.caption,
          { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
        ]}
      >
        {t('premium.legalNote')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { alignItems: 'center', paddingTop: 20 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  featureIcon: {},
  priceButton: { alignItems: 'center', justifyContent: 'center' },
});

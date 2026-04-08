import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCategories } from '../hooks/useCategories';
import { usePremium } from '../context/PremiumContext';
import { CATEGORY_COLORS, FREE_PLAN_LIMITS } from '../utils/constants';
import { Category } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_ICONS = [
  // Generale
  'heart', 'briefcase', 'receipt', 'school', 'car',
  'home', 'gift', 'medkit', 'fitness', 'paw',
  'musical-notes', 'airplane', 'restaurant', 'cart', 'book',
  'camera', 'people', 'star', 'leaf', 'wallet',
  // Sport
  'fish', 'football', 'basketball', 'baseball', 'tennisball',
  'golf', 'bicycle', 'boat', 'barbell', 'trophy',
  'snow', 'walk', 'body', 'navigate', 'compass',
];

export function ManageCategoriesScreen() {
  const { t } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { isPremium } = usePremium();

  const [editing, setEditing] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);

  const resetForm = () => {
    setName('');
    setSelectedColor(CATEGORY_COLORS[0]);
    setSelectedIcon(CATEGORY_ICONS[0]);
    setEditing(null);
    setIsAdding(false);
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setIsAdding(true);
    setName(cat.name);
    setSelectedColor(cat.color);
    setSelectedIcon(cat.icon);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editing) {
      await updateCategory({ ...editing, name: trimmed, color: selectedColor, icon: selectedIcon });
    } else {
      if (!isPremium && categories.length >= FREE_PLAN_LIMITS.MAX_CATEGORIES) {
        Alert.alert(t('common.premiumFeature'), t('common.categoryLimitReached', { max: FREE_PLAN_LIMITS.MAX_CATEGORIES }));
        return;
      }
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: trimmed,
        color: selectedColor,
        icon: selectedIcon,
      };
      await addCategory(newCat);
    }
    resetForm();
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      t('manageCategories.deleteTitle'),
      t('manageCategories.deleteMessage', { name: cat.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
        {/* Category list */}
        {categories.map((cat) => (
          <View
            key={cat.id}
            style={[
              styles.categoryRow,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View style={styles.categoryRowLeft}>
              <View style={[styles.colorDot, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon as any} size={16} color="#FFF" />
              </View>
              <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
                {cat.name}
              </Text>
            </View>
            <View style={styles.categoryActions}>
              <TouchableOpacity onPress={() => startEdit(cat)} style={{ marginRight: spacing.sm }}>
                <Ionicons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(cat)}>
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add / Edit form */}
        {isAdding ? (
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              {editing ? t('manageCategories.editCategory') : t('manageCategories.newCategory')}
            </Text>

            {/* Name input */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: borderRadius.md,
                  padding: spacing.sm,
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
                typo.body,
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('manageCategories.namePlaceholder')}
              placeholderTextColor={colors.textTertiary}
            />

            {/* Color picker */}
            <Text style={[typo.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              {t('manageCategories.color')}
            </Text>
            <View style={styles.chipRow}>
              {CATEGORY_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c,
                      borderWidth: selectedColor === c ? 3 : 0,
                      borderColor: colors.text,
                      marginRight: spacing.xs,
                      marginBottom: spacing.xs,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Icon picker */}
            <Text
              style={[
                typo.label,
                { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
              ]}
            >
              {t('manageCategories.icon')}
            </Text>
            <View style={styles.chipRow}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        selectedIcon === icon ? selectedColor : colors.surfaceVariant,
                      borderRadius: borderRadius.full,
                      marginRight: spacing.xs,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  <Ionicons
                    name={icon as any}
                    size={20}
                    color={selectedIcon === icon ? '#FFF' : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { marginTop: spacing.sm, marginBottom: spacing.md }]}>
              <View style={[styles.colorDot, { backgroundColor: selectedColor }]}>
                <Ionicons name={selectedIcon as any} size={16} color="#FFF" />
              </View>
              <Text style={[typo.body, { color: colors.text, marginLeft: spacing.sm }]}>
                {name || t('manageCategories.namePlaceholder')}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={resetForm}
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text style={[typo.button, { color: colors.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.button,
                  {
                    backgroundColor: name.trim() ? colors.primary : colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                  },
                ]}
              >
                <Text style={[typo.button, { color: name.trim() ? '#FFF' : colors.textTertiary }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Ionicons name="add-circle" size={22} color="#FFF" />
            <Text style={[typo.button, { color: '#FFF', marginLeft: spacing.sm }]}>
              {t('manageCategories.addCategory')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryActions: { flexDirection: 'row', alignItems: 'center' },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  input: {},
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  iconCircle: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  button: { alignItems: 'center' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Category } from '../models/types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'small' | 'medium';
}

export function CategoryBadge({ category, size = 'small' }: CategoryBadgeProps) {
  const { typography: typo, borderRadius } = useTheme();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: category.color + '20',
          borderRadius: borderRadius.full,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Ionicons
        name={category.icon as any}
        size={isSmall ? 12 : 16}
        color={category.color}
      />
      <Text
        style={[
          isSmall ? typo.caption : typo.bodySmall,
          { color: category.color, marginLeft: 4, fontWeight: '500' },
        ]}
      >
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  rightElement,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors, typography: typo, spacing, borderRadius } = useTheme();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <TouchableOpacity
        style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name={isOpen ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[typo.h3, { color: colors.text, marginLeft: spacing.sm }]}>
            {title}
          </Text>
        </View>
        {rightElement}
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.content, { paddingHorizontal: spacing.md, paddingBottom: spacing.md }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  content: {},
});

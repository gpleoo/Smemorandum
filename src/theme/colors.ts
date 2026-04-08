export const lightColors = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42E0',
  secondary: '#FF6584',
  secondaryLight: '#FF8FA3',
  accent: '#00C9A7',
  background: '#F8F9FE',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F1F8',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
};

export const darkColors = {
  primary: '#8B85FF',
  primaryLight: '#A9A4FF',
  primaryDark: '#6C63FF',
  secondary: '#FF8FA3',
  secondaryLight: '#FFB3C1',
  accent: '#00E4BF',
  background: '#0F0F23',
  surface: '#1A1A2E',
  surfaceVariant: '#252540',
  text: '#F8F9FE',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#374151',
  error: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  card: '#1A1A2E',
  tabBar: '#1A1A2E',
  tabBarInactive: '#6B7280',
};

export type ColorScheme = typeof lightColors;

export type ColorTheme = 'purple' | 'blue' | 'green' | 'orange' | 'rose';

export interface ColorPalette {
  label: string;
  swatch: string;
  light: { primary: string; primaryLight: string; primaryDark: string };
  dark:  { primary: string; primaryLight: string; primaryDark: string };
}

export const COLOR_PALETTES: Record<ColorTheme, ColorPalette> = {
  purple: {
    label: 'Viola',
    swatch: '#6C63FF',
    light: { primary: '#6C63FF', primaryLight: '#8B85FF', primaryDark: '#4A42E0' },
    dark:  { primary: '#8B85FF', primaryLight: '#A9A4FF', primaryDark: '#6C63FF' },
  },
  blue: {
    label: 'Blu',
    swatch: '#3B82F6',
    light: { primary: '#3B82F6', primaryLight: '#60A5FA', primaryDark: '#1D4ED8' },
    dark:  { primary: '#60A5FA', primaryLight: '#93C5FD', primaryDark: '#3B82F6' },
  },
  green: {
    label: 'Verde',
    swatch: '#10B981',
    light: { primary: '#10B981', primaryLight: '#34D399', primaryDark: '#059669' },
    dark:  { primary: '#34D399', primaryLight: '#6EE7B7', primaryDark: '#10B981' },
  },
  orange: {
    label: 'Arancione',
    swatch: '#F97316',
    light: { primary: '#F97316', primaryLight: '#FB923C', primaryDark: '#EA580C' },
    dark:  { primary: '#FB923C', primaryLight: '#FDBA74', primaryDark: '#F97316' },
  },
  rose: {
    label: 'Rosa',
    swatch: '#F43F5E',
    light: { primary: '#F43F5E', primaryLight: '#FB7185', primaryDark: '#E11D48' },
    dark:  { primary: '#FB7185', primaryLight: '#FDA4AF', primaryDark: '#F43F5E' },
  },
};

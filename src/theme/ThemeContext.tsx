import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme, ColorTheme, COLOR_PALETTES } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';
import { ThemeMode } from '../models/types';

interface ThemeContextType {
  colors: ColorScheme;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  isDark: boolean;
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('purple');

  const isDark = useMemo(() => {
    if (themeMode === 'auto') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo<ColorScheme>(() => {
    const base = isDark ? { ...darkColors } : { ...lightColors };
    const palette = COLOR_PALETTES[colorTheme];
    const overrides = isDark ? palette.dark : palette.light;
    return { ...base, ...overrides };
  }, [isDark, colorTheme]);

  const value = useMemo(
    () => ({
      colors,
      spacing,
      borderRadius,
      typography,
      isDark,
      themeMode,
      colorTheme,
      setThemeMode,
      setColorTheme,
    }),
    [colors, isDark, themeMode, colorTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

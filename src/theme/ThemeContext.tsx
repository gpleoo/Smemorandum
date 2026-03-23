import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from './colors';
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
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  const isDark = useMemo(() => {
    if (themeMode === 'auto') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      colors,
      spacing,
      borderRadius,
      typography,
      isDark,
      themeMode,
      setThemeMode,
    }),
    [colors, isDark, themeMode]
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

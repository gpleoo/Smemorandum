import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import './src/i18n';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Platform, Linking, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { EventProvider } from './src/context/EventContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { AppNavigator, navigationRef } from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import { initializeAdMob } from './src/services/adService';
import { getSettings } from './src/storage/settingsStorage';
import './src/i18n';

// Initialize notifications at module load (before any component renders)
initializeNotifications();

function AppContent() {
  const { isDark, colors } = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    // Initialize AdMob (no-op on web)
    initializeAdMob().catch(() => {});
  }, []);

  useEffect(() => {
    // Show onboarding the first time the app boots. Settings persist via
    // AsyncStorage, so on subsequent launches `hasSeenOnboarding` is true
    // and the modal stays closed.
    let cancelled = false;
    getSettings().then((s) => {
      if (cancelled || s.hasSeenOnboarding) return;
      const tryNavigate = () => {
        if (cancelled) return;
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate('Onboarding');
        } else {
          setTimeout(tryNavigate, 100);
        }
      };
      tryNavigate();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handle notification tap / quick actions
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data ?? {};
      const actionId = response.actionIdentifier;
      const phone = data.contactPhone as string | null;

      // "Chiama" quick action (iOS category button / Android action)
      if (actionId === 'call' && phone) {
        Linking.openURL(`tel:${phone}`).catch(() => {});
        return;
      }

      // Default tap → navigate to event detail
      const eventId = data.eventId as string;
      if (eventId && navigationRef.isReady()) {
        (navigationRef as any).navigate('MainTabs', {
          screen: 'HomeTab',
          params: { screen: 'EventDetail', params: { eventId } },
        });
      }
    });

    // Handle notification tap that opened the app from killed state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const eventId = response.notification.request.content.data?.eventId as string;
      if (eventId) {
        // Wait for navigation to be ready
        const checkReady = setInterval(() => {
          if (navigationRef.isReady()) {
            clearInterval(checkReady);
            (navigationRef as any).navigate('MainTabs', {
              screen: 'HomeTab',
              params: { screen: 'EventDetail', params: { eventId } },
            });
          }
        }, 100);
        // Safety: stop checking after 5 seconds
        setTimeout(() => clearInterval(checkReady), 5000);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
      <PremiumProvider>
        <EventProvider>
          <AppContent />
        </EventProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
}

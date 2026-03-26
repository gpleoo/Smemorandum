import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { EventProvider } from './src/context/EventContext';
import { AppNavigator, navigationRef } from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import './src/i18n';

// Initialize notifications at module load (before any component renders)
initializeNotifications();

function AppContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Handle notification tap when app is in foreground/background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const eventId = response.notification.request.content.data?.eventId as string;
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
      <EventProvider>
        <AppContent />
      </EventProvider>
    </ThemeProvider>
  );
}

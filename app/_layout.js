import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
import Constants from 'expo-constants';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { OrdersProvider } from '../contexts/OrdersContext';
import { AnimationProvider } from '../contexts/AnimationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import AuthWrapper from './AuthWrapper';
import BrandedLaunchScreen from '../components/BrandedLaunchScreen';
import { setupDeepLinkListener } from '../utils/deepLinking';

// Suppress known warnings that don't affect functionality
// Push notifications on Android require Firebase (google-services.json) for production
// In Expo Go / dev builds without Firebase, this warning is expected and can be ignored
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications',
]);

export default function RootLayout() {
  const [showLaunch, setShowLaunch] = useState(true);

  // Initialize deep link listener
  useEffect(() => {
    const cleanup = setupDeepLinkListener();
    return cleanup;
  }, []);

  // Expo Go always shows its own native loading screen first (app name text).
  // We only show an in-app branded launch screen in Expo Go to make it look nicer.
  // For EAS dev builds / TestFlight, rely on the native splash (`app.json`).
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo && showLaunch) {
    return <BrandedLaunchScreen onDone={() => setShowLaunch(false)} />;
  }

  return (
    <AuthProvider>
      <LocalizationProvider>
        <AnimationProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <CartProvider>
                <OrdersProvider>
                  <StatusBar style="dark" backgroundColor="#ffffff" />
                  <AuthWrapper />
                </OrdersProvider>
              </CartProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AnimationProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}

import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import Constants from 'expo-constants';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { OrdersProvider } from '../contexts/OrdersContext';
import { AnimationProvider } from '../contexts/AnimationContext';
import AuthWrapper from './AuthWrapper';
import BrandedLaunchScreen from '../components/BrandedLaunchScreen';

export default function RootLayout() {
  const [showLaunch, setShowLaunch] = useState(true);

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
          <FavoritesProvider>
            <CartProvider>
              <OrdersProvider>
                <StatusBar style="dark" backgroundColor="#ffffff" />
                <AuthWrapper />
              </OrdersProvider>
            </CartProvider>
          </FavoritesProvider>
        </AnimationProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}

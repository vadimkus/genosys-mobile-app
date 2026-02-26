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
import ForceUpdateScreen from '../components/ForceUpdateScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { setupDeepLinkListener } from '../utils/deepLinking';
import AUTH_CONFIG from '../config/auth';

// Suppress known warnings that don't affect functionality
// Push notifications on Android require Firebase (google-services.json) for production
// In Expo Go / dev builds without Firebase, this warning is expected and can be ignored
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications',
]);

function compareVersions(current, minimum) {
  const c = current.split('.').map(Number);
  const m = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((c[i] || 0) < (m[i] || 0)) return -1;
    if ((c[i] || 0) > (m[i] || 0)) return 1;
  }
  return 0;
}

export default function RootLayout() {
  const [showLaunch, setShowLaunch] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(null); // null = checking, false = ok, object = needs update

  // Initialize deep link listener
  useEffect(() => {
    const cleanup = setupDeepLinkListener();
    return cleanup;
  }, []);

  // Check minimum app version on cold start
  useEffect(() => {
    let cancelled = false;

    async function checkVersion() {
      try {
        const res = await fetch(`${AUTH_CONFIG.WEB_ORIGIN}/api/mobile/app-version`, {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const currentVersion = Constants.expoConfig?.version || '0.0.0';

        if (data.forceUpdate && data.minimumVersion && compareVersions(currentVersion, data.minimumVersion) < 0) {
          const locale = Constants.expoConfig?.extra?.locale || 'en';
          const message = data.message?.[locale] || data.message?.en || data.message;
          setForceUpdate({ updateUrl: data.updateUrl, message });
        } else {
          setForceUpdate(false);
        }
      } catch {
        // Network error or server down — fail open, let the user through
        if (!cancelled) setForceUpdate(false);
      }
    }

    checkVersion();
    return () => { cancelled = true; };
  }, []);

  // Expo Go always shows its own native loading screen first (app name text).
  // We only show an in-app branded launch screen in Expo Go to make it look nicer.
  // For EAS dev builds / TestFlight, rely on the native splash (`app.json`).
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo && showLaunch) {
    return <BrandedLaunchScreen onDone={() => setShowLaunch(false)} />;
  }

  // Block the entire app if a force update is required
  if (forceUpdate && typeof forceUpdate === 'object') {
    return <ForceUpdateScreen updateUrl={forceUpdate.updateUrl} message={forceUpdate.message} />;
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
                  <ErrorBoundary screenName="AppRoot">
                    <AuthWrapper />
                  </ErrorBoundary>
                </OrdersProvider>
              </CartProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AnimationProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}

import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogBox, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { OrdersProvider } from '../contexts/OrdersContext';
import { AnimationProvider } from '../contexts/AnimationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import AuthWrapper from './AuthWrapper';
import ForceUpdateScreen from '../components/ForceUpdateScreen';
import VideoLaunchScreen from '../components/VideoLaunchScreen';
import UpdateBanner from '../components/UpdateBanner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AUTH_CONFIG from '../config/auth';
import { checkForUpdates } from '../config/updates';
import { initSentry } from '../config/sentry';
import { getJson } from '../services/httpClient';

const UPDATE_DISMISSED_KEY = '@update_dismissed_version';

// Keep the native splash (logo) on screen until the JS launch layer has
// actually painted, so there is no white gap during the native→JS handoff.
// hideAsync() is called once the JS cover is ready (see hideNativeSplash).
SplashScreen.preventAutoHideAsync().catch(() => {});

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

const SPLASH_CACHE_KEY = '@splash_config';
const DEFAULT_SPLASH_CONFIG = {
  enabled: true,
  type: 'video',
  videoUrl: `${AUTH_CONFIG.WEB_ORIGIN}/videos/Splash.mp4`,
  posterUrl: null,
  duration: 5000,
  cacheTTL: 86400,
};

function isSameSplashConfig(a, b) {
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return a === b;
  return (
    a.enabled === b.enabled &&
    a.type === b.type &&
    a.videoUrl === b.videoUrl &&
    a.posterUrl === b.posterUrl &&
    Number(a.duration || 0) === Number(b.duration || 0) &&
    Number(a.cacheTTL || 0) === Number(b.cacheTTL || 0)
  );
}

function setSplashConfigIfChanged(setter, next) {
  setter((prev) => (isSameSplashConfig(prev, next) ? prev : next));
}

export default function RootLayout() {
  const [forceUpdate, setForceUpdate] = useState(null);
  const [softUpdate, setSoftUpdate] = useState(null);
  const [splashVideo, setSplashVideo] = useState(DEFAULT_SPLASH_CONFIG);

  // The website's display serif, so headings can be set in the same face.
  // Loaded from `assets/fonts`, which means it ships in the OTA bundle rather
  // than needing a store build.
  //
  // Deliberately not gating render on the result: nothing sets the face yet,
  // and local files resolve in milliseconds behind the launch video anyway.
  // The screens that adopt it should go through `serifFamily()` in
  // `utils/typography.js`.
  useFonts({
    'CormorantGaramond-Regular': require('../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Medium': require('../assets/fonts/CormorantGaramond-Medium.ttf'),
    'CormorantGaramond-SemiBold': require('../assets/fonts/CormorantGaramond-SemiBold.ttf'),
  });

  // Hide the native splash exactly once, after the JS launch layer is painted.
  const nativeSplashHiddenRef = useRef(false);
  const hideNativeSplash = useCallback(() => {
    if (nativeSplashHiddenRef.current) return;
    nativeSplashHiddenRef.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Safety net: never let the native splash stick if the cover signal is missed.
  useEffect(() => {
    const id = setTimeout(hideNativeSplash, 2500);
    return () => clearTimeout(id);
  }, [hideNativeSplash]);

  useEffect(() => {
    initSentry();
  }, []);

  // External deep links / universal links are routed by `app/+native-intent.js`
  // (which rewrites web URL shapes like `/products/<id>` to the real route),
  // and auth gating is handled declaratively by AuthWrapper.

  useEffect(() => {
    let cancelled = false;

    async function checkVersion() {
      try {
        const data = await getJson(`${AUTH_CONFIG.WEB_ORIGIN}/api/mobile/app-version?platform=${Platform.OS}`, {
          headers: {
            extra: { 'Cache-Control': 'no-cache' },
          },
        });

        if (cancelled) return;

        const currentVersion = Constants.expoConfig?.version || '0.0.0';

        if (data.forceUpdate && data.minimumVersion && compareVersions(currentVersion, data.minimumVersion) < 0) {
          const locale = Constants.expoConfig?.extra?.locale || 'en';
          const message = data.message?.[locale] || data.message?.en || data.message;
          setForceUpdate({ updateUrl: data.updateUrl, message });
        } else {
          setForceUpdate(false);

          if (data.latestVersion && compareVersions(currentVersion, data.latestVersion) < 0) {
            const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY).catch(() => null);
            if (dismissed !== data.latestVersion) {
              setSoftUpdate({ latestVersion: data.latestVersion, updateUrl: data.updateUrl });
            }
          }
        }
      } catch {
        if (!cancelled) setForceUpdate(false);
      }
    }

    async function checkSplash() {
      // 1. Instantly apply cached config so returning users see splash without delay
      try {
        const cached = await AsyncStorage.getItem(SPLASH_CACHE_KEY);
        if (cached && !cancelled) {
          const config = JSON.parse(cached);
          if (config.enabled && config.type === 'video' && config.videoUrl) {
            setSplashConfigIfChanged(setSplashVideo, config);
          }
        }
      } catch {}

      // 2. Fetch fresh config from API and persist for next cold start
      try {
        const data = await getJson(`${AUTH_CONFIG.WEB_ORIGIN}/api/mobile/splash-config`, {
          headers: {
            extra: { 'Cache-Control': 'no-cache' },
          },
        });

        await AsyncStorage.setItem(SPLASH_CACHE_KEY, JSON.stringify(data)).catch(() => {});

        if (cancelled) return;

        if (data.enabled && data.type === 'video' && data.videoUrl) {
          setSplashConfigIfChanged(setSplashVideo, data);
        } else {
          setSplashConfigIfChanged(setSplashVideo, false);
        }
      } catch {
        if (!cancelled) setSplashVideo((prev) => prev || false);
      }
    }

    checkVersion();
    checkSplash();

    // OTA: download update in background; applies on next cold start
    if (!__DEV__) {
      checkForUpdates();
    }

    return () => { cancelled = true; };
  }, []);

  // Block the entire app if a force update is required
  if (forceUpdate && typeof forceUpdate === 'object') {
    return <ForceUpdateScreen updateUrl={forceUpdate.updateUrl} message={forceUpdate.message} />;
  }

  return (
    <StripeProvider
      publishableKey={AUTH_CONFIG.STRIPE.publishableKey}
      merchantIdentifier={AUTH_CONFIG.STRIPE.merchantIdentifier}
      urlScheme={AUTH_CONFIG.STRIPE.urlScheme}
    >
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

                  {splashVideo && typeof splashVideo === 'object' && (
                    <VideoLaunchScreen
                      videoUrl={splashVideo.videoUrl}
                      posterUrl={splashVideo.posterUrl}
                      duration={splashVideo.duration || 5000}
                      cacheTTL={splashVideo.cacheTTL || 86400}
                      onCoverReady={hideNativeSplash}
                      onDone={() => setSplashVideo(false)}
                    />
                  )}

                  {softUpdate && !splashVideo && (
                    <UpdateBanner
                      updateUrl={softUpdate.updateUrl}
                      onDismiss={() => {
                        AsyncStorage.setItem(UPDATE_DISMISSED_KEY, softUpdate.latestVersion).catch(() => {});
                        setSoftUpdate(null);
                      }}
                    />
                  )}
                </OrdersProvider>
              </CartProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AnimationProvider>
      </LocalizationProvider>
      </AuthProvider>
    </StripeProvider>
  );
}

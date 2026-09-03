import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useLocalization } from './LocalizationContext';
import { setUpdateAvailableBadge } from '../utils/appBadge';
import { isUpdateAvailable } from '../utils/version';
import { createLogger } from '../utils/logger';

const log = createLogger('appUpdate');

/**
 * The soft update gate.
 *
 * `_layout` already fetches /api/mobile/app-version for the hard gate (the
 * blocking screen). This takes the same response and handles the gentler
 * case: the installed build is older than what the store has, but still
 * allowed. The person gets a dot on their avatar, a "1" on the app icon, a
 * row in Profile, and a prompt when they open the app, at most once a day
 * per version, with a Later button that means it.
 *
 * The installed version is the native runtime version, not the JS manifest's:
 * an over-the-air update can carry a newer app.json than the binary under it,
 * and the store only cares about the binary.
 */

const AppUpdateContext = createContext({
  updateAvailable: false,
  installedVersion: '',
  latestVersion: '',
  updateUrl: '',
  openStore: () => {},
});

const PROMPT_KEY = '@update-prompt-shown';
const PROMPT_EVERY_MS = 24 * 60 * 60 * 1000;

export function installedNativeVersion() {
  const rv = Updates.runtimeVersion;
  if (typeof rv === 'string' && /^\d+\.\d+/.test(rv)) return rv;
  return Constants.expoConfig?.version || '0.0.0';
}

export function AppUpdateProvider({ versionInfo, children }) {
  const { t } = useLocalization();
  const [promptShown, setPromptShown] = useState(false);
  const promptedFor = useRef(null);

  const installedVersion = installedNativeVersion();
  const latestVersion = versionInfo?.latestVersion || '';
  const updateUrl = versionInfo?.updateUrl || '';
  const updateAvailable = isUpdateAvailable(installedVersion, latestVersion);

  const openStore = useCallback(() => {
    if (!updateUrl) return;
    Linking.openURL(updateUrl).catch((e) => log.warn('Could not open store:', e?.message));
  }, [updateUrl]);

  // App icon badge follows availability, and stays through notification clears.
  useEffect(() => {
    setUpdateAvailableBadge(updateAvailable);
  }, [updateAvailable]);

  // One prompt per version per day. Later means later.
  useEffect(() => {
    if (!updateAvailable || promptShown || promptedFor.current === latestVersion) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROMPT_KEY);
        const last = raw ? JSON.parse(raw) : null;
        if (last && last.version === latestVersion && Date.now() - last.at < PROMPT_EVERY_MS) return;
      } catch {
        // storage unavailable: prompt anyway, once
      }
      if (cancelled) return;
      promptedFor.current = latestVersion;
      setPromptShown(true);
      const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
      Alert.alert(
        t('appUpdate.title'),
        t('appUpdate.message', { version: latestVersion, store: storeName }),
        [
          { text: t('appUpdate.later'), style: 'cancel' },
          { text: t('appUpdate.updateNow'), onPress: openStore },
        ]
      );
      try {
        await AsyncStorage.setItem(PROMPT_KEY, JSON.stringify({ version: latestVersion, at: Date.now() }));
      } catch {
        // fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [updateAvailable, latestVersion, promptShown, openStore, t]);

  const value = useMemo(
    () => ({ updateAvailable, installedVersion, latestVersion, updateUrl, openStore }),
    [updateAvailable, installedVersion, latestVersion, updateUrl, openStore]
  );

  return <AppUpdateContext.Provider value={value}>{children}</AppUpdateContext.Provider>;
}

export function useAppUpdate() {
  return useContext(AppUpdateContext);
}

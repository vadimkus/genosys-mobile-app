import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const STORAGE_KEY = '@language';

const en = require('../i18n/messages/en.json');
const ru = require('../i18n/messages/ru.json');
const ar = require('../i18n/messages/ar.json');

const SUPPORTED = ['en', 'ru', 'ar'];

const LocalizationContext = createContext({
  locale: 'en',
  dir: 'ltr',
  t: (key, params) => key,
  setLocale: async (_locale) => {},
});

function getMessages(locale) {
  if (locale === 'ar') return ar;
  if (locale === 'ru') return ru;
  return en;
}

function translate(messages, key, params) {
  const keys = String(key || '').split('.');
  let value = messages;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  if (typeof value !== 'string') return String(key || '');
  if (!params) return value;
  return Object.entries(params).reduce((str, [pk, pv]) => {
    return str.replace(new RegExp(`\\{${pk}\\}`, 'g'), String(pv));
  }, value);
}

// Module-level locale mirror for code that can't use hooks (class components
// like ErrorBoundary). Kept in sync by the provider below.
let _currentLocale = 'en';

/** Current locale for non-hook consumers. */
export function getCurrentLocale() {
  return _currentLocale;
}

/** Translate outside React (class components, services). */
export function tStatic(key, params) {
  return translate(getMessages(_currentLocale), key, params);
}

export function LocalizationProvider({ children }) {
  const [locale, setLocaleState] = useState('en');

  const reloadApp = useCallback(async () => {
    // Prefer expo-updates reload if available; fall back to no-op (we also show a prompt in UI).
    try {
      const Updates = await import('expo-updates');
      if (Updates?.reloadAsync) {
        await Updates.reloadAsync();
        return;
      }
    } catch {
      // ignore
    }
  }, []);

  const applyRTLIfNeeded = useCallback(
    async (nextLocale) => {
      const shouldRTL = String(nextLocale) === 'ar';
      const currentRTL = !!I18nManager.isRTL;
      if (currentRTL === shouldRTL) return false;
      try {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);
      } catch {
        // ignore
      }
      await reloadApp();
      return true;
    },
    [reloadApp]
  );

  const setLocale = useCallback(async (nextLocale) => {
    const next = String(nextLocale || '').toLowerCase();
    const safe = SUPPORTED.includes(next) ? next : 'en';
    // IMPORTANT: Persist to storage BEFORE any RTL toggle + reload.
    // applyRTLIfNeeded calls Updates.reloadAsync() which tears down the JS
    // runtime; any code after it (including setItem) never runs. That caused
    // AR <-> non-AR switches to silently fail (store stayed on the old locale,
    // and after the reload the app rehydrated the previous language).
    try {
      await AsyncStorage.setItem(STORAGE_KEY, safe);
    } catch {
      // ignore
    }
    setLocaleState(safe);
    // If RTL changes, force + reload (app restarts and picks up stored locale).
    await applyRTLIfNeeded(safe);
  }, [applyRTLIfNeeded]);

  // Hydrate the stored locale, then ensure the native RTL flag matches it.
  // The RTL check must run AFTER the storage read resolves - the previous
  // guard ran on the initial 'en' render and never re-checked, so Arabic
  // cold starts could stay LTR.
  useEffect(() => {
    (async () => {
      let next = 'en';
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        next = stored && SUPPORTED.includes(stored) ? stored : 'en';
      } catch {
        next = 'en';
      }
      setLocaleState(next);
      // Fire and forget; if it triggers reload, app will restart.
      applyRTLIfNeeded(next);
    })();
   
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);
  // Keep the module-level mirror in sync for non-hook consumers (tStatic).
  _currentLocale = locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useCallback((key, params) => translate(messages, key, params), [messages]);

  const value = useMemo(() => ({ locale, dir, t, setLocale }), [locale, dir, t, setLocale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}



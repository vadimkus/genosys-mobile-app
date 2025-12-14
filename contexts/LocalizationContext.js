import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

export function LocalizationProvider({ children }) {
  const [locale, setLocaleState] = useState('en');
  const didHydrateRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const next = stored && SUPPORTED.includes(stored) ? stored : 'en';
        setLocaleState(next);
      } catch {
        setLocaleState('en');
      }
    })();
  }, []);

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
    // If RTL changes, force + reload before updating state (so app restarts in correct direction).
    await applyRTLIfNeeded(safe);
    setLocaleState(safe);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, safe);
    } catch {
      // ignore
    }
  }, [applyRTLIfNeeded]);

  // On first hydration, ensure RTL matches stored locale.
  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;
    // Fire and forget; if it triggers reload, app will restart.
    applyRTLIfNeeded(locale);
  }, [locale, applyRTLIfNeeded]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useCallback((key, params) => translate(messages, key, params), [messages]);

  const value = useMemo(() => ({ locale, dir, t, setLocale }), [locale, dir, t, setLocale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}



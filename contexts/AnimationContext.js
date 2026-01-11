import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@animationsEnabled';

const AnimationContext = createContext({
  enabled: false,
  setEnabled: async (_next) => {},
  toggle: async () => {},
});

export function AnimationProvider({ children }) {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored == null) return;
        setEnabledState(stored === '1' || stored === 'true');
      } catch {
        // ignore
      }
    })();
  }, []);

  const setEnabled = useCallback(async (next) => {
    const v = !!next;
    setEnabledState(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(async () => {
    await setEnabled(!enabled);
  }, [enabled, setEnabled]);

  const value = useMemo(() => ({ enabled, setEnabled, toggle }), [enabled, setEnabled, toggle]);

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

export function useAnimation() {
  return useContext(AnimationContext);
}





import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import T from '../utils/typography';

export default function BrandedLaunchScreen({ onDone, minimumMs = 650 }) {
  // IMPORTANT: This screen is rendered before `LocalizationProvider` (Expo Go only),
  // so do not depend on i18n here. Keep the company line exact and stable.
  const COMPANY_NAME = 'Genosys Middle East FZ-LLC';
  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minimumMs - elapsed);
      setTimeout(() => {
        if (!cancelled) onDone?.();
      }, remaining);
    };

    // Allow at least one paint, then finish after minimum duration.
    const raf = requestAnimationFrame(() => requestAnimationFrame(finish));
    return () => {
      cancelled = true;
      try {
        cancelAnimationFrame(raf);
      } catch {
        // noop
      }
    };
  }, [onDone, minimumMs]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Image
          source={require('../assets/splash-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.companyText}>{COMPANY_NAME}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 260,
    height: 90,
  },
  companyText: {
    ...T.sectionTitleSmall,
    color: '#dc2626',
    marginTop: 18,
    textAlign: 'center',
  },
});






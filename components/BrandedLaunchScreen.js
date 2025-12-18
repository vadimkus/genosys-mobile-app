import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';

export default function BrandedLaunchScreen({ onDone, minimumMs = 650 }) {
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
          resizeMode="contain"
        />
        <Text style={styles.companyText}>Genosys Middle East FZ-LLC</Text>
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
    marginTop: 18,
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    textAlign: 'center',
  },
});






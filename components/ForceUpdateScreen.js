import React from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../utils/theme';

/**
 * Full-screen blocking overlay shown when the installed app version
 * is below the server-side `minimumVersion`.
 *
 * Rendered in `_layout.js` BEFORE any providers, so it cannot
 * depend on AuthContext, LocalizationContext, etc.
 */
export default function ForceUpdateScreen({ updateUrl, message }) {
  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      <View style={styles.content}>
        <Image
          source={require('../assets/splash-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⬆</Text>
        </View>

        <Text style={styles.title}>Update required</Text>
        <Text style={styles.message}>
          {message || 'A new version of Genosys UAE is available. Please update to continue.'}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleUpdate}
        >
          <Text style={styles.buttonText}>
            {Platform.OS === 'ios' ? 'Update on App Store' : 'Update on Google Play'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>GENOSYS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 340,
  },
  logo: {
    width: 220,
    height: 75,
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.cta,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: -0.1,
  },
});

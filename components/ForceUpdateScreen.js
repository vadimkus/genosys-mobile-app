import React from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';

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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        <Image
          source={require('../assets/splash-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⬆</Text>
        </View>

        <Text style={styles.title}>Update Required</Text>
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#FEF2F2',
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
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#dc2626',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
    letterSpacing: -0.1,
  },
});

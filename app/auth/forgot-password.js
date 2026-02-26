import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';
import { requestPasswordReset } from '../../services/authService';
import T from '../../utils/typography';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || '').trim());
}

export default function ForgotPasswordScreen() {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => isValidEmail(email) && !loading, [email, loading]);

  const handleSend = async () => {
    haptics.mediumTap();
    if (!isValidEmail(email)) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.invalidEmail'));
      return;
    }

    try {
      setLoading(true);
      const result = await requestPasswordReset(email.trim());

      if (!result.success) {
        haptics.warning();
        Alert.alert(t('common.error'), result.error || t('authScreen.genericError'));
        return;
      }

      haptics.success();
      Alert.alert(
        t('authScreen.resetEmailSentTitle'),
        t('authScreen.resetEmailSentMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.push({ pathname: '/auth/reset-password', params: { email: email.trim() } }),
          },
        ]
      );
    } catch (_e) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { haptics.lightTap(); router.back(); }} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('authScreen.forgotPasswordTitle')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('authScreen.forgotPasswordSubtitle')}</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>{t('authScreen.emailLabel')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('authScreen.emailPlaceholder')}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{t('authScreen.sendResetCode')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...T.navTitle,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  subtitle: {
    ...T.label,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 18,
  },
  inputWrap: {
    marginBottom: 16,
  },
  label: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    ...T.label,
    fontWeight: '400',
    color: '#111827',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    ...T.buttonSmall,
    fontWeight: '700',
  },
});






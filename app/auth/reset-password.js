import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { resetPasswordWithToken } from '../../services/authService';

export default function ResetPasswordScreen() {
  const { t } = useLocalization();
  const params = useLocalSearchParams();
  const email = typeof params?.email === 'string' ? params.email : '';

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!token || token.trim().length < 10) return false;
    if (!newPassword || newPassword.length < 8) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  }, [token, newPassword, confirmPassword, loading]);

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert(t('common.error'), t('authScreen.passwordTooShort8'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('authScreen.passwordsDontMatch'));
      return;
    }
    if (!token || token.trim().length < 10) {
      Alert.alert(t('common.error'), t('authScreen.resetTokenInvalid'));
      return;
    }

    try {
      setLoading(true);
      const result = await resetPasswordWithToken(token.trim(), newPassword);

      if (!result.success) {
        Alert.alert(t('common.error'), result.error || t('authScreen.genericError'));
        return;
      }

      Alert.alert(t('authScreen.passwordResetSuccessTitle'), t('authScreen.passwordResetSuccessMessage'), [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (_e) {
      Alert.alert(t('common.error'), t('authScreen.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('authScreen.resetPasswordTitle')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {!!email && (
          <Text style={styles.emailHint}>
            {t('authScreen.resetForEmail', { email })}
          </Text>
        )}

        <View style={styles.inputWrap}>
          <Text style={styles.label}>{t('authScreen.resetCodeLabel')}</Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder={t('authScreen.resetCodePlaceholder')}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>{t('authScreen.newPasswordLabel')}</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('authScreen.newPasswordPlaceholder')}
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>{t('authScreen.confirmPasswordLabel')}</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('authScreen.confirmPasswordPlaceholder')}
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{t('authScreen.resetPasswordButton')}</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  emailHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  inputWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});





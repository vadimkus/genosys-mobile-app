import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';
import { resetPasswordWithToken } from '../../services/authService';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

export default function ResetPasswordScreen() {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
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

  // Subtle entrance motion (native driver).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/auth/login');
  };

  const handleReset = async () => {
    haptics.mediumTap();
    if (!newPassword || newPassword.length < 8) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.passwordTooShort8'));
      return;
    }
    if (newPassword !== confirmPassword) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.passwordsDontMatch'));
      return;
    }
    if (!token || token.trim().length < 10) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.resetTokenInvalid'));
      return;
    }

    try {
      setLoading(true);
      const result = await resetPasswordWithToken(token.trim(), newPassword);

      if (!result.success) {
        haptics.warning();
        Alert.alert(t('common.error'), result.error || t('authScreen.genericError'));
        return;
      }

      haptics.success();
      Alert.alert(t('authScreen.passwordResetSuccessTitle'), t('authScreen.passwordResetSuccessMessage'), [
        { text: t('common.ok'), onPress: () => router.replace('/auth/login') },
      ]);
    } catch (_e) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('authScreen.resetPasswordTitle')}
        scrollY={scrollY}
        onBack={onBack}
        isRTL={isRTL}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <Animated.ScrollView
          style={styles.flex}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
            {!!email && (
              <Text style={[styles.lead, isRTL && styles.textRTL]}>
                {t('authScreen.resetForEmail', { email })}
              </Text>
            )}

            <View style={[styles.card, shadow.card]}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.resetCodeLabel')}</Text>
                <TextInput
                  value={token}
                  onChangeText={setToken}
                  placeholder={t('authScreen.resetCodePlaceholder')}
                  placeholderTextColor={colors.tertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.newPasswordLabel')}</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t('authScreen.newPasswordPlaceholder')}
                  placeholderTextColor={colors.tertiary}
                  secureTextEntry
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                />
              </View>

              <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.confirmPasswordLabel')}</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('authScreen.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.tertiary}
                  secureTextEntry
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, shadow.cta(colors.brand), !canSubmit && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('authScreen.resetPasswordButton')}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  flex: {
    flex: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputValueLTR: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },

  lead: {
    ...T.subtitle,
    color: colors.secondaryLabel,
    marginHorizontal: 20,
    marginBottom: 14,
    lineHeight: 20,
  },

  // Grouped card
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  fieldContainerLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryLabel,
    marginBottom: 6,
  },
  textInput: {
    ...T.input,
    fontSize: 16,
    color: colors.label,
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 36,
  },

  // Primary CTA
  button: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...T.button,
    fontWeight: '700',
    color: colors.white,
  },
});

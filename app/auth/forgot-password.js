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
import { router } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';
import { requestPasswordReset } from '../../services/authService';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || '').trim());
}

export default function ForgotPasswordScreen() {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => isValidEmail(email) && !loading, [email, loading]);

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
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('authScreen.forgotPasswordTitle')}
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
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('authScreen.forgotPasswordSubtitle')}</Text>

            <View style={[styles.card, shadow.card]}>
              <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.emailLabel')}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('authScreen.emailPlaceholder')}
                  placeholderTextColor={colors.tertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, shadow.cta(colors.brand), !canSubmit && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('authScreen.sendResetCode')}</Text>
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

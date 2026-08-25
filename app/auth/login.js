import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import AUTH_CONFIG from '../../config/auth';
import Constants from 'expo-constants';
import T from '../../utils/typography';
import { colors, shadow, surfaces, tint } from '../../utils/theme';
import {
  isEmailAddressSyntaxValid,
  normalizeEmailAddress,
  suggestEmailAddressCorrection,
} from '../../utils/emailAddressValidation';

// expo-apple-authentication is iOS-only; safe-load to prevent Android build/runtime issues
let AppleAuthentication = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
  // Expected on Android — module may not resolve
}

const log = createLogger('Login');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getNativeBundleId = () => {
  try {
    return (
      Constants?.expoConfig?.ios?.bundleIdentifier ||
      Constants?.manifest2?.extra?.expoClient?.ios?.bundleIdentifier ||
      Constants?.manifest?.ios?.bundleIdentifier ||
      ''
    );
  } catch {
    return '';
  }
};

export default function LoginScreen() {
  const { t, locale, setLocale, dir } = useLocalization();
  const params = useLocalSearchParams();
  const isRTL = dir === 'rtl';
  const partnerIntent =
    String(Array.isArray(params?.returnTo) ? params.returnTo[0] : params?.returnTo || '') === '/partner-portal';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emirate, setEmirate] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showEmiratePicker, setShowEmiratePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langSwitching, setLangSwitching] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState(null);

  const UAE_EMIRATES = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
  ];
  
  const { 
    loginWithGoogle, 
    loginWithApple,
    loginWithEmail, 
    loginWithBiometrics,
    register,
    biometricAvailable,
    biometricEnabled,
    biometricType
  } = useAuth();
  const emailSuggestion = !isLogin ? suggestEmailAddressCorrection(email) : null;

  // Subtle entrance motion (native driver) — matches the rest of the app.
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const handleGoogleLogin = async () => {
    haptics.lightTap();
    // Check privacy consent
    if (!privacyConsent) {
      haptics.warning();
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithGoogle();
      
      if (result.success) {
        haptics.success();
        // Navigation will be handled by the auth context automatically
      } else {
        haptics.warning();
        // Show helpful error message with alternative
        Alert.alert(
          t('authScreen.googleSignInIssueTitle'), 
          result.error || t('authScreen.googleSignInIssueMessage'),
          [
            { text: t('common.ok'), style: 'default' },
            { text: t('authScreen.useEmailLogin'), style: 'default', onPress: () => {
              // Focus on email input or scroll to email form
              log.debug('User chose email login alternative');
            }}
          ]
        );
      }
    } catch (error) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.googleAuthFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    haptics.lightTap();
    if (!privacyConsent) {
      haptics.warning();
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }
    if (!AppleAuthentication) {
      haptics.warning();
      // Should never happen since the button is only shown on iOS, but guard anyway
      Alert.alert(t('authScreen.authFailedTitle'), t('authScreen.appleIosOnly'));
      return;
    }
    try {
      setLoading(true);
      // Surface a clearer message when Apple Sign-In isn't available on the device.
      const isAvailable = await AppleAuthentication.isAvailableAsync().catch(() => false);
      if (!isAvailable) {
        haptics.warning();
        Alert.alert(
          t('authScreen.authFailedTitle'),
          t('authScreen.appleUnavailableDevice')
        );
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential?.identityToken;
      const fullName = credential?.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ').trim()
        : '';

      if (!identityToken) {
        haptics.warning();
        Alert.alert(t('authScreen.authFailedTitle'), t('authScreen.appleNoToken'));
        return;
      }

      const result = await loginWithApple({ identityToken, fullName });
      if (!result.success) {
        haptics.warning();
        Alert.alert(t('authScreen.authFailedTitle'), result.error || t('authScreen.appleAuthFailed'));
      } else {
        haptics.success();
      }
    } catch (error) {
      // User cancelled is common; don't show scary error.
      if (error && String(error?.code || '').toLowerCase().includes('canceled')) return;
      // Provide actionable diagnostics (especially for TestFlight builds).
      const code = String(error?.code || '').trim();
      const msg = String(error?.message || '').trim();
      log.error('Apple sign-in failed', { code, message: msg });
      const bundleId = getNativeBundleId();
      const msgLower = msg.toLowerCase();
      const looksLikeSetupNotComplete =
        msgLower.includes('setup') && msgLower.includes('not complete');

      // Apple "Setup not complete" commonly surfaces as:
      // - message contains "setup not complete"
      // - error codes from expo-apple-authentication: ERR_NOT_HANDLED / ERR_INVALID_RESPONSE / ERR_UNKNOWN
      // - native AuthorizationError 1000 (often returned as part of the message)
      const codeUpper = code.toUpperCase();
      const looksLikeNotHandled =
        codeUpper === 'ERR_NOT_HANDLED' ||
        codeUpper === 'ERR_INVALID_RESPONSE' ||
        (codeUpper === 'ERR_UNKNOWN' && (msgLower.includes('authorization') || msgLower.includes('1000')));

      if (looksLikeSetupNotComplete || looksLikeNotHandled) {
        haptics.warning();
        Alert.alert(
          t('authScreen.authFailedTitle'),
          t('authScreen.appleSetupNotComplete', { bundleId: bundleId || 'unknown' })
        );
        return;
      }
      const detail = [code, msg].filter(Boolean).join(': ');
      haptics.warning();
      Alert.alert(
        t('common.error'),
        detail
          ? `${t('authScreen.appleAuthFailed')}\n\n${detail}`
          : t('authScreen.appleAuthFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    haptics.lightTap();
    // Check privacy consent
    if (!privacyConsent) {
      haptics.warning();
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithBiometrics();
      
      if (result.success) {
        haptics.success();
        // Navigation will be handled by the auth context automatically
        log.debug('Biometric login successful');
      } else {
        haptics.warning();
        Alert.alert(t('authScreen.authFailedTitle'), result.error || t('authScreen.biometricLoginFailed'));
      }
    } catch (error) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.biometricAuthFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    haptics.mediumTap();
    if (!email || !password || (!isLogin && !name)) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.fillAllFields'));
      return;
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!phone.trim()) {
        haptics.warning();
        Alert.alert(t('common.error'), t('authScreen.phoneRequired'));
        return;
      }
      if (!address.trim()) {
        haptics.warning();
        Alert.alert(t('common.error'), t('authScreen.addressRequired'));
        return;
      }
      if (!emirate) {
        haptics.warning();
        Alert.alert(t('common.error'), t('authScreen.emirateRequired'));
        return;
      }
    }

    const normalizedEmail = normalizeEmailAddress(email);
    if (!isEmailAddressSyntaxValid(normalizedEmail)) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.invalidEmail'));
      return;
    }

    if (emailSuggestion && confirmedEmail !== normalizedEmail) {
      haptics.warning();
      Alert.alert(t('authScreen.checkEmailTitle'), t('authScreen.emailSuggestionRequired'));
      return;
    }

    // Register-only: min 8, aligned with the server + reset-password policy.
    // Login is not length-checked so legacy accounts with shorter passwords
    // can still sign in (server validates credentials anyway).
    if (!isLogin && password.length < 8) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.passwordMinLength'));
      return;
    }

    // Check privacy consent
    if (!privacyConsent) {
      haptics.warning();
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (isLogin) {
        result = await loginWithEmail(normalizedEmail, password);
      } else {
        result = await register(name, normalizedEmail, password, {
          phone: phone.trim(),
          address: address.trim(),
          emirate,
          birthday: birthday.trim(),
          emailSuggestionConfirmed: confirmedEmail === normalizedEmail,
        });
      }

      if (result.success) {
        haptics.success();
        // Show success alert only for registration, not login
        if (!isLogin) {
          Alert.alert(t('authScreen.accountCreatedTitle'), t('authScreen.accountCreatedMessage'));
        }
        // Navigation will be handled by the auth context automatically
      } else {
        haptics.warning();
        Alert.alert(t('common.error'), result.error || (isLogin ? t('authScreen.loginFailed') : t('authScreen.registrationFailed')));
      }
    } catch (error) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    haptics.selectionTick();
    if (isLogin && partnerIntent) {
      router.setParams({ returnTo: '' });
    }
    setIsLogin(!isLogin);
    setEmail('');
    setConfirmedEmail(null);
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setEmirate('');
    setBirthday('');
    setShowPassword(false);
    setPrivacyConsent(false);
  };

  const handlePrivacyPolicyPress = () => {
    setShowPrivacyModal(true);
  };

  const handlePartnerPortalPress = () => {
    haptics.selectionTick();
    router.setParams({ returnTo: partnerIntent ? '' : '/partner-portal' });
  };

  const currentLangCode = langSwitching
    ? '...'
    : (locale === 'ar' ? 'AR' : locale === 'ru' ? 'RU' : 'EN');

  const handleSelectLocale = async (nextLocale) => {
    const next = String(nextLocale || '').toLowerCase();
    if (!['en', 'ru', 'ar'].includes(next)) return;
    setLangOpen(false);
    setLangSwitching(true);
    try {
      await setLocale?.(next);
    } finally {
      // If a reload happens (AR <-> non-AR), the app will restart anyway.
      setTimeout(() => setLangSwitching(false), 150);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
            {/* Top controls (language) */}
            <View style={[styles.topControls, isRTL && styles.topControlsRtl]}>
              <TouchableOpacity
                onPress={() => setLangOpen(true)}
                disabled={langSwitching}
                activeOpacity={0.85}
                style={styles.langButton}
                accessibilityRole="button"
                accessibilityLabel={t('common.switchLanguage')}
              >
                <Text style={styles.langButtonText}>{currentLangCode}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.greenDeep} />
              </TouchableOpacity>
            </View>

            {/* Header with Logo */}
            <View style={styles.header}>
              <Image 
                source={require('../../assets/genosys-logo-gray.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.uaeRow}>
                <Text style={styles.uaeFlag}>🇦🇪</Text>
                <Text style={styles.title}>{t('authScreen.uaeLine')}</Text>
                <Ionicons name="heart" size={12} color={colors.accent} style={styles.uaeHeart} />
              </View>
            </View>

            {/* Privacy Policy Notice */}
            {!privacyConsent && (
              <View style={styles.privacyNotice}>
                <Ionicons name="information-circle" size={16} color={colors.orange} />
                <Text style={[styles.privacyNoticeText, isRTL && styles.textRTL]}>
                  {t('authScreen.privacyNotice')}
                </Text>
              </View>
            )}

            {/* Biometric Login Button */}
            {biometricAvailable && biometricEnabled && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  !privacyConsent && styles.buttonDisabledOpacity
                ]}
                onPress={handleBiometricLogin}
                disabled={loading || !privacyConsent}
                activeOpacity={0.85}
              >
                <View style={[styles.biometricButtonContent, isRTL && styles.rowReverse]}>
                  <Ionicons 
                    name={biometricType.includes('Face') ? 'scan' : 'finger-print'} 
                    size={20} 
                    color={colors.accent} 
                  />
                  <Text style={[styles.biometricButtonText, isRTL && styles.biometricButtonTextRTL]}>
                    {t('authScreen.loginWithBiometrics', { biometricType })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Social Login Buttons (compact) */}
            <View style={[styles.socialRow, isRTL && styles.socialRowRTL]}>
              <TouchableOpacity
                style={[
                  styles.googleButton,
                  shadow.card,
                  !privacyConsent && styles.buttonDisabledOpacity
                ]}
                onPress={handleGoogleLogin}
                disabled={loading || !privacyConsent}
                activeOpacity={0.85}
                accessibilityLabel={t('authScreen.continueWithGoogle')}
              >
                <View style={[styles.socialButtonContent, isRTL && styles.rowReverse]}>
                  <View style={[styles.googleIcon, isRTL ? styles.socialIconRTL : styles.socialIconLTR]}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={[styles.googleButtonText, isRTL && styles.textRTL]}>
                    {t('authScreen.googleShort')}
                  </Text>
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.appleButton, shadow.card, !privacyConsent && styles.buttonDisabledOpacity]}
                  onPress={handleAppleLogin}
                  disabled={loading || !privacyConsent}
                  activeOpacity={0.85}
                  accessibilityLabel={t('authScreen.continueWithApple')}
                >
                  <View style={[styles.socialButtonContent, isRTL && styles.rowReverse]}>
                    <Ionicons name="logo-apple" size={18} color={colors.white} style={isRTL ? styles.socialIconRTL : styles.socialIconLTR} />
                    <Text style={[styles.appleButtonText, isRTL && styles.textRTL]}>
                      {t('authScreen.appleShort')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('authScreen.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email/Password Form (grouped card) */}
            <View style={[styles.formCard, shadow.card]}>
              {!isLogin && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.fullNameLabel')}</Text>
                  <TextInput
                    style={[styles.textInput, isRTL && styles.inputRTL]}
                    placeholder={t('authScreen.fullNamePlaceholder')}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholderTextColor={colors.tertiary}
                  />
                </View>
              )}

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.emailLabel')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                  placeholder={t('authScreen.emailPlaceholder')}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setConfirmedEmail(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType={isLogin ? 'username' : 'emailAddress'}
                  placeholderTextColor={colors.tertiary}
                />
                {emailSuggestion && confirmedEmail !== normalizeEmailAddress(email) ? (
                  <View style={styles.emailSuggestion} accessibilityRole="alert">
                    <Text style={[styles.emailSuggestionText, isRTL && styles.textRTL]}>
                      {t('authScreen.emailDidYouMean', {
                        email: emailSuggestion,
                      })}
                    </Text>
                    <View style={[styles.emailSuggestionActions, isRTL && styles.rowReverse]}>
                      <TouchableOpacity
                        style={styles.emailSuggestionPrimary}
                        onPress={() => {
                          setEmail(emailSuggestion);
                          setConfirmedEmail(null);
                          haptics.selectionTick();
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={styles.emailSuggestionPrimaryText}>
                          {t('authScreen.useSuggestedEmail')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.emailSuggestionSecondary}
                        onPress={() => {
                          setConfirmedEmail(normalizeEmailAddress(email));
                          haptics.selectionTick();
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={styles.emailSuggestionSecondaryText}>
                          {t('authScreen.keepEnteredEmail')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={[styles.fieldContainer, isLogin && styles.fieldContainerLast]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('authScreen.passwordLabel')}</Text>
                <View style={[styles.passwordRow, isRTL && styles.rowReverse]}>
                  <TextInput
                    style={[styles.passwordInput, isRTL && styles.inputValueLTR]}
                    placeholder={t('authScreen.passwordPlaceholder')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    textContentType={isLogin ? 'password' : 'newPassword'}
                    placeholderTextColor={colors.tertiary}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? t('authScreen.hidePassword') : t('authScreen.showPassword')}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.secondaryLabel}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Registration-only fields */}
              {!isLogin && (
                <>
                  {/* Phone */}
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                      {t('authScreen.phoneLabel')} <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.textInput, styles.inputValueLTR]}
                      placeholder={t('authScreen.phonePlaceholder')}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      placeholderTextColor={colors.tertiary}
                    />
                  </View>

                  {/* Address */}
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                      {t('authScreen.addressLabel')} <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.textInput, isRTL && styles.inputRTL]}
                      placeholder={t('authScreen.addressPlaceholder')}
                      value={address}
                      onChangeText={setAddress}
                      autoComplete="street-address"
                      placeholderTextColor={colors.tertiary}
                    />
                  </View>

                  {/* Emirate */}
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                      {t('authScreen.emirateLabel')} <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={[styles.selectField, isRTL && styles.selectFieldRTL]}
                      onPress={() => setShowEmiratePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.selectFieldText,
                        !emirate && styles.selectFieldPlaceholder,
                        isRTL && styles.textRTL,
                      ]}>
                        {emirate || t('authScreen.selectEmirate')}
                      </Text>
                      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.tertiary} />
                    </TouchableOpacity>
                  </View>

                  {/* Birthday (optional) */}
                  <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                    <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                      {t('authScreen.birthdayLabel')}
                    </Text>
                    <TextInput
                      style={[styles.textInput, isRTL && styles.inputRTL]}
                      placeholder={t('authScreen.birthdayPlaceholder')}
                      value={birthday}
                      onChangeText={setBirthday}
                      placeholderTextColor={colors.tertiary}
                      keyboardType="numbers-and-punctuation"
                    />
                    <Text style={[styles.birthdayHint, isRTL && styles.textRTL]}>
                      {t('authScreen.birthdayHint')}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Privacy Policy Consent */}
            <View style={[styles.privacySection, isRTL && styles.privacySectionRTL]}>
              <TouchableOpacity
                style={[styles.checkboxContainer, isRTL && styles.rowReverse]}
                onPress={() => { haptics.selectionTick(); setPrivacyConsent(!privacyConsent); }}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked, isRTL && styles.checkboxRTL]}>
                  {privacyConsent && (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  )}
                </View>
                <Text style={[styles.privacyText, isRTL && styles.textRTL]}>
                  {t('authScreen.privacyConsentPrefix')}{' '}
                  <Text style={styles.privacyLink} onPress={handlePrivacyPolicyPress}>
                    {t('authScreen.privacyPolicyLink')}
                  </Text>{' '}
                  {t('authScreen.privacyConsentSuffix')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login/Register Button */}
            <TouchableOpacity
              style={[
                styles.authButton,
                shadow.cta(colors.cta),
                (loading || !privacyConsent) && styles.buttonDisabledOpacity
              ]}
              onPress={handleEmailAuth}
              disabled={loading || !privacyConsent}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin
                    ? partnerIntent
                      ? t('authScreen.signInToPartnerPortal')
                      : t('authScreen.signIn')
                    : t('authScreen.createAccount')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Partner Portal destination (login only). This is intentionally a
                reversible route choice, not a partner-status checkbox. Actual
                partner access is verified from the server after authentication. */}
            {isLogin && (
              <TouchableOpacity
                style={[
                  styles.partnerPortalButton,
                  partnerIntent && styles.partnerPortalButtonSelected,
                ]}
                onPress={handlePartnerPortalPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={
                  partnerIntent
                    ? t('authScreen.cancelPartnerPortal')
                    : t('authScreen.partnerPortal')
                }
              >
                <View style={[styles.partnerPortalContent, isRTL && styles.rowReverse]}>
                  <View style={styles.partnerPortalIcon}>
                    <Ionicons
                      name="storefront-outline"
                      size={18}
                      color={colors.white}
                    />
                  </View>
                  <View style={styles.partnerPortalCopy}>
                    <Text style={[styles.partnerPortalTitle, isRTL && styles.textRTL]}>
                      {t('authScreen.partnerPortal')}
                    </Text>
                    <Text style={[styles.partnerPortalHint, isRTL && styles.textRTL]}>
                      {partnerIntent
                        ? t('authScreen.partnerPortalActiveHint')
                        : t('authScreen.partnerPortalHint')}
                    </Text>
                  </View>
                  <Ionicons
                    name={partnerIntent ? 'close-circle' : isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={partnerIntent ? 21 : 17}
                    color={partnerIntent ? colors.accent : colors.secondaryLabel}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPassword}
                activeOpacity={0.7}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>{t('authScreen.forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            {/* Switch Mode */}
            <View style={styles.switchMode}>
              <Text style={[styles.switchModeText, isRTL && styles.textRTL]}>
                {isLogin ? t('authScreen.dontHaveAccount') : t('authScreen.alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7} style={styles.switchModeButtonWrap}>
                <Text style={styles.switchModeButton}>
                  {isLogin ? t('authScreen.signUp') : t('authScreen.signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Emirate Picker Modal */}
      <Modal
        visible={showEmiratePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmiratePicker(false)}
      >
        <Pressable style={styles.emirateOverlay} onPress={() => setShowEmiratePicker(false)}>
          <View style={styles.emirateMenu}>
            <Text style={styles.emirateMenuTitle}>{t('authScreen.selectEmirate')}</Text>
            {UAE_EMIRATES.map((em) => (
              <TouchableOpacity
                key={em}
                onPress={() => { setEmirate(em); setShowEmiratePicker(false); }}
                activeOpacity={0.85}
                style={[styles.emirateMenuItem, emirate === em && styles.emirateMenuItemActive]}
              >
                <Text style={[
                  styles.emirateMenuItemText,
                  isRTL && styles.textRTL,
                  emirate === em && styles.emirateMenuItemTextActive,
                ]}>
                  {em}
                </Text>
                {emirate === em && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Language dropdown */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable style={styles.langOverlay} onPress={() => setLangOpen(false)}>
          <View style={[styles.langMenu, isRTL && styles.langMenuRtl]}>
            <TouchableOpacity
              onPress={() => handleSelectLocale('en')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'en' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.textRTL, locale === 'en' && styles.langMenuItemTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ru')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ru' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.textRTL, locale === 'ru' && styles.langMenuItemTextActive]}>
                Русский
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ar')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ar' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.textRTL, locale === 'ar' && styles.langMenuItemTextActive]}>
                العربية
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
  },

  // Shared row/text helpers
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // Keep latin values (email/phone) LTR even in RTL UI
  inputValueLTR: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  buttonDisabledOpacity: {
    opacity: 0.5,
  },

  // Language switcher
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  topControlsRtl: {
    justifyContent: 'flex-end',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langButtonText: {
    ...T.captionSmall,
    fontWeight: '800',
    color: colors.greenDeep,
  },
  langOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  langMenu: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 160,
    ...shadow.card,
  },
  langMenuRtl: {
    alignSelf: 'flex-end',
  },
  langMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  langMenuItemActive: {
    backgroundColor: colors.accentBg,
  },
  langMenuItemText: {
    ...T.label,
    color: colors.label,
  },
  langMenuItemTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },

  // Branded hero
  header: {
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 4,
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 10,
  },
  title: {
    ...T.label,
    fontWeight: '400',
    textAlign: 'center',
  },
  uaeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  uaeFlag: {
    fontSize: 14,
    marginRight: 6,
    marginTop: -1,
  },
  uaeHeart: {
    marginLeft: 6,
    marginTop: -1,
  },

  // Privacy notice (soft tinted card)
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tint(colors.orange, '14'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tint(colors.orange, '40'),
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  privacyNoticeText: {
    ...T.caption,
    fontWeight: '500',
    color: colors.label,
    flex: 1,
  },

  // Biometric (tinted brand — keeps the single filled primary clean)
  biometricButton: {
    backgroundColor: colors.accentBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBg,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: colors.accent,
    lineHeight: undefined,
    marginLeft: 10,
  },
  biometricButtonTextRTL: {
    marginLeft: 0,
    marginRight: 10,
  },

  // Social buttons (equal height, rounded 14)
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  socialRowRTL: {
    flexDirection: 'row-reverse',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconLTR: {
    marginRight: 10,
  },
  socialIconRTL: {
    marginLeft: 10,
  },
  googleButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  googleButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: colors.label,
    lineHeight: undefined,
  },
  appleButton: {
    flex: 1,
    backgroundColor: colors.label,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  appleButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: colors.white,
    lineHeight: undefined,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  dividerText: {
    ...T.caption,
    fontWeight: '600',
    color: colors.secondaryLabel,
    marginHorizontal: 16,
  },

  // Form card (grouped inset rows + hairlines)
  formCard: {
    ...surfaces.card,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  emailSuggestion: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F4C96B',
    backgroundColor: '#FFF8E7',
  },
  emailSuggestionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#704B00',
  },
  emailSuggestionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  emailSuggestionPrimary: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#704B00',
    paddingHorizontal: 14,
  },
  emailSuggestionPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  emailSuggestionSecondary: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8A93E',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
  },
  emailSuggestionSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#704B00',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    ...T.input,
    fontSize: 16,
    color: colors.label,
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 36,
  },
  passwordToggle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 36,
  },
  selectFieldRTL: {
    flexDirection: 'row-reverse',
  },
  selectFieldText: {
    ...T.input,
    fontSize: 16,
    color: colors.label,
  },
  selectFieldPlaceholder: {
    color: colors.secondaryLabel,
  },
  requiredStar: {
    color: colors.accent,
    fontWeight: '700',
  },
  birthdayHint: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 6,
  },

  // Emirate picker modal
  emirateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emirateMenu: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadow.card,
  },
  emirateMenuTitle: {
    ...T.price,
    color: colors.label,
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  emirateMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  emirateMenuItemActive: {
    backgroundColor: colors.accentBg,
  },
  emirateMenuItemText: {
    ...T.body,
    color: colors.label,
    fontWeight: '500',
    lineHeight: undefined,
  },
  emirateMenuItemTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },

  // Privacy consent
  privacySection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  privacySectionRTL: {
    alignItems: 'flex-end',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.tertiary,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.cta,
    borderColor: colors.accent,
  },
  privacyText: {
    ...T.caption,
    color: colors.secondaryLabel,
    lineHeight: 18,
    flex: 1,
  },
  privacyLink: {
    ...T.caption,
    color: colors.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Primary CTA
  authButton: {
    backgroundColor: colors.cta,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    ...T.button,
    fontWeight: '700',
    color: colors.white,
  },
  partnerPortalButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: 14,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  partnerPortalButtonSelected: {
    borderColor: colors.label,
    backgroundColor: tint(colors.label, '08'),
  },
  partnerPortalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  partnerPortalIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.label,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerPortalCopy: {
    flex: 1,
  },
  partnerPortalTitle: {
    ...T.label,
    fontWeight: '800',
    color: colors.label,
  },
  partnerPortalHint: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 2,
  },

  // Secondary links
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 2,
  },
  forgotPasswordText: {
    ...T.label,
    fontWeight: '600',
    color: colors.accent,
  },
  switchMode: {
    alignItems: 'center',
    marginTop: 18,
  },
  switchModeText: {
    ...T.caption,
    color: colors.secondaryLabel,
    textAlign: 'center',
  },
  switchModeButtonWrap: {
    marginTop: 6,
  },
  switchModeButton: {
    ...T.label,
    fontWeight: '700',
    color: colors.accent,
  },
});

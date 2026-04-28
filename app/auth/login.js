import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import AUTH_CONFIG from '../../config/auth';
import Constants from 'expo-constants';
import T from '../../utils/typography';

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
  const isRTL = dir === 'rtl';
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
      Alert.alert(t('authScreen.authFailedTitle'), 'Apple Sign-In is only available on iOS.');
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
          'Apple Sign‑In is not available on this device. Please ensure you are signed into iCloud and try again.'
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

    if (!isValidEmail(email)) {
      haptics.warning();
      Alert.alert(t('common.error'), t('authScreen.invalidEmail'));
      return;
    }

    if (password.length < 6) {
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
        result = await loginWithEmail(email, password);
      } else {
        result = await register(name, email, password, {
          phone: phone.trim(),
          address: address.trim(),
          emirate,
          birthday: birthday.trim(),
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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const toggleMode = () => {
    haptics.selectionTick();
    setIsLogin(!isLogin);
    setEmail('');
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
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="chevron-down" size={14} color="#16A34A" />
            </TouchableOpacity>
          </View>

          {/* Header with Logo */}
          <View style={styles.header}>
            <Image 
              source={{ uri: AUTH_CONFIG.LOGO_URL }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.uaeRow}>
              <Text style={styles.uaeFlag}>🇦🇪</Text>
              <Text style={styles.title}>{t('authScreen.uaeLine')}</Text>
              <Ionicons name="heart" size={12} color="#dc2626" style={styles.uaeHeart} />
            </View>
          </View>

          {/* Privacy Policy Notice */}
          {!privacyConsent && (
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyNoticeText}>
                {t('authScreen.privacyNotice')}
              </Text>
            </View>
          )}

          {/* Biometric Login Button */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                !privacyConsent && styles.biometricButtonDisabled
              ]}
              onPress={handleBiometricLogin}
              disabled={loading || !privacyConsent}
              activeOpacity={0.8}
            >
              <View style={[styles.biometricButtonContent, isRTL && styles.biometricButtonContentRTL]}>
                <Ionicons 
                  name={biometricType.includes('Face') ? 'scan' : 'finger-print'} 
                  size={20} 
                  color="#ffffff" 
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
                !privacyConsent && styles.googleButtonDisabled
              ]}
              onPress={handleGoogleLogin}
              disabled={loading || !privacyConsent}
              activeOpacity={0.85}
              accessibilityLabel={t('authScreen.continueWithGoogle')}
            >
              <View style={[styles.googleButtonContent, isRTL && styles.googleButtonContentRTL]}>
                <View style={[styles.googleIcon, isRTL ? styles.googleIconRTL : styles.googleIconLTR]}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={[styles.googleButtonText, isRTL && styles.googleButtonTextRTL]}>
                  {t('authScreen.googleShort')}
                </Text>
              </View>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.appleButton, !privacyConsent && styles.appleButtonDisabled]}
                onPress={handleAppleLogin}
                disabled={loading || !privacyConsent}
                activeOpacity={0.85}
                accessibilityLabel={t('authScreen.continueWithApple')}
              >
                <View style={[styles.appleButtonContent, isRTL && styles.appleButtonContentRTL]}>
                  <Ionicons name="logo-apple" size={18} color="#ffffff" style={styles.appleIcon} />
                  <Text style={[styles.appleButtonText, isRTL && styles.appleButtonTextRTL]}>
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

          {/* Email/Password Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>{t('authScreen.fullNameLabel')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.textInputRTL]}
                  placeholder={t('authScreen.fullNamePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholderTextColor="#86868B"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            )}
            
            <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
              <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>{t('authScreen.emailLabel')}</Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.textInputRTL]}
                placeholder={t('authScreen.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#86868B"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
              <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>{t('authScreen.passwordLabel')}</Text>
              <View style={[styles.passwordContainer, isRTL && styles.passwordContainerRTL]}>
                <TextInput
                  style={[styles.passwordInput, isRTL && styles.passwordInputRTL]}
                  placeholder={t('authScreen.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholderTextColor="#86868B"
                  textAlign={isRTL ? 'right' : 'left'}
                />
                <TouchableOpacity
                  style={[styles.passwordToggle, isRTL && styles.passwordToggleRTL]}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#86868B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration-only fields */}
            {!isLogin && (
              <>
                {/* Phone */}
                <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                  <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>
                    {t('authScreen.phoneLabel')} <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, isRTL && styles.textInputRTL]}
                    placeholder={t('authScreen.phonePlaceholder')}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholderTextColor="#86868B"
                    textAlign="left"
                  />
                </View>

                {/* Address */}
                <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                  <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>
                    {t('authScreen.addressLabel')} <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, isRTL && styles.textInputRTL]}
                    placeholder={t('authScreen.addressPlaceholder')}
                    value={address}
                    onChangeText={setAddress}
                    autoComplete="street-address"
                    placeholderTextColor="#86868B"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>

                {/* Emirate */}
                <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                  <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>
                    {t('authScreen.emirateLabel')} <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.selectButton, isRTL && styles.selectButtonRTL]}
                    onPress={() => setShowEmiratePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      !emirate && styles.selectButtonPlaceholder,
                      isRTL && styles.selectButtonTextRTL,
                    ]}>
                      {emirate || t('authScreen.selectEmirate')}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#86868B" />
                  </TouchableOpacity>
                </View>

                {/* Birthday (optional) */}
                <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                  <Text style={[styles.inputLabel, isRTL && styles.inputLabelRTL]}>
                    {t('authScreen.birthdayLabel')}
                  </Text>
                  <TextInput
                    style={[styles.textInput, isRTL && styles.textInputRTL]}
                    placeholder={t('authScreen.birthdayPlaceholder')}
                    value={birthday}
                    onChangeText={setBirthday}
                    placeholderTextColor="#86868B"
                    textAlign={isRTL ? 'right' : 'left'}
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={[styles.birthdayHint, isRTL && styles.birthdayHintRTL]}>
                    {t('authScreen.birthdayHint')}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Privacy Policy Consent */}
          <View style={[styles.privacySection, isRTL && styles.privacySectionRTL]}>
            <TouchableOpacity
              style={[styles.checkboxContainer, isRTL && styles.checkboxContainerRTL]}
              onPress={() => { haptics.selectionTick(); setPrivacyConsent(!privacyConsent); }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked, isRTL && styles.checkboxRTL]}>
                {privacyConsent && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </View>
              <Text style={[styles.privacyText, isRTL && styles.privacyTextRTL]}>
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
              loading && styles.authButtonDisabled,
              !privacyConsent && styles.authButtonDisabled
            ]}
            onPress={handleEmailAuth}
            disabled={loading || !privacyConsent}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? t('authScreen.signIn') : t('authScreen.createAccount')}
              </Text>
            )}
          </TouchableOpacity>

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
            <Text style={[styles.switchModeText, isRTL && styles.switchModeTextRTL]}>
              {isLogin ? t('authScreen.dontHaveAccount') : t('authScreen.alreadyHaveAccount')}
            </Text>
            <TouchableOpacity onPress={toggleMode} activeOpacity={0.7} style={styles.switchModeButtonWrap}>
              <Text style={styles.switchModeButton}>
                {isLogin ? t('authScreen.signUp') : t('authScreen.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
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
                  isRTL && styles.emirateMenuItemTextRtl,
                  emirate === em && styles.emirateMenuItemTextActive,
                ]}>
                  {em}
                </Text>
                {emirate === em && <Ionicons name="checkmark" size={18} color="#dc2626" />}
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
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'en' && styles.langMenuItemTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ru')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ru' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'ru' && styles.langMenuItemTextActive]}>
                Русский
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ar')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ar' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'ar' && styles.langMenuItemTextActive]}>
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
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
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
    color: '#16A34A',
  },
  langOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  langMenu: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  langMenuRtl: {
    alignSelf: 'flex-end',
  },
  langMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langMenuItemActive: {
    backgroundColor: '#fef2f2',
  },
  langMenuItemText: {
    ...T.label,
    color: '#111827',
  },
  langMenuItemTextRtl: {
    textAlign: 'right',
  },
  langMenuItemTextActive: {
    color: '#dc2626',
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 10,
  },
  title: {
    ...T.label,
    fontWeight: '400',
    marginBottom: 0,
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
  subtitle: {
    ...T.body,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconRTL: {
    marginLeft: 10,
    marginRight: 0,
  },
  googleIconLTR: {
    marginRight: 10,
    marginLeft: 0,
  },
  googleIconText: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#ffffff',
  },
  googleButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: undefined,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  appleIcon: {
    marginEnd: 10,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: undefined,
  },
  appleButtonDisabled: {
    opacity: 0.5,
  },
  biometricButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    ...T.bodySmall,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: undefined,
    marginLeft: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  socialRowRTL: {
    flexDirection: 'row-reverse',
  },
  biometricButtonDisabled: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    ...T.label,
    fontWeight: '500',
    color: '#86868B',
    marginHorizontal: 16,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...T.button,
    color: '#1D1D1F',
    marginBottom: 8,
  },
  textInput: {
    ...T.body,
    color: '#1D1D1F',
    lineHeight: undefined,
    fontWeight: undefined,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  passwordInput: {
    ...T.body,
    color: '#1D1D1F',
    lineHeight: undefined,
    fontWeight: undefined,
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  authButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    ...T.button,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 0,
  },
  forgotPasswordText: {
    ...T.label,
    fontWeight: '500',
    color: '#dc2626',
  },
  switchMode: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchModeText: {
    ...T.label,
    fontWeight: '400',
    color: '#86868B',
    textAlign: 'center',
  },
  switchModeButtonWrap: {
    marginTop: 6,
  },
  switchModeButton: {
    ...T.bodySmall,
    fontWeight: '700',
    color: '#dc2626',
    lineHeight: undefined,
  },

  // Required field star
  requiredStar: {
    color: '#dc2626',
    fontWeight: '700',
  },
  // Select button (emirate picker)
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  selectButtonRTL: {
    flexDirection: 'row-reverse',
  },
  selectButtonText: {
    ...T.body,
    color: '#1D1D1F',
    lineHeight: undefined,
    fontWeight: undefined,
  },
  selectButtonTextRTL: {
    textAlign: 'right',
  },
  selectButtonPlaceholder: {
    color: '#86868B',
  },
  // Birthday hint
  birthdayHint: {
    ...T.captionSmall,
    color: '#86868B',
    marginTop: 6,
  },
  birthdayHintRTL: {
    textAlign: 'right',
  },
  // Emirate picker modal
  emirateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emirateMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emirateMenuTitle: {
    ...T.price,
    color: '#1D1D1F',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  emirateMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  emirateMenuItemActive: {
    backgroundColor: '#fef2f2',
  },
  emirateMenuItemText: {
    ...T.body,
    color: '#1D1D1F',
    fontWeight: '500',
    lineHeight: undefined,
  },
  emirateMenuItemTextRtl: {
    textAlign: 'right',
  },
  emirateMenuItemTextActive: {
    color: '#dc2626',
    fontWeight: '700',
  },

  // Privacy Policy Consent
  privacySection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  privacyText: {
    ...T.label,
    fontWeight: '400',
    color: '#3C3C43',
    lineHeight: 20,
    flex: 1,
  },
  privacyLink: {
    ...T.link,
    textDecorationLine: 'underline',
  },
  
  // Privacy Notice
  privacyNotice: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  privacyNoticeText: {
    ...T.caption,
    fontWeight: '500',
    color: '#856404',
    textAlign: 'center',
  },

  // RTL-specific styles for Arabic
  inputContainerRTL: {
    alignItems: 'flex-end',
  },
  inputLabelRTL: {
    textAlign: 'right',
  },
  textInputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  passwordContainerRTL: {
    flexDirection: 'row-reverse',
  },
  passwordInputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  passwordToggleRTL: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  privacySectionRTL: {
    alignItems: 'flex-end',
  },
  checkboxContainerRTL: {
    flexDirection: 'row-reverse',
  },
  checkboxRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  privacyTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  switchModeTextRTL: {
    textAlign: 'center',
  },
  
  // Button RTL styles
  biometricButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  biometricButtonTextRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  googleButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  googleButtonTextRTL: {
    textAlign: 'right',
  },
  appleButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  appleButtonTextRTL: {
    textAlign: 'right',
  },
});

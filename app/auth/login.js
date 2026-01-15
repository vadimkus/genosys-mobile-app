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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import { createLogger } from '../../utils/logger';
import AUTH_CONFIG from '../../config/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';

const log = createLogger('Login');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langSwitching, setLangSwitching] = useState(false);
  
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
    // Check privacy consent
    if (!privacyConsent) {
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithGoogle();
      
      if (result.success) {
        // Navigation will be handled by the auth context automatically
      } else {
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
      Alert.alert(t('common.error'), t('authScreen.googleAuthFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!privacyConsent) {
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }
    try {
      setLoading(true);
      // Surface a clearer message when Apple Sign-In isn't available on the device.
      const isAvailable = await AppleAuthentication.isAvailableAsync().catch(() => false);
      if (!isAvailable) {
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
        Alert.alert(t('authScreen.authFailedTitle'), t('authScreen.appleNoToken'));
        return;
      }

      const result = await loginWithApple({ identityToken, fullName });
      if (!result.success) {
        Alert.alert(t('authScreen.authFailedTitle'), result.error || t('authScreen.appleAuthFailed'));
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
        Alert.alert(
          t('authScreen.authFailedTitle'),
          t('authScreen.appleSetupNotComplete', { bundleId: bundleId || 'unknown' })
        );
        return;
      }
      const detail = [code, msg].filter(Boolean).join(': ');
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
    // Check privacy consent
    if (!privacyConsent) {
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithBiometrics();
      
      if (result.success) {
        // Navigation will be handled by the auth context automatically
        log.debug('Biometric login successful');
      } else {
        Alert.alert(t('authScreen.authFailedTitle'), result.error || t('authScreen.biometricLoginFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('authScreen.biometricAuthFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert(t('common.error'), t('authScreen.fillAllFields'));
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(t('common.error'), t('authScreen.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('authScreen.passwordMinLength'));
      return;
    }

    // Check privacy consent
    if (!privacyConsent) {
      Alert.alert(t('authScreen.privacyRequiredTitle'), t('authScreen.privacyRequiredMessage'));
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (isLogin) {
        result = await loginWithEmail(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.success) {
        // Show success alert only for registration, not login
        if (!isLogin) {
          Alert.alert(t('authScreen.accountCreatedTitle'), t('authScreen.accountCreatedMessage'));
        }
        // Navigation will be handled by the auth context automatically
      } else {
        Alert.alert(t('common.error'), result.error || (isLogin ? t('authScreen.loginFailed') : t('authScreen.registrationFailed')));
      }
    } catch (error) {
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
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
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
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Language Selector - Top Left */}
            <View style={[styles.topControls, isRTL && styles.topControlsRtl]}>
              <TouchableOpacity
                onPress={() => setLangOpen(true)}
                disabled={langSwitching}
                activeOpacity={0.85}
                style={styles.langButton}
                accessibilityRole="button"
                accessibilityLabel="Switch language"
              >
                <Text style={styles.langButtonText}>{currentLangCode}</Text>
                <Ionicons name="chevron-down" size={14} color="#16A34A" />
              </TouchableOpacity>
            </View>

            {/* Centered Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: AUTH_CONFIG.LOGO_URL }}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.uaeRow}>
                <Text style={styles.uaeFlag}>🇦🇪</Text>
                <Text style={styles.uaeText}>{t('authScreen.uaeLine')}</Text>
                <Ionicons name="heart" size={14} color="#dc2626" style={styles.uaeHeart} />
              </View>
            </View>

            {/* Social Login Toggle Buttons */}
            <View style={[styles.socialToggleContainer, isRTL && styles.socialToggleContainerRTL]}>
              <TouchableOpacity
                style={[
                  styles.socialToggleButton,
                  styles.socialToggleGoogle,
                  !privacyConsent && styles.socialToggleDisabled
                ]}
                onPress={handleGoogleLogin}
                disabled={loading || !privacyConsent}
                activeOpacity={0.85}
              >
                <View style={styles.socialToggleContent}>
                  <Text style={styles.googleG}>G</Text>
                  <Text style={styles.socialToggleTextGoogle}>{t('authScreen.googleShort')}</Text>
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[
                    styles.socialToggleButton,
                    styles.socialToggleApple,
                    !privacyConsent && styles.socialToggleAppleDisabled
                  ]}
                  onPress={handleAppleLogin}
                  disabled={loading || !privacyConsent}
                  activeOpacity={0.85}
                >
                  <View style={styles.socialToggleContent}>
                    <Ionicons name="logo-apple" size={18} color="#ffffff" />
                    <Text style={styles.socialToggleTextApple}>{t('authScreen.appleShort')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Biometric Login - Show below social if available */}
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
                    size={18} 
                    color="#dc2626" 
                  />
                  <Text style={[styles.biometricButtonText, isRTL && styles.biometricButtonTextRTL]}>
                    {t('authScreen.loginWithBiometrics', { biometricType })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

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
                    placeholderTextColor="#9CA3AF"
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
                  placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <TouchableOpacity
                    style={[styles.passwordToggle, isRTL && styles.passwordToggleRTL]}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Privacy Policy Consent */}
            <View style={[styles.privacySection, isRTL && styles.privacySectionRTL]}>
              <TouchableOpacity
                style={[styles.checkboxContainer, isRTL && styles.checkboxContainerRTL]}
                onPress={() => setPrivacyConsent(!privacyConsent)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked, isRTL && styles.checkboxRTL]}>
                  {privacyConsent && (
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
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
                loading && styles.authButtonLoading,
                !privacyConsent && styles.authButtonDisabled
              ]}
              onPress={handleEmailAuth}
              disabled={loading || !privacyConsent}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={[styles.authButtonText, !privacyConsent && styles.authButtonTextDisabled]}>
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
            <View style={[styles.switchMode, isRTL && styles.switchModeRTL]}>
              <Text style={[styles.switchModeText, isRTL && styles.switchModeTextRTL]}>
                {isLogin ? t('authScreen.dontHaveAccount') : t('authScreen.alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text style={styles.switchModeButton}>
                  {isLogin ? t('authScreen.signUp') : t('authScreen.signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  // Full screen container - no navigation elements
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
  },
  
  // Language selector - top left
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 32,
  },
  topControlsRtl: {
    justifyContent: 'flex-end',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  
  // Language dropdown modal
  langOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingHorizontal: 20,
  },
  langMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  langMenuRtl: {
    alignSelf: 'flex-end',
  },
  langMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  langMenuItemActive: {
    backgroundColor: '#FEF2F2',
  },
  langMenuItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  langMenuItemTextRtl: {
    textAlign: 'right',
  },
  langMenuItemTextActive: {
    color: '#dc2626',
    fontWeight: '700',
  },
  
  // Logo section - centered
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 12,
  },
  uaeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uaeFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  uaeText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
  },
  uaeHeart: {
    marginLeft: 8,
  },
  
  // Social login toggle buttons (like segmented control)
  socialToggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  socialToggleContainerRTL: {
    flexDirection: 'row-reverse',
  },
  socialToggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialToggleGoogle: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  socialToggleApple: {
    backgroundColor: '#6B7280',
  },
  socialToggleDisabled: {
    opacity: 0.5,
  },
  socialToggleAppleDisabled: {
    opacity: 0.5,
  },
  socialToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA4335',
  },
  socialToggleTextGoogle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  socialToggleTextApple: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Biometric button
  biometricButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 10,
  },
  biometricButtonDisabled: {
    opacity: 0.5,
  },
  biometricButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  biometricButtonTextRTL: {
    marginLeft: 0,
    marginRight: 10,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  // Form
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  
  // Privacy section
  privacySection: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
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
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyLink: {
    color: '#dc2626',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  
  // Auth button
  authButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  authButtonLoading: {
    opacity: 0.8,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonTextDisabled: {
    color: '#9CA3AF',
  },
  
  // Forgot password
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  
  // Switch mode
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  switchModeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchModeButton: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },

  // RTL-specific styles
  inputContainerRTL: {
    alignItems: 'flex-end',
  },
  inputLabelRTL: {
    textAlign: 'right',
    alignSelf: 'stretch',
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
    paddingLeft: 14,
    paddingRight: 14,
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
  switchModeRTL: {
    flexDirection: 'row-reverse',
  },
  switchModeTextRTL: {
    textAlign: 'right',
  },
});

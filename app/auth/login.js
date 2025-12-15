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

const log = createLogger('Login');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useLocalization();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
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
      Alert.alert(t('common.error'), t('authScreen.appleAuthFailed'));
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="heart" size={12} color="#E74C3C" style={styles.uaeHeart} />
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
              <View style={styles.biometricButtonContent}>
                <Ionicons 
                  name={biometricType.includes('Face') ? 'scan' : 'finger-print'} 
                  size={24} 
                  color="#ffffff" 
                />
                <Text style={styles.biometricButtonText}>
                  {t('authScreen.loginWithBiometrics', { biometricType })}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Google Login Button */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              !privacyConsent && styles.googleButtonDisabled
            ]}
            onPress={handleGoogleLogin}
            disabled={loading || !privacyConsent}
            activeOpacity={0.8}
          >
            <View style={styles.googleButtonContent}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>{t('authScreen.continueWithGoogle')}</Text>
            </View>
          </TouchableOpacity>

          {/* Apple Login Button (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.appleButton, !privacyConsent && styles.appleButtonDisabled]}
              onPress={handleAppleLogin}
              disabled={loading || !privacyConsent}
              activeOpacity={0.8}
            >
              <View style={styles.appleButtonContent}>
                <Ionicons name="logo-apple" size={18} color="#ffffff" style={{ marginRight: 10 }} />
                <Text style={styles.appleButtonText}>{t('authScreen.continueWithApple')}</Text>
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
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('authScreen.fullNameLabel')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('authScreen.fullNamePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholderTextColor="#86868B"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('authScreen.emailLabel')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('authScreen.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#86868B"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('authScreen.passwordLabel')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('authScreen.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholderTextColor="#86868B"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
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
          </View>

          {/* Privacy Policy Consent */}
          <View style={styles.privacySection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setPrivacyConsent(!privacyConsent)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked]}>
                {privacyConsent && (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                )}
              </View>
              <Text style={styles.privacyText}>
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
                {isLogin ? 'Sign In' : 'Create Account'}
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
            <Text style={styles.switchModeText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
              <Text style={styles.switchModeButton}>
                {isLogin ? 'Sign Up' : 'Sign In'}
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
    fontSize: 14,
    fontWeight: '400',
    color: '#1D1D1F',
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
    fontSize: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  appleButtonDisabled: {
    opacity: 0.5,
  },
  biometricButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#E74C3C',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
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
    marginHorizontal: 16,
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1D1D1F',
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
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1D1D1F',
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  authButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchModeText: {
    fontSize: 14,
    color: '#86868B',
  },
  switchModeButton: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
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
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  privacyLink: {
    color: '#007AFF',
    fontWeight: '600',
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
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
});

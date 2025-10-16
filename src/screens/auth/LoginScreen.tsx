import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from '../../utils/validation';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error, clearError } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string[];
    password?: string[];
  }>({});

  const handleEmailChange = (text: string) => {
    const sanitized = sanitizeInput(text);
    setEmail(sanitized);

    // Clear validation errors when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    // Clear validation errors when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleLogin = async () => {
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const errors: { email?: string[]; password?: string[] } = {};

    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }

    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert(
        'Validation Error',
        'Please fix the errors below and try again.'
      );
      return;
    }

    console.log('LoginScreen - Starting login process');
    clearError();
    setValidationErrors({});

    const success = await login(email, password);
    console.log('LoginScreen - Login result:', success);
    console.log('LoginScreen - Current error:', error);

    if (!success && error) {
      Alert.alert('Login Failed', error);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ImageBackground
      source={require('../../../login/login.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Genosys</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.email && styles.inputError,
                  ]}
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                />
                {validationErrors.email && (
                  <Text style={styles.errorText}>{validationErrors.email[0]}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.password && styles.inputError,
                  ]}
                  placeholder='Enter your password'
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  autoCapitalize='none'
                />
                {validationErrors.password && (
                  <Text style={styles.errorText}>
                    {validationErrors.password[0]}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    margin: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
});

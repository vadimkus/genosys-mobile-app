/**
 * LoginScreen Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { Alert } from 'react-native';
import LoginScreen from '../auth/LoginScreen';

// Mock the store
jest.mock('../../store/useStore', () => ({
  useStore: () => ({
    login: jest.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form elements', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Welcome to Genosys')).toBeTruthy();
    expect(screen.getByText('Sign in to your account')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Forgot Password?')).toBeTruthy();
    expect(screen.getByText("Don't have an account? Register")).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginScreen />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please fix the errors below and try again.'
      );
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeTruthy();
    });
  });

  it('should show validation error for weak password', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeTruthy();
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const signInButton = screen.getByText('Sign In');

    // Trigger validation error
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    // Start typing in email field
    fireEvent.changeText(emailInput, 'test@example.com');

    // Validation error should be cleared
    expect(screen.queryByText('Please enter a valid email address')).toBeNull();
  });

  it('should navigate to register screen when register link is pressed', () => {
    render(<LoginScreen />);

    const registerLink = screen.getByText('Register');
    fireEvent.press(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to forgot password screen when forgot password link is pressed', () => {
    render(<LoginScreen />);

    const forgotPasswordLink = screen.getByText('Forgot Password?');
    fireEvent.press(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should sanitize email input', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');

    // Try to input potentially dangerous content
    fireEvent.changeText(emailInput, '  TEST@EXAMPLE.COM  ');

    // The input should be sanitized (trimmed and lowercased)
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should show loading state when login is in progress', () => {
    // Mock loading state
    jest.doMock('../../store/useStore', () => ({
      useStore: () => ({
        login: jest.fn().mockResolvedValue(true),
        isLoading: true,
        error: null,
        clearError: jest.fn(),
      }),
    }));

    render(<LoginScreen />);

    expect(screen.getByText('Signing In...')).toBeTruthy();
  });

  it('should handle successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);

    jest.doMock('../../store/useStore', () => ({
      useStore: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
        clearError: jest.fn(),
      }),
    }));

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  it('should handle login error', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    const mockClearError = jest.fn();

    jest.doMock('../../store/useStore', () => ({
      useStore: () => ({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
      }),
    }));

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials'
      );
    });
  });
});

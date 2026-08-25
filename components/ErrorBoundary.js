/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI
 * instead of crashing the entire app. Critical for production stability.
 * 
 * Usage:
 *   <ErrorBoundary fallbackMessage="Something went wrong with checkout">
 *     <CheckoutScreen />
 *   </ErrorBoundary>
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { createLogger } from '../utils/logger';
import { captureException } from '../config/sentry';
import { tStatic } from '../contexts/LocalizationContext';
import T from '../utils/typography';
import { colors } from '../utils/theme';

const log = createLogger('ErrorBoundary');

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    log.error('Component error caught', {
      error: error?.message || String(error),
      componentStack: errorInfo?.componentStack?.slice(0, 500),
      screen: this.props.screenName || 'unknown',
    });
    
    this.setState({ errorInfo });
    captureException(error, {
      screen: this.props.screenName || 'unknown',
      extra: {
        componentStack: errorInfo?.componentStack?.slice(0, 1000),
      },
    });
    
    // If a custom error handler is provided, call it
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          retry: this.handleRetry,
        });
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>{tStatic('error.somethingWentWrong')}</Text>
            <Text style={styles.message}>
              {this.props.fallbackMessage || tStatic('error.unexpectedError')}
            </Text>
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </Text>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel={tStatic('error.tryAgain')}
            >
              <Text style={styles.retryButtonText}>{tStatic('error.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight screen-level error boundary wrapper
 * Use this to wrap individual screens for granular error isolation.
 */
export function withErrorBoundary(Component, options = {}) {
  const { screenName, fallbackMessage } = options;
  
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary screenName={screenName} fallbackMessage={fallbackMessage}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    ...T.sectionTitle,
    color: colors.label,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    ...T.bodySmall,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  retryButtonText: {
    ...T.button,
  },
  debugContainer: {
    backgroundColor: colors.fill,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
    width: '100%',
  },
  debugText: {
    ...T.mono,
    fontSize: 11,
    color: colors.mutedText,
  },
});

export default ErrorBoundary;

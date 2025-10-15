import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { CartProvider } from './src/contexts/CartContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { productService } from './src/services/productService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ENV } from './src/config/environment';

function AppContent() {
  const { isLoading, setLoading } = useStore();
  const { isDark } = useTheme();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      setLoading(true);
      try {
        // Log environment info in development
        if (ENV.IS_DEVELOPMENT) {
          console.log('🚀 Initializing Genosys Mobile App...');
          console.log('Environment:', ENV.ENVIRONMENT);
          console.log('API Base URL:', ENV.API_BASE_URL);
        }

        // Initialize product service
        console.log('🔄 Initializing ProductService...');
        await productService.initialize();
        console.log('✅ ProductService initialized');
        
        // Check for existing auth token
        // You can add token validation logic here
        setLoading(false);
      } catch (error) {
        console.error('App initialization error:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, [setLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

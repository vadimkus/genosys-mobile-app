import React from 'react';
import { Stack, Redirect, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from './auth/login';

export default function AuthWrapper() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // Prevent access to non-auth routes when logged out
    if (pathname && !pathname.startsWith('/auth')) {
      return <Redirect href="/auth/login" />;
    }

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Prevent access to auth routes when logged in
  if (pathname && pathname.startsWith('/auth')) {
    return <Redirect href="/(tabs)/shop" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="product/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/addresses" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/payment" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/help" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/contact" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/privacy" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/terms" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
      <Stack.Screen 
        name="profile/about" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

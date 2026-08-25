import React from 'react';
import { Stack, Redirect, useLocalSearchParams, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import ChatButton from '../components/ChatButton';
import { colors } from '../utils/theme';

// Screens where the chat button should be hidden
// Hides on: all standalone info pages, checkout flow, auth, webview, camera
const CHAT_HIDDEN_ROUTES = [
  '/chat',                 // full-screen chat route (button would overlap itself)
  '/profile',              // profile page and sub-pages
  '/bag',                  // bag/cart tab
  '/orders',               // orders tab
  '/checkout',             // checkout flow
  '/payment/',             // payment screens
  '/auth/',                // login, register, forgot-password, reset-password
  '/webview',              // legacy webview screens
  '/product-guide',        // dedicated PDF viewer with its own controls
  '/skin-analysis',        // skin analysis quiz
  '/skin-analysis-camera', // camera screen
  '/bundle-builder',       // build your set
  '/partners',             // partners page
  '/brand',                // brand page
  '/contact',              // contact page
  '/locations',            // locations page
  '/blog',                 // blog page
  '/training',             // training page
  '/faq',                  // FAQ page
  '/delivery',             // delivery page
  '/about',                // about page
  '/skin-concerns',        // skin concerns listing
  '/concern-detail',       // skin concern detail pages
  '/product/',             // PDP has dense sticky bag controls; avoid overlap
  '/partner-portal',       // partner (clinic) ordering portal
];

const PROTECTED_ROUTE_PREFIXES = [
  '/bag',
  '/(tabs)/bag',
  '/orders',
  '/(tabs)/orders',
  '/profile',
  '/checkout',
  '/payment',
  '/chat',
  '/partner-portal',
];

const isProtectedRoute = (pathname) => {
  if (!pathname) return false;
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const normalizeReturnTo = (value) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') return '/(tabs)/shop';
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  if (!decoded.startsWith('/') || decoded.startsWith('/auth')) return '/(tabs)/shop';
  return decoded;
};

const buildReturnTo = (pathname, params = {}) => {
  const query = Object.entries(params)
    .filter(([key, value]) => key !== 'returnTo' && value !== undefined && value !== null)
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    })
    .join('&');
  return query ? `${pathname}?${query}` : pathname;
};

export default function AuthWrapper() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const showChatButton = isAuthenticated && !CHAT_HIDDEN_ROUTES.some((r) => pathname?.startsWith(r));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated && pathname && isProtectedRoute(pathname)) {
    return (
      <Redirect
        href={{
          pathname: '/auth/login',
          params: { returnTo: buildReturnTo(pathname, params) },
        }}
      />
    );
  }

  // Prevent access to auth routes when logged in, preserving the original intent.
  if (isAuthenticated && pathname && pathname.startsWith('/auth')) {
    return <Redirect href={normalizeReturnTo(params?.returnTo)} />;
  }

  return (
    <View style={styles.mainContainer}>
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
          name="product-guide"
          options={{
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true,
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
      </Stack>
      {/* Global floating chat button - visible on all screens except chat, checkout, camera */}
      <ChatButton visible={showChatButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
});

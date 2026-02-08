/**
 * Reusable WebView screen
 * Opens a URL in an embedded browser with back navigation and loading indicator.
 * Usage: router.push({ pathname: '/webview', params: { url, title } })
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams();
  const { dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(title || '');
  const [httpError, setHttpError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const webViewRef = useRef(null);

  // Handle HTTP errors (4xx, 5xx)
  const handleHttpError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[WebView] HTTP Error:', nativeEvent.statusCode, nativeEvent.url, nativeEvent.description);
    setHttpError({
      statusCode: nativeEvent.statusCode,
      url: nativeEvent.url || '',
      description: nativeEvent.description || 'Server error',
    });
    setLoading(false);
  }, []);

  // Handle load errors (network, DNS, etc.)
  const handleError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setLoadError({
      code: nativeEvent.code,
      description: nativeEvent.description || 'Failed to load page',
    });
    setLoading(false);
  }, []);

  // Retry loading the page
  const handleRetry = useCallback(() => {
    setHttpError(null);
    setLoadError(null);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  const displayUrl = typeof url === 'string' ? url : '';

  if (!displayUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>No URL provided</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {pageTitle || 'Loading...'}
        </Text>
        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Loading bar */}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#dc2626" />
        </View>
      )}

      {/* Error State */}
      {(httpError || loadError) ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorTitle}>
            {httpError ? `Error ${httpError.statusCode}` : 'Connection Error'}
          </Text>
          <Text style={styles.errorDescription}>
            {httpError
              ? 'The page could not be loaded. This is usually temporary.'
              : loadError?.description || 'Please check your connection and try again.'}
          </Text>
          {httpError?.url ? (
            <Text style={styles.errorUrl} numberOfLines={2} selectable>
              {httpError.url}
            </Text>
          ) : null}
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton} activeOpacity={0.7}>
            <Ionicons name="reload" size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
      /* WebView */
      <WebView
        ref={webViewRef}
        source={{ uri: displayUrl }}
        style={styles.webview}
        onLoadStart={() => { setLoading(true); setHttpError(null); setLoadError(null); }}
        onLoadEnd={() => setLoading(false)}
        onHttpError={handleHttpError}
        onError={handleError}
        onNavigationStateChange={(navState) => {
          if (navState.title && navState.title !== displayUrl) {
            setPageTitle(navState.title);
          }
        }}
        startInLoadingState={false}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loadingBar: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  errorUrl: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 260,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

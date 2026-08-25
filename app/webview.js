/**
 * Reusable WebView screen
 * Opens a URL in an embedded browser with back navigation and loading indicator.
 * Usage: router.push({ pathname: '/webview', params: { url, title } })
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { createLogger } from '../utils/logger';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { colors, shadow } from '../utils/theme';

const log = createLogger('WebView');

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams();
  const { dir, t } = useLocalization();
  const isRTL = dir === 'rtl';
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(title || '');
  const [httpError, setHttpError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const webViewRef = useRef(null);
  // WebView owns its own scrolling, so the nav bar stays solid (scrollY={null}).
  const { headerHeight } = useCollapsibleHeader();

  // Handle HTTP errors (4xx, 5xx)
  const handleHttpError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    log.error('HTTP Error: ' + nativeEvent.statusCode + ' ' + nativeEvent.url, nativeEvent.description);
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

  // Intercept navigation requests: handle PDF downloads & external links
  const handleNavigationRequest = useCallback((request) => {
    const { url: reqUrl, isTopFrame } = request;

    // Allow the initial page load
    if (reqUrl === displayUrl) return true;

    // Allow iframe loads (YouTube embeds, etc.) — don't intercept sub-frame navigation
    if (isTopFrame === false) return true;

    // Allow YouTube embed URLs (used in training page iframes)
    if (reqUrl.includes('youtube.com/embed') || reqUrl.includes('youtube-nocookie.com/embed')) return true;

    // Detect PDF links (direct .pdf files or pcloud downloads)
    const isPdf = /\.pdf(\?|$)/i.test(reqUrl);
    const isPcloud = reqUrl.includes('pcloud.link') || reqUrl.includes('pcloud.com');
    const isDownload = isPdf || isPcloud;

    if (isDownload) {
      // Open PDF in native viewer / browser (triggers iOS Share Sheet or preview)
      Linking.openURL(reqUrl).catch((e) => {
        log.warn('Failed to open PDF URL', e?.message);
        Alert.alert(t('webview.downloadError'), t('webview.couldNotOpenPdf'));
      });
      return false; // Prevent WebView from loading it
    }

    // Allow same-domain navigation within WebView
    if (reqUrl.includes('genosys.ae')) return true;

    // Allow Google-related domains (reCAPTCHA, analytics, fonts, etc.)
    if (reqUrl.includes('google.com') || reqUrl.includes('googleapis.com') || reqUrl.includes('gstatic.com')) return true;

    // External links: open in system browser
    Linking.openURL(reqUrl).catch((e) => log.warn('Failed to open external URL', e?.message));
    return false;
  }, [displayUrl]);

  // Inject JS to hide website chrome (headers, nav, chat) and intercept PDF clicks
  const injectedJS = `
    (function() {
      // CSS to hide ALL website chrome (headers, nav, chat, footers) inside native app WebView
      var css = document.createElement('style');
      css.textContent = [
        // === HEADERS ===
        // Hide main desktop header
        '.main-header { display: none !important; height: 0 !important; }',
        // Hide ALL <header> elements (PWAHeader, MobileWebHeader, desktop Header)
        'header { display: none !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }',
        // Hide all sticky/fixed elements at top (catches any header variation)
        '[class*="sticky"][class*="top-0"] { display: none !important; height: 0 !important; }',
        '[class*="fixed"][class*="top-0"] { display: none !important; height: 0 !important; }',
        // Hide hamburger-based mobile nav overlays and menus
        '[class*="z-50"][class*="fixed"][class*="inset-0"] { display: none !important; }',
        '[class*="z-40"][class*="fixed"][class*="inset-0"] { display: none !important; }',
        // === SPACERS & PADDING ===
        // Remove top padding/margin that headers leave behind
        '#main-content { padding-top: 0 !important; margin-top: 0 !important; }',
        'body { padding-top: 0 !important; margin-top: 0 !important; }',
        'main { padding-top: 0 !important; margin-top: 0 !important; }',
        // Hide header spacer divs (aria-hidden placeholders for fixed headers)
        'div[aria-hidden="true"] { display: none !important; height: 0 !important; }',
        // === IN-PAGE SUB-NAVIGATION (< Products | Title | Profile icon) ===
        // These are rendered by PWAPageWrapper and individual page components
        // Some pages have border-b, some don't — match all variations
        'div[class*="justify-between"][class*="px-5"][class*="py-4"] { display: none !important; }',
        'div[class*="justify-between"][class*="px-4"][class*="py-3"] { display: none !important; }',
        // === CHAT WIDGET ===
        'button[aria-label*="Genie" i], button[aria-label*="Beauty Genie" i], button[aria-label*="chat" i] { display: none !important; }',
        // === BOTTOM BARS ===
        // Hide PWA/mobile-web bottom tab bars and footers
        '[class*="fixed"][class*="bottom-0"] { display: none !important; }',
        // Remove large bottom padding added for PWA/mobile-web tab bar
        '[class*="pb-32"], [class*="pb-24"], [class*="pb-20"] { padding-bottom: 0 !important; }',
      ].join('\\n');
      document.head.appendChild(css);

      // Additional JS cleanup for dynamically rendered elements
      function hideWebsiteChrome() {
        // Hide chat widget containers (fixed position with Genie text)
        document.querySelectorAll('[class*="fixed"]').forEach(function(el) {
          var text = el.textContent || '';
          if ((text.includes('Genie') || text.includes('Beauty Genie')) && el.querySelector('svg')) {
            el.style.display = 'none';
          }
        });
        // Hide ALL aria-hidden spacer divs (placed after fixed headers)
        document.querySelectorAll('div[aria-hidden="true"]').forEach(function(el) {
          el.style.display = 'none';
          el.style.height = '0px';
        });
        // Hide in-page navigation headers (< Products | Title | profile icon)
        // These are rendered by PWAPageWrapper and individual page components
        // Use BOTH class-name matching AND structure-based detection for reliability
        document.querySelectorAll('div').forEach(function(el) {
          var cs = el.className || '';
          // Class-name pattern: flex + justify-between + padding
          if (cs.includes('flex') && cs.includes('items-center') && cs.includes('justify-between') && (cs.includes('px-5') || cs.includes('px-4'))) {
            if (el.querySelector('svg') && el.children.length >= 2 && el.children.length <= 5) {
              el.style.display = 'none';
            }
          }
          // Sticky wrapper pattern (Training page)
          if (cs.includes('border-b') && cs.includes('bg-white') && cs.includes('sticky')) {
            el.style.display = 'none';
          }
        });
        // Structure-based detection: find divs that look like sub-nav bars
        // (3 children: button/link with SVG, text span, button with avatar circle)
        document.querySelectorAll('div').forEach(function(el) {
          if (el.children.length === 3 && el.querySelector('svg')) {
            var style = window.getComputedStyle(el);
            if (style.display === 'flex' && style.justifyContent === 'space-between' && style.alignItems === 'center') {
              // Verify it contains a back-arrow SVG and short text (title)
              var hasBackArrow = el.querySelector('svg path[d*="M15 19l-7-7"]') || el.querySelector('svg[class*="w-5"][class*="h-5"]');
              var hasAvatar = el.querySelector('div[class*="rounded-full"]');
              if (hasBackArrow || hasAvatar) {
                el.style.display = 'none';
              }
            }
          }
        });
        // Strip excessive bottom padding (pb-32 = 8rem added for PWA/mobile tab bar)
        document.querySelectorAll('[class*="pb-32"], [class*="pb-24"], [class*="pb-20"]').forEach(function(el) {
          el.style.paddingBottom = '0px';
        });
      }
      hideWebsiteChrome();
      setTimeout(hideWebsiteChrome, 500);
      setTimeout(hideWebsiteChrome, 1500);
      setTimeout(hideWebsiteChrome, 3000);
      new MutationObserver(function() { hideWebsiteChrome(); }).observe(document.body, { childList: true, subtree: true });

      // Override window.open to send messages to React Native
      var originalOpen = window.open;
      window.open = function(url, target, features) {
        if (url && (url.match(/\\.pdf(\\?|$)/i) || url.includes('pcloud.link') || url.includes('pcloud.com'))) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open-url', url: url }));
          return null;
        }
        // For other URLs, also send to React Native
        if (url && !url.includes('genosys.ae')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open-url', url: url }));
          return null;
        }
        return originalOpen.call(window, url, target, features);
      };

      // Also intercept programmatic <a> click downloads
      document.addEventListener('click', function(e) {
        var el = e.target.closest('a[href]');
        if (el && el.href) {
          var href = el.href;
          if (href.match(/\\.pdf(\\?|$)/i) || href.includes('pcloud.link') || href.includes('pcloud.com')) {
            e.preventDefault();
            e.stopPropagation();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open-url', url: href }));
          }
        }
      }, true);
    })();
    true;
  `;

  if (!displayUrl) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader
          title={t('webview.errorTitle')}
          scrollY={null}
          onBack={() => { haptics.lightTap(); router.back(); }}
          isRTL={isRTL}
        />
        <View style={[styles.errorContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.tertiary} />
          <Text style={styles.errorText}>{t('webview.noUrlProvided')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Solid nav bar (WebView scrolls internally, so no fade tracking) */}
      <CollapsibleHeader
        title={pageTitle || t('webview.loading')}
        scrollY={null}
        onBack={() => { haptics.lightTap(); router.back(); }}
        onRefresh={() => { haptics.lightTap(); webViewRef.current?.reload(); }}
        rightIcon="reload"
        isRTL={isRTL}
      />
      <View style={[styles.body, { paddingTop: headerHeight }]}>
      {/* Loading bar */}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      )}

      {/* Error State */}
      {(httpError || loadError) ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.tertiary} />
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
          <TouchableOpacity onPress={() => { haptics.lightTap(); handleRetry(); }} style={styles.retryButton} activeOpacity={0.7}>
            <Ionicons name="reload" size={18} color={colors.white} />
            <Text style={styles.retryButtonText}>{t('webview.tryAgain')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { haptics.lightTap(); router.back(); }} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>{t('webview.goBack')}</Text>
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
        onShouldStartLoadWithRequest={handleNavigationRequest}
        onOpenWindow={(syntheticEvent) => {
          // Intercept window.open() calls (used by PDFDownloadButton for external links)
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.targetUrl) {
            Linking.openURL(nativeEvent.targetUrl).catch((e) => log.warn('Failed to open window URL', e?.message));
          }
        }}
        onMessage={(event) => {
          // Handle messages from injected JavaScript
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'open-url' && data.url) {
              Linking.openURL(data.url).catch((e) => {
                log.warn('Failed to open file URL', e?.message);
                Alert.alert(t('webview.errorTitle'), t('webview.couldNotOpenFile'));
              });
            }
          } catch { /* ignore non-JSON messages */ }
        }}
        injectedJavaScript={injectedJS}
        startInLoadingState={false}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsInlineMediaPlayback
      />
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  body: {
    flex: 1,
  },
  loadingBar: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.subtleBg,
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
    ...T.body,
    color: colors.secondaryLabel,
    lineHeight: undefined,
  },
  errorTitle: {
    ...T.sectionTitleSmall,
    color: colors.label,
    marginTop: 8,
  },
  errorDescription: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  errorUrl: {
    ...T.badge,
    fontWeight: '400',
    color: colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    maxWidth: 260,
    ...shadow.cta(colors.cta),
  },
  retryButtonText: {
    ...T.buttonSmall,
    fontSize: 15,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backButtonText: {
    ...T.label,
    fontWeight: '500',
    color: colors.secondaryLabel,
  },
});

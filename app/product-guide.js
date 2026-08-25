import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { useLocalization } from '../contexts/LocalizationContext';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { colors, shadow } from '../utils/theme';
import T from '../utils/typography';
import * as haptics from '../utils/haptics';
import { createLogger } from '../utils/logger';
import {
  canonicalizeProductGuideUrl,
  getProductGuideFilename,
  getProductGuideSourceUrl,
  isAllowedProductGuideNavigation,
} from '../utils/productGuide';

const log = createLogger('ProductGuide');
const LOAD_TIMEOUT_MS = 30000;
const CACHE_DIR = `${FileSystem.cacheDirectory}product-guides/`;
const IOS_VIEWER_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const firstParam = (value) => (Array.isArray(value) ? value[0] : value);

const injectedViewerCleanup = `
  (function () {
    function prepareViewer() {
      var close = document.querySelector('button[aria-label="Close"]');
      var toolbar = close && close.parentElement;
      if (toolbar) toolbar.style.display = 'none';

      var iframe = document.querySelector('iframe');
      if (iframe) {
        var content = iframe.parentElement;
        if (content) {
          content.style.top = '0px';
          content.style.height = '100vh';
          content.style.bottom = '0px';
        }
        if (!iframe.dataset.genosysReadyBound) {
          iframe.dataset.genosysReadyBound = 'true';
          iframe.addEventListener('load', function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pdf-ready' }));
          });
        }
      }

      document.querySelectorAll('header, footer, nav, button[aria-label="Download"]').forEach(function (el) {
        el.style.display = 'none';
      });
    }

    prepareViewer();
    new MutationObserver(prepareViewer).observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(prepareViewer, 500);
    setTimeout(prepareViewer, 1500);
  })();
  true;
`;

function ActionButton({ icon, label, onPress, disabled, busy, isRTL }) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons name={icon} size={20} color={disabled ? colors.tertiary : colors.blue} />
      )}
      <Text style={[styles.actionLabel, isRTL && styles.textRTL]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProductGuideScreen() {
  const params = useLocalSearchParams();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { headerHeight } = useCollapsibleHeader();
  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);
  const downloadRef = useRef(null);

  const canonicalUrl = useMemo(() => canonicalizeProductGuideUrl(firstParam(params.url)), [params.url]);
  const sourceUrl = useMemo(
    () => getProductGuideSourceUrl(canonicalUrl, Platform.OS),
    [canonicalUrl]
  );
  const documentTitle = firstParam(params.title) || t('productGuide.title');
  const filename = useMemo(() => getProductGuideFilename(canonicalUrl), [canonicalUrl]);

  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(canonicalUrl ? null : 'invalid-url');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const armLoadTimeout = useCallback(() => {
    clearLoadTimeout();
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError('timeout');
    }, LOAD_TIMEOUT_MS);
  }, [clearLoadTimeout]);

  useEffect(() => {
    if (!sourceUrl) return undefined;
    armLoadTimeout();
    return clearLoadTimeout;
  }, [sourceUrl, loadKey, armLoadTimeout, clearLoadTimeout]);

  const handleBack = useCallback(() => {
    haptics.lightTap();
    router.back();
  }, []);

  const handleRetry = useCallback(() => {
    haptics.lightTap();
    setError(null);
    setLoading(true);
    setProgress(0);
    setLoadKey((value) => value + 1);
  }, []);

  const shareCanonicalUrl = useCallback(async () => {
    if (!canonicalUrl) return;
    haptics.lightTap();
    try {
      await Share.share(
        {
          title: documentTitle,
          message: `${documentTitle}\n${canonicalUrl}`,
          url: canonicalUrl,
        },
        { dialogTitle: t('productGuide.share') }
      );
    } catch (shareError) {
      log.warn('Share failed', shareError?.message || shareError);
      Alert.alert(t('productGuide.errorTitle'), t('productGuide.shareFailed'));
    }
  }, [canonicalUrl, documentTitle, t]);

  const openExternally = useCallback(async () => {
    if (!canonicalUrl) return;
    haptics.lightTap();
    try {
      await WebBrowser.openBrowserAsync(canonicalUrl);
    } catch (openError) {
      log.warn('External open failed', openError?.message || openError);
      Alert.alert(t('productGuide.errorTitle'), t('productGuide.openFailed'));
    }
  }, [canonicalUrl, t]);

  const offerDownloadedFile = useCallback(
    (localUri) => {
      Alert.alert(
        t('productGuide.downloadCompleteTitle'),
        t('productGuide.downloadCompleteMessage'),
        [
          { text: t('common.done'), style: 'cancel' },
          {
            text: t('productGuide.openDownloaded'),
            onPress: async () => {
              try {
                if (Platform.OS === 'android') {
                  const contentUri = await FileSystem.getContentUriAsync(localUri);
                  await Linking.openURL(contentUri);
                } else {
                  await Share.share({ title: documentTitle, url: localUri });
                }
              } catch (openError) {
                log.warn('Downloaded file open/share failed', openError?.message || openError);
                Alert.alert(t('productGuide.errorTitle'), t('productGuide.downloadedOpenFailed'));
              }
            },
          },
        ]
      );
    },
    [documentTitle, t]
  );

  const downloadPdf = useCallback(async () => {
    if (!canonicalUrl || downloading) return;
    haptics.mediumTap();
    setDownloading(true);
    setDownloadProgress(0);

    try {
      const directoryInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      const localUri = `${CACHE_DIR}${encodeURIComponent(filename)}`;
      const existing = await FileSystem.getInfoAsync(localUri);
      if (existing.exists && Number(existing.size || 0) > 0) {
        setDownloadProgress(1);
        haptics.success();
        offerDownloadedFile(localUri);
        return;
      }

      const resumable = FileSystem.createDownloadResumable(
        canonicalUrl,
        localUri,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0) {
            setDownloadProgress(Math.min(1, totalBytesWritten / totalBytesExpectedToWrite));
          }
        }
      );
      downloadRef.current = resumable;
      const result = await resumable.downloadAsync();
      if (!result?.uri) throw new Error('Download returned no file');

      setDownloadProgress(1);
      haptics.success();
      offerDownloadedFile(result.uri);
    } catch (downloadError) {
      haptics.error();
      log.warn('PDF download failed', downloadError?.message || downloadError);
      Alert.alert(t('productGuide.downloadFailedTitle'), t('productGuide.downloadFailedMessage'));
    } finally {
      downloadRef.current = null;
      setDownloading(false);
    }
  }, [canonicalUrl, downloading, filename, offerDownloadedFile, t]);

  const allowNavigation = useCallback(
    (request) => {
      const allowed = isAllowedProductGuideNavigation(request.url, canonicalUrl, {
        isTopFrame: request.isTopFrame,
      });
      if (!allowed && request.isTopFrame !== false) {
        log.warn('Blocked product guide navigation', request.url);
      }
      return allowed;
    },
    [canonicalUrl]
  );

  const showError = !!error;
  const loadingPercent = Math.max(1, Math.min(100, Math.round(progress * 100)));
  const downloadPercent = Math.max(0, Math.min(100, Math.round(downloadProgress * 100)));

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={documentTitle} scrollY={null} onBack={handleBack} isRTL={isRTL} />

      <View style={[styles.content, { paddingTop: headerHeight }]}>
        {showError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="cloud-offline-outline" size={34} color={colors.accent} />
            </View>
            <Text style={[styles.errorTitle, isRTL && styles.textRTL]}>{t('productGuide.loadFailedTitle')}</Text>
            <Text style={[styles.errorMessage, isRTL && styles.textRTL]}>
              {error === 'invalid-url'
                ? t('productGuide.invalidUrl')
                : error === 'timeout'
                  ? t('productGuide.timeoutMessage')
                  : t('productGuide.offlineMessage')}
            </Text>
            {canonicalUrl ? (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} accessibilityRole="button">
                <Ionicons name="reload" size={18} color={colors.white} />
                <Text style={styles.retryText}>{t('productGuide.retry')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <WebView
              key={loadKey}
              ref={webViewRef}
              source={{ uri: sourceUrl }}
              style={styles.webview}
              userAgent={Platform.OS === 'android' ? IOS_VIEWER_USER_AGENT : undefined}
              onLoadStart={() => {
                setLoading(true);
                setProgress(0);
                setError(null);
                armLoadTimeout();
              }}
              onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress || 0)}
              onLoadEnd={() => {
                clearLoadTimeout();
                setLoading(false);
                setProgress(1);
              }}
              onError={({ nativeEvent }) => {
                clearLoadTimeout();
                setLoading(false);
                setError(nativeEvent.description || 'network');
              }}
              onHttpError={({ nativeEvent }) => {
                const failedMainDocument =
                  nativeEvent.url === sourceUrl || nativeEvent.url === canonicalUrl;
                if (failedMainDocument && nativeEvent.statusCode >= 400) {
                  clearLoadTimeout();
                  setLoading(false);
                  setError(`http-${nativeEvent.statusCode}`);
                }
              }}
              onMessage={({ nativeEvent }) => {
                try {
                  const message = JSON.parse(nativeEvent.data);
                  if (message.type === 'pdf-ready') {
                    clearLoadTimeout();
                    setLoading(false);
                    setProgress(1);
                  }
                } catch {
                  // Ignore messages not emitted by the product-guide injection.
                }
              }}
              onShouldStartLoadWithRequest={allowNavigation}
              injectedJavaScript={Platform.OS === 'android' ? injectedViewerCleanup : undefined}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled
              bounces
              directionalLockEnabled={false}
              nestedScrollEnabled
              setBuiltInZoomControls
              setDisplayZoomControls={false}
              showsVerticalScrollIndicator
              showsHorizontalScrollIndicator
              contentMode="mobile"
              startInLoadingState={false}
              setSupportMultipleWindows={false}
              allowsBackForwardNavigationGestures={false}
              sharedCookiesEnabled={false}
              thirdPartyCookiesEnabled={false}
            />
            {loading ? (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
                  {t('productGuide.loading', { percent: loadingPercent })}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${loadingPercent}%` }]} />
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>

      <View
        style={[
          styles.actions,
          isRTL && styles.actionsRTL,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <ActionButton
          icon="download-outline"
          label={downloading ? t('productGuide.downloading', { percent: downloadPercent }) : t('productGuide.download')}
          onPress={downloadPdf}
          disabled={!canonicalUrl || downloading}
          busy={downloading}
          isRTL={isRTL}
        />
        <ActionButton
          icon="share-outline"
          label={t('productGuide.share')}
          onPress={shareCanonicalUrl}
          disabled={!canonicalUrl}
          isRTL={isRTL}
        />
        <ActionButton
          icon="open-outline"
          label={t('productGuide.openExternally')}
          onPress={openExternally}
          disabled={!canonicalUrl}
          isRTL={isRTL}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  content: {
    flex: 1,
    backgroundColor: colors.subtleBg,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 40,
  },
  loadingText: {
    ...T.label,
    color: colors.secondaryLabel,
    marginTop: 14,
    textAlign: 'center',
  },
  progressTrack: {
    width: '72%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.fillSecondary,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.cta,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginBottom: 16,
  },
  errorTitle: {
    ...T.sectionTitle,
    color: colors.label,
    textAlign: 'center',
  },
  errorMessage: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    ...shadow.cta(colors.cta),
  },
  retryText: {
    ...T.buttonSmall,
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  actionsRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionLabel: {
    ...T.captionSmall,
    color: colors.label,
    fontWeight: '600',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

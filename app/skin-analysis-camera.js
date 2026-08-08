/**
 * Skin Analysis Camera Screen
 * Captures a selfie photo and offers:
 *   1. Quick on-device analysis (heuristic-based)
 *   2. AI Expert Analysis (GPT-4o vision via /api/skin-analysis/ai)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as haptics from '../utils/haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import SkinAnalysisResults from '../components/SkinAnalysisResults';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { colors, tint, shadow, surfaces } from '../utils/theme';
import { analyzeSkinImage } from '../utils/skinImageAnalysis';
import AUTH_CONFIG from '../config/auth';
import { getJson, sendJson } from '../services/httpClient';
import { fetchProductById } from '../services/api';
import { createLogger } from '../utils/logger';
import { isProductOptionSelectionRequired } from '../utils/productOptions';
import T from '../utils/typography';

const log = createLogger('SkinAnalysisCamera');

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

// Helper: parse product IDs from AI recommendation text
// Format: [PRODUCT NAME](url){{id:ID}}
function parseProductId(text) {
  const match = text?.match(/\{\{id:(\d+)\}\}/);
  return match ? parseInt(match[1], 10) : null;
}
function cleanProductText(text) {
  return (text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\{\{id:\d+\}\}/g, '')
    .trim();
}

export default function SkinAnalysisCameraScreen() {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const cameraHeaderTop = Math.max(insets.top + 8, Platform.OS === 'ios' ? 50 : 10);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const [capturing, setCapturing] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [capturedBase64, setCapturedBase64] = useState(null);
  const [capturedUri, setCapturedUri] = useState(null);
  const [addedProducts, setAddedProducts] = useState(new Set());
  const [productDetails, setProductDetails] = useState({}); // { id: { image, size, price, isPriceOnRequest } }
  const { user } = useAuth();
  const { addItem } = useCart();

  // Fetch product details (image, size, price) for AI recommendations
  const fetchProductDetails = useCallback(async (recommendations) => {
    const baseUrl = (AUTH_CONFIG.API_BASE_URL || 'https://genosys.ae/api/mobile').replace('/api/mobile', '');
    const ids = recommendations
      .map((r) => {
        const match = r.product?.match(/\{\{id:(\d+)\}\}/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    const details = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const product = await getJson(`${baseUrl}/api/products/${id}`, {
            headers: { apiKey: false },
          });
          const img = product.image || '';
          details[parseInt(id, 10)] = {
            image: img.startsWith('http') ? img : `${ASSET_ORIGIN}${img}`,
            size: product.size || null,
            price: product.displayPrice ?? product.price ?? null,
            isPriceOnRequest: product.isPriceOnRequest || false,
          };
        } catch { /* silent */ }
      })
    );
    setProductDetails((prev) => ({ ...prev, ...details }));
  }, []);

  // Quick on-device analysis
  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    haptics.mediumTap();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      setCapturedUri(photo.uri);

      // Get base64 for AI analysis later
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512 } }],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true, compress: 0.8 }
      );
      setCapturedBase64(`data:image/jpeg;base64,${resized.base64}`);

      // Run AI Expert Analysis directly
      setAiAnalyzing(true);
      try {
        const baseUrl = (AUTH_CONFIG.API_BASE_URL || 'https://genosys.ae/api/mobile').replace('/api/mobile', '');
        const json = await sendJson(`${baseUrl}/api/skin-analysis/ai`, {
          image: `data:image/jpeg;base64,${resized.base64}`,
          locale: locale || 'en',
        }, {
          headers: { apiKey: false },
          safeMessage: t('skinCamera.errorAnalysisFailed'),
        });
        if (json.success && json.data) {
          setAiResult(json.data);
          haptics.success();
          // Fetch product details (images, sizes, prices) in background
          fetchProductDetails(json.data.recommendations || []);
        } else {
          throw new Error(json.error || 'AI analysis failed');
        }
      } catch (err) {
        log.warn('AI analysis failed:', err.message);
        // Fall back to on-device analysis
        setAnalyzing(true);
        try {
          const result = await analyzeSkinImage(photo.uri);
          setLocalResult(result);
        } catch {
          Alert.alert(t('skinCamera.errorTitle'), t('skinCamera.errorAnalysisFailed'));
        }
        setAnalyzing(false);
      } finally {
        setAiAnalyzing(false);
      }
    } catch (error) {
      Alert.alert(t('skinCamera.errorTitle'), t('skinCamera.errorCaptureFailed'));
    } finally {
      setCapturing(false);
    }
  };

  const handleReset = useCallback(() => {
    setLocalResult(null);
    setAiResult(null);
    setCapturedBase64(null);
    setCapturedUri(null);
    setAddedProducts(new Set());
    setProductDetails({});
  }, []);

  const handleAddToBag = useCallback(async (productId, productName) => {
    if (!productId || addedProducts.has(productId)) return;
    if (!user) {
      router.push({
        pathname: '/auth/login',
        params: { returnTo: '/skin-analysis-camera' },
      });
      return;
    }
    try {
      // Fetch the mobile contract so config-backed colors and variant prices
      // are present before deciding whether a quick add is safe.
      const product = await fetchProductById(productId, user, { locale });
      if (!product) throw new Error('Product unavailable');
      if (isProductOptionSelectionRequired(product)) {
        router.push(`/product/${product.id || productId}`);
        return;
      }
      await addItem(product, 1, '', '');
      haptics.success();
      setAddedProducts((prev) => new Set([...prev, productId]));
      setTimeout(() => {
        setAddedProducts((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      }, 2000);
    } catch (err) {
      log.warn('Add to bag failed', err?.message || err);
      haptics.warning();
      Alert.alert(t('skinCamera.errorTitle'), t('common.addToBagFailed'));
    }
  }, [addItem, addedProducts, user, t, locale]);

  // Permission loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={t('skinAnalysis.title')} scrollY={null} onBack={() => router.back()} isRTL={isRTL} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </View>
    );
  }

  // Permission denied. When the OS won't show the prompt again
  // (canAskAgain === false), the only way out is the system Settings —
  // otherwise the "Grant Permission" button silently does nothing.
  if (!permission.granted) {
    const permanentlyDenied = permission.canAskAgain === false;
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={t('skinAnalysis.title')} scrollY={null} onBack={() => router.back()} isRTL={isRTL} />
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color={colors.tertiary} />
          <Text style={styles.permissionText}>
            {permanentlyDenied ? t('skinCamera.permissionDeniedHint') : t('skinAnalysis.cameraPermission')}
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={() => {
              if (permanentlyDenied) {
                Linking.openSettings().catch(() => {});
              } else {
                requestPermission();
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionBtnText}>
              {permanentlyDenied ? t('skinCamera.openSettings') : t('skinCamera.grantPermission')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show on-device results (fallback)
  if (localResult) {
    return (
      <SkinAnalysisResults
        result={localResult}
        onReset={handleReset}
        onBack={() => router.back()}
      />
    );
  }

  // Show AI Expert Analysis results
  if (aiResult) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={t('skinAnalysis.yourResults')} scrollY={scrollY} onBack={() => router.back()} isRTL={isRTL} />

        <Animated.ScrollView
          contentContainerStyle={[styles.aiContent, { paddingTop: headerHeight + 8, paddingBottom: insets.bottom + 48 }]}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* Health Score Circle */}
          <View style={styles.aiScoreCard}>
            <View style={[styles.aiScoreCircle, { borderColor: scoreColor(aiResult.healthScore) }]}>
              <Text style={[styles.aiScoreNum, { color: scoreColor(aiResult.healthScore) }]}>
                {aiResult.healthScore || '—'}
              </Text>
              <Text style={styles.aiScoreMax}>/10</Text>
            </View>
            <Text style={styles.aiScoreLabel}>{t('skinCamera.skinHealthScore')}</Text>
            <View style={styles.aiSkinTypeBadge}>
              <Text style={styles.aiSkinTypeText}>{capitalize(aiResult.skinType || 'Unknown')}</Text>
            </View>
          </View>

          {/* AI Analysis Text */}
          {aiResult.analysis && (
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="sparkles" size={18} color="#dc2626" />
                <Text style={styles.aiSectionTitle}>{t('skinCamera.aiAnalysis')}</Text>
              </View>
              <Text style={styles.aiAnalysisText}>{aiResult.analysis}</Text>
            </View>
          )}

          {/* Concerns */}
          {aiResult.concerns?.length > 0 && (
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
                <Text style={styles.aiSectionTitle}>{t('skinCamera.keyConcerns')}</Text>
              </View>
              <View style={styles.concernChips}>
                {aiResult.concerns.map((c, i) => (
                  <View key={i} style={styles.concernChip}>
                    <Ionicons name="ellipse" size={6} color="#dc2626" />
                    <Text style={styles.concernChipText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Product Recommendations */}
          {aiResult.recommendations?.length > 0 && (
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="bag-outline" size={18} color="#dc2626" />
                <Text style={styles.aiSectionTitle}>{t('skinCamera.recommendedProducts')}</Text>
              </View>
              {aiResult.recommendations.map((rec, idx) => {
                const productId = parseProductId(rec.product);
                const productName = cleanProductText(rec.product);
                const isAdded = productId ? addedProducts.has(productId) : false;
                const details = productId ? productDetails[productId] : null;

                return (
                  <View style={styles.aiRecCard} key={idx}>
                    <View style={styles.aiRecRow}>
                      {details?.image ? (
                        <View style={styles.aiRecImageWrap}>
                          <Image source={{ uri: details.image }} style={styles.aiRecImage} contentFit="contain" />
                          {details.size ? <Text style={styles.aiRecSize}>{details.size}</Text> : null}
                        </View>
                      ) : (
                        <View style={[styles.aiRecImage, styles.aiRecImagePlaceholder]}>
                          <Ionicons name="leaf-outline" size={24} color="#D1D5DB" />
                        </View>
                      )}
                      <View style={styles.aiRecBody}>
                        <Text style={styles.aiRecName} numberOfLines={2}>{productName}</Text>
                        {!user ? (
                          <Text style={styles.aiRecPriceOnRequest}>{t('product.loginToSeePrice')}</Text>
                        ) : details?.isPriceOnRequest ? (
                          <Text style={styles.aiRecPriceOnRequest}>{t('skinCamera.priceOnRequest')}</Text>
                        ) : details?.price ? (
                          <Text style={styles.aiRecPrice}>AED {Number(details.price).toFixed(0)}</Text>
                        ) : null}
                        <Text style={styles.aiRecReason} numberOfLines={3}>{rec.reason}</Text>
                        {productId && (
                          <View style={styles.aiRecActions}>
                            <TouchableOpacity
                              style={[styles.aiRecAddBtn, isAdded && styles.aiRecAddBtnAdded]}
                              onPress={() => handleAddToBag(productId, productName)}
                              disabled={isAdded}
                              activeOpacity={0.8}
                            >
                              <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={14} color="#fff" />
                              <Text style={styles.aiRecAddText}>
                                {isAdded ? t('skinCamera.added') : !user ? t('shop.loginToBuy') : t('skinCamera.addToBag')}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.aiRecViewBtn}
                              onPress={() => router.push({ pathname: '/product/[id]', params: { id: productId } })}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.aiRecViewText}>{t('skinCamera.view')}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Skincare Routine */}
          {(aiResult.routine?.am?.length > 0 || aiResult.routine?.pm?.length > 0) && (
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="sunny-outline" size={18} color="#dc2626" />
                <Text style={styles.aiSectionTitle}>{t('skinCamera.yourSkincareRoutine')}</Text>
              </View>

              {aiResult.routine?.am?.length > 0 && (
                <View style={styles.routineBlock}>
                  <View style={styles.routineLabelRow}>
                    <Ionicons name="sunny" size={14} color="#F59E0B" />
                    <Text style={styles.routineLabel}>{t('skinCamera.morningAM')}</Text>
                  </View>
                  {aiResult.routine.am.map((step, i) => (
                    <View key={i} style={styles.routineStep}>
                      <Text style={styles.routineStepNum}>{i + 1}</Text>
                      <Text style={styles.routineStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiResult.routine?.pm?.length > 0 && (
                <View style={styles.routineBlock}>
                  <View style={styles.routineLabelRow}>
                    <Ionicons name="moon" size={14} color="#6366F1" />
                    <Text style={styles.routineLabel}>{t('skinCamera.eveningPM')}</Text>
                  </View>
                  {aiResult.routine.pm.map((step, i) => (
                    <View key={i} style={styles.routineStep}>
                      <Text style={styles.routineStepNum}>{i + 1}</Text>
                      <Text style={styles.routineStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Tips */}
          {aiResult.tips?.length > 0 && (
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="bulb-outline" size={18} color="#dc2626" />
                <Text style={styles.aiSectionTitle}>{t('skinCamera.personalizedTips')}</Text>
              </View>
              {aiResult.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Actions */}
          <View style={styles.aiActionsRow}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleReset} activeOpacity={0.85}>
              <Ionicons name="camera-outline" size={18} color="#dc2626" />
              <Text style={styles.retakeBtnText}>{t('skinCamera.retakePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quizBtn}
              onPress={() => { handleReset(); router.replace('/skin-analysis'); }}
              activeOpacity={0.85}
            >
              <Ionicons name="clipboard-outline" size={18} color="#374151" />
              <Text style={styles.quizBtnText}>{t('skinCamera.takeQuizInstead')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </View>
    );
  }

  // Camera view (main)
  return (
    <SafeAreaView style={styles.cameraContainer} edges={['top']}>
      <View style={[styles.header, styles.headerOverCamera, { top: cameraHeaderTop }, isRTL && styles.headerRTL]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{t('skinAnalysis.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.cameraFlex}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          {/* Face guide overlay */}
          <View style={styles.overlay}>
            <View style={styles.faceGuide}>
              <View style={styles.faceOval} />
            </View>
            <Text style={styles.guideText}>
              {aiAnalyzing ? t('skinCamera.analyzingWithAI') : analyzing ? t('skinAnalysis.analyzing') : t('skinCamera.positionFace')}
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Capture button */}
      <View style={styles.captureArea}>
        {(analyzing || aiAnalyzing) ? (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.analyzingText}>
              {aiAnalyzing ? t('skinCamera.aiExpertAnalyzing') : t('skinCamera.analyzing')}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              disabled={capturing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('profile.takePhoto')}
              accessibilityState={{ disabled: capturing }}
            >
              <View style={styles.captureInner}>
                <Ionicons name="camera" size={32} color="#dc2626" />
              </View>
            </TouchableOpacity>
            <Text style={styles.captureLabel}>
              {t('skinCamera.aiExpertAnalysis')}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helpers
function scoreColor(score) {
  if (!score) return '#9CA3AF';
  if (score >= 7) return '#16A34A';
  if (score >= 5) return '#F59E0B';
  return '#dc2626';
}
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  headerOverCamera: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...T.navTitle, fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center' },

  permissionText: { ...T.bodySmall, color: '#6B7280', lineHeight: undefined, textAlign: 'center', marginTop: 8 },
  permissionBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  permissionBtnText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700' },

  cameraFlex: { flex: 1 },
  camera: { flex: 1 },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuide: {
    width: 250,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOval: {
    width: 220,
    height: 300,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
  },
  guideText: {
    ...T.label,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  captureArea: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#dc2626',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureLabel: {
    ...T.labelSmall,
    color: '#ffffff',
    marginTop: 8,
  },
  analyzingBox: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  analyzingText: {
    ...T.label,
    color: '#ffffff',
  },

  // AI Results
  aiContent: { padding: 16, paddingBottom: 48 },

  aiScoreCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  aiScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  aiScoreNum: { fontSize: 32, fontWeight: '900' },
  aiScoreMax: { ...T.labelSmall, color: '#9CA3AF', marginTop: -4 },
  aiScoreLabel: { ...T.label, fontWeight: '700', color: '#374151', marginBottom: 8 },
  aiSkinTypeBadge: {
    backgroundColor: tint(colors.brand, '14'),
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiSkinTypeText: { ...T.labelSmall, fontWeight: '700', color: colors.brand },

  aiSection: {
    ...surfaces.card,
    ...shadow.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiSectionTitle: { ...T.price, fontWeight: '800', color: '#1F2937' },
  aiAnalysisText: { ...T.label, fontWeight: '400', color: '#374151', lineHeight: 22 },

  // Concerns
  concernChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tint(colors.brand, '14'),
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  concernChipText: { ...T.labelSmall, color: colors.brand },

  // AI Recommendations
  aiRecCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  aiRecRow: {
    flexDirection: 'row',
    gap: 12,
  },
  aiRecImageWrap: {
    alignItems: 'center',
  },
  aiRecImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  aiRecImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  aiRecSize: {
    ...T.badge,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 3,
  },
  aiRecBody: { flex: 1 },
  aiRecName: { ...T.label, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  aiRecPrice: { ...T.label, fontWeight: '800', color: '#dc2626', marginBottom: 4 },
  aiRecPriceOnRequest: { ...T.captionSmall, fontWeight: '700', color: '#25D366', marginBottom: 4 },
  aiRecReason: { ...T.captionSmall, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  aiRecActions: { flexDirection: 'row', gap: 8 },
  aiRecAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  aiRecAddBtnAdded: { backgroundColor: '#16A34A' },
  aiRecAddText: { ...T.captionSmall, fontWeight: '700', color: '#fff' },
  aiRecViewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  aiRecViewText: { ...T.captionSmall, fontWeight: '600', color: '#374151' },

  // Routine
  routineBlock: { marginBottom: 14 },
  routineLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  routineLabel: { ...T.label, fontWeight: '700', color: '#374151' },
  routineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 4,
  },
  routineStepNum: {
    ...T.captionSmall,
    fontWeight: '700',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  routineStepText: { ...T.caption, color: '#374151', lineHeight: 20, flex: 1 },

  // Tips
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  tipText: { ...T.caption, color: '#374151', lineHeight: 20, flex: 1 },

  // Bottom actions
  aiActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  retakeBtnText: { ...T.buttonSmall, fontWeight: '700', color: '#dc2626' },
  quizBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  quizBtnText: { ...T.buttonSmall, fontWeight: '700', color: '#374151' },
});

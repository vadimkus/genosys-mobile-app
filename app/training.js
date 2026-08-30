/**
 * Training Screen - Native (API-driven)
 * Fetches training documents, product documentation, and video lessons
 * from the website's /api/mobile/training endpoint.
 * Authenticated - only visible to logged-in users.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import AppFooter from '../components/AppFooter';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces, tint } from '../utils/theme';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchTraining as fetchTrainingAPI } from '../services/api';
import { createLogger } from '../utils/logger';
import SectionHeader from '../components/SectionHeader';
import PageHero from '../components/PageHero';

const log = createLogger('Training');

export default function TrainingScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [trainingDocs, setTrainingDocs] = useState([]);
  const [productDocs, setProductDocs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // Subtle entrance motion (matches order/about screens) - runs once content is ready.
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    if (user && !loading && !error) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [user, loading, error, fade, lift]);

  const fetchTraining = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchTrainingAPI({ locale: locale || 'en' });

      setTrainingDocs(data.trainingDocuments || []);
      setProductDocs(data.productDocuments || []);
      setVideos(data.videos || []);
      setStats(data.stats || null);
    } catch (err) {
      log.warn('Failed to fetch training:', err.message);
      setError(l(
        'Failed to load training materials',
        'فشل تحميل مواد التدريب',
        'Не удалось загрузить учебные материалы'
      ));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    if (user) fetchTraining();
  }, [user, fetchTraining]);

  const openDocument = async (url) => {
    try {
      haptics.lightTap();
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        l('Error', 'خطأ', 'Ошибка'),
        l('Could not open the document. Please try again.', 'تعذر فتح المستند. يرجى المحاولة مرة أخرى.', 'Не удалось открыть документ. Попробуйте снова.')
      );
    }
  };

  const openVideo = async (youtubeId) => {
    try {
      haptics.mediumTap();
      // Try YouTube app first, fall back to browser
      const ytAppUrl = `youtube://watch?v=${youtubeId}`;
      const canOpen = await Linking.canOpenURL(ytAppUrl);
      if (canOpen) {
        await Linking.openURL(ytAppUrl);
      } else {
        await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
      }
    } catch {
      Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`).catch(() => {});
    }
  };

  // Icon mapping for training documents
  const getDocIcon = (iconName) => {
    const map = {
      'book': 'book',
      'home': 'home',
      'medical': 'medical',
      'sparkles': 'sparkles',
      'medkit': 'medkit',
      'diamond': 'diamond',
      'flask': 'flask',
    };
    return map[iconName] || 'document-text';
  };

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'); };

  /** iOS Settings - style filled glyph tile + bold section title. */
  // Redirect if not logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader translateY={headerTranslateY} title={t('navigation.training')} onBack={onBack} isRTL={isRTL} />
        <View style={[styles.emptyState, { paddingTop: headerHeight }]}>
          <Ionicons name="lock-closed" size={48} color={colors.tertiary} />
          <Text style={styles.emptyTitle}>{l('Login Required', 'يجب تسجيل الدخول', 'Требуется авторизация')}</Text>
          <Text style={styles.emptyDesc}>{l('Please log in to access training materials', 'يرجى تسجيل الدخول للوصول إلى مواد التدريب', 'Войдите для доступа к учебным материалам')}</Text>
          <TouchableOpacity style={[styles.loginBtn, shadow.cta(colors.cta)]} onPress={() => router.push('/auth/login')} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>{l('Log In', 'تسجيل الدخول', 'Войти')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY}
        title={t('navigation.training')}
        scrollY={(!loading && !error) ? scrollY : null}
        onBack={onBack}
        onRefresh={() => fetchTraining(true)}
        isRTL={isRTL}
      />

      {/* Loading */}
      {loading && (
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>{l('Loading training materials...', 'جاري تحميل مواد التدريب...', 'Загрузка учебных материалов...')}</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={[styles.emptyState, { paddingTop: headerHeight }]}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, shadow.cta(colors.cta)]} onPress={() => fetchTraining()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>{l('Try Again', 'حاول مجدداً', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTraining(true)} tintColor={colors.accent} progressViewOffset={headerHeight} />
          }
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
            {/* Hero */}
            <PageHero
              isRTL={isRTL}
              title={l('Training Materials', 'مواد التدريب', 'Учебные материалы')}
              subtitle={l('Professional resources for GENOSYS partners', 'موارد مهنية لشركاء GENOSYS', 'Профессиональные ресурсы для партнёров GENOSYS')}
            >
              {/* Counts of what is actually in here: information, not ornament. */}
              {stats && (
                <View style={[styles.statsRow, isRTL && styles.rowRTL]}>
                  <View style={styles.statBadge}>
                    <Ionicons name="document-text" size={14} color={colors.ok} />
                    <Text style={styles.statText}>{stats.totalDocuments} {l('Guides', 'أدلة', 'Пособий')}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="flask" size={14} color={colors.accent} />
                    <Text style={styles.statText}>{stats.totalProductDocs} {l('Products', 'منتجات', 'Продуктов')}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="play-circle" size={14} color={colors.purple} />
                    <Text style={styles.statText}>{stats.totalVideos} {l('Videos', 'فيديو', 'Видео')}</Text>
                  </View>
                </View>
              )}
            </PageHero>

            {/* Training Documents */}
            {trainingDocs.length > 0 && (
              <View style={styles.section}>
                <SectionHeader icon="document-text" title={l('Training Documents', 'وثائق التدريب', 'Учебные документы')} isRTL={isRTL} />
                <View style={[styles.card, shadow.card]}>
                  {trainingDocs.map((doc, idx) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={[styles.docRow, isRTL && styles.rowRTL, idx > 0 && styles.docRowDivider]}
                      onPress={() => openDocument(doc.downloadUrl)}
                      activeOpacity={0.6}
                    >
                      <View style={[styles.docTile, { backgroundColor: tint(colors.ok) }]}>
                        <Ionicons name={getDocIcon(doc.icon)} size={20} color={colors.ok} />
                      </View>
                      <View style={styles.docTextWrap}>
                        <Text style={[styles.docTitle, isRTL && styles.textRTL]} numberOfLines={2}>{doc.title}</Text>
                        <Text style={[styles.docSize, isRTL && styles.textRTL]}>{doc.fileSize}</Text>
                      </View>
                      <View style={[styles.pdfBadge, { backgroundColor: tint(colors.ok) }]}>
                        <Ionicons name="download-outline" size={15} color={colors.ok} />
                        <Text style={[styles.pdfBadgeText, { color: colors.ok }]}>PDF</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Product Documentation */}
            {productDocs.length > 0 && (
              <View style={styles.section}>
                <SectionHeader icon="flask" title={l('Product Documentation', 'وثائق المنتجات', 'Документация по продуктам')} isRTL={isRTL} />
                <View style={[styles.card, shadow.card]}>
                  {productDocs.map((doc, idx) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={[styles.docRow, isRTL && styles.rowRTL, idx > 0 && styles.docRowDivider]}
                      onPress={() => openDocument(doc.downloadUrl)}
                      activeOpacity={0.6}
                    >
                      <View style={styles.productImageWrap}>
                        <Image
                          source={{ uri: doc.image }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.docTextWrap}>
                        <Text style={[styles.docTitle, isRTL && styles.textRTL]} numberOfLines={2}>{doc.title}</Text>
                        <Text style={[styles.docSize, isRTL && styles.textRTL]}>{doc.fileSize}</Text>
                      </View>
                      <View style={[styles.pdfBadge, { backgroundColor: colors.accentBg }]}>
                        <Ionicons name="download-outline" size={15} color={colors.accent} />
                        <Text style={[styles.pdfBadgeText, { color: colors.accent }]}>PDF</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Training Videos */}
            {videos.length > 0 && (
              <View style={styles.section}>
                <SectionHeader icon="play-circle" title={l('Video Lessons', 'دروس فيديو', 'Видеоуроки')} isRTL={isRTL} />
                <View style={styles.videoGrid}>
                  {videos.map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      style={[styles.videoCard, shadow.card]}
                      onPress={() => openVideo(video.youtubeId)}
                      activeOpacity={0.85}
                    >
                      {/* YouTube Thumbnail */}
                      <View style={styles.videoThumb}>
                        <Image
                          source={{ uri: video.thumbnail }}
                          style={styles.videoThumbImage}
                          resizeMode="cover"
                        />
                        <View style={styles.playOverlay}>
                          <Ionicons name="play" size={24} color={colors.white} />
                        </View>
                        {/* Duration badge */}
                        <View style={styles.durationBadge}>
                          <Text style={styles.durationText}>{video.duration}</Text>
                        </View>
                      </View>
                      <View style={styles.videoInfo}>
                        <Text style={[styles.videoTitle, isRTL && styles.textRTL]} numberOfLines={2}>{video.title}</Text>
                        <View style={[styles.videoMeta, isRTL && styles.videoMetaRTL]}>
                          <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{video.level}</Text>
                          </View>
                          <Text style={styles.videoCategory}>{video.category}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Footer - shared brand block */}
            <AppFooter
              tagline={l('Professional Training Resources', 'موارد التدريب المهني', 'Профессиональные учебные ресурсы')}
              style={{ paddingBottom: 16 }}
            />
          </Animated.View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...T.bodySmall, marginTop: 12, color: colors.secondaryLabel },

  // Hero
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    ...shadow.card,
  },
  statText: { ...T.captionSmall, fontWeight: '600', color: colors.label },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },

  // Grouped card (training + product doc rows)
  card: { ...surfaces.card, paddingHorizontal: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  docRowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  docTile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  docTextWrap: { flex: 1, minWidth: 0 },
  docTitle: { ...T.label, color: colors.label, marginBottom: 2 },
  docSize: { ...T.captionTiny, color: colors.secondaryLabel },
  pdfBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  pdfBadgeText: { ...T.captionTiny, fontWeight: '700' },

  // Product image thumbnail
  productImageWrap: {
    width: 44, height: 44, borderRadius: 11, overflow: 'hidden',
    backgroundColor: colors.subtleBg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator,
  },
  productImage: { width: '100%', height: '100%' },

  // Video Grid
  videoGrid: { gap: 12 },
  videoCard: { ...surfaces.card, overflow: 'hidden' },
  videoThumb: {
    height: 180, backgroundColor: colors.label,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  videoThumbImage: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  durationText: { ...T.captionTiny, color: colors.white, fontWeight: '600' },
  videoInfo: { padding: 14 },
  videoTitle: { ...T.label, fontSize: 15, fontWeight: '700', color: colors.label, marginBottom: 8 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  videoMetaRTL: { flexDirection: 'row-reverse' },
  levelBadge: { backgroundColor: tint(colors.purple), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { ...T.captionTiny, fontWeight: '700', color: colors.purple },
  videoCategory: { ...T.captionSmall, color: colors.secondaryLabel },

  // Empty State / Error
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { ...T.sectionTitleSmall, color: colors.label, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyDesc: { ...T.subtitle, color: colors.secondaryLabel, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  loginBtn: { backgroundColor: colors.cta, paddingHorizontal: 32, paddingVertical: 15, borderRadius: 14 },
  loginBtnText: { ...T.button, fontWeight: '700' },
  retryBtn: { backgroundColor: colors.cta, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, marginTop: 8 },
  retryBtnText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700' },

  // RTL
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

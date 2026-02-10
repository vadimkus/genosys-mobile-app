/**
 * Training Screen - Native (API-driven)
 * Fetches training documents, product documentation, and video lessons
 * from the website's /api/mobile/training endpoint.
 * Authenticated — only visible to logged-in users.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import AUTH_CONFIG from '../config/auth';

export default function TrainingScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const isRTL = dir === 'rtl';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [trainingDocs, setTrainingDocs] = useState([]);
  const [productDocs, setProductDocs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const fetchTraining = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const res = await fetch(`${baseUrl}/api/mobile/training`, {
        headers: {
          'x-api-key': AUTH_CONFIG.API_KEY,
          'x-locale': locale || 'en',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setTrainingDocs(data.trainingDocuments || []);
      setProductDocs(data.productDocuments || []);
      setVideos(data.videos || []);
      setStats(data.stats || null);
    } catch (err) {
      console.warn('Failed to fetch training:', err.message);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Try YouTube app first, fall back to browser
      const ytAppUrl = `youtube://watch?v=${youtubeId}`;
      const canOpen = await Linking.canOpenURL(ytAppUrl);
      if (canOpen) {
        await Linking.openURL(ytAppUrl);
      } else {
        await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
      }
    } catch {
      await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
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

  // Redirect if not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('navigation.training') || 'Training'}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{l('Login Required', 'يجب تسجيل الدخول', 'Требуется авторизация')}</Text>
          <Text style={styles.emptyDesc}>{l('Please log in to access training materials', 'يرجى تسجيل الدخول للوصول إلى مواد التدريب', 'Войдите для доступа к учебным материалам')}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text style={styles.loginBtnText}>{l('Log In', 'تسجيل الدخول', 'Войти')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.training') || 'Training'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>{l('Loading training materials...', 'جاري تحميل مواد التدريب...', 'Загрузка учебных материалов...')}</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTraining()} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Try Again', 'حاول مجدداً', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTraining(true)} tintColor="#16a34a" />
          }
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <Ionicons name="school" size={48} color="#16a34a" />
            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
              {l('Training Materials', 'مواد التدريب', 'Учебные материалы')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
              {l('Professional resources for GENOSYS partners', 'موارد مهنية لشركاء GENOSYS', 'Профессиональные ресурсы для партнёров GENOSYS')}
            </Text>
            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="document-text" size={14} color="#16a34a" />
                  <Text style={styles.statText}>{stats.totalDocuments} {l('Guides', 'أدلة', 'Пособий')}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Ionicons name="flask" size={14} color="#dc2626" />
                  <Text style={styles.statText}>{stats.totalProductDocs} {l('Products', 'منتجات', 'Продуктов')}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Ionicons name="play-circle" size={14} color="#7c3aed" />
                  <Text style={styles.statText}>{stats.totalVideos} {l('Videos', 'فيديو', 'Видео')}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Training Documents */}
          {trainingDocs.length > 0 && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="document-text" size={20} color="#16a34a" />
                </View>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {l('Training Documents', 'وثائق التدريب', 'Учебные документы')}
                </Text>
              </View>
              {trainingDocs.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.docCard, isRTL && styles.docCardRTL]}
                  onPress={() => openDocument(doc.downloadUrl)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.docIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name={getDocIcon(doc.icon)} size={20} color="#16a34a" />
                  </View>
                  <View style={[styles.docTextWrap, isRTL && styles.docTextWrapRTL]}>
                    <Text style={[styles.docTitle, isRTL && styles.textRTL]} numberOfLines={2}>{doc.title}</Text>
                    <Text style={[styles.docSize, isRTL && styles.textRTL]}>{doc.fileSize}</Text>
                  </View>
                  <View style={styles.downloadBadge}>
                    <Ionicons name="download-outline" size={16} color="#16a34a" />
                    <Text style={styles.downloadText}>PDF</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Product Documentation */}
          {productDocs.length > 0 && (
            <View style={[styles.section, styles.sectionAlt]}>
              <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="flask" size={20} color="#dc2626" />
                </View>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {l('Product Documentation', 'وثائق المنتجات', 'Документация по продуктам')}
                </Text>
              </View>
              {productDocs.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.productDocCard, isRTL && styles.productDocCardRTL]}
                  onPress={() => openDocument(doc.downloadUrl)}
                  activeOpacity={0.7}
                >
                  {/* Product Image */}
                  <View style={styles.productImageWrap}>
                    <Image
                      source={{ uri: doc.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={[styles.docTextWrap, isRTL && styles.docTextWrapRTL]}>
                    <Text style={[styles.productDocTitle, isRTL && styles.textRTL]} numberOfLines={2}>{doc.title}</Text>
                    <Text style={[styles.docSize, isRTL && styles.textRTL]}>{doc.fileSize}</Text>
                  </View>
                  <View style={[styles.downloadBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="download-outline" size={16} color="#dc2626" />
                    <Text style={[styles.downloadText, { color: '#dc2626' }]}>PDF</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Training Videos */}
          {videos.length > 0 && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="play-circle" size={20} color="#7c3aed" />
                </View>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {l('Video Lessons', 'دروس فيديو', 'Видеоуроки')}
                </Text>
              </View>
              <View style={styles.videoGrid}>
                {videos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() => openVideo(video.youtubeId)}
                    activeOpacity={0.7}
                  >
                    {/* YouTube Thumbnail */}
                    <View style={styles.videoThumb}>
                      <Image
                        source={{ uri: video.thumbnail }}
                        style={styles.videoThumbImage}
                        resizeMode="cover"
                      />
                      <View style={styles.playOverlay}>
                        <Ionicons name="play" size={24} color="#ffffff" />
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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isRTL && styles.textRTL]}>
              {l('GENOSYS Middle East FZ-LLC', 'جينوسيس الشرق الأوسط FZ-LLC', 'GENOSYS Middle East FZ-LLC')}
            </Text>
            <Text style={[styles.footerSub, isRTL && styles.textRTL]}>
              {l('Professional Training Resources', 'موارد التدريب المهني', 'Профессиональные учебные ресурсы')}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.genosys.ae')} activeOpacity={0.7} style={{ marginTop: 8 }}>
              <Text style={styles.footerLink}>www.genosys.ae</Text>
            </TouchableOpacity>
            <Text style={styles.footerCopyright}>© {new Date().getFullYear()} GENOSYS. All rights reserved.</Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6B7280' },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center', marginTop: 12, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  statText: { fontSize: 12, fontWeight: '600', color: '#374151' },

  // Sections
  section: { paddingHorizontal: 16, paddingVertical: 20 },
  sectionAlt: { backgroundColor: '#FAFAFA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  sectionIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', letterSpacing: -0.3 },

  // Training Document Cards
  docCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  docCardRTL: { flexDirection: 'row-reverse' },
  docIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docTextWrap: { flex: 1, marginLeft: 12 },
  docTextWrapRTL: { marginLeft: 0, marginRight: 12 },
  docTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 2 },
  docSize: { fontSize: 11, color: '#9CA3AF' },
  downloadBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  downloadText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },

  // Product Document Cards
  productDocCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 10, marginBottom: 8,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  productDocCardRTL: { flexDirection: 'row-reverse' },
  productImageWrap: {
    width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6',
  },
  productImage: { width: '100%', height: '100%' },
  productDocTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },

  // Video Grid
  videoGrid: { gap: 12 },
  videoCard: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  videoThumb: {
    height: 180, backgroundColor: '#1F2937',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  videoThumbImage: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  durationText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  videoInfo: { padding: 14 },
  videoTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  videoMetaRTL: { flexDirection: 'row-reverse' },
  levelBadge: { backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },
  videoCategory: { fontSize: 12, color: '#9CA3AF' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 12 },
  footerText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  footerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  footerLink: { fontSize: 14, color: '#dc2626', fontWeight: '600', textDecorationLine: 'underline' },
  footerCopyright: { fontSize: 11, color: '#D1D5DB', marginTop: 8 },

  // Empty State / Error
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  loginBtn: { backgroundColor: '#dc2626', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  retryBtn: { backgroundColor: '#16a34a', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

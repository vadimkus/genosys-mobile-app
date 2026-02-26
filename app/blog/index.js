/**
 * Blog Screen - Native (replaces WebView)
 * Fetches and displays blog posts from the mobile API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';

const log = createLogger('Blog');

export default function BlogScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const res = await fetch(`${baseUrl}/api/mobile/blog?limit=20`, {
        headers: {
          'x-api-key': AUTH_CONFIG.API_KEY,
          'x-locale': locale,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      log.error('Blog fetch error', err?.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const openPost = (slug) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => { haptics.lightTap(); router.back(); }} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.blog') || 'Blog'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline" size={48} color="#D1D5DB" />
          <Text style={styles.errorTitle}>{l('Failed to load', 'فشل التحميل', 'Ошибка загрузки')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { haptics.lightTap(); fetchPosts(); }} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} tintColor="#dc2626" />
          }
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
              {l('GENOSYS Blog', 'مدونة جينوسيس', 'Блог GENOSYS')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
              {l('Skincare tips, product news, and beauty insights',
                 'نصائح للعناية بالبشرة وأخبار المنتجات ورؤى الجمال',
                 'Советы по уходу за кожей, новости продуктов')}
            </Text>
          </View>

          {/* Posts */}
          <View style={styles.postsSection}>
            {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>{l('No posts yet', 'لا توجد مقالات بعد', 'Пока нет статей')}</Text>
              </View>
            ) : (
              posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => { haptics.lightTap(); openPost(post.slug); }}
                  activeOpacity={0.7}
                >
                  {post.featuredImage ? (
                    <Image
                      source={{ uri: post.featuredImage.startsWith('http') ? post.featuredImage : `https://genosys.ae${post.featuredImage}` }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.postImage, styles.postImagePlaceholder]}>
                      <Ionicons name="newspaper" size={32} color="#D1D5DB" />
                    </View>
                  )}
                  <View style={styles.postContent}>
                    <Text style={[styles.postTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                      {post.title}
                    </Text>
                    {post.excerpt ? (
                      <Text style={[styles.postExcerpt, isRTL && styles.textRTL]} numberOfLines={2}>
                        {post.excerpt}
                      </Text>
                    ) : null}
                    <View style={[styles.postMeta, isRTL && styles.postMetaRTL]}>
                      <Text style={styles.postDate}>{formatDate(post.publishedAt)}</Text>
                      {post.views > 0 && (
                        <View style={[styles.viewsRow, isRTL && styles.viewsRowRTL]}>
                          <Ionicons name="eye-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.viewsText}>{post.views}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
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

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: '#FAFAFA' },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 6, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  // Posts
  postsSection: { paddingHorizontal: 20, paddingVertical: 16 },
  postCard: { backgroundColor: '#F9FAFB', borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  postImage: { width: '100%', height: 180, backgroundColor: '#F3F4F6' },
  postImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  postContent: { padding: 14 },
  postTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 22 },
  postExcerpt: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  postMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postMetaRTL: { flexDirection: 'row-reverse' },
  postDate: { fontSize: 12, color: '#9CA3AF' },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsRowRTL: { flexDirection: 'row-reverse' },
  viewsText: { fontSize: 12, color: '#9CA3AF' },

  // States
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  retryBtn: { backgroundColor: '#1F2937', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

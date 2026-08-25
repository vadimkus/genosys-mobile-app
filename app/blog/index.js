/**
 * Blog Screen - Native (replaces WebView)
 * Fetches and displays blog posts from the mobile API.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import LocaleSwitchButton from '../../components/LocaleSwitchButton';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';
import { getJson } from '../../services/httpClient';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces, tint } from '../../utils/theme';

const log = createLogger('Blog');

export default function BlogScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { scrollY, onScroll, headerHeight, insets } = useCollapsibleHeader();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // Subtle entrance motion (matches order / promo screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await getJson(`${baseUrl}/api/mobile/blog?limit=20`, {
        headers: {
          locale,
        },
      });
      setPosts(data.posts || []);
    } catch (err) {
      log.error('Blog fetch error', err?.message);
      setError(l('Failed to load', 'فشل التحميل', 'Ошибка загрузки'));
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

  const onBack = () => { haptics.lightTap(); router.back(); };

  const resolveImage = (raw) => {
    const s = String(raw || '');
    if (!s) return '';
    return s.startsWith('http') ? s : `https://genosys.ae${s}`;
  };

  const canScroll = !loading && !error;

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('navigation.blog') || 'Blog'}
        scrollY={canScroll ? scrollY : null}
        onBack={onBack}
        // Pull-to-refresh already covers reloading, so the slot goes to the
        // language control: titles and excerpts here are localized server-side.
        right={<LocaleSwitchButton />}
        isRTL={isRTL}
      />

      {loading && !refreshing ? (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <Ionicons name="cloud-offline" size={48} color={colors.tertiary} />
          <Text style={styles.errorTitle}>{l('Failed to load', 'فشل التحميل', 'Ошибка загрузки')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { haptics.lightTap(); fetchPosts(); }} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
          <Animated.ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 32 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} tintColor={colors.accent} progressViewOffset={headerHeight} />
            }
          >
            {/* Hero — large title */}
            <View style={styles.hero}>
              <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
                {l('GENOSYS Blog', 'مدونة جينوسيس', 'Блог GENOSYS')}
              </Text>
              <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
                {l('Skincare tips, product news, and beauty insights',
                   'نصائح للعناية بالبشرة وأخبار المنتجات ورؤى الجمال',
                   'Советы по уходу за кожей, новости продуктов')}
              </Text>
            </View>

            {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.tertiary} />
                <Text style={styles.emptyText}>{l('No posts yet', 'لا توجد مقالات بعد', 'Пока нет статей')}</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {posts.map((post) => {
                  const img = resolveImage(post.featuredImage);
                  return (
                    <TouchableOpacity
                      key={post.id}
                      style={[styles.card, shadow.card]}
                      onPress={() => { haptics.lightTap(); openPost(post.slug); }}
                      activeOpacity={0.85}
                    >
                      {img ? (
                        <Image
                          source={{ uri: img }}
                          style={styles.cover}
                          contentFit="cover"
                          transition={200}
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View style={[styles.cover, styles.coverPlaceholder]}>
                          <Ionicons name="newspaper" size={32} color={colors.tertiary} />
                        </View>
                      )}
                      <View style={styles.cardBody}>
                        {post.category ? (
                          <View style={[styles.categoryPill, isRTL && styles.categoryPillRTL]}>
                            <Text style={styles.categoryText} numberOfLines={1}>{String(post.category)}</Text>
                          </View>
                        ) : null}
                        <Text style={[styles.postTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                          {post.title}
                        </Text>
                        {post.excerpt ? (
                          <Text style={[styles.postExcerpt, isRTL && styles.textRTL]} numberOfLines={2}>
                            {post.excerpt}
                          </Text>
                        ) : null}
                        <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
                          <Text style={[styles.postDate, isRTL && styles.textRTL]}>{formatDate(post.publishedAt)}</Text>
                          {post.views > 0 ? (
                            <View style={[styles.viewsRow, isRTL && styles.rowRTL]}>
                              <Ionicons name="eye-outline" size={13} color={colors.secondaryLabel} />
                              <Text style={styles.viewsText}>{post.views}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // States
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  errorTitle: { ...T.label, fontSize: 16, fontWeight: '400', color: colors.secondaryLabel, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.label, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { ...T.buttonSmall },
  emptyState: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyText: { ...T.body, color: colors.secondaryLabel },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  heroTitle: { ...T.pageTitleLarge, marginBottom: 4 },
  heroSubtitle: { ...T.subtitle, color: colors.secondaryLabel, lineHeight: 20 },

  // Feed
  list: { paddingHorizontal: 16, paddingTop: 10, gap: 16 },
  card: { ...surfaces.card, padding: 12 },
  cover: { width: '100%', height: 188, borderRadius: 12, backgroundColor: colors.subtleBg },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { paddingTop: 12, paddingHorizontal: 2 },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentBg,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 8,
  },
  categoryPillRTL: { alignSelf: 'flex-end' },
  categoryText: { ...T.captionTiny, fontWeight: '700', color: colors.accent },

  postTitle: { ...T.sectionTitleSmall, color: colors.label, lineHeight: 23 },
  postExcerpt: { ...T.caption, color: colors.secondaryLabel, lineHeight: 20, marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  postDate: { ...T.captionSmall, color: colors.secondaryLabel },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { ...T.captionSmall, color: colors.secondaryLabel },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

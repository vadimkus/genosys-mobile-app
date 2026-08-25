/**
 * Blog Post Detail Screen - Native
 * Fetches and renders full blog post content with comments.
 * Uses react-native-render-html for article body.
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import LocaleSwitchButton from '../../components/LocaleSwitchButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Lazy-safe import: react-native-render-html may crash on some RN versions
let RenderHtml = null;
try {
  RenderHtml = require('react-native-render-html').default;
} catch {
  // Will fall back to plain text rendering
}
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import AUTH_CONFIG from '../../config/auth';
import { getJson, sendJson } from '../../services/httpClient';
import { createLogger } from '../../utils/logger';
import { colors, shadow, surfaces } from '../../utils/theme';

const log = createLogger('BlogPost');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH - 40; // 20px padding each side

export default function BlogPostScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const token = user?.token;
  const isRTL = dir === 'rtl';
  const scrollRef = useRef(null);
  const { scrollY, onScroll, headerHeight, insets } = useCollapsibleHeader();

  const l = (en, ar, ru) => (locale === 'ar' ? ar : locale === 'ru' ? ru : en);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Subtle entrance motion (matches order / promo screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    if (!loading && post) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, post, fade, lift]);

  const fetchPost = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
        const data = await getJson(`${baseUrl}/api/mobile/blog/${slug}`, {
          headers: {
            locale: locale || 'en',
          },
        });

        // Fix relative URLs in HTML content so images/links resolve correctly
        const origin = AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae';
        if (data.post?.content) {
          data.post.content = data.post.content
            // src="/..." → src="https://genosys.ae/..."
            .replace(/src="\/(?!\/)/g, `src="${origin}/`)
            .replace(/src='\/(?!\/)/g, `src='${origin}/`)
            // href="/..." → href="https://genosys.ae/..."
            .replace(/href="\/(?!\/)/g, `href="${origin}/`)
            .replace(/href='\/(?!\/)/g, `href='${origin}/`);
        }
        if (data.post?.featuredImage && !data.post.featuredImage.startsWith('http')) {
          data.post.featuredImage = `${origin}${data.post.featuredImage}`;
        }

        setPost(data.post);
        setComments(data.comments || []);
      } catch (err) {
        log.warn('Blog post fetch error:', err.message);
        setError(l('Failed to load article', 'فشل تحميل المقال', 'Не удалось загрузить статью'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug, locale]
  );

  useEffect(() => {
    if (slug) fetchPost();
  }, [fetchPost, slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return l('Just now', 'الآن', 'Только что');
    if (diffMins < 60) return `${diffMins}${l('m ago', 'د', 'м назад')}`;
    if (diffHours < 24) return `${diffHours}${l('h ago', 'س', 'ч назад')}`;
    if (diffDays < 7) return `${diffDays}${l('d ago', 'ي', 'д назад')}`;
    return formatDate(dateStr);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!user || !token) {
      Alert.alert(
        l('Login Required', 'تسجيل الدخول مطلوب', 'Требуется вход'),
        l('Please log in to leave a comment.', 'يرجى تسجيل الدخول لترك تعليق.', 'Войдите, чтобы оставить комментарий.'),
        [
          { text: l('Cancel', 'إلغاء', 'Отмена'), style: 'cancel' },
          { text: l('Login', 'دخول', 'Войти'), onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }

    try {
      setSubmitting(true);
      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await sendJson(`${baseUrl}/api/mobile/blog/comments`, {
        postId: post.id,
        content: commentText.trim(),
      }, {
        authenticated: true,
        token,
        headers: { token },
        safeMessage: l('Failed to post comment', 'فشل إرسال التعليق', 'Не удалось отправить комментарий'),
      });
      if (!data?.success) throw new Error('comment-submit-failed');

      haptics.success();
      // Prepend new comment to list
      setComments((prev) => [data.comment, ...prev]);
      setCommentText('');
    } catch (err) {
      Alert.alert(
        l('Error', 'خطأ', 'Ошибка'),
        l('Failed to post comment', 'فشل إرسال التعليق', 'Не удалось отправить комментарий')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Custom renderers for HTML content
  const tagsStyles = {
    body: { color: colors.bodyText, fontSize: 16, lineHeight: 26 },
    p: { marginBottom: 16 },
    h2: { fontSize: 22, fontWeight: '700', color: colors.label, marginTop: 24, marginBottom: 12 },
    h3: { fontSize: 19, fontWeight: '700', color: colors.label, marginTop: 20, marginBottom: 10 },
    h4: { fontSize: 17, fontWeight: '600', color: colors.label, marginTop: 16, marginBottom: 8 },
    a: { color: colors.accent, textDecorationLine: 'none' },
    strong: { fontWeight: '700', color: colors.label },
    em: { fontStyle: 'italic' },
    ul: { marginBottom: 16, paddingLeft: 16 },
    ol: { marginBottom: 16, paddingLeft: 16 },
    li: { marginBottom: 6, fontSize: 16, lineHeight: 24, color: colors.bodyText },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      paddingLeft: 14,
      marginVertical: 16,
      backgroundColor: colors.accentBg,
      paddingVertical: 10,
      paddingRight: 14,
      borderRadius: 4,
    },
    img: { borderRadius: 10, marginVertical: 12 },
  };

  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/blog'); };

  const featuredImageUrl = post?.featuredImage || null;

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('navigation.blog') || l('Blog', 'المدونة', 'Блог')}
        scrollY={post && !loading && !error ? scrollY : null}
        onBack={onBack}
        // The refresh icon that sat here duplicated pull-to-refresh, which the
        // article already supports. The slot is worth more to the language
        // control: this screen fetches localized copy keyed on `locale`, so
        // switching here reloads the article in the chosen language in place.
        right={<LocaleSwitchButton />}
        isRTL={isRTL}
      />

      {loading && !refreshing ? (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{l('Loading article...', 'جاري التحميل...', 'Загрузка...')}</Text>
        </View>
      ) : error || !post ? (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <Ionicons name="cloud-offline" size={48} color={colors.tertiary} />
          <Text style={styles.errorTitle}>{error || l('Article not found', 'المقال غير موجود', 'Статья не найдена')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { haptics.lightTap(); fetchPost(); }} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
            <Animated.ScrollView
              ref={scrollRef}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchPost(true)} tintColor={colors.accent} progressViewOffset={headerHeight} />
              }
            >
              {/* Featured Image — hero cover */}
              {featuredImageUrl ? (
                <Image source={{ uri: featuredImageUrl }} style={styles.hero} contentFit="cover" transition={200} />
              ) : null}

              {/* Article sheet: title + meta + body */}
              <View style={[styles.sheet, shadow.card, featuredImageUrl && styles.sheetOverlap]}>
                <Text style={[styles.articleTitle, isRTL && styles.textRTL]}>{post.title}</Text>

                <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
                  {post.authorName ? (
                    <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                      <Ionicons name="person-outline" size={14} color={colors.secondaryLabel} />
                      <Text style={styles.metaText}>{post.authorName}</Text>
                    </View>
                  ) : null}
                  {post.publishedAt ? (
                    <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                      <Ionicons name="calendar-outline" size={14} color={colors.secondaryLabel} />
                      <Text style={styles.metaText}>{formatDate(post.publishedAt)}</Text>
                    </View>
                  ) : null}
                  {post.views > 0 ? (
                    <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                      <Ionicons name="eye-outline" size={14} color={colors.secondaryLabel} />
                      <Text style={styles.metaText}>{post.views}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Tags */}
                {post.tags?.length > 0 ? (
                  <View style={[styles.tagsRow, isRTL && styles.tagsRowRTL]}>
                    {post.tags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.bodyHairline} />

                {/* Article Content (HTML) */}
                {post.content && RenderHtml ? (
                  <RenderHtml
                    contentWidth={CONTENT_WIDTH}
                    source={{ html: post.content }}
                    tagsStyles={tagsStyles}
                    renderersProps={renderersProps}
                    enableExperimentalBRCollapsing
                    enableExperimentalGhostLinesPrevention
                    enableExperimentalMarginCollapsing
                    defaultTextProps={{ selectable: true }}
                  />
                ) : post.content ? (
                  <Text style={styles.noContent} selectable>{post.content.replace(/<[^>]*>/g, '')}</Text>
                ) : (
                  <Text style={styles.noContent}>{l('No content available', 'لا يوجد محتوى', 'Содержимое недоступно')}</Text>
                )}
              </View>

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
                  <View style={[surfaces.iconTile, { backgroundColor: colors.accent }]}>
                    <Ionicons name="chatbubbles" size={17} color={colors.white} />
                  </View>
                  <Text style={[styles.commentsTitle, isRTL && styles.textRTL]}>
                    {l('Comments', 'التعليقات', 'Комментарии')}
                  </Text>
                  {comments.length > 0 ? (
                    <View style={styles.commentCountBadge}>
                      <Text style={styles.commentCountText}>{comments.length}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Comment Input */}
                <View style={styles.commentInputContainer}>
                  {user ? (
                    <View style={[styles.commentInputCard, shadow.card]}>
                      <View style={[styles.commentInputRow, isRTL && styles.commentInputRowRTL]}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <TextInput
                          style={[styles.commentInput, isRTL && styles.commentInputRTL]}
                          value={commentText}
                          onChangeText={setCommentText}
                          placeholder={l('Write a comment...', 'اكتب تعليقاً...', 'Напишите комментарий...')}
                          placeholderTextColor={colors.secondaryLabel}
                          multiline
                          maxLength={1000}
                          editable={!submitting}
                          textAlign={isRTL ? 'right' : 'left'}
                        />
                      </View>
                      {commentText.trim().length > 0 ? (
                        <TouchableOpacity
                          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                          onPress={handleSubmitComment}
                          disabled={submitting}
                          activeOpacity={0.85}
                        >
                          {submitting ? (
                            <ActivityIndicator size="small" color={colors.white} />
                          ) : (
                            <>
                              <Ionicons name="send" size={16} color={colors.white} />
                              <Text style={styles.submitBtnText}>{l('Post', 'نشر', 'Отправить')}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.loginToComment, isRTL && styles.rowRTL]}
                      onPress={() => { haptics.lightTap(); router.push('/auth/login'); }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={colors.accent} />
                      <Text style={styles.loginToCommentText}>
                        {l('Log in to leave a comment', 'سجل دخولك لترك تعليق', 'Войдите, чтобы комментировать')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Comments List */}
                {comments.length === 0 ? (
                  <View style={styles.noComments}>
                    <Ionicons name="chatbubbles-outline" size={36} color={colors.tertiary} />
                    <Text style={styles.noCommentsText}>
                      {l('No comments yet. Be the first!', 'لا توجد تعليقات بعد. كن الأول!', 'Пока нет комментариев. Будьте первым!')}
                    </Text>
                  </View>
                ) : (
                  comments.map((comment) => (
                    <View key={comment.id} style={[styles.commentCard, shadow.card]}>
                      <View style={[styles.commentHeader, isRTL && styles.commentHeaderRTL]}>
                        <View style={styles.commentAvatarSmall}>
                          <Text style={styles.commentAvatarSmallText}>
                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.commentUserName, isRTL && styles.textRTL]}>{comment.userName}</Text>
                          <Text style={[styles.commentTime, isRTL && styles.textRTL]}>{timeAgo(comment.createdAt)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.commentContent, isRTL && styles.textRTL]}>{comment.content}</Text>
                    </View>
                  ))
                )}
              </View>
            </Animated.ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Hero cover
  hero: { width: '100%', height: 240, backgroundColor: colors.subtleBg },

  // Article sheet (edge-to-edge so RenderHtml contentWidth stays exact)
  sheet: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetOverlap: { marginTop: -24 },
  articleTitle: { ...T.serifDisplay, fontSize: 30, lineHeight: 35, marginBottom: 12 },

  // Article meta
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 4 },
  metaRowRTL: { flexDirection: 'row-reverse' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItemRTL: { flexDirection: 'row-reverse' },
  metaText: { ...T.caption, color: colors.secondaryLabel },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagsRowRTL: { flexDirection: 'row-reverse' },
  tag: { backgroundColor: colors.subtleBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { ...T.captionSmall, color: colors.secondaryLabel, fontWeight: '500' },

  bodyHairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginTop: 16, marginBottom: 8 },
  noContent: { ...T.bodySmall, color: colors.secondaryLabel, textAlign: 'center', paddingVertical: 40 },

  // Comments section
  commentsSection: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  rowRTL: { flexDirection: 'row-reverse' },
  commentsTitle: { ...T.serifHeading, fontSize: 19 },
  commentCountBadge: { backgroundColor: colors.cta, borderRadius: 11, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  commentCountText: { ...T.badgeMedium, color: colors.white },

  // Comment input
  commentInputContainer: { marginBottom: 18 },
  commentInputCard: { ...surfaces.card, padding: 12 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  commentInputRowRTL: { flexDirection: 'row-reverse' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cta, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  commentAvatarText: { ...T.button, fontWeight: '700', color: colors.white },
  commentInput: {
    flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.label,
    maxHeight: 100, backgroundColor: colors.subtleBg,
  },
  commentInputRTL: { textAlign: 'right', writingDirection: 'rtl' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.cta, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 12, marginTop: 10, alignSelf: 'flex-end',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...T.buttonSmall, color: colors.white },

  loginToComment: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.accentBg, paddingVertical: 14, borderRadius: 14,
  },
  loginToCommentText: { ...T.buttonSmall, color: colors.accent },

  // Comments list
  noComments: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  noCommentsText: { ...T.caption, color: colors.secondaryLabel, fontSize: 14, textAlign: 'center' },
  commentCard: { ...surfaces.card, padding: 14, marginBottom: 12 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  commentHeaderRTL: { flexDirection: 'row-reverse' },
  commentAvatarSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.subtleBg, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator },
  commentAvatarSmallText: { ...T.caption, fontWeight: '700', color: colors.secondaryLabel },
  commentUserName: { ...T.label, color: colors.label },
  commentTime: { ...T.captionTiny, color: colors.secondaryLabel },
  commentContent: { ...T.faqAnswer, color: colors.label, lineHeight: 21 },

  // States
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  loadingText: { ...T.bodySmall, color: colors.secondaryLabel, lineHeight: undefined },
  errorTitle: { ...T.label, fontSize: 16, fontWeight: '400', color: colors.secondaryLabel, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.label, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { ...T.buttonSmall, color: colors.white },

  // RTL
  // Clearing the family gives Arabic the system face: Cormorant has no
  // Arabic glyphs. No-op for the sans text that also uses this style.
  textRTL: { writingDirection: 'rtl', textAlign: 'right', fontFamily: undefined },
});

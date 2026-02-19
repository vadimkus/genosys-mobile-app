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
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Lazy-safe import: react-native-render-html may crash on some RN versions
let RenderHtml = null;
try {
  RenderHtml = require('react-native-render-html').default;
} catch {
  // Will fall back to plain text rendering
}
import * as haptics from '../../utils/haptics';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import AUTH_CONFIG from '../../config/auth';
import { createLogger } from '../../utils/logger';

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

  const l = (en, ar, ru) => (locale === 'ar' ? ar : locale === 'ru' ? ru : en);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
        const res = await fetch(`${baseUrl}/api/mobile/blog/${slug}`, {
          headers: {
            'x-api-key': AUTH_CONFIG.API_KEY,
            'x-locale': locale || 'en',
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

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
      const res = await fetch(`${baseUrl}/api/mobile/blog/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AUTH_CONFIG.API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          content: commentText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post comment');
      }

      haptics.success();
      // Prepend new comment to list
      setComments((prev) => [data.comment, ...prev]);
      setCommentText('');
    } catch (err) {
      Alert.alert(
        l('Error', 'خطأ', 'Ошибка'),
        err.message || l('Failed to post comment', 'فشل إرسال التعليق', 'Не удалось отправить комментарий')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Custom renderers for HTML content
  const tagsStyles = {
    body: { color: '#374151', fontSize: 16, lineHeight: 26 },
    p: { marginBottom: 16 },
    h2: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 },
    h3: { fontSize: 19, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },
    h4: { fontSize: 17, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
    a: { color: '#dc2626', textDecorationLine: 'none' },
    strong: { fontWeight: '700', color: '#111827' },
    em: { fontStyle: 'italic' },
    ul: { marginBottom: 16, paddingLeft: 16 },
    ol: { marginBottom: 16, paddingLeft: 16 },
    li: { marginBottom: 6, fontSize: 16, lineHeight: 24, color: '#374151' },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: '#dc2626',
      paddingLeft: 14,
      marginVertical: 16,
      backgroundColor: '#FEF2F2',
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

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{l('Article', 'مقال', 'Статья')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>{l('Loading article...', 'جاري التحميل...', 'Загрузка...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{l('Article', 'مقال', 'Статья')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline" size={48} color="#D1D5DB" />
          <Text style={styles.errorTitle}>{error || l('Article not found', 'المقال غير موجود', 'Статья не найдена')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPost()} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const featuredImageUrl = post.featuredImage || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {l('Blog', 'المدونة', 'Блог')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPost(true)} tintColor="#dc2626" />
          }
        >
          {/* Featured Image */}
          {featuredImageUrl && (
            <Image source={{ uri: featuredImageUrl }} style={styles.featuredImage} resizeMode="cover" />
          )}

          {/* Article Meta */}
          <View style={styles.articleMeta}>
            <Text style={[styles.articleTitle, isRTL && styles.textRTL]}>{post.title}</Text>

            <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
              {post.authorName && (
                <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{post.authorName}</Text>
                </View>
              )}
              {post.publishedAt && (
                <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{formatDate(post.publishedAt)}</Text>
                </View>
              )}
              {post.views > 0 && (
                <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                  <Ionicons name="eye-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{post.views}</Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <View style={[styles.tagsRow, isRTL && styles.tagsRowRTL]}>
                {post.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Article Content (HTML) */}
          <View style={styles.contentContainer}>
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={[styles.commentsSectionHeader, isRTL && styles.commentsSectionHeaderRTL]}>
              <Text style={[styles.commentsTitle, isRTL && styles.textRTL]}>
                {l('Comments', 'التعليقات', 'Комментарии')}
              </Text>
              {comments.length > 0 && (
                <View style={styles.commentCountBadge}>
                  <Text style={styles.commentCountText}>{comments.length}</Text>
                </View>
              )}
            </View>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              {user ? (
                <>
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
                      placeholderTextColor="#9CA3AF"
                      multiline
                      maxLength={1000}
                      editable={!submitting}
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  </View>
                  {commentText.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                      onPress={handleSubmitComment}
                      disabled={submitting}
                      activeOpacity={0.7}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="send" size={16} color="#fff" />
                          <Text style={styles.submitBtnText}>{l('Post', 'نشر', 'Отправить')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.loginToComment}
                  onPress={() => router.push('/auth/login')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#dc2626" />
                  <Text style={styles.loginToCommentText}>
                    {l('Log in to leave a comment', 'سجل دخولك لترك تعليق', 'Войдите, чтобы комментировать')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Comments List */}
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Ionicons name="chatbubbles-outline" size={36} color="#D1D5DB" />
                <Text style={styles.noCommentsText}>
                  {l('No comments yet. Be the first!', 'لا توجد تعليقات بعد. كن الأول!', 'Пока нет комментариев. Будьте первым!')}
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={[styles.commentHeader, isRTL && styles.commentHeaderRTL]}>
                    <View style={styles.commentAvatarSmall}>
                      <Text style={styles.commentAvatarSmallText}>
                        {(comment.userName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.commentUserName, isRTL && styles.textRTL]}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.commentContent, isRTL && styles.textRTL]}>{comment.content}</Text>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Featured image
  featuredImage: { width: '100%', height: 220, backgroundColor: '#F3F4F6' },

  // Article meta
  articleMeta: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  articleTitle: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 32, letterSpacing: -0.5, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 12 },
  metaRowRTL: { flexDirection: 'row-reverse' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItemRTL: { flexDirection: 'row-reverse' },
  metaText: { fontSize: 13, color: '#6B7280' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagsRowRTL: { flexDirection: 'row-reverse' },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  // Content
  contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  noContent: { fontSize: 15, color: '#9CA3AF', textAlign: 'center', paddingVertical: 40 },

  // Divider
  divider: { height: 8, backgroundColor: '#F3F4F6', marginVertical: 8 },

  // Comments section
  commentsSection: { paddingHorizontal: 20, paddingTop: 16 },
  commentsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  commentsSectionHeaderRTL: { flexDirection: 'row-reverse' },
  commentsTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  commentCountBadge: { backgroundColor: '#dc2626', borderRadius: 10, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  commentCountText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Comment input
  commentInputContainer: { marginBottom: 20 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  commentInputRowRTL: { flexDirection: 'row-reverse' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  commentAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  commentInput: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#374151',
    maxHeight: 100, backgroundColor: '#F9FAFB',
  },
  commentInputRTL: { textAlign: 'right', writingDirection: 'rtl' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 10, marginTop: 10, alignSelf: 'flex-end',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  loginToComment: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA',
  },
  loginToCommentText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },

  // Comments list
  noComments: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  noCommentsText: { fontSize: 14, color: '#9CA3AF' },
  commentCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  commentHeaderRTL: { flexDirection: 'row-reverse' },
  commentAvatarSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  commentAvatarSmallText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  commentUserName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  commentTime: { fontSize: 11, color: '#9CA3AF' },
  commentContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  // States
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#6B7280' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  retryBtn: { backgroundColor: '#1F2937', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

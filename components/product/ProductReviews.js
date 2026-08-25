/**
 * ProductReviews - Customer reviews section for product detail page
 * Fetches from the web API and allows logged-in users to write/edit/delete reviews
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';
import { getJson, sendJson } from '../../services/httpClient';
import { createLogger } from '../../utils/logger';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

const log = createLogger('ProductReviews');

const WEB_ORIGIN = AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae';

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJson(`${WEB_ORIGIN}/api/products/${productId}/reviews`, {
        headers: { apiKey: false },
      });
      if (data.reviews) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating || null);
        setReviewCount(data.reviewCount || 0);
      }
    } catch (error) {
      // Silently fail - reviews are non-critical
      log.warn('Could not load reviews:', error?.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, fetchReviews]);

  const resetForm = () => {
    setFormRating(5);
    setFormTitle('');
    setFormComment('');
    setShowForm(false);
    setEditingReview(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(t('reviews.loginRequired'), t('reviews.loginToReview'));
      return;
    }
    if (formComment.trim().length < 10) {
      Alert.alert(t('reviews.tooShort'), t('reviews.minimumCharacters'));
      return;
    }

    try {
      setSubmitting(true);
      const url = editingReview
        ? `${WEB_ORIGIN}/api/products/${productId}/reviews/${editingReview.id}`
        : `${WEB_ORIGIN}/api/products/${productId}/reviews`;

      const method = editingReview ? 'PUT' : 'POST';

      const data = await sendJson(url, {
        email: user.email,
        rating: formRating,
        title: formTitle.trim() || null,
        comment: formComment.trim(),
      }, {
        method,
        authenticated: true,
        token: user.token,
        headers: { apiKey: true, token: user.token },
        safeMessage: t('reviews.submitFailed'),
      });
      if (data?.success === false) throw new Error('review-submit-failed');

      resetForm();
      await fetchReviews();
    } catch (error) {
      Alert.alert(t('common.error'), t('reviews.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (reviewId) => {
    Alert.alert(
      t('reviews.deleteTitle'),
      t('reviews.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await sendJson(`${WEB_ORIGIN}/api/products/${productId}/reviews/${reviewId}`, {}, {
                method: 'DELETE',
                authenticated: true,
                token: user?.token,
                headers: { apiKey: true, token: user?.token },
                safeMessage: t('reviews.deleteFailed'),
              });
              await fetchReviews();
            } catch (error) {
              Alert.alert(t('common.error'), t('reviews.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormRating(review.rating);
    setFormTitle(review.title || '');
    setFormComment(review.comment || '');
    setShowForm(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const renderStars = (rating, size = 16, interactive = false, onSelect = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => interactive && onSelect?.(i)}
          activeOpacity={interactive ? 0.6 : 1}
          style={interactive ? styles.starTouchable : null}
          accessibilityRole={interactive ? 'button' : 'image'}
          accessibilityLabel={`${i}/5`}
          accessibilityState={interactive ? { selected: i <= rating } : undefined}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color={i <= rating ? '#FBBF24' : colors.separatorStrong}
          />
        </TouchableOpacity>
      );
    }
    return <View style={[styles.starsRow, isRTL && styles.starsRowRTL]}>{stars}</View>;
  };

  const userReview = reviews.find((r) => r.userId === user?.id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <View style={surfaces.iconWell}>
              <Ionicons name="star" size={16} color={colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('reviews.title')}
            </Text>
          </View>
          {averageRating != null && reviewCount > 0 && (
            <View style={[styles.ratingRow, isRTL && styles.ratingRowRTL]}>
              {renderStars(Math.floor(averageRating), 18)}
              <Text style={styles.avgRatingText}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>
                ({reviewCount} {reviewCount === 1 ? (t('reviews.review')) : (t('reviews.reviewsPlural'))})
              </Text>
            </View>
          )}
        </View>
        {user && !userReview && !showForm && (
          <TouchableOpacity style={styles.writeButton} onPress={() => setShowForm(true)}>
            <Ionicons name="create-outline" size={16} color={colors.white} />
            <Text style={styles.writeButtonText}>{t('reviews.writeReview')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Form */}
      {showForm && user && (
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, isRTL && styles.textRTL]}>
            {editingReview ? (t('reviews.editReview')) : (t('reviews.writeReview'))}
          </Text>

          {/* Rating */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.rating')} *</Text>
          {renderStars(formRating, 28, true, setFormRating)}

          {/* Title */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.reviewTitle')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            value={formTitle}
            onChangeText={setFormTitle}
            placeholder={t('reviews.titlePlaceholder')}
            placeholderTextColor={colors.placeholder}
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Comment */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.yourReview')} *</Text>
          <TextInput
            style={[styles.textarea, isRTL && styles.inputRTL]}
            value={formComment}
            onChangeText={setFormComment}
            placeholder={t('reviews.reviewPlaceholder')}
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
          />
          <Text style={[styles.charCount, isRTL && styles.textRTL]}>
            {t('reviews.minimumLabel')} ({formComment.length}/10)
          </Text>

          {/* Buttons */}
          <View style={[styles.formButtons, isRTL && styles.formButtonsRTL]}>
            <TouchableOpacity
              style={[styles.submitButton, (submitting || formComment.trim().length < 10) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting || formComment.trim().length < 10}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingReview ? (t('reviews.updateReview')) : (t('reviews.submitReview'))}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reviews List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.loadingText}>{t('reviews.loading')}</Text>
        </View>
      ) : reviews.length > 0 ? (
        <View style={styles.reviewsList}>
          {reviews.map((review, index) => (
            <View key={`${review.id}-${index}`} style={styles.reviewCard}>
              <View style={[styles.reviewHeader, isRTL && styles.reviewHeaderRTL]}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.reviewNameRow, isRTL && styles.reviewNameRowRTL]}>
                    <Text style={[styles.reviewerName, isRTL && styles.textRTL]}>{review.userName}</Text>
                    {renderStars(review.rating, 14)}
                  </View>
                  {review.title && (
                    <Text style={[styles.reviewTitleText, isRTL && styles.textRTL]}>{review.title}</Text>
                  )}
                  <Text style={[styles.reviewDate, isRTL && styles.textRTL]}>{formatDate(review.createdAt)}</Text>
                </View>
                {user?.id === review.userId && (
                  <View style={[styles.reviewActions, isRTL && styles.reviewActionsRTL]}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(review)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.edit')}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.secondaryLabel} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(review.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.delete')}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.red} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={[styles.reviewComment, isRTL && styles.textRTL]}>{review.comment}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={32} color={colors.tertiary} />
          <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
            {t('reviews.noReviews')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...surfaces.card,
    ...shadow.card,
    padding: 18,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  headerRowRTL: {
    flexDirection: 'row-reverse',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ratingRowRTL: {
    flexDirection: 'row-reverse',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsRowRTL: {
    flexDirection: 'row-reverse',
  },
  starTouchable: {
    padding: 4,
  },
  avgRatingText: {
    ...T.price,
    fontWeight: '600',
  },
  reviewCountText: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cta,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  writeButtonText: {
    ...T.labelSmall,
    color: colors.white,
  },
  // Form
  formContainer: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    ...T.price,
    fontWeight: '600',
    marginBottom: 12,
  },
  formLabel: {
    ...T.label,
    fontWeight: '500',
    color: colors.label,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    ...T.input,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textarea: {
    ...T.input,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
  },
  charCount: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 4,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  formButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.cta,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...T.buttonSmall,
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.fillSecondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...T.buttonSmall,
    fontSize: 15,
    color: colors.label,
  },
  // Reviews list
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  reviewNameRowRTL: {
    flexDirection: 'row-reverse',
  },
  reviewerName: {
    ...T.label,
  },
  reviewTitleText: {
    ...T.label,
    fontWeight: '500',
    marginTop: 2,
  },
  reviewDate: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewActionsRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    padding: 6,
  },
  reviewComment: {
    ...T.label,
    fontWeight: '400',
    color: colors.label,
    lineHeight: 20,
  },
  // Empty & loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

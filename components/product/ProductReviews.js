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
import { createLogger } from '../../utils/logger';

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
      const response = await fetch(`${WEB_ORIGIN}/api/products/${productId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
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
      Alert.alert(t('reviews.loginRequired') || 'Login Required', t('reviews.loginToReview') || 'Please log in to write a review.');
      return;
    }
    if (formComment.trim().length < 10) {
      Alert.alert(t('reviews.tooShort') || 'Too Short', t('reviews.minimumCharacters') || 'Please write at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingReview
        ? `${WEB_ORIGIN}/api/products/${productId}/reviews/${editingReview.id}`
        : `${WEB_ORIGIN}/api/products/${productId}/reviews`;

      const method = editingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          rating: formRating,
          title: formTitle.trim() || null,
          comment: formComment.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (t('reviews.submitFailed') || 'Failed to submit review'));
      }

      resetForm();
      await fetchReviews();
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', error?.message || (t('reviews.submitFailed') || 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (reviewId) => {
    Alert.alert(
      t('reviews.deleteTitle') || 'Delete Review',
      t('reviews.deleteConfirm') || 'Are you sure you want to delete this review?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${WEB_ORIGIN}/api/products/${productId}/reviews/${reviewId}?email=${encodeURIComponent(user?.email || '')}`,
                { method: 'DELETE' }
              );
              if (!response.ok) throw new Error('Failed to delete');
              await fetchReviews();
            } catch (error) {
              Alert.alert(t('common.error') || 'Error', t('reviews.deleteFailed') || 'Failed to delete review');
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
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={size}
            color={i <= rating ? '#FBBF24' : '#D1D5DB'}
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
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('reviews.title') || 'Customer Reviews'}
          </Text>
          {averageRating != null && reviewCount > 0 && (
            <View style={[styles.ratingRow, isRTL && styles.ratingRowRTL]}>
              {renderStars(Math.floor(averageRating), 18)}
              <Text style={styles.avgRatingText}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>
                ({reviewCount} {reviewCount === 1 ? (t('reviews.review') || 'review') : (t('reviews.reviewsPlural') || 'reviews')})
              </Text>
            </View>
          )}
        </View>
        {user && !userReview && !showForm && (
          <TouchableOpacity style={styles.writeButton} onPress={() => setShowForm(true)}>
            <Ionicons name="create-outline" size={16} color="#ffffff" />
            <Text style={styles.writeButtonText}>{t('reviews.writeReview') || 'Write Review'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Form */}
      {showForm && user && (
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, isRTL && styles.textRTL]}>
            {editingReview ? (t('reviews.editReview') || 'Edit Review') : (t('reviews.writeReview') || 'Write Review')}
          </Text>

          {/* Rating */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.rating') || 'Rating'} *</Text>
          {renderStars(formRating, 28, true, setFormRating)}

          {/* Title */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.reviewTitle') || 'Title'}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            value={formTitle}
            onChangeText={setFormTitle}
            placeholder={t('reviews.titlePlaceholder') || 'Brief summary...'}
            placeholderTextColor="#9CA3AF"
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Comment */}
          <Text style={[styles.formLabel, isRTL && styles.textRTL]}>{t('reviews.yourReview') || 'Your Review'} *</Text>
          <TextInput
            style={[styles.textarea, isRTL && styles.inputRTL]}
            value={formComment}
            onChangeText={setFormComment}
            placeholder={t('reviews.reviewPlaceholder') || 'Share your experience with this product...'}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
          />
          <Text style={[styles.charCount, isRTL && styles.textRTL]}>
            {t('reviews.minimumLabel') || 'Minimum 10 characters'} ({formComment.length}/10)
          </Text>

          {/* Buttons */}
          <View style={[styles.formButtons, isRTL && styles.formButtonsRTL]}>
            <TouchableOpacity
              style={[styles.submitButton, (submitting || formComment.trim().length < 10) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting || formComment.trim().length < 10}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingReview ? (t('reviews.updateReview') || 'Update') : (t('reviews.submitReview') || 'Submit')}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>{t('common.cancel') || 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reviews List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
          <Text style={styles.loadingText}>{t('reviews.loading') || 'Loading reviews...'}</Text>
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
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(review)}>
                      <Ionicons name="create-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(review.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
          <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
          <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
            {t('reviews.noReviews') || 'No reviews yet. Be the first to review!'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  reviewCountText: {
    fontSize: 14,
    color: '#6B7280',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  writeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Form
  formContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1D1D1F',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textarea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1D1D1F',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
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
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  // Reviews list
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  reviewTitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
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
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

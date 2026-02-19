import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  I18nManager,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, isBeautyBoxProduct } from '../utils/productRules';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductSize, getCategoryTranslationKey, normalizeCategoryCanonical } from '../utils/productLocalization';
import AUTH_CONFIG from '../config/auth';
import * as haptics from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 20px padding + 20px gap

export default function ProductGridItem({ product }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t, locale } = useLocalization();
  const isRTL = !!I18nManager.isRTL;
  const handlePress = () => {
    haptics.lightTap();
    router.push(`/product/${product.id}`);
  };

  const imageUrl =
    product.image_url ||
    (product.image
      ? (product.image.startsWith('http') ? product.image : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`)
      : null);
  const isOutOfStock = product.status === 'out_of_stock' || product.stock === false;
  const nameLower = (product?.name || '').trim().toLowerCase();
  const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
  const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
  const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
  const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
  const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
  const isBeautyBox = isBeautyBoxProduct(product);

  const baseBadges = (product.badges || []).filter((b) => {
    const text = (b.text || '').toLowerCase().trim();
    if (text === 'best seller' || text === 'limited edition' || text === '50% off') return false;
    // Remove "Bundle Offer" badge from Beauty Boxes
    if (isBeautyBox && text.includes('bundle') && text.includes('offer')) return false;
    // Remove "Professional" badge from specific products
    if (text === 'professional' && (isEyeZoneKit || isBioFermentMask)) return false;
    // Keep "New" only for PDRN mask
    if (text === 'new' && !(isPdrnMask || isBioFermentMask)) return false;
    return true;
  });

  // Add client-enforced stock badges for the Shop grid requirements
  const computedBadges = [];
  if (!isOutOfStock) {
    if (isMesopeciaKit) {
      computedBadges.push({
        type: 'order',
        text: t('common.order'),
        color: '#FF9500',
        textColor: '#FFFFFF',
        priority: 0,
      });
    } else if (!isHolidayKit) {
      computedBadges.push({
        type: 'in_stock',
        text: t('stock.inStock'),
        color: '#34C759',
        textColor: '#FFFFFF',
        priority: 0,
      });
    }
  }

  // Add "New" badge to Bio Ferment Mask even if backend doesn't send it
  const hasNewBadge = baseBadges.some((b) => String(b?.text || '').toLowerCase().trim() === 'new');
  if (isBioFermentMask && !hasNewBadge) {
    computedBadges.push({
      type: 'new',
      text: t('common.new'),
      color: '#007AFF',
      textColor: '#FFFFFF',
      priority: 1,
    });
  }

  const badges = [...computedBadges, ...baseBadges];

  return (
    <TouchableOpacity
      style={[styles.card, isOutOfStock && styles.cardOutOfStock]}
      onPress={handlePress}
      activeOpacity={0.95}
      disabled={isOutOfStock}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, isOutOfStock && styles.imageOutOfStock]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {product.name?.charAt(0) || 'G'}
            </Text>
          </View>
        )}
        
        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockOverlayText}>{t('stock.outOfStock')}</Text>
          </View>
        )}
        
        {/* Enhanced Badges from Server */}
        {badges.length > 0 && (
          <View style={[styles.badgesContainer, isRTL && styles.badgesContainerRTL]}>
            {badges
              .sort((a, b) => (a.priority || 10) - (b.priority || 10))  // Sort by priority
              .slice(0, 2)  // Show max 2 badges
              .map((badge, index) => (
                <View key={badge.type || index} style={[
                  styles.badge, 
                  { backgroundColor: badge.color || '#007AFF' }
                ]}>
                  <Text style={[styles.badgeText, { color: badge.textColor || '#FFFFFF' }]}>
                    {badge.text}
                  </Text>
                </View>
              ))
            }
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, isRTL && styles.textRTL]} numberOfLines={2}>
          {getLocalizedProductName(product, locale) || product.name}
        </Text>
        
        {/* Badges removed from content area to avoid duplication - they show on image */}
        
        <Text style={[styles.category, isRTL && styles.textRTL]} numberOfLines={1}>
          {(() => {
            const canon = normalizeCategoryCanonical(product.category) || product.category;
            const key = getCategoryTranslationKey(canon);
            return key ? t(key) : canon;
          })()}
        </Text>
        
        {/* Enhanced Size Information from Server */}
        {(product.size || product.hasVariants || (product.variants && product.variants.length > 0)) && (
          <View style={[styles.sizeBadgeContainer, isRTL && styles.rowRTL]}>
            <View style={styles.sizeBadge}>
              <Text style={[styles.sizeBadgeText, isRTL && styles.textRTL]}>
                {product.variants && product.variants.length > 0
                  ? t('product.sizesCountShort', { count: product.variants.length })
                  : product.hasVariants 
                    ? t('product.multipleSizesShort')
                    : t('product.sizeLine', { size: getLocalizedProductSize(product, locale) })}
              </Text>
            </View>
            {(product.stock || product.inStock) && (
              <View style={styles.stockBadge}>
                <Text style={[styles.stockBadgeText, isRTL && styles.textRTL]}>{t('stock.inStock')}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Enhanced Pricing from Server with Beauty Boxes Special Display */}
        <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
          {(() => {
            const category = product?.category;
            const name = product?.name || '';
            const hasBeautyBoxInName = name.toUpperCase().includes('BEAUTY BOX');
            const isCategoryBeautyBoxes = category === 'Beauty Boxes';
            return isCategoryBeautyBoxes || hasBeautyBoxInName;
          })() ? (
            // Special pricing display for Beauty Boxes - show full price + 15% discount clearly
            <View style={[styles.beautyBoxPricing, isRTL && styles.alignEndRTL]}>
              <Text style={[styles.beautyBoxFullPrice, isRTL && styles.textRTL]}>
                {t('product.fullPrice', { price: (product.originalPrice || product.displayPrice || product.price || 0).toFixed(2) })}
              </Text>
              <View style={[styles.beautyBoxDiscountContainer, isRTL && styles.rowRTL]}>
                <Text style={styles.beautyBoxDiscount}>{t('bag.bundleDiscount15')}</Text>
                <Text style={[styles.beautyBoxFinalPrice, isRTL && styles.valueRTL]}>
                  {t('product.finalPrice', { price: (product.displayPrice || product.price || 0).toFixed(2) })}
                </Text>
              </View>
            </View>
          ) : (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product)) ? (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {getCanonicalUnitPrice(product).toFixed(2)} AED
            </Text>
          ) : product.originalPrice && product.originalPrice !== (product.displayPrice || product.price) ? (
            <View style={[styles.discountPricing, isRTL && styles.alignEndRTL]}>
              <Text style={[styles.originalPrice, isRTL && styles.valueRTL]}>
                {product.originalPrice.toFixed(2)} AED
              </Text>
              <Text style={[styles.discountedPrice, isRTL && styles.valueRTL]}>
                {(product.displayPrice || product.price).toFixed(2)} AED
              </Text>
              {product.discountLabel && (
                <View style={styles.savingsContainer}>
                  <Text style={styles.savings}>
                    {product.discountLabel}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {(product.displayPrice || product.price).toFixed(2)} AED
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    // overflow: 'hidden', // Remove this to allow badges to show outside
  },
  cardOutOfStock: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8, // Maintain aspect ratio
    backgroundColor: '#F5F5F7',
    position: 'relative',
    overflow: 'visible', // Make sure badges aren't clipped
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#dc2626',
  },
  stockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  stockOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    start: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  badgesContainerRTL: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    minWidth: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceContainerRTL: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  discountPricing: {
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 12,
    color: '#86868B',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 2,
  },
  savingsContainer: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savings: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  // Beauty Boxes specific pricing styles
  beautyBoxPricing: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  beautyBoxFullPrice: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  beautyBoxDiscountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beautyBoxDiscount: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: 'bold',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beautyBoxFinalPrice: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  rowRTL: { flexDirection: 'row-reverse' },
  alignEndRTL: { alignItems: 'flex-end' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  // In RTL, values like prices should stay readable and align to the outside edge
  valueRTL: { textAlign: 'left' },
  
  // Size Badge Styles
  sizeBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  sizeBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sizeBadgeText: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '500',
  },
  stockBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stockBadgeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
  },
});

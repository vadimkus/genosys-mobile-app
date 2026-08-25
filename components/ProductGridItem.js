import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  I18nManager,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, isBeautyBoxProduct, isUserDiscountExcludedProduct } from '../utils/productRules';
import { getPricingDisplay, hasServerPricing, formatAed } from '../utils/pricingDisplay';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedProductName, getLocalizedProductSize, getLocalizedProductDescription, getCategoryTranslationKey, normalizeCategoryCanonical } from '../utils/productLocalization';
import AUTH_CONFIG from '../config/auth';
import * as haptics from '../utils/haptics';
import { isProductOutOfStock } from '../utils/stock';
import { isProductOptionSelectionRequired } from '../utils/productOptions';
import T from '../utils/typography';
import { colors } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 20px padding + 20px gap

export default function ProductGridItem({ product, onAddToCart, onChooseOptions, inCart, justAdded, inCartQty = 0 }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t, locale } = useLocalization();
  const { user } = useAuth();
  const isRTL = !!I18nManager.isRTL;
  const canSeePrices = !!user;

  const discountPct = Number(user?.discountPercentage);
  const hasUserDiscount = !!user?.discountType && Number.isFinite(discountPct) && discountPct > 0 && discountPct < 100;

  const handlePress = () => {
    haptics.lightTap();
    router.push(`/product/${product.id}`);
  };

  const imageUrl =
    product.image_url ||
    (product.image
      ? (product.image.startsWith('http') ? product.image : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`)
      : null);
  const isOutOfStock = isProductOutOfStock(product);
  const requiresOptions = isProductOptionSelectionRequired(product);
  const nameLower = (product?.name || '').trim().toLowerCase();
  const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
  const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
  const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
  const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
  const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
  const isRevitaGlow = nameLower.includes('revita glow') || (nameLower.includes('revita') && nameLower.includes('blemish')) || String(product?.id) === '63';
  const isBeautyBox = isBeautyBoxProduct(product);
  const pricingDisplay = getPricingDisplay(product);
  const hasPricingContract = hasServerPricing(product);
  const discountLabel = (percent) => t('product.discountPercent', { percent: Math.round(Number(percent) || 0) });
  const localizeDiscountLabel = (label) => {
    const match = String(label || '').trim().match(/^(\d+(?:\.\d+)?)%\s*OFF$/i);
    return match ? discountLabel(Number(match[1])) : label;
  };

  const baseBadges = (product.badges || []).filter((b) => {
    const text = (b.text || '').toLowerCase().trim();
    if (text === 'best seller' || text === 'limited edition' || text === '50% off') return false;
    // Remove "Bundle Offer" badge from Beauty Boxes
    if (isBeautyBox && text.includes('bundle') && text.includes('offer')) return false;
    // Remove "Professional" badge from specific products
    if (text === 'professional' && (isEyeZoneKit || isBioFermentMask)) return false;
    // Keep "New" only for specific products
    if (text === 'new' && !(isPdrnMask || isBioFermentMask || isRevitaGlow)) return false;
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
        textColor: colors.white,
        priority: 0,
      });
    } else if (!isHolidayKit) {
      computedBadges.push({
        type: 'in_stock',
        text: t('stock.inStock'),
        color: '#34C759',
        textColor: colors.white,
        priority: 0,
      });
    }
  }

  const hasNewBadge = baseBadges.some((b) => String(b?.text || '').toLowerCase().trim() === 'new');
  if ((isBioFermentMask || isRevitaGlow) && !hasNewBadge) {
    computedBadges.push({
      type: 'new',
      text: t('common.new'),
      color: '#007AFF',
      textColor: colors.white,
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
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
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
                  <Text style={[styles.badgeText, { color: badge.textColor || colors.white }]}>
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
        {(() => {
          const desc = getLocalizedProductDescription(product, locale) || product.description || '';
          const plain = String(desc).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          return plain ? (
            <Text style={[styles.productDescription, isRTL && styles.textRTL]} numberOfLines={2}>{plain}</Text>
          ) : null;
        })()}
        
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
          </View>
        )}
        
        {/* Enhanced Pricing from Server with Beauty Boxes Special Display */}
        <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
          {!canSeePrices ? (
            <Text style={[styles.loginToSeePrice, isRTL && styles.valueRTL]}>
              {t('product.loginToSeePrice')}
            </Text>
          ) : pricingDisplay.isPriceOnRequest ? (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {t('product.priceOnRequest')}
            </Text>
          ) : (() => {
            const category = product?.category;
            const name = product?.name || '';
            const hasBeautyBoxInName = name.toUpperCase().includes('BEAUTY BOX');
            const isCategoryBeautyBoxes = category === 'Beauty Boxes';
            return isCategoryBeautyBoxes || hasBeautyBoxInName;
          })() ? (
            // Special pricing display for Beauty Boxes - show full price + 15% discount clearly
            <View style={[styles.beautyBoxPricing, isRTL && styles.alignEndRTL]}>
              <Text style={[styles.beautyBoxFullPrice, isRTL && styles.textRTL]}>
                {t('product.fullPrice', { price: (pricingDisplay.originalPrice || pricingDisplay.displayPrice || 0).toFixed(2) })}
              </Text>
              <View style={[styles.beautyBoxDiscountContainer, isRTL && styles.rowRTL]}>
                <Text style={styles.beautyBoxDiscount}>{t('bag.bundleDiscount15')}</Text>
                <Text style={[styles.beautyBoxFinalPrice, isRTL && styles.valueRTL]}>
                  {t('product.finalPrice', { price: (pricingDisplay.displayPrice || 0).toFixed(2) })}
                </Text>
              </View>
            </View>
          ) : (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product)) ? (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {formatAed(hasPricingContract ? pricingDisplay.displayPrice : getCanonicalUnitPrice(product))}
            </Text>
          ) : (() => {
            if (hasPricingContract) {
              const finalPrice = pricingDisplay.displayPrice;
              const retailPrice = pricingDisplay.originalPrice || finalPrice;
              const hasDiscount = retailPrice > finalPrice + 0.01;
              const label = localizeDiscountLabel(pricingDisplay.discountLabel) ||
                (pricingDisplay.discountPercentage > 0 ? discountLabel(pricingDisplay.discountPercentage) : null);

              return hasDiscount ? (
                <View style={[styles.discountPricing, isRTL && styles.alignEndRTL]}>
                  <Text style={[styles.originalPrice, isRTL && styles.valueRTL]}>
                    {formatAed(retailPrice)}
                  </Text>
                  <Text style={[styles.discountedPrice, isRTL && styles.valueRTL]}>
                    {formatAed(finalPrice)}
                  </Text>
                  {label ? (
                    <View style={styles.savingsContainer}>
                      <Text style={styles.savings}>{label}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Text style={[styles.price, isRTL && styles.valueRTL]}>
                  {formatAed(finalPrice)}
                </Text>
              );
            }

            const displayP = Number(product.displayPrice || product.price || 0);
            const serverOriginal = Number(product.originalPrice);
            const hasServerOriginal = Number.isFinite(serverOriginal) && serverOriginal > 0;
            const excluded = isUserDiscountExcludedProduct(product);
            const retailPrice = (hasServerOriginal && serverOriginal > displayP) ? serverOriginal : displayP;
            const serverAlreadyDiscounted = hasServerOriginal && serverOriginal > displayP;
            const canApplyUserDiscount = hasUserDiscount && !excluded && !serverAlreadyDiscounted;
            const finalPrice = canApplyUserDiscount ? retailPrice * (1 - discountPct / 100) : displayP;
            const hasDiscount = retailPrice > finalPrice + 0.01;
            const label = serverAlreadyDiscounted
              ? localizeDiscountLabel(product.discountLabel)
              : (canApplyUserDiscount ? discountLabel(discountPct) : null);

            return hasDiscount ? (
              <View style={[styles.discountPricing, isRTL && styles.alignEndRTL]}>
                <Text style={[styles.originalPrice, isRTL && styles.valueRTL]}>
                  {retailPrice.toFixed(2)} AED
                </Text>
                <Text style={[styles.discountedPrice, isRTL && styles.valueRTL]}>
                  {finalPrice.toFixed(2)} AED
                </Text>
                {label ? (
                  <View style={styles.savingsContainer}>
                    <Text style={styles.savings}>{label}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.price, isRTL && styles.valueRTL]}>
                {finalPrice.toFixed(2)} AED
              </Text>
            );
          })()}
        </View>
        {onAddToCart && !isOutOfStock && (
          <TouchableOpacity
            style={[styles.addToCartBtn, inCart && styles.addToCartBtnInCart]}
            onPress={(e) => {
              e.stopPropagation?.();
              if (!user) {
                router.push({
                  pathname: '/auth/login',
                  params: { returnTo: `/product/${product.id}` },
                });
                return;
              }
              if (requiresOptions) {
                if (inCart) {
                  router.push('/(tabs)/bag');
                  return;
                }
                (onChooseOptions || handlePress)();
                return;
              }
              onAddToCart();
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={inCart ? 'checkmark-circle' : justAdded ? 'checkmark-circle' : 'bag-add-outline'}
              size={14}
              color={inCart ? '#15803D' : colors.white}
            />
            <Text style={[styles.addToCartBtnText, inCart && styles.addToCartBtnTextInCart]}>
              {inCart
                ? requiresOptions
                  ? t('product.viewBag')
                  : `${locale === 'ar' ? 'في الحقيبة' : locale === 'ru' ? 'В корзине' : 'In Bag'}${inCartQty > 0 ? ` (${inCartQty})` : ' ✓'}`
                : !user
                  ? t('shop.loginToBuy')
                  : requiresOptions
                    ? t('variant.chooseOptions')
                    : (locale === 'ar' ? 'أضف للحقيبة' : locale === 'ru' ? 'В корзину' : 'Add to Bag')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.separator,
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
    // Square tile (matches website): square studio photos fill edge-to-edge,
    // wide photos letterbox invisibly on the white background.
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.card,
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
    backgroundColor: colors.subtleBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent,
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
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.white,
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
    ...T.badgeMedium,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    ...T.productName,
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    ...T.productCategory,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  productDescription: {
    ...T.productDescription,
    marginBottom: 6,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceContainerRTL: {
    alignItems: 'flex-end',
  },
  price: {
    ...T.price,
  },
  loginToSeePrice: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.secondaryLabel,
  },
  discountPricing: {
    alignItems: 'flex-start',
  },
  originalPrice: {
    ...T.priceStrikethrough,
    fontSize: 12,
    marginBottom: 2,
  },
  discountedPrice: {
    ...T.priceDiscount,
    marginBottom: 2,
  },
  savingsContainer: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savings: {
    ...T.badge,
    color: colors.white,
  },
  // Beauty Boxes specific pricing styles
  beautyBoxPricing: {
    backgroundColor: colors.subtleBg,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  beautyBoxFullPrice: {
    ...T.captionSmall,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  beautyBoxDiscountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beautyBoxDiscount: {
    ...T.captionTiny,
    fontWeight: 'bold',
    color: colors.accent,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beautyBoxFinalPrice: {
    ...T.labelSmall,
    fontWeight: 'bold',
    color: '#27AE60',
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
    backgroundColor: colors.groupedBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sizeBadgeText: {
    ...T.badge,
    fontSize: 9,
    fontWeight: '500',
    color: colors.mutedText,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.cta,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  addToCartBtnInCart: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  addToCartBtnText: {
    ...T.buttonTiny,
  },
  addToCartBtnTextInCart: {
    color: '#15803D',
  },
});

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
import { isBeautyBoxProduct } from '../utils/productRules';
import { formatAed, resolvePriceView, discountLabelFor } from '../utils/pricingDisplay';
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

  const priceView = resolvePriceView(product, { user });
  const priceLabel = priceView.kind === 'discounted' ? discountLabelFor(priceView, t) : null;

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
  const isWishlisted = !!(product?.id && isFavorite(product.id));
  const requiresOptions = isProductOptionSelectionRequired(product);
  const nameLower = (product?.name || '').trim().toLowerCase();
  const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
  const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
  const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
  const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
  const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
  const isRevitaGlow = nameLower.includes('revita glow') || (nameLower.includes('revita') && nameLower.includes('blemish')) || String(product?.id) === '63';
  const isBeautyBox = isBeautyBoxProduct(product);

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
        color: colors.orange,
        textColor: colors.white,
        priority: 0,
      });
    } else if (!isHolidayKit) {
      computedBadges.push({
        type: 'in_stock',
        text: t('stock.inStock'),
        color: colors.ok,
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
      color: colors.blue,
      textColor: colors.white,
      priority: 1,
    });
  }

  const badges = [...computedBadges, ...baseBadges];

  return (
    // Out of stock dims the card and hides the buy button, but the card stays
    // tappable: a shopper still needs to read the ingredients, see the photos
    // and save it for when it returns.
    <TouchableOpacity
      style={[styles.card, isOutOfStock && styles.cardOutOfStock]}
      onPress={handlePress}
      activeOpacity={0.95}
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
                  { backgroundColor: badge.color || colors.blue }
                ]}>
                  <Text style={[styles.badgeText, { color: badge.textColor || colors.white }]}>
                    {badge.text}
                  </Text>
                </View>
              ))
            }
          </View>
        )}

        {/* Saving a product is a list-level action: the shopper is comparing
            here, not on the detail page. Matches the shop tab's card. */}
        <TouchableOpacity
          style={styles.favoriteHeart}
          onPress={(e) => {
            e.stopPropagation?.();
            haptics.lightTap();
            toggleFavorite(product);
          }}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={isWishlisted ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
          accessibilityState={{ selected: isWishlisted }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? colors.accent : colors.mutedText}
          />
        </TouchableOpacity>
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
        
        {/* Price, decided once in `resolvePriceView` so the catalogue can never
            advertise a number the product page or checkout disagrees with. */}
        <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
          {priceView.kind === 'login' ? (
            <Text style={[styles.loginToSeePrice, isRTL && styles.valueRTL]}>
              {t('product.loginToSeePrice')}
            </Text>
          ) : priceView.kind === 'onRequest' ? (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {t('product.priceOnRequest')}
            </Text>
          ) : priceView.kind === 'discounted' ? (
            <View style={[styles.discountPricing, isRTL && styles.alignEndRTL]}>
              <Text style={[styles.originalPrice, isRTL && styles.valueRTL]}>
                {formatAed(priceView.originalPrice)}
              </Text>
              <Text style={[styles.discountedPrice, isRTL && styles.valueRTL]}>
                {formatAed(priceView.price)}
              </Text>
              {priceLabel ? (
                <View style={styles.savingsContainer}>
                  <Text style={styles.savings}>{priceLabel}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.price, isRTL && styles.valueRTL]}>
              {formatAed(priceView.price)}
            </Text>
          )}
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
              color={inCart ? colors.ok : colors.white}
            />
            <Text style={[styles.addToCartBtnText, inCart && styles.addToCartBtnTextInCart]}>
              {inCart
                ? requiresOptions
                  ? t('product.viewBag')
                  : t('product.inBag', { count: inCartQty > 0 ? inCartQty : 1 })
                : !user
                  ? t('shop.loginToBuy')
                  : requiresOptions
                    ? t('variant.chooseOptions')
                    : t('product.addToBag')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Flat on a hairline, the way the website sets its product cards. The border
  // was already doing the separating; the shadow underneath it only smudged
  // the edge, and against cream that reads as dirt rather than depth.
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
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
  // Sits on the image, opposite the badge stack, on a soft disc so the outline
  // heart stays visible over a white packshot as well as a dark one.
  favoriteHeart: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    zIndex: 10,
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
    shadowColor: colors.shadowCast,
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
    backgroundColor: colors.ok,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savings: {
    ...T.badge,
    color: colors.white,
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
    backgroundColor: colors.okBg,
    borderWidth: 1,
    borderColor: colors.okLine,
  },
  addToCartBtnText: {
    ...T.buttonTiny,
  },
  addToCartBtnTextInCart: {
    color: colors.ok,
  },
});

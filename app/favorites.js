import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct } from '../utils/productRules';
import { getPricingDisplay, hasServerPricing, formatAed } from '../utils/pricingDisplay';
import {
  isProductOptionSelectionRequired,
  loadCanonicalProductForQuickAdd,
} from '../utils/productOptions';
import { isProductOutOfStock } from '../utils/stock';
import { fetchProductById } from '../services/api';
import { computeProductBadges } from '../utils/badges';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName, getCategoryTranslationKey, normalizeCategoryCanonical } from '../utils/productLocalization';
import { createLogger } from '../utils/logger';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, tint } from '../utils/theme';
import AUTH_CONFIG from '../config/auth';

const log = createLogger('FavoritesScreen');

const EMPTY_UNI_IMAGE = 'https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Fgray_uni.jpeg&w=512&q=75';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { addItem } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [addingProducts, setAddingProducts] = useState(new Set());

  const { scrollY, onScroll, headerHeight, insets } = useCollapsibleHeader();

  // Subtle entrance motion (matches order details / OrderSuccessScreen feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/(tabs)/shop');
  };

  const handleProductPress = (product) => {
    haptics.lightTap();
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product) => {
    haptics.mediumTap();
    if (!product?.id || addingProducts.has(product.id) || product.isPriceOnRequest) return;
    if (!user) {
      Alert.alert(
        t('favorites.loginRequiredTitle'),
        t('favorites.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.login'),
            onPress: () => router.push({
              pathname: '/auth/login',
              params: { returnTo: '/favorites' },
            }),
          }
        ]
      );
      return;
    }

    // Server-synced favorites intentionally contain only summary fields. Always
    // reload the canonical mobile contract before deciding whether quick-add is
    // safe, otherwise a size/shade product can look like a simple product.
    setAddingProducts(prev => new Set([...prev, product.id]));

    try {
      const canonicalProduct = await loadCanonicalProductForQuickAdd(
        product,
        (productId) => fetchProductById(productId, user, { locale })
      );
      if (canonicalProduct.isPriceOnRequest) return;
      if (isProductOutOfStock(canonicalProduct)) {
        Alert.alert(t('stock.outOfStock'), t('stock.outOfStockMessage'));
        return;
      }
      if (isProductOptionSelectionRequired(canonicalProduct)) {
        router.push(`/product/${canonicalProduct.id}`);
        return;
      }

      const added = await addItem(canonicalProduct, 1, '', '');
      if (added === false) throw new Error('PRODUCT_OPTIONS_REQUIRED');
      log.debug('Added to bag from favorites', { productId: canonicalProduct.id });
    } catch (error) {
      log.error('Failed to add product to cart', error?.message || error);
      Alert.alert(t('common.error'), t('favorites.addToBagFailed'));
    } finally {
      // Remove from tracking set after delay
      setTimeout(() => {
        setAddingProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }, 500);
    }
  };

  const handleRemoveFromFavorites = (product) => {
    haptics.lightTap();
    toggleFavorite(product);
    log.debug('Removed from favorites', { productId: product?.id });
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={t('favorites.title')} scrollY={null} onBack={onBack} isRTL={isRTL} />
        <Animated.View
          style={[
            styles.emptyContainer,
            { paddingTop: headerHeight + 24 },
            { opacity: fade, transform: [{ translateY: lift }] },
          ]}
        >
          <View style={styles.iconContainer}>
            <Image
              source={EMPTY_UNI_IMAGE}
              style={styles.emptyUniImage}
              contentFit="contain"
              accessibilityRole="image"
              accessible={false}
            />
          </View>
          <Text style={[styles.emptyTitle, isRTL && styles.textCenterRTL]}>{t('favorites.emptyTitle')}</Text>
          <Text style={[styles.emptySubtitle, isRTL && styles.textCenterRTL]}>
            {t('favorites.emptySubtitle')}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => { haptics.lightTap(); router.back(); }}
            activeOpacity={0.85}
          >
            <Text style={[styles.browseButtonText, isRTL && styles.textCenterRTL]}>{t('favorites.browseProducts')}</Text>
          </TouchableOpacity>
          {/* Login nudge for signed-out guests — favorites are stored
              per-device, so cross-device sync is a real incentive to
              sign in. Hidden once the user has an auth session. */}
          {!user ? (
            <View style={styles.loginNudge}>
              <Text style={[styles.loginNudgeText, isRTL && styles.textCenterRTL]}>{t('favorites.signInToSync')}</Text>
              <TouchableOpacity
                onPress={() => { haptics.lightTap(); router.push('/auth/login'); }}
                style={[styles.loginNudgeButton, isRTL && styles.rowRTL]}
                activeOpacity={0.7}
              >
                <Ionicons name="log-in-outline" size={16} color={colors.accent} />
                <Text style={styles.loginNudgeButtonText}>{t('favorites.signIn')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('favorites.title')} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Animated.ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
        >
          <View style={styles.list}>
            {favorites.map((product, index) => {
              const isAdding = addingProducts.has(product.id);
              const isOut = product.status === 'out_of_stock' || product.stock === false;
              const disabled = isOut || isAdding;
              const badges = computeProductBadges(product, {
                order: t('common.order'),
                inStock: t('stock.inStock'),
                new: t('common.new'),
              });
              return (
                <View key={`${product.id}-${index}`} style={[styles.card, shadow.card]}>
                  {/* Tappable product row (thumbnail + details) */}
                  <View style={[styles.cardHead, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                      style={[styles.headTap, isRTL && styles.rowRTL]}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.6}
                    >
                      <View style={styles.thumbWrap}>
                        {product.image ? (
                          <Image
                            source={`${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`}
                            style={styles.thumb}
                            contentFit="contain"
                            transition={200}
                            cachePolicy="memory-disk"
                          />
                        ) : (
                          <View style={[styles.thumb, styles.thumbPlaceholder]}>
                            <Text style={styles.thumbPlaceholderText}>
                              {(getLocalizedProductName(product, locale) || product.name || '').charAt(0) || 'G'}
                            </Text>
                          </View>
                        )}
                        {badges.length ? (
                          <View style={styles.badgeContainer}>
                            {badges.map((badge, badgeIndex) => (
                              <View
                                key={`${badge.text || 'badge'}-${badgeIndex}`}
                                style={[styles.badge, { backgroundColor: badge.color || colors.blue }]}
                              >
                                <Text style={styles.badgeText}>{badge.text}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.middle}>
                        <Text style={[styles.name, isRTL && styles.textRTL]} numberOfLines={2}>
                          {getLocalizedProductName(product, locale) || product.name}
                        </Text>
                        <Text style={[styles.category, isRTL && styles.textRTL]} numberOfLines={1}>
                          {(() => {
                            const canon = normalizeCategoryCanonical(product.category) || product.category;
                            const key = getCategoryTranslationKey(canon);
                            return key ? t(key) : canon;
                          })()}
                        </Text>

                        {/* Pricing */}
                        {(() => {
                          const pricing = getPricingDisplay(product);
                          const contractPrice = hasServerPricing(product);
                          const displayPrice = contractPrice
                            ? pricing.displayPrice
                            : Number(product.displayPrice || product.price || 0);
                          const originalPrice = contractPrice
                            ? pricing.originalPrice
                            : Number(product.originalPrice);

                          if (!user) {
                            return (
                              <View style={styles.priceContainer}>
                                <Text style={[styles.loginToSeePriceText, isRTL && styles.textRTL]}>{t('product.loginToSeePrice')}</Text>
                              </View>
                            );
                          }

                          if (pricing.isPriceOnRequest) {
                            return (
                              <View style={styles.priceContainer}>
                                <Text style={[styles.priceOnRequestText, isRTL && styles.textRTL]}>{t('product.priceOnRequest')}</Text>
                              </View>
                            );
                          }

                          if (!contractPrice && (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product))) {
                            return (
                              <View style={styles.priceContainer}>
                                <Text style={[styles.price, isRTL && styles.textRTL]}>{formatAed(getCanonicalUnitPrice(product))}</Text>
                                <Text style={[styles.vatText, isRTL && styles.textRTL]}>{t('favorites.vatIncluded')}</Text>
                              </View>
                            );
                          }

                          if (originalPrice && Number(originalPrice) > Number(displayPrice || 0)) {
                            return (
                              <View style={styles.priceContainer}>
                                <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                                  <Text style={styles.originalPrice}>{formatAed(originalPrice)}</Text>
                                  {pricing.discountLabel ? (
                                    <Text style={styles.savings}>{pricing.discountLabel}</Text>
                                  ) : null}
                                </View>
                                <Text style={[styles.discountedPrice, isRTL && styles.textRTL]}>{formatAed(displayPrice)}</Text>
                                <Text style={[styles.vatText, isRTL && styles.textRTL]}>{t('favorites.vatIncluded')}</Text>
                              </View>
                            );
                          }

                          return (
                            <View style={styles.priceContainer}>
                              <Text style={[styles.price, isRTL && styles.textRTL]}>{formatAed(displayPrice)}</Text>
                              <Text style={[styles.vatText, isRTL && styles.textRTL]}>{t('favorites.vatIncluded')}</Text>
                            </View>
                          );
                        })()}
                      </View>
                    </TouchableOpacity>

                    {/* Subtle remove/heart toggle (filled because it's a favorite) */}
                    <TouchableOpacity
                      style={styles.heartBtn}
                      onPress={() => handleRemoveFromFavorites(product)}
                      activeOpacity={0.6}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('favorites.removeFromFavorites')} — ${product?.name || ''}`}
                    >
                      <Ionicons name="heart" size={22} color={colors.accent} />
                    </TouchableOpacity>
                  </View>

                  {/* Add to Cart / Request Quote — compact tinted pill */}
                  {product.isPriceOnRequest ? (
                    <TouchableOpacity
                      style={[styles.requestQuoteButton, isRTL && styles.rowRTL]}
                      onPress={() => {
                        const productName = getLocalizedProductName(product, locale) || product.name || '';
                        const msg = encodeURIComponent(
                          t('product.requestQuoteMessage', { name: productName })
                        );
                        Linking.openURL(`https://wa.me/971585487665?text=${msg}`).catch(() => {});
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color={colors.whatsapp} />
                      <Text style={styles.requestQuoteText}>{t('product.requestQuote')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.addToCartButton, isRTL && styles.rowRTL, disabled && styles.addToCartButtonDisabled]}
                      onPress={() => handleAddToCart(product)}
                      disabled={disabled}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isAdding ? 'checkmark' : 'bag-add'}
                        size={16}
                        color={disabled ? colors.secondaryLabel : colors.accent}
                      />
                      <Text style={[styles.addToCartText, disabled && styles.addToCartTextDisabled]}>
                        {isAdding
                          ? t('favorites.added')
                          : isOut
                            ? t('favorites.outOfStock')
                            : user
                              ? t('favorites.addToBag')
                              : t('favorites.loginToBuy')
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  flex: { flex: 1 },
  rowRTL: { flexDirection: 'row-reverse' },

  // ── List + cards ───────────────────────────────────────────────────
  list: { padding: 16, gap: 14 },
  card: {
    ...surfaces.card,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  thumbWrap: { width: 72, height: 72 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  thumbPlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  badgeContainer: {
    position: 'absolute',
    top: 5,
    start: 5,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...T.badge,
    textTransform: 'uppercase',
  },
  middle: { flex: 1, minWidth: 0 },
  name: {
    ...T.label,
    fontSize: 15,
    lineHeight: 19,
    color: colors.label,
  },
  category: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  // ── Pricing ────────────────────────────────────────────────────────
  priceContainer: { marginTop: 6 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    ...T.priceSmall,
    color: colors.accent,
  },
  originalPrice: {
    ...T.priceStrikethrough,
    fontSize: 12,
    color: colors.secondaryLabel,
  },
  discountedPrice: {
    ...T.priceSmall,
    color: colors.accent,
    marginTop: 2,
  },
  savings: {
    ...T.captionTiny,
    fontWeight: '700',
    color: colors.greenDeep,
  },
  vatText: {
    ...T.captionTiny,
    fontSize: 10,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
  priceOnRequestText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.whatsapp,
  },
  loginToSeePriceText: {
    ...T.captionSmall,
    fontWeight: '700',
    color: colors.secondaryLabel,
  },

  // ── Heart toggle ───────────────────────────────────────────────────
  heartBtn: { padding: 6 },

  // ── Add to cart / request quote ────────────────────────────────────
  addToCartButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentBg,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: colors.fillSecondary,
  },
  addToCartText: {
    ...T.buttonSmall,
    color: colors.accent,
  },
  addToCartTextDisabled: {
    color: colors.secondaryLabel,
  },
  requestQuoteButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: tint(colors.whatsapp),
    paddingVertical: 11,
    borderRadius: 12,
  },
  requestQuoteText: {
    ...T.buttonSmall,
    color: colors.whatsapp,
  },

  // ── Empty state ────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 40,
  },
  // Frame the illustration in a soft rounded white card so its white canvas
  // reads as an intentional tile on the grouped-gray background.
  // Gray unicorn blends into the grouped-gray background — no card frame.
  iconContainer: {
    marginBottom: 24,
  },
  emptyUniImage: {
    width: 240,
    height: 240,
  },
  emptyTitle: {
    ...T.sectionTitle,
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...T.body,
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  browseButton: {
    backgroundColor: colors.cta,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    ...shadow.cta(colors.cta),
  },
  browseButtonText: {
    ...T.button,
  },
  loginNudge: {
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginNudgeText: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    textAlign: 'center',
  },
  loginNudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loginNudgeButtonText: {
    ...T.button,
    color: colors.accent,
    fontSize: 15,
  },

  // ── RTL helpers ────────────────────────────────────────────────────
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textCenterRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});

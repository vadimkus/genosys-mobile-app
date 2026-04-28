import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct } from '../utils/productRules';
import { getPricingDisplay, hasServerPricing, formatAed } from '../utils/pricingDisplay';
import { computeProductBadges } from '../utils/badges';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName, getCategoryTranslationKey, normalizeCategoryCanonical } from '../utils/productLocalization';
import { createLogger } from '../utils/logger';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import AUTH_CONFIG from '../config/auth';

const log = createLogger('FavoritesScreen');

const EMPTY_UNI_IMAGE = 'https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Funi.png&w=512&q=75';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { addItem } = useCart();
  const { favorites, toggleFavorite, getFavoritesCount } = useFavorites();
  const [addingProducts, setAddingProducts] = useState(new Set());

  const handleProductPress = (product) => {
    haptics.lightTap();
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product) => {
    haptics.mediumTap();
    if (product.isPriceOnRequest) return; // price-on-request products cannot be added to cart
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

    if (product.status === 'out_of_stock' || product.stock === false) {
      Alert.alert(t('stock.outOfStock'), t('stock.outOfStockMessage'));
      return;
    }

    // Add to tracking set
    setAddingProducts(prev => new Set([...prev, product.id]));

    try {
      await addItem(product, 1, '', ''); // Add 1 quantity with no color/size variants
      log.debug('Added to bag from favorites', { productId: product?.id });
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => { haptics.lightTap(); router.back(); }}
            activeOpacity={0.7}
          >
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('favorites.title')}</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Image
              source={EMPTY_UNI_IMAGE}
              style={styles.emptyUniImage}
              contentFit="contain"
              accessibilityRole="image"
              accessible={false}
            />
            <Text style={styles.emptyTitle}>{t('favorites.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('favorites.emptySubtitle')}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => { haptics.lightTap(); router.back(); }}
            >
              <Text style={styles.browseButtonText}>{t('favorites.browseProducts')}</Text>
            </TouchableOpacity>
            {/* Login nudge for signed-out guests — favorites are stored
                per-device, so cross-device sync is a real incentive to
                sign in. Hidden once the user has an auth session. */}
            {!user ? (
              <View style={styles.loginNudge}>
                <Text style={styles.loginNudgeText}>{t('favorites.signInToSync')}</Text>
                <TouchableOpacity
                  onPress={() => { haptics.lightTap(); router.push('/auth/login'); }}
                  style={styles.loginNudgeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-in-outline" size={16} color="#dc2626" />
                  <Text style={styles.loginNudgeButtonText}>{t('favorites.signIn')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => { haptics.lightTap(); router.back(); }}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('favorites.title')}</Text>
          <View style={styles.headerRight}>
            <Ionicons name="heart" size={20} color="#dc2626" />
            <Text style={styles.countText}>({getFavoritesCount()})</Text>
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {favorites.map((product, index) => (
            <View
              key={`${product.id}-${index}`}
              style={[styles.gridCard, index % 2 === 0 ? styles.gridCardLeft : styles.gridCardRight]}
            >
              <TouchableOpacity 
                onPress={() => handleProductPress(product)}
                activeOpacity={0.95}
              >
                <View style={styles.gridImageContainer}>
                  {product.image ? (
                    <Image 
                      source={`${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`}
                      style={styles.gridImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={styles.gridImagePlaceholder}>
                      <Text style={styles.gridPlaceholderText}>
                        {(getLocalizedProductName(product, locale) || product.name || '').charAt(0) || 'G'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Heart Button - Always filled red in favorites */}
                  <TouchableOpacity 
                    style={styles.favoriteHeart}
                    onPress={() => handleRemoveFromFavorites(product)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="heart" 
                      size={20} 
                      color="#dc2626" 
                    />
                  </TouchableOpacity>
                  
                  {/* Badges */}
                  {(() => {
                    const badges = computeProductBadges(product, {
                      order: t('common.order'),
                      inStock: t('stock.inStock'),
                      new: t('common.new'),
                    });

                    if (!badges.length) return null;

                    return (
                      <View style={styles.badgeContainer}>
                        {badges.map((badge, badgeIndex) => (
                          <View
                            key={`${badge.text || 'badge'}-${badgeIndex}`}
                            style={[styles.badge, { backgroundColor: badge.color || '#007AFF' }]}
                          >
                            <Text style={styles.badgeText}>{badge.text}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })()}
                </View>
                
                <View style={styles.gridContent}>
                  <Text style={[styles.gridName, isRTL && styles.textRTL]} numberOfLines={2}>
                    {getLocalizedProductName(product, locale) || product.name}
                  </Text>
                  <Text style={[styles.gridCategory, isRTL && styles.textRTL]}>
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
                          <Text style={styles.loginToSeePriceText}>{t('product.loginToSeePrice')}</Text>
                        </View>
                      );
                    }

                    if (pricing.isPriceOnRequest) {
                      return (
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceOnRequestText}>{t('product.priceOnRequest')}</Text>
                        </View>
                      );
                    }

                    if (!contractPrice && (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product))) {
                      return (
                        <View style={styles.priceContainer}>
                          <Text style={styles.gridPrice}>{formatAed(getCanonicalUnitPrice(product))}</Text>
                          <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                        </View>
                      );
                    }

                    if (originalPrice && Number(originalPrice) > Number(displayPrice || 0)) {
                      return (
                        <View style={styles.priceContainer}>
                          <Text style={styles.originalPrice}>{formatAed(originalPrice)}</Text>
                          <Text style={styles.discountedPrice}>{formatAed(displayPrice)}</Text>
                          {pricing.discountLabel && (
                            <Text style={styles.savings}>{pricing.discountLabel}</Text>
                          )}
                          <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                        </View>
                      );
                    }

                    return (
                      <View style={styles.priceContainer}>
                        <Text style={styles.gridPrice}>{formatAed(displayPrice)}</Text>
                        <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                      </View>
                    );
                  })()}
                </View>
              </TouchableOpacity>
              
              {/* Add to Cart / Request Quote Button */}
              {product.isPriceOnRequest ? (
                <TouchableOpacity
                  style={styles.requestQuoteButton}
                  onPress={() => {
                    const productName = getLocalizedProductName(product, locale) || product.name || '';
                    const msg = encodeURIComponent(
                      t('product.requestQuoteMessage', { name: productName })
                    );
                    Linking.openURL(`https://wa.me/971585487665?text=${msg}`).catch(() => {});
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={styles.addToCartIcon} />
                  <Text style={styles.addToCartText}>
                    {t('product.requestQuote')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    (product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)) && styles.addToCartButtonDisabled
                  ]}
                  onPress={() => handleAddToCart(product)}
                  disabled={product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={addingProducts.has(product.id) ? "checkmark" : "bag-add"} 
                    size={16} 
                    color="#ffffff" 
                    style={styles.addToCartIcon}
                  />
                  <Text style={styles.addToCartText}>
                    {addingProducts.has(product.id) 
                      ? t('favorites.added')
                      : (product.status === 'out_of_stock' || product.stock === false) 
                        ? t('favorites.outOfStock')
                        : user 
                          ? t('favorites.addToBag')
                          : t('favorites.loginToBuy')
                    }
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        
        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    ...T.navTitle,
    fontSize: 18,
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    ...T.button,
    color: '#dc2626',
  },
  scrollView: {
    flex: 1,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyUniImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    ...T.pageTitle,
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...T.body,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    ...T.buttonLarge,
    fontSize: 17,
  },
  loginNudge: {
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginNudgeText: {
    ...T.bodySmall,
    color: '#8E8E93',
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
    ...T.buttonLarge,
    color: '#dc2626',
    fontSize: 15,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  gridCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: (SCREEN_WIDTH - 40) / 2,
  },
  gridCardLeft: {
    marginEnd: 8,
  },
  gridCardRight: {
    marginStart: 8,
  },
  gridImageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  gridImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#dc2626',
  },
  favoriteHeart: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    start: 8,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...T.badge,
    textTransform: 'uppercase',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    ...T.productName,
    marginBottom: 4,
    lineHeight: 18,
  },
  gridCategory: {
    ...T.productCategory,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  
  // Pricing
  priceContainer: {
    marginBottom: 12,
  },
  beautyBoxPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  beautyBoxDiscount: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridPrice: {
    ...T.price,
    marginBottom: 4,
  },
  originalPrice: {
    ...T.priceStrikethrough,
    fontSize: 12,
    color: '#86868B',
    marginBottom: 2,
  },
  discountedPrice: {
    ...T.priceDiscount,
    marginBottom: 2,
  },
  savings: {
    ...T.badge,
    color: '#27AE60',
    marginBottom: 2,
  },
  vatText: {
    fontSize: 9,
    color: '#86868B',
    fontStyle: 'italic',
  },
  
  // Add to Cart Button
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  requestQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  priceOnRequestText: {
    ...T.label,
    fontWeight: '700',
    color: '#25D366',
  },
  loginToSeePriceText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: '#86868B',
  },
  addToCartIcon: {
    marginEnd: 4,
  },
  addToCartText: {
    ...T.buttonSmall,
  },
  
  footer: {
    height: 100,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
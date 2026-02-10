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
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, isBeautyBoxProduct } from '../utils/productRules';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName, getCategoryTranslationKey, normalizeCategoryCanonical } from '../utils/productLocalization';
import { createLogger } from '../utils/logger';
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
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product) => {
    if (product.isPriceOnRequest) return; // price-on-request products cannot be added to cart
    if (!user) {
      Alert.alert(
        t('favorites.loginRequiredTitle'),
        t('favorites.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.login'), onPress: () => router.push('/auth/login') }
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
    toggleFavorite(product);
    log.debug('Removed from favorites', { productId: product?.id });
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#dc2626" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('favorites.title')}</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Image source={EMPTY_UNI_IMAGE} style={styles.emptyUniImage} contentFit="contain" />
            <Text style={styles.emptyTitle}>{t('favorites.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('favorites.emptySubtitle')}
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.back()}
            >
              <Text style={styles.browseButtonText}>{t('favorites.browseProducts')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#dc2626" />
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
                    const nameLower = (product?.name || '').trim().toLowerCase();
                    const isOutOfStock = product.status === 'out_of_stock' || product.stock === false;
                    const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
                    const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
                    const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
                    const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
                    const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
                    const isBeautyBox = isBeautyBoxProduct(product);

                    const baseBadges = (product.badges || []).filter((badge) => {
                      const text = (badge.text || '').toLowerCase().trim();
                      if (text === 'best seller' || text === 'limited edition' || text === '50% off') return false;
                      // Remove "Bundle Offer" badge from Beauty Boxes
                      if (isBeautyBox && text.includes('bundle') && text.includes('offer')) return false;
                      // Remove "Professional" badge from specific products
                      if (text === 'professional' && (isEyeZoneKit || isBioFermentMask)) return false;
                      // Keep "New" only for PDRN mask
                      if (text === 'new' && !(isPdrnMask || isBioFermentMask)) return false;
                      return true;
                    });

                    const computedBadges = [];
                    if (!isOutOfStock) {
                      if (isMesopeciaKit) {
                        computedBadges.push({ text: t('common.order'), color: '#FF9500', priority: 0 });
                      } else if (!isHolidayKit) {
                        computedBadges.push({ text: t('stock.inStock'), color: '#34C759', priority: 0 });
                      }
                    }

                    // Add "New" badge to Bio Ferment Mask even if backend doesn't send it
                    const hasNewBadge = baseBadges.some((b) => String(b?.text || '').toLowerCase().trim() === 'new');
                    if (isBioFermentMask && !hasNewBadge) {
                      computedBadges.push({ text: t('common.new'), color: '#007AFF', priority: 1 });
                    }

                    const badges = [...computedBadges, ...baseBadges]
                      .sort((a, b) => (a.priority || 10) - (b.priority || 10))
                      .slice(0, 2);

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
                  <Text style={styles.gridName} numberOfLines={2}>
                    {getLocalizedProductName(product, locale) || product.name}
                  </Text>
                  <Text style={styles.gridCategory}>
                    {(() => {
                      const canon = normalizeCategoryCanonical(product.category) || product.category;
                      const key = getCategoryTranslationKey(canon);
                      return key ? t(key) : canon;
                    })()}
                  </Text>
                  
                  {/* Pricing */}
                  {product.isPriceOnRequest ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceOnRequestText}>{t('product.priceOnRequest') || 'Price on Request'}</Text>
                    </View>
                  ) : (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product)) ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.gridPrice}>{getCanonicalUnitPrice(product).toFixed(2)} AED</Text>
                      <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                    </View>
                  ) : product.originalPrice && product.originalPrice !== (product.displayPrice || product.price) ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPrice}>{product.originalPrice} AED</Text>
                      <Text style={styles.discountedPrice}>{(product.displayPrice || product.price).toFixed(2)} AED</Text>
                      {product.discountLabel && (
                        <Text style={styles.savings}>{product.discountLabel}</Text>
                      )}
                      <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                    </View>
                  ) : (
                    <View style={styles.priceContainer}>
                      <Text style={styles.gridPrice}>{(product.displayPrice || product.price).toFixed(2)} AED</Text>
                      <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Add to Cart / Request Quote Button */}
              {product.isPriceOnRequest ? (
                <TouchableOpacity
                  style={styles.requestQuoteButton}
                  onPress={() => {
                    const productName = getLocalizedProductName(product, locale) || product.name || '';
                    const msg = encodeURIComponent(
                      (t('product.requestQuoteMessage') || "Hi, I'm interested in {name}. Could you please provide pricing information?").replace('{name}', productName)
                    );
                    Linking.openURL(`https://wa.me/971585487665?text=${msg}`);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={styles.addToCartIcon} />
                  <Text style={styles.addToCartText}>
                    {t('product.requestQuote') || 'Request Quote'}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
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
    marginRight: 8,
  },
  gridCardRight: {
    marginLeft: 8,
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
    right: 8,
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
    left: 8,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 18,
  },
  gridCategory: {
    fontSize: 12,
    color: '#86868B',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
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
  savings: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#25D366',
  },
  addToCartIcon: {
    marginRight: 4,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  footer: {
    height: 100,
  },
});
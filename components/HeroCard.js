import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask } from '../utils/productRules';
import { useLocalization } from '../contexts/LocalizationContext';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getCategoryTranslationKey,
} from '../utils/productLocalization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

export default function HeroCard({ product }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const isOutOfStock = product?.status === 'out_of_stock' || product?.stock === false;
  const nameLower = (product?.name || '').trim().toLowerCase();
  const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
  const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
  const shouldUseCanonical = hasFixedPriceOverride(product) || isHydroCoolMask(product);
  const displayPrice = shouldUseCanonical
    ? getCanonicalUnitPrice(product)
    : Number(product?.displayPrice ?? product?.price ?? 0) || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.content}>
        <Text
          style={[
            styles.category,
            isRTL && styles.textRTL,
            locale === 'ar' && styles.categoryAr,
          ]}
          numberOfLines={1}
        >
          {(() => {
            const key = getCategoryTranslationKey(product?.category);
            return key ? t(key) : product?.category;
          })()}
        </Text>
        <Text style={[styles.name, isRTL && styles.textRTL]} numberOfLines={2}>
          {getLocalizedProductName(product, locale) || product?.name}
        </Text>
        <Text style={[styles.description, isRTL && styles.textRTL]} numberOfLines={3}>
          {getLocalizedProductDescription(product, locale) || product?.localizedDescription || product?.description}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {displayPrice.toFixed(2)} AED
          </Text>
          {!isOutOfStock && !isHolidayKit && (
            isMesopeciaKit ? (
              <View style={styles.orderBadge}>
                <Text style={styles.orderText}>{t('common.order')}</Text>
              </View>
            ) : (
              <View style={styles.inStockBadge}>
                <Text style={styles.inStockText}>{t('stock.inStock')}</Text>
              </View>
            )
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
    marginEnd: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: '#6E6E73',
    lineHeight: 22,
    marginBottom: 16,
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  categoryAr: {
    // Avoid forced uppercase/letter spacing in Arabic.
    textTransform: 'none',
    letterSpacing: 0,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  inStockBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  inStockText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  orderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { isCushionBB } from '../utils/productRules';
import T from '../utils/typography';
import { colors } from '../utils/theme';

const parseMaybeJSON = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value.trim());
    } catch {
      return value;
    }
  }
  return value;
};

const getSingleSizeLabel = (product, t) => {
  // Cushion BB: force exact label requested for the size block.
  if (isCushionBB(product)) return t('variant.cushionBBSizeLabel');

  const obj = parseMaybeJSON(product?.productDetails);
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const direct = obj.size;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    // case-insensitive fallback
    for (const [k, v] of Object.entries(obj)) {
      if (String(k).toLowerCase().trim() === 'size') {
        const txt = String(v ?? '').trim();
        if (txt) return txt;
      }
    }
  }
  const fallback = String(product?.size ?? '').trim();
  return fallback || '';
};

export default function ProductVariantSelector({
  product,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
}) {
  const { user } = useAuth();
  const { t } = useLocalization();

  // Enhanced API provides complete variant data with calculated prices
  const availableSizes = (product.variants || []).filter((v) => v && v.size);
  const availableColors = product.colorVariants || [];
  const singleSizeLabel = getSingleSizeLabel(product, t);

  return (
    <View style={styles.container}>
      {/* Color Selection - Server determines if product has colors */}
      {availableColors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('variant.color')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            <View style={styles.colorOptions}>
              {availableColors.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  onPress={() => onColorChange(color.value)}
                  style={[
                    styles.colorOption,
                    selectedColor === color.value && styles.selectedColorOption
                  ]}
                >
                  {selectedColor === color.value && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={11} color={colors.white} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.hex || colors.white },
                      selectedColor === color.value && styles.selectedColorSwatch
                    ]}
                  />
                  <Text style={[
                    styles.colorLabel,
                    selectedColor === color.value && styles.selectedColorLabel
                  ]}>
                    {color.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('variant.size')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            <View style={styles.sizeOptions}>
              {availableSizes.map((variant, idx) => (
                <TouchableOpacity
                  key={`${variant.size}-${variant.id || idx}`}
                  onPress={() => onSizeChange(variant.size)}
                  style={[
                    styles.sizeOption,
                    selectedSize === variant.size && styles.selectedSizeOption,
                    !variant.available && styles.sizeOptionDisabled
                  ]}
                  disabled={!variant.available}
                >
                  {selectedSize === variant.size && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={11} color={colors.white} />
                    </View>
                  )}
                  <Text style={[
                    styles.sizeLabel,
                    selectedSize === variant.size && styles.selectedSizeLabel,
                    !variant.available && styles.sizeLabelDisabled
                  ]}>
                    {variant.size}
                  </Text>
                  {user && variant.price && (
                    <Text style={[
                      styles.sizePrice,
                      selectedSize === variant.size && styles.selectedSizePrice,
                      !variant.available && styles.sizePriceDisabled
                    ]}>
                      {variant.price.toFixed(2)} AED
                    </Text>
                  )}
                  {!variant.available && (
                    <Text style={styles.unavailableText}>{t('variant.unavailable')}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Single Size (no selectable size variants) */}
      {availableSizes.length === 0 && singleSizeLabel ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('variant.size')}</Text>
          <View style={styles.sizeOptions}>
            <View style={[styles.sizeOption, styles.singleSizeOption, styles.singleSizeStaticOption]}>
              <Text style={[styles.sizeLabel, styles.singleSizeStaticLabel]}>{singleSizeLabel}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...T.price,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  
  // Color Options
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2,
  },
  colorOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.separator,
    backgroundColor: colors.card,
    minWidth: 80,
  },
  selectedColorOption: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.separator,
  },
  selectedColorSwatch: {
    borderColor: colors.accent,
  },
  colorLabel: {
    ...T.captionSmall,
    fontWeight: '500',
    color: colors.mutedText,
    textAlign: 'center',
  },
  selectedColorLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  
  // Size Options
  sizeOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2,
  },
  singleSizeOption: {
    paddingHorizontal: 20,
  },
  singleSizeStaticOption: {
    // Keep it non-interactive but visually readable (black text, no "disabled" fade).
    borderColor: colors.separator,
    backgroundColor: colors.card,
  },
  // The chosen option wears a tick. A rose border and a blush fill are the
  // right colours but too quiet on their own - blush differs from white by
  // 1.16:1, so at a glance the selected chip looks like the others.
  checkBadge: {
    position: 'absolute',
    top: -6,
    end: -6,
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
    zIndex: 2,
  },
  sizeOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.separator,
    backgroundColor: colors.card,
    minWidth: 80,
  },
  selectedSizeOption: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  sizeLabel: {
    ...T.label,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  selectedSizeLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  sizePrice: {
    ...T.captionTiny,
    color: colors.mutedText,
    textAlign: 'center',
  },
  selectedSizePrice: {
    color: colors.accent,
    fontWeight: '500',
  },
  
  // Enhanced styles for availability states
  sizeOptionDisabled: {
    opacity: 0.5,
    borderColor: colors.separatorStrong,
  },
  sizeLabelDisabled: {
    color: colors.secondaryLabel,
  },
  singleSizeStaticLabel: {
    color: colors.label,
    fontWeight: '500',
  },
  sizePriceDisabled: {
    color: colors.secondaryLabel,
  },
  unavailableText: {
    ...T.badge,
    fontWeight: '500',
    color: colors.red,
    marginTop: 2,
  },
});
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { isCushionBB } from '../utils/productRules';

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

const getSingleSizeLabel = (product) => {
  // Cushion BB: force exact label requested for the size block.
  if (isCushionBB(product)) return '15g (includees replacement refill)';

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
  const singleSizeLabel = getSingleSizeLabel(product);

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
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.hex || '#FFFFFF' },
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
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
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
    minWidth: 80,
  },
  selectedColorOption: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  selectedColorSwatch: {
    borderColor: '#E74C3C',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  selectedColorLabel: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  
  // Size Options
  sizeOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2,
  },
  singleSizeOption: {
    paddingHorizontal: 18,
  },
  singleSizeStaticOption: {
    // Keep it non-interactive but visually readable (black text, no "disabled" fade).
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  sizeOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
    minWidth: 80,
  },
  selectedSizeOption: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 2,
  },
  selectedSizeLabel: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  sizePrice: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  selectedSizePrice: {
    color: '#E74C3C',
    fontWeight: '500',
  },
  
  // Enhanced styles for availability states
  sizeOptionDisabled: {
    opacity: 0.5,
    borderColor: '#D1D5DB',
  },
  sizeLabelDisabled: {
    color: '#9CA3AF',
  },
  singleSizeStaticLabel: {
    color: '#000000',
    fontWeight: '500',
  },
  sizePriceDisabled: {
    color: '#9CA3AF',
  },
  unavailableText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
});
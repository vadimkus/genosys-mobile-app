import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProductVariantSelector({
  product,
  selectedSize,
  selectedColor,
  availableSizes = [],
  availableColors = [],
  onSizeChange,
  onColorChange,
}) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Color Selection - Only for product ID 41 */}
      {product.id === '41' && availableColors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
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
          <Text style={styles.sectionTitle}>Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            <View style={styles.sizeOptions}>
              {availableSizes.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => onSizeChange(option.value)}
                  style={[
                    styles.sizeOption,
                    selectedSize === option.value && styles.selectedSizeOption
                  ]}
                >
                  <Text style={[
                    styles.sizeLabel,
                    selectedSize === option.value && styles.selectedSizeLabel
                  ]}>
                    {option.label}
                  </Text>
                  {user && (
                    <Text style={[
                      styles.sizePrice,
                      selectedSize === option.value && styles.selectedSizePrice
                    ]}>
                      {option.price} AED
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
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
});
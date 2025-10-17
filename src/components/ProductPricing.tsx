import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types';
import { PricingService } from '../services/pricingService';
import { useTheme } from '../contexts/ThemeContext';

interface ProductPricingProps {
  product: Product;
  onSizeChange?: (size: string) => void;
  onPriceChange?: (price: number) => void;
  style?: any;
  selectedSize?: string;
  currentPrice?: number;
  hideSizeSelection?: boolean;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  product,
  onSizeChange,
  onPriceChange,
  style,
  selectedSize: externalSelectedSize,
  currentPrice: externalCurrentPrice,
  hideSizeSelection = false,
}) => {
  const { theme } = useTheme();
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(product.price);
  
  // Use external values if provided, otherwise use internal state
  const displaySelectedSize = externalSelectedSize || selectedSize;
  const displayCurrentPrice = externalCurrentPrice || currentPrice;

  const availableSizes = PricingService.getAvailableSizes(product);
  const hasSizeVariants = PricingService.hasSizeVariants(product);

  useEffect(() => {
    if (!externalSelectedSize && !externalCurrentPrice) {
      if (hasSizeVariants && availableSizes.length > 0) {
        const defaultSize = availableSizes[0];
        setSelectedSize(defaultSize);
        const price = PricingService.getPriceForSize(product, defaultSize);
        setCurrentPrice(price);
        onSizeChange?.(defaultSize);
        onPriceChange?.(price);
      } else {
        setCurrentPrice(product.price);
        onPriceChange?.(product.price);
      }
    }
  }, [product, hasSizeVariants, availableSizes, onSizeChange, onPriceChange, externalSelectedSize, externalCurrentPrice]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const price = PricingService.getPriceForSize(product, size);
    setCurrentPrice(price);
    onSizeChange?.(size);
    onPriceChange?.(price);
  };

  if (!hasSizeVariants || hideSizeSelection) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.price, { color: '#DC2626' }]}>
          AED {displayCurrentPrice.toFixed(2)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Select Size
      </Text>
      <View style={styles.sizeContainer}>
        {availableSizes.map((size: string) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              selectedSize === size && styles.selectedSizeButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => handleSizeSelect(size)}
            accessibilityLabel={`Select size ${size}`}
            accessibilityRole='button'
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === size && styles.selectedSizeText,
                {
                  color: selectedSize === size ? '#ffffff' : theme.colors.text,
                },
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.price, { color: '#DC2626' }]}>
        AED {currentPrice.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sizeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSizeButton: {
    backgroundColor: '#3b82f6',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSizeText: {
    color: '#ffffff',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

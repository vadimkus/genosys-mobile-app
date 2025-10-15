import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { PricingService } from '../services/pricingService';

interface ProductActionsProps {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  currentPrice: number;
  style?: any;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  selectedSize,
  selectedColor,
  currentPrice,
  style,
}) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedSize && PricingService.hasSizeVariants(product)) {
      Alert.alert(
        'Please select a size',
        'You need to select a size before adding to cart.'
      );
      return;
    }

    setIsAddingToCart(true);

    try {
      addToCart(product, quantity, selectedColor, selectedSize);

      const variantInfo = [];
      if (selectedColor) variantInfo.push(`Color: ${selectedColor}`);
      if (selectedSize) variantInfo.push(`Size: ${selectedSize}`);
      const variantText = variantInfo.length > 0 ? ` (${variantInfo.join(', ')})` : '';

      Alert.alert(
        'Added to Cart',
        `${product.name}${variantText} has been added to your cart.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.quantityContainer}>
        <Text style={[styles.quantityLabel, { color: theme.colors.text }]}>
          Quantity:
        </Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={decrementQuantity}
            disabled={quantity <= 1}
            accessibilityLabel='Decrease quantity'
            accessibilityRole='button'
          >
            <Ionicons
              name='remove'
              size={20}
              color={
                quantity <= 1 ? theme.colors.text + '50' : theme.colors.primary
              }
            />
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: theme.colors.text }]}>
            {quantity}
          </Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={incrementQuantity}
            disabled={quantity >= 10}
            accessibilityLabel='Increase quantity'
            accessibilityRole='button'
          >
            <Ionicons
              name='add'
              size={20}
              color={
                quantity >= 10 ? theme.colors.text + '50' : theme.colors.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addToCartButton,
          { backgroundColor: theme.colors.primary },
          isAddingToCart && styles.disabledButton,
        ]}
        onPress={handleAddToCart}
        disabled={isAddingToCart}
        accessibilityLabel='Add to cart'
        accessibilityRole='button'
      >
        <Ionicons
          name='cart'
          size={20}
          color='#ffffff'
          style={styles.cartIcon}
        />
        <Text style={styles.addToCartText}>
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    borderWidth: 1,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

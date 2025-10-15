import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ProductHeaderProps {
  product: Product;
  onBackPress: () => void;
  style?: any;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  onBackPress,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel='Go back'
        accessibilityRole='button'
      >
        <Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
          Back
        </Text>
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={[styles.brand, { color: theme.colors.text }]}>
          {product.brand}
        </Text>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {product.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  productInfo: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

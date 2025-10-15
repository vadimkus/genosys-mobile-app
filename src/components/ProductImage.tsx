import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { Product } from '../types';
import { ImageService } from '../services/imageService';

const { width } = Dimensions.get('window');

interface ProductImageProps {
  product: Product;
  style?: any;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  style,
}) => {
  const imageUrl = ImageService.getProductImageUrl(product);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode='cover'
        accessibilityLabel={`${product.name} product image`}
        accessibilityRole='image'
        accessibilityHint='Product image'
      />
      {product.isOnSale && (
        <View
          style={styles.saleBadge}
          accessibilityLabel='On sale'
          accessibilityRole='text'
        >
          <Text style={styles.saleText}>SALE</Text>
        </View>
      )}
      {product.isNew && (
        <View
          style={styles.newBadge}
          accessibilityLabel='New product'
          accessibilityRole='text'
        >
          <Text style={styles.newText}>NEW</Text>
        </View>
      )}
      {/* In Stock Badge for all products */}
      {product.inStock !== false && (
        <View
          style={styles.inStockBadge}
          accessibilityLabel='In stock'
          accessibilityRole='text'
        >
          <Text style={styles.inStockText}>In Stock</Text>
        </View>
      )}
      
      {/* Out of Stock Badge */}
      {product.inStock === false && (
        <View
          style={styles.outOfStockBadge}
          accessibilityLabel='Out of stock'
          accessibilityRole='text'
        >
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: width - 32,
    height: width - 32,
    alignSelf: 'center',
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  saleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inStockText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

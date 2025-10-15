import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Product } from '../types';
import {
  ProductDetailsService,
  ProductDetail,
} from '../services/productDetailsService';
import { useTheme } from '../contexts/ThemeContext';

interface ProductDetailsProps {
  product: Product;
  style?: any;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  style,
}) => {
  const { theme } = useTheme();
  const details = ProductDetailsService.getProductDetails(product);

  const renderDetailItem = (detail: ProductDetail, index: number) => (
    <View key={index} style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
        {detail.label}:
      </Text>
      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
        {detail.value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Product Details
      </Text>
      {details.map(renderDetailItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 120,
  },
  detailValue: {
    flex: 1,
    flexWrap: 'wrap',
  },
});

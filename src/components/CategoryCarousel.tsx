import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Category } from '../types';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = width * 0.4;
const CATEGORY_SPACING = 12;

interface CategoryCarouselProps {
  categories: Category[];
  onCategoryPress: (categoryName: string) => void;
}


export default function CategoryCarousel({ categories, onCategoryPress }: CategoryCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const renderCategoryCard = (category: Category, index: number) => {
    return (
      <TouchableOpacity
        key={category.name}
        style={[
          styles.categoryCard,
          { marginLeft: index === 0 ? 0 : CATEGORY_SPACING }
        ]}
        onPress={() => onCategoryPress(category.name)}
      >
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {category.name}
          </Text>
          <Text style={styles.categoryCount}>
            {category.count} items
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (categories.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category</Text>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
      >
        {categories.map((category, index) => renderCategoryCard(category, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  carouselContainer: {
    paddingRight: 20,
  },
  categoryCard: {
    width: CATEGORY_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

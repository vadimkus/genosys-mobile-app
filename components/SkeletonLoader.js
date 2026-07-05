/**
 * SkeletonLoader - Shimmer placeholder for loading states
 * Replaces ActivityIndicator spinners with content-aware placeholders.
 * Provides preset layouts for common screens.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Single animated shimmer bar */
function ShimmerBar({ width = '100%', height = 16, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Product card skeleton for shop grid */
function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      {/* Square image tile — mirrors shop grid's square photo frame */}
      <ShimmerBar width="100%" height={(SCREEN_WIDTH - 36) / 2} borderRadius={12} />
      <View style={styles.productCardBody}>
        <ShimmerBar width="60%" height={10} />
        <ShimmerBar width="90%" height={14} style={{ marginTop: 8 }} />
        <ShimmerBar width="40%" height={14} style={{ marginTop: 8 }} />
        <ShimmerBar width="100%" height={36} borderRadius={10} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

/** Shop screen skeleton - categories + product grid */
export function ShopSkeleton() {
  return (
    <View style={styles.container}>
      {/* Category bar */}
      <View style={styles.categoryRow}>
        {[80, 100, 70, 90, 60].map((w, i) => (
          <ShimmerBar key={i} width={w} height={32} borderRadius={16} />
        ))}
      </View>
      {/* Product grid */}
      <View style={styles.productGrid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

/** Product detail skeleton */
export function ProductDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero image */}
      <ShimmerBar width="100%" height={240} borderRadius={0} />
      <View style={styles.detailBody}>
        <ShimmerBar width="30%" height={12} style={{ marginTop: 16 }} />
        <ShimmerBar width="80%" height={24} style={{ marginTop: 10 }} />
        <ShimmerBar width="45%" height={20} style={{ marginTop: 12 }} />
        {/* Specs */}
        <View style={{ marginTop: 24 }}>
          <ShimmerBar width="50%" height={18} />
          <View style={styles.specRow}>
            <ShimmerBar width="30%" height={14} />
            <ShimmerBar width="55%" height={14} />
          </View>
          <View style={styles.specRow}>
            <ShimmerBar width="25%" height={14} />
            <ShimmerBar width="65%" height={14} />
          </View>
          <View style={styles.specRow}>
            <ShimmerBar width="35%" height={14} />
            <ShimmerBar width="50%" height={14} />
          </View>
        </View>
        {/* Description */}
        <View style={{ marginTop: 24 }}>
          <ShimmerBar width="40%" height={18} />
          <ShimmerBar width="100%" height={60} borderRadius={12} style={{ marginTop: 10 }} />
        </View>
      </View>
    </View>
  );
}

/** Orders list skeleton — mirrors the Apple-native order card */
export function OrdersSkeleton() {
  return (
    <View style={styles.ordersContainer}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.orderCard}>
          <View style={styles.orderHeaderRow}>
            <ShimmerBar width={52} height={52} borderRadius={12} />
            <View style={{ flex: 1 }}>
              <ShimmerBar width="55%" height={15} />
              <ShimmerBar width="40%" height={11} style={{ marginTop: 7 }} />
            </View>
            <ShimmerBar width={72} height={22} borderRadius={11} />
          </View>
          <View style={styles.orderFooter}>
            <ShimmerBar width="35%" height={12} />
            <ShimmerBar width="28%" height={16} />
          </View>
          <ShimmerBar width="100%" height={44} borderRadius={14} style={{ marginTop: 14 }} />
        </View>
      ))}
    </View>
  );
}

export default ShimmerBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  bar: {
    backgroundColor: '#E5E7EB',
  },
  // Shop
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    overflow: 'hidden',
  },
  productCardBody: {
    padding: 10,
  },
  // Product detail
  detailBody: {
    paddingHorizontal: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  // Orders
  ordersContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 16,
  },
  orderCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

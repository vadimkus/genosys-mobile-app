import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  style?: any;
  borderRadius?: number;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width: customWidth = '100%',
  height = 20,
  style,
  borderRadius = 8,
  children,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.border],
  });

  if (children) {
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.skeleton,
            {
              width: customWidth,
              height,
              backgroundColor,
              borderRadius,
            } as any,
          ]}
        />
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: customWidth,
          height,
          backgroundColor,
          borderRadius,
        } as any,
        style,
      ]}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <SkeletonLoader width='100%' height={200} borderRadius={12} />
      <View style={styles.productInfo}>
        <SkeletonLoader width='80%' height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width='60%' height={14} style={{ marginBottom: 12 }} />
        <View style={styles.priceRow}>
          <SkeletonLoader width='40%' height={18} />
          <SkeletonLoader width='20%' height={14} />
        </View>
      </View>
    </View>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.profileContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <SkeletonLoader
          width={100}
          height={100}
          borderRadius={50}
          style={{ marginBottom: 16 }}
        />
        <SkeletonLoader width='70%' height={24} style={{ marginBottom: 8 }} />
        <SkeletonLoader width='50%' height={16} style={{ marginBottom: 20 }} />
        <View style={styles.statsRow}>
          <SkeletonLoader width='30%' height={40} />
          <SkeletonLoader width='30%' height={40} />
          <SkeletonLoader width='30%' height={40} />
        </View>
      </View>
    </View>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.listItem,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width='70%' height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width='50%' height={14} />
      </View>
      <SkeletonLoader width={20} height={20} borderRadius={10} />
    </View>
  );
};

// Text Skeleton (for paragraphs)
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={16}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

// Loading Overlay
export const LoadingOverlay: React.FC<{
  visible: boolean;
  message?: string;
}> = ({ visible, message = 'Loading...' }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View
        style={[styles.overlayContent, { backgroundColor: theme.colors.card }]}
      >
        <SkeletonLoader
          width={40}
          height={40}
          borderRadius={20}
          style={{ marginBottom: 16 }}
        />
        <SkeletonLoader width='60%' height={16} />
      </View>
    </View>
  );
};

// Enhanced Loading Button
export const LoadingButton: React.FC<{
  loading: boolean;
  onPress: () => void;
  title: string;
  style?: any;
  disabled?: boolean;
}> = ({ loading, onPress, title, style, disabled }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.buttonContainer, style]}>
      {loading ? (
        <SkeletonLoader width='100%' height={48} borderRadius={8} />
      ) : (
        <View
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          {/* This would be replaced with actual TouchableOpacity in real implementation */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  skeleton: {
    overflow: 'hidden',
  },
  productCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SkeletonLoader;

import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high'; // Kept for compatibility but not used
  cache?: 'immutable' | 'web' | 'memory'; // Kept for compatibility but not used
  fallbackSource?: { uri: string } | number;
  showLoadingIndicator?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  cache = 'immutable',
  fallbackSource,
  showLoadingIndicator = true,
  onLoadStart,
  onLoadEnd,
  onError,
  accessibilityLabel,
  accessibilityRole = 'image',
  accessibilityHint,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const getResizeMode = () => {
    switch (resizeMode) {
      case 'contain':
        return 'contain';
      case 'stretch':
        return 'stretch';
      case 'center':
        return 'center';
      default:
        return 'cover';
    }
  };

  const imageSource = error && fallbackSource ? fallbackSource : source;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={getResizeMode() as any}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole as any}
        accessibilityHint={accessibilityHint}
      />

      {loading && showLoadingIndicator && (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ActivityIndicator size='small' color={theme.colors.primary} />
        </View>
      )}

      {error && !fallbackSource && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            style={[styles.errorText, { color: theme.colors.textSecondary }]}
          >
            Failed to load image
          </Text>
        </View>
      )}
    </View>
  );
};

// Product Image Component with optimizations
export const ProductImage: React.FC<{
  product: any;
  style?: any;
  size?: 'small' | 'medium' | 'large';
}> = ({ product, style, size = 'medium' }) => {
  const { theme } = useTheme();

  const getImageSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 300, height: 300 };
      default:
        return { width: 200, height: 200 };
    }
  };

  const getPriority = (): 'low' | 'normal' | 'high' => {
    // Prioritize featured products and first few items
    if (product.isFeatured || product.isNew) return 'high';
    return 'normal';
  };

  const imageSize = getImageSize();

  return (
    <View style={[styles.productContainer, style]}>
      <OptimizedImage
        source={{ uri: product.image }}
        style={[styles.productImage, imageSize]}
        resizeMode='cover'
        priority={getPriority()}
        cache='immutable'
        fallbackSource={require('../../assets/icon.png')} // Fallback to app icon
        accessibilityLabel={`${product.name} product image`}
        accessibilityHint='Product image'
      />

      {product.isOnSale && (
        <View style={[styles.badge, styles.saleBadge]}>
          <Text style={styles.badgeText}>SALE</Text>
        </View>
      )}

      {product.isNew && (
        <View style={[styles.badge, styles.newBadge]}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
    </View>
  );
};

// Avatar Image Component
export const AvatarImage: React.FC<{
  source: { uri: string } | number;
  size?: number;
  style?: any;
}> = ({ source, size = 50, style }) => {
  return (
    <OptimizedImage
      source={source}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      resizeMode='cover'
      priority='normal'
      cache='memory'
      fallbackSource={require('../../assets/icon.png')}
      accessibilityLabel='User avatar'
      accessibilityRole='image'
    />
  );
};

// Background Image Component
export const BackgroundImage: React.FC<{
  source: { uri: string } | number;
  style?: any;
  children?: React.ReactNode;
}> = ({ source, style, children }) => {
  return (
    <View style={[styles.backgroundContainer, style]}>
      <OptimizedImage
        source={source}
        style={StyleSheet.absoluteFillObject}
        resizeMode='cover'
        priority='low'
        cache='web'
        showLoadingIndicator={false}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  productContainer: {
    position: 'relative',
  },
  productImage: {
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadge: {
    backgroundColor: '#ef4444',
  },
  newBadge: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  backgroundContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
});

export default OptimizedImage;

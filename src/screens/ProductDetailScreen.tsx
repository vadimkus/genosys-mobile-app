import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
}

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { productId } = route.params as { productId: string };
        
        // Fetch product from API
        const response = await fetch(`https://genosys.ae/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
        } else {
          // Fallback to mock data for demo
          const mockProduct: Product = {
            id: productId,
            name: 'Microneedle Roller',
            price: 230,
            description: 'Skin stimulator to promote collagen production and transdermal nutrient delivery. Professional microneedling device for effective skin regeneration. Manufactured in South Korea.',
            image: '/images/genosys-microneedling-devices.jpg',
            category: 'Microneedling',
            inStock: true,
          };
          setProduct(mockProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to mock data
        const mockProduct: Product = {
          id: route.params?.productId || '1',
          name: 'Microneedle Roller',
          price: 230,
          description: 'Skin stimulator to promote collagen production and transdermal nutrient delivery. Professional microneedling device for effective skin regeneration. Manufactured in South Korea.',
          image: '/images/genosys-microneedling-devices.jpg',
          category: 'Microneedling',
          inStock: true,
        };
        setProduct(mockProduct);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [route.params]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const getImageSource = () => {
    if (imageError || !product?.image) {
      return { uri: 'https://genosys.ae/images/genosys-logo.png' };
    }
    
    const imageUrl = product.image.startsWith('http') 
      ? product.image 
      : `https://genosys.ae${product.image}`;
    return { uri: imageUrl };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>AED {product.price}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            product.inStock ? styles.inStock : styles.outOfStock
          ]}>
            {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </Text>
        </View>

        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.productDescription}>{product.description}</Text>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !product.inStock && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Text style={[
            styles.addToCartText,
            !product.inStock && styles.disabledText
          ]}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>

        {isInCart(product.id) && (
          <Text style={styles.inCartText}>✅ This item is in your cart</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  stockContainer: {
    marginBottom: 20,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inStock: {
    color: '#10b981',
  },
  outOfStock: {
    color: '#ef4444',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
  },
  addToCartButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#999',
  },
  inCartText: {
    textAlign: 'center',
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
});

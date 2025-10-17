import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography } from '../../constants/typography';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const { theme } = useTheme();

  const handleRemoveItem = (uniqueId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${productName} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(uniqueId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleQuantityChange = (
    uniqueId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(uniqueId, newQuantity);
    } else {
      removeFromCart(uniqueId);
    }
  };

  if (items.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.centerContainer}>
              <Image
                source={require('../../../login/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                Cart
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Your cart is empty
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
          >
            Add some products to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.centerContainer}>
            <Image
              source={require('../../../login/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Cart
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {items.map(item => (
          <View key={item.uniqueId} style={styles.cartItem}>
            <View style={styles.leftSection}>
              <Image
                source={{ uri: item.product.imageUrl }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {item.product.name}
                  {item.selectedColor && ` - ${item.selectedColor}`}
                  {item.selectedSize && ` (${item.selectedSize})`}
                </Text>
                <Text style={styles.productBrand}>{item.product.brand}</Text>
                <Text style={styles.vatInfo}>Price includes 5% VAT</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.uniqueId, item.quantity, -1)
                  }
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.uniqueId, item.quantity, 1)
                  }
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.itemTotalPrice}>
                  AED {(item.product.price * item.quantity).toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    handleRemoveItem(item.uniqueId, item.product.name)
                  }
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal ({getTotalItems()} items)</Text>
            <Text style={styles.priceValue}>
              AED {(getTotalPrice() / 1.05).toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>VAT (5%)</Text>
            <Text style={styles.priceValue}>
              AED {(getTotalPrice() - getTotalPrice() / 1.05).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              AED {getTotalPrice().toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 95,
    height: 63,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
  },
  headerSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 22,
  },
  productBrand: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  vatInfo: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
  },
  checkoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

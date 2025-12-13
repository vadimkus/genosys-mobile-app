import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function BagScreen() {
  const { user } = useAuth();
  const { 
    items, 
    getTotalItems, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartSummary,
    selectedEmirate,
    setSelectedEmirate,
    getAvailableEmirates,
    isLoading
  } = useCart();
  
  const [showEmirateModal, setShowEmirateModal] = useState(false);

  const cartSummary = getCartSummary();
  const emirates = getAvailableEmirates();

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    updateQuantity(item.product.id, newQuantity, item.selectedColor, item.selectedSize);
  };

  const handleRemoveItem = (item) => {
    removeItem(item.product.id, item.selectedColor, item.selectedSize);
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart before checkout.');
      return;
    }

    // Navigate to checkout page
    router.push('/checkout');
  };

  const handleClearBag = () => {
    Alert.alert(
      'Clear Bag',
      'Remove all items from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const handleEmirateSelect = (emirate) => {
    setSelectedEmirate(emirate.name);
    setShowEmirateModal(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
                <Text style={styles.backText}>Home</Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Bag</Text>
                <Text style={styles.subtitle}>Loading...</Text>
              </View>
              
              <View style={styles.headerRight} />
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color="#D1D1D6" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
                <Text style={styles.backText}>Home</Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.title}>Bag</Text>
                <Text style={styles.subtitle}>Your selected products</Text>
              </View>
              
              <View style={styles.headerRight} />
            </View>
          </View>
        </SafeAreaView>
        
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="bag-outline" size={64} color="#D1D1D6" />
          </View>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyText}>
            When you add products, they'll appear here
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
              <Text style={styles.backText}>Home</Text>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Bag</Text>
              <Text style={styles.subtitle}>{cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'}</Text>
            </View>
            
            <TouchableOpacity onPress={handleClearBag}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      
      {/* Items List - Scrollable content with proper bottom padding */}
      <ScrollView 
        style={styles.itemsList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Emirates Selection */}
        <TouchableOpacity 
          style={styles.emirateSelector}
          onPress={() => setShowEmirateModal(true)}
        >
          <View style={styles.emirateSelectorContent}>
            <View style={styles.emirateIcon}>
              <Ionicons name="location-outline" size={20} color="#E74C3C" />
            </View>
            <View style={styles.emirateInfo}>
              <Text style={styles.emirateLabel}>Delivery to</Text>
              <Text style={styles.emirateValue}>{selectedEmirate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#86868B" />
          </View>
        </TouchableOpacity>

        {/* Free Shipping Banner */}
        {cartSummary.amountForFreeShipping > 0 && (
          <View style={styles.freeShippingBanner}>
            <Text style={styles.freeShippingText}>
              Add {cartSummary.amountForFreeShipping.toFixed(2)} AED more for FREE shipping!
            </Text>
          </View>
        )}

        {/* Cart Items */}
        {items.map((item, index) => {
          const itemKey = `${item.product.id}-${item.selectedColor}-${item.selectedSize}`;
          const imageUrl = item.product.image ? `https://genosys.ae${item.product.image}` : null;
          
          return (
            <View key={itemKey} style={styles.cartItem}>
              <TouchableOpacity 
                style={styles.itemImageContainer}
                onPress={() => router.push(`/product/${item.product.id}`)}
              >
                {imageUrl ? (
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.placeholderText}>
                      {item.product.name?.charAt(0) || 'G'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.itemDetails}>
                <TouchableOpacity onPress={() => router.push(`/product/${item.product.id}`)}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                </TouchableOpacity>
                <Text style={styles.itemCategory}>{item.product.category}</Text>
                
                {/* Variants Display */}
                {(item.selectedSize || item.selectedColor) && (
                  <View style={styles.variantsContainer}>
                    {item.selectedSize && (
                      <Text style={styles.variantText}>Size: {item.selectedSize}</Text>
                    )}
                    {item.selectedColor && (
                      <Text style={styles.variantText}>Color: {item.selectedColor}</Text>
                    )}
                  </View>
                )}

                {/* Price with Discount Display */}
                {item.product.hasDiscount ? (
                  <View style={styles.itemPriceContainer}>
                    <Text style={styles.itemOriginalPrice}>{item.product.originalPrice} AED</Text>
                    <Text style={styles.itemDiscountedPrice}>{item.product.displayPrice.toFixed(2)} AED</Text>
                  </View>
                ) : (
                  <Text style={styles.itemPrice}>{item.product.displayPrice?.toFixed(2) || item.product.price} AED</Text>
                )}

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(item, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#D1D1D6" : "#1D1D1F"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item, 1)}
                  >
                    <Ionicons name="add" size={16} color="#1D1D1F" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>

      {/* Checkout Footer - Fixed at bottom */}
      <View style={styles.checkoutFooter}>
        <SafeAreaView edges={['bottom']}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{cartSummary.subtotal.toFixed(2)} AED</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping to {selectedEmirate}</Text>
            <Text style={[styles.summaryValue, cartSummary.hasFreeShipping && styles.freeText]}>
              {cartSummary.hasFreeShipping ? 'FREE' : `${cartSummary.shippingCost.toFixed(2)} AED`}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (5%)</Text>
            <Text style={styles.summaryValue}>{cartSummary.vatAmount.toFixed(2)} AED</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total ({cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'})</Text>
            <Text style={styles.totalAmount}>{cartSummary.total.toFixed(2)} AED</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Emirates Selection Modal */}
      <Modal
        visible={showEmirateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Emirate</Text>
            <TouchableOpacity 
              onPress={() => setShowEmirateModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1D1D1F" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={emirates}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.emirateOption,
                  selectedEmirate === item.name && styles.selectedEmirateOption
                ]}
                onPress={() => handleEmirateSelect(item)}
              >
                <View style={styles.emirateOptionContent}>
                  <Text style={[
                    styles.emirateOptionName,
                    selectedEmirate === item.name && styles.selectedEmirateText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.emirateShippingCost}>
                    {item.shippingCost === 0 ? 'FREE shipping' : `${item.shippingCost} AED shipping`}
                  </Text>
                </View>
                {selectedEmirate === item.name && (
                  <Ionicons name="checkmark" size={20} color="#E74C3C" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 8,
    flex: 1,
  },
  backText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '400',
    marginLeft: 4,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '400',
    textAlign: 'center',
  },
  clearText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  // Layout Sections
  itemsList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 200, // Space for checkout footer (no tab bar now)
  },
  
  // Emirates Selection
  emirateSelector: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emirateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emirateIcon: {
    marginRight: 12,
  },
  emirateInfo: {
    flex: 1,
  },
  emirateLabel: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 2,
  },
  emirateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  // Free Shipping Banner
  freeShippingBanner: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  freeShippingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E74C3C',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  
  // Variants Display
  variantsContainer: {
    marginBottom: 8,
  },
  variantText: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 2,
  },
  
  // Enhanced Price Display
  itemPriceContainer: {
    marginBottom: 12,
  },
  itemOriginalPrice: {
    fontSize: 14,
    color: '#86868B',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemDiscountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  
  // Enhanced Summary
  summaryContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  freeText: {
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  checkoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Emirates Selection Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  modalCloseButton: {
    padding: 4,
  },
  emirateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedEmirateOption: {
    backgroundColor: '#E74C3C10',
  },
  emirateOptionContent: {
    flex: 1,
  },
  emirateOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  selectedEmirateText: {
    color: '#E74C3C',
  },
  emirateShippingCost: {
    fontSize: 14,
    color: '#86868B',
  },
});

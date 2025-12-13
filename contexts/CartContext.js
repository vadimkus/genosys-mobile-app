import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveOrder } from '../services/databaseService';
import { useAuth } from './AuthContext';
import { calculateCartTotals, UAE_EMIRATES } from '../utils/pricingUtils';

const CartContext = createContext();

const CART_STORAGE_KEY = 'genosys_cart';
const EMIRATE_STORAGE_KEY = 'genosys_selected_emirate';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedEmirate, setSelectedEmirateState] = useState('Dubai');
  const [isLoading, setIsLoading] = useState(true);

  // Load cart and emirate from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage();
    }
  }, [items, isLoading]);

  // Save emirate to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveEmirateToStorage();
    }
  }, [selectedEmirate, isLoading]);

  const loadCartFromStorage = async () => {
    try {
      const [cartData, emirateData] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(EMIRATE_STORAGE_KEY)
      ]);

      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setItems(parsedCart || []);
      }

      if (emirateData) {
        setSelectedEmirateState(emirateData);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const saveEmirateToStorage = async () => {
    try {
      await AsyncStorage.setItem(EMIRATE_STORAGE_KEY, selectedEmirate);
    } catch (error) {
      console.error('Error saving emirate to storage:', error);
    }
  };

  /**
   * Add item to cart with variant support
   */
  const addItem = (product, quantity = 1, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    const existingItemIndex = items.findIndex(item => 
      item.product.id === product.id && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      setItems(newItems);
    } else {
      // Add new item
      const newItem = {
        product,
        quantity,
        selectedColor: normalizedColor,
        selectedSize: normalizedSize,
        addedAt: new Date().toISOString()
      };
      setItems(prev => [...prev, newItem]);
    }

    console.log(`➕ Added ${quantity}x ${product.name} to cart`);
  };

  /**
   * Remove item from cart
   */
  const removeItem = (productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    setItems(prev => prev.filter(item => 
      !(item.product.id === productId && 
        item.selectedColor === normalizedColor && 
        item.selectedSize === normalizedSize)
    ));

    console.log(`➖ Removed product ${productId} from cart`);
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (productId, quantity, selectedColor = '', selectedSize = '') => {
    if (quantity <= 0) {
      removeItem(productId, selectedColor, selectedSize);
      return;
    }

    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    setItems(prev => prev.map(item =>
      item.product.id === productId && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize
        ? { ...item, quantity }
        : item
    ));

    console.log(`🔄 Updated product ${productId} quantity to ${quantity}`);
  };

  /**
   * Update item color variant
   */
  const updateColor = (productId, newColor, oldColor = '', selectedSize = '') => {
    const normalizedOldColor = oldColor || '';
    const normalizedSize = selectedSize || '';
    const normalizedNewColor = newColor || '';
    
    // Find the item to update
    const itemToUpdate = items.find(item =>
      item.product.id === productId && 
      item.selectedColor === normalizedOldColor && 
      item.selectedSize === normalizedSize
    );
    
    if (itemToUpdate) {
      // Check if an item with the new color already exists
      const existingItemWithNewColor = items.find(item =>
        item.product.id === productId && 
        item.selectedColor === normalizedNewColor && 
        item.selectedSize === normalizedSize &&
        item !== itemToUpdate
      );
      
      if (existingItemWithNewColor) {
        // Merge quantities and remove the old item
        const updatedItems = items
          .map(item =>
            item.product.id === productId && 
            item.selectedColor === normalizedNewColor && 
            item.selectedSize === normalizedSize &&
            item !== itemToUpdate
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
              : item
          )
          .filter(item => item !== itemToUpdate);
        
        setItems(updatedItems);
      } else {
        // Just update the color
        setItems(prev => prev.map(item =>
          item === itemToUpdate
            ? { ...item, selectedColor: normalizedNewColor }
            : item
        ));
      }
    }

    console.log(`🎨 Updated product ${productId} color from ${oldColor} to ${newColor}`);
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setItems([]);
    console.log('🗑️ Cart cleared');
  };

  // Save order to database
  const saveOrderToDatabase = async (orderData, userToken) => {
    try {
      console.log('💾 Saving order to database:', orderData);
      
      // Generate order number if not provided
      const orderNumber = orderData.orderNumber || `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const orderToSave = {
        orderNumber,
        status: 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: 'pending',
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        deliveryAddressId: orderData.deliveryAddressId,
        shippingAddress: orderData.shippingAddress,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost || 0,
        vatAmount: orderData.vatAmount || 0,
        discountAmount: orderData.discountAmount || 0,
        totalAmount: orderData.totalAmount,
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          discount: item.product.discount || 0,
        }))
      };
      
      const result = await saveOrder(userToken, orderToSave);
      
      if (result.success) {
        console.log('✅ Order saved successfully:', result.data);
        // Clear cart after successful order
        clearCart();
        return { success: true, order: result.data, orderNumber };
      } else {
        console.error('❌ Failed to save order:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Save order error:', error);
      return { success: false, error: 'Failed to save order' };
    }
  };

  /**
   * Get total number of items in cart
   */
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Check if a specific product is in cart
   */
  const isInCart = (productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    return items.some(item => 
      item.product.id === productId && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize
    );
  };

  /**
   * Get quantity of a specific item in cart
   */
  const getItemQuantity = (productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    const item = items.find(item => 
      item.product.id === productId && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize
    );
    
    return item ? item.quantity : 0;
  };

  /**
   * Set selected emirate
   */
  const setSelectedEmirate = (emirate) => {
    const validEmirate = UAE_EMIRATES.find(e => e.name === emirate);
    if (validEmirate) {
      setSelectedEmirateState(emirate);
      console.log(`📍 Selected emirate: ${emirate}`);
    } else {
      console.error(`Invalid emirate: ${emirate}`);
    }
  };

  /**
   * Get cart totals with VAT, shipping, and discounts
   */
  const getCartTotals = () => {
    return calculateCartTotals(items, user, selectedEmirate);
  };

  /**
   * Get cart summary for display
   */
  const getCartSummary = () => {
    const totals = getCartTotals();
    const itemCount = getTotalItems();
    
    return {
      itemCount,
      subtotal: totals.subtotal,
      shippingCost: totals.shippingCost,
      vatAmount: totals.vatAmount,
      total: totals.total,
      freeShippingThreshold: totals.freeShippingThreshold,
      amountForFreeShipping: totals.amountForFreeShipping,
      hasFreeShipping: totals.shippingCost === 0
    };
  };

  /**
   * Get available emirates for shipping
   */
  const getAvailableEmirates = () => {
    return UAE_EMIRATES;
  };

  const value = {
    // State
    items,
    selectedEmirate,
    isLoading,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    updateColor,
    clearCart,
    setSelectedEmirate,
    saveOrderToDatabase,
    
    // Getters
    getTotalItems,
    isInCart,
    getItemQuantity,
    getCartTotals,
    getCartSummary,
    getAvailableEmirates,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
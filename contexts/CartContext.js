import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveOrder } from '../services/databaseService';
import { useAuth } from './AuthContext';
import { calculateCartTotals, UAE_EMIRATES } from '../utils/cartUtils';
import { fetchShippingRates } from '../services/api';
import { hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, getCanonicalUnitPrice } from '../utils/productRules';
import { createLogger } from '../utils/logger';

const log = createLogger('Cart');

const CartContext = createContext();

const CART_STORAGE_KEY = 'genosys_cart';
const EMIRATE_STORAGE_KEY = 'genosys_selected_emirate';
const SHIPPING_RATES_STORAGE_KEY = 'genosys_shipping_rates';

// Free mask promotion config:
// - Spend >= 500 AED: 1 free collagen mask
// - Spend >= 700 AED: 2 free masks (sea algae + collagen)
const PROMO_VARIANT_SIZE = '__PROMO__';
const PROMO_PRODUCTS = {
  collagen: {
    id: 'cmgj9ifoi00008o07p4eqmfb7',
    name: 'INTENSIVE REPAIR COLLAGEN MASK',
    image: '/images/in.png',
    originalPrice: 36,
    size: '1 Sheet (23g)',
  },
  seaAlgae: {
    id: '36',
    name: 'SOOTHING BOMB SEA ALGAE MASK',
    image: '/images/SEA.jpg',
    originalPrice: 36,
    size: '1 sheet (23g)',
  },
};
const PROMO_THRESHOLDS = {
  collagen: 500,
  twoMasks: 700,
};

const isPromotionItem = (item) => item?.isPromotionItem === true || item?.selectedSize === PROMO_VARIANT_SIZE;

const inferOriginalFromUserDiscount = ({ discountedPrice, discountPct }) => {
  const pct = Number(discountPct);
  const base = Number(discountedPrice);
  if (!Number.isFinite(base) || base <= 0) return null;
  if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
  const multiplier = 1 - pct / 100;
  if (!Number.isFinite(multiplier) || multiplier <= 0) return null;
  const inferred = base / multiplier;
  return Number.isFinite(inferred) && inferred > base ? inferred : null;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedEmirate, setSelectedEmirateState] = useState('Dubai');
  const [isLoading, setIsLoading] = useState(true);
  const [shippingRates, setShippingRates] = useState(null);
  const [emirates, setEmirates] = useState(UAE_EMIRATES);
  const shippingRatesFetchRef = useRef({ inFlight: null, lastAt: 0 });

  // Load cart and emirate from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Load shipping rates from API (DB-driven), fallback to storage/hardcoded
  useEffect(() => {
    loadShippingRates();
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

  // Auto-apply Free Mask Promotion based on cart subtotal (excludes existing promo items).
  // This keeps promo items visible in Bag + included in checkout payload, while not affecting pricing totals.
  useEffect(() => {
    if (isLoading) return;

    const nonPromoItems = items.filter((it) => !isPromotionItem(it));
    const totals = calculateCartTotals(nonPromoItems, user, selectedEmirate, {
      emirates,
      freeShippingThreshold: shippingRates?.freeShippingThreshold,
      vatRate: shippingRates?.vatRate,
    });
    const subtotal = Number(totals?.subtotal) || 0;

    const desiredKeys = [];
    if (subtotal >= PROMO_THRESHOLDS.twoMasks) {
      desiredKeys.push('collagen', 'seaAlgae');
    } else if (subtotal >= PROMO_THRESHOLDS.collagen) {
      desiredKeys.push('collagen');
    }

    setItems((prev) => {
      const prevNonPromo = prev.filter((it) => !isPromotionItem(it));
      const prevPromo = prev.filter((it) => isPromotionItem(it));

      const currentKeys = new Set(
        prevPromo
          .map((it) => String(it?.promotionKey || '').trim())
          .filter(Boolean)
      );

      const wantKeys = new Set(desiredKeys);

      // Remove promos that should no longer exist
      const keptPromo = prevPromo.filter((it) => {
        const k = String(it?.promotionKey || '').trim();
        return k && wantKeys.has(k);
      });

      // Add missing promos
      const toAdd = [];
      for (const key of desiredKeys) {
        if (currentKeys.has(key)) continue;
        const p = PROMO_PRODUCTS[key];
        if (!p?.id) continue;
        toAdd.push({
          product: {
            id: p.id,
            name: p.name,
            category: 'Promotion',
            image: p.image || null,
            size: p.size || null,
            price: 0,
            displayPrice: 0,
            originalPrice: Number(p.originalPrice) || null,
            discountLabel: '100% OFF',
          },
          quantity: 1,
          selectedColor: '',
          selectedSize: PROMO_VARIANT_SIZE,
          addedAt: new Date().toISOString(),
          isPromotionItem: true,
          promotionKey: key,
        });
      }

      const next = [...prevNonPromo, ...keptPromo, ...toAdd];

      // Avoid state churn if nothing changed
      if (next.length === prev.length) {
        let same = true;
        for (let i = 0; i < next.length; i++) {
          const a = next[i];
          const b = prev[i];
          if (
            a?.product?.id !== b?.product?.id ||
            a?.quantity !== b?.quantity ||
            a?.selectedSize !== b?.selectedSize ||
            a?.selectedColor !== b?.selectedColor ||
            a?.isPromotionItem !== b?.isPromotionItem
          ) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }

      return next;
    });
  }, [items, user, selectedEmirate, emirates, shippingRates, isLoading]);

  const loadCartFromStorage = async () => {
    try {
      const [cartData, emirateData, shippingRatesData] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(EMIRATE_STORAGE_KEY),
        AsyncStorage.getItem(SHIPPING_RATES_STORAGE_KEY),
      ]);

      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Normalize any previously-saved variant items so their stored unit price matches the selected size.
        const normalized = (Array.isArray(parsedCart) ? parsedCart : []).map((it) => {
          const selectedSize = String(it?.selectedSize || '').trim();
          const product = it?.product;
          if (!selectedSize || !product || !Array.isArray(product?.variants)) return it;
          const v = product.variants.find((vv) => String(vv?.size || '').trim() === selectedSize);
          const vp = Number(v?.price);
          if (!Number.isFinite(vp) || vp <= 0) return it;
          const discountPct = Number(user?.discountPercentage);
          const inferredOriginal = inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct });
          const variantOriginal = Number(v?.originalPrice);
          const productOriginal = Number(product?.originalPrice);
          const keptOriginal =
            (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
            (Number.isFinite(productOriginal) && productOriginal > vp ? productOriginal : null) ||
            inferredOriginal ||
            null;
          return {
            ...it,
            product: {
              ...product,
              price: vp,
              displayPrice: vp,
              // Prefer variant originalPrice; otherwise keep product originalPrice if it still makes sense for this size.
              // If neither exists but user has a discount, infer original so Bag doesn't "double-discount" the already-discounted price.
              originalPrice: keptOriginal,
            },
          };
        });
        setItems(normalized);
      }

      if (emirateData) {
        setSelectedEmirateState(emirateData);
      }

      if (shippingRatesData) {
        const parsed = JSON.parse(shippingRatesData);
        if (parsed?.emirates && Array.isArray(parsed.emirates)) {
          setShippingRates(parsed);
          setEmirates(parsed.emirates);
        }
      }
    } catch (error) {
      log.error('Error loading cart from storage', error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShippingRates = async () => {
    try {
      const now = Date.now();
      // Collapse rapid repeated calls (dev StrictMode / multiple screens mounting).
      // If we fetched very recently, skip.
      if (shippingRatesFetchRef.current.lastAt && now - shippingRatesFetchRef.current.lastAt < 10_000) {
        return;
      }
      // If a request is in-flight, reuse it.
      if (shippingRatesFetchRef.current.inFlight) {
        await shippingRatesFetchRef.current.inFlight;
        return;
      }

      shippingRatesFetchRef.current.inFlight = (async () => {
        const rates = await fetchShippingRates();
        setShippingRates(rates);
        if (Array.isArray(rates.emirates) && rates.emirates.length) {
          setEmirates(rates.emirates);
        }
        await AsyncStorage.setItem(SHIPPING_RATES_STORAGE_KEY, JSON.stringify(rates));
        log.debug('Shipping rates loaded', { source: rates?._source || 'unknown' });
        shippingRatesFetchRef.current.lastAt = Date.now();
      })();

      await shippingRatesFetchRef.current.inFlight;
      shippingRatesFetchRef.current.inFlight = null;
    } catch (error) {
      shippingRatesFetchRef.current.inFlight = null;
      log.warn('Could not load shipping rates from API, using fallback', error?.message || error);
      // keep whatever we have from storage or hardcoded
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      log.error('Error saving cart to storage', error?.message || error);
    }
  };

  const saveEmirateToStorage = async () => {
    try {
      await AsyncStorage.setItem(EMIRATE_STORAGE_KEY, selectedEmirate);
    } catch (error) {
      log.error('Error saving emirate to storage', error?.message || error);
    }
  };

  /**
   * Add item to cart with variant support
   */
  const addItem = (product, quantity = 1, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';

    // Ensure special products are stored in cart with canonical pricing fields
    // (so UI + order payloads stay consistent).
    const normalizedProduct = (() => {
      // If a size variant is selected and the product includes variant pricing, store the selected variant price
      // as the product unit price in the cart item.
      if (normalizedSize && Array.isArray(product?.variants) && product.variants.length > 0) {
        const v = product.variants.find((vv) => String(vv?.size || '').trim() === String(normalizedSize).trim());
        const vp = Number(v?.price);
        if (Number.isFinite(vp) && vp > 0) {
          const discountPct = Number(user?.discountPercentage);
          const inferredOriginal = inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct });
          const variantOriginal = Number(v?.originalPrice);
          const productOriginal = Number(product?.originalPrice);
          const keptOriginal =
            (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
            (Number.isFinite(productOriginal) && productOriginal > vp ? productOriginal : null) ||
            inferredOriginal ||
            null;
          return {
            ...product,
            price: vp,
            displayPrice: vp,
            // Prefer variant originalPrice; otherwise keep product originalPrice if it still makes sense for this size.
            // If neither exists but user has a discount, infer original so Bag doesn't "double-discount" the already-discounted price.
            originalPrice: keptOriginal,
          };
        }
      }

      const needsCanonical = isHydroCoolMask(product) || isDeviceProduct(product) || hasFixedPriceOverride(product);
      if (!needsCanonical) return product;
      const base = getCanonicalUnitPrice(product);
      return {
        ...product,
        price: base,
        displayPrice: base,
        // Remove discount-looking fields to avoid strikethrough/discount UI in cart screens
        originalPrice: null,
        discountLabel: null,
      };
    })();
    
    const existingItemIndex = items.findIndex(item => 
      item.product.id === normalizedProduct.id && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize &&
      !isPromotionItem(item)
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      setItems(newItems);
    } else {
      // Add new item
      const newItem = {
        product: normalizedProduct,
        quantity,
        selectedColor: normalizedColor,
        selectedSize: normalizedSize,
        addedAt: new Date().toISOString()
      };
      setItems(prev => [...prev, newItem]);
    }

    log.debug('Added to cart', { productId: normalizedProduct?.id, quantity });
  };

  /**
   * Remove item from cart
   */
  const removeItem = (productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    setItems(prev => prev.filter(item => {
      // Never remove promotion items via this method
      if (isPromotionItem(item)) return true;
      return !(
        item.product.id === productId && 
        item.selectedColor === normalizedColor && 
        item.selectedSize === normalizedSize
      );
    }));

    log.debug('Removed from cart', { productId });
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
        ? (isPromotionItem(item) ? item : { ...item, quantity })
        : item
    ));

    log.debug('Updated quantity', { productId, quantity });
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

    log.debug('Updated color', { productId, oldColor, newColor });
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setItems([]);
    log.debug('Cart cleared');
  };

  // Save order to database
  const saveOrderToDatabase = async (orderData, userToken) => {
    try {
      log.debug('Saving order to database');
      
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
          price: (() => {
            const selectedSize = String(item?.selectedSize || '').trim();
            const v = selectedSize && Array.isArray(item?.product?.variants)
              ? item.product.variants.find((vv) => String(vv?.size || '').trim() === selectedSize)
              : null;
            const vp = Number(v?.price);
            if (Number.isFinite(vp) && vp > 0) return vp;
            return item.product.price;
          })(),
          quantity: item.quantity,
          image: item.product.image,
          selectedColor: item.selectedColor || null,
          selectedSize: isPromotionItem(item) ? null : (item.selectedSize || null),
          discount: item.product.discount || 0,
          isPromotionItem: isPromotionItem(item),
          promotionKey: item.promotionKey || null,
        }))
      };
      
      const result = await saveOrder(userToken, orderToSave);
      
      if (result.success) {
        log.debug('Order saved successfully');
        // Clear cart after successful order
        clearCart();
        return { success: true, order: result.data, orderNumber };
      } else {
        log.error('Failed to save order', result?.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      log.error('Save order error', error?.message || error);
      return { success: false, error: 'Failed to save order' };
    }
  };

  /**
   * Get total number of items in cart
   */
  const getTotalItems = () => {
    // Do not count promotion items towards the "Bag: X items" header.
    return items.filter((it) => !isPromotionItem(it)).reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Check if a specific product is in cart
   */
  const isInCart = (productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    
    return items.some(item => 
      !isPromotionItem(item) &&
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
      !isPromotionItem(item) &&
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
    const list = emirates?.length ? emirates : UAE_EMIRATES;
    const targetKey = String(emirate || '').trim().toLowerCase();
    const validEmirate = list.find(e => String(e.name || '').trim().toLowerCase() === targetKey);
    if (validEmirate) {
      // store the canonical emirate name from the rates list
      setSelectedEmirateState(validEmirate.name);
      log.debug('Selected emirate', { emirate: validEmirate.name });
    } else {
      log.error('Invalid emirate', String(emirate));
    }
  };

  /**
   * Get cart totals with VAT, shipping, and discounts
   */
  const getCartTotals = () => {
    return calculateCartTotals(items, user, selectedEmirate, {
      emirates,
      freeShippingThreshold: shippingRates?.freeShippingThreshold,
      vatRate: shippingRates?.vatRate,
    });
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
      shippingCost: totals.shippingCost ?? totals.shipping ?? 0,
      vatAmount: totals.vatAmount,
      total: totals.total,
      freeShippingThreshold: totals.freeShippingThreshold,
      amountForFreeShipping: totals.amountForFreeShipping,
      hasFreeShipping: (totals.shippingCost ?? totals.shipping ?? 0) === 0
    };
  };

  /**
   * Get available emirates for shipping
   */
  const getAvailableEmirates = () => {
    return emirates?.length ? emirates : UAE_EMIRATES;
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

    // Shipping rates (DB-driven)
    shippingRates,
    reloadShippingRates: loadShippingRates,
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
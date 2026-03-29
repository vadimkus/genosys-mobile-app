import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const pickDefaultVariantSize = (product) => {
  const variants = product?.variants;
  if (!Array.isArray(variants) || variants.length === 0) return '';
  const v =
    variants.find((x) => x?.isDefault) ||
    variants.find((x) => x?.available) ||
    variants[0];
  return String(v?.size || '').trim();
};

const normalizeSizeKey = (product, selectedSize) => {
  const s = String(selectedSize || '').trim();
  if (s) return s;
  return pickDefaultVariantSize(product) || '';
};

const hasServerDiscount = (variantOriginal, variantPrice, variants, product) => {
  if (Number.isFinite(variantOriginal) && variantOriginal > variantPrice) return true;
  if (Array.isArray(variants) && variants.some(v => {
    const vo = Number(v?.originalPrice);
    return Number.isFinite(vo) && vo > Number(v?.price);
  })) return true;
  if (product?.discountLabel) return true;
  return false;
};

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

  // Re-normalize cart pricing when user context changes (e.g., login provides discountPercentage)
  const userIdRef = useRef(user?.id);
  useEffect(() => {
    if (isLoading || !user?.id || user.id === userIdRef.current) return;
    userIdRef.current = user.id;
    setItems(prev => prev.map(it => {
      if (!it?.product || isPromotionItem(it)) return it;
      const product = it.product;
      const selectedSize = String(it?.selectedSize || '').trim();
      if (!selectedSize || !Array.isArray(product?.variants)) return it;
      const v = product.variants.find(vv => String(vv?.size || '').trim() === selectedSize);
      const vp = Number(v?.price);
      if (!Number.isFinite(vp) || vp <= 0) return it;
      const variantOriginal = Number(v?.originalPrice);
      const serverConfirmed = hasServerDiscount(variantOriginal, vp, product.variants, product);
      const discountPct = Number(user?.discountPercentage);
      const inferredOriginal = serverConfirmed
        ? inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct })
        : null;
      const keptOriginal =
        (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
        inferredOriginal ||
        null;
      return { ...it, product: { ...product, price: vp, displayPrice: vp, originalPrice: keptOriginal } };
    }));
    bumpPromoTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoading]);

  // Auto-apply Free Mask Promotion based on cart subtotal (excludes existing promo items).
  // Uses itemsRef to read current items without listing `items` as a dep (which would
  // cause a re-trigger every time setItems runs, risking an infinite loop).
  // Instead, the effect re-runs when external factors change (user, emirate, rates).
  // Cart mutations (add/remove/qty) also trigger it via a lightweight counter.
  const [promoTick, setPromoTick] = useState(0);
  const bumpPromoTick = useCallback(() => setPromoTick((n) => n + 1), []);

  useEffect(() => {
    if (isLoading) return;

    setItems((prev) => {
      const prevNonPromo = prev.filter((it) => !isPromotionItem(it));
      const prevPromo = prev.filter((it) => isPromotionItem(it));

      const totals = calculateCartTotals(prevNonPromo, user, selectedEmirate, {
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

      const currentKeys = new Set(
        prevPromo
          .map((it) => String(it?.promotionKey || '').trim())
          .filter(Boolean)
      );

      const wantKeys = new Set(desiredKeys);

      const keptPromo = prevPromo.filter((it) => {
        const k = String(it?.promotionKey || '').trim();
        return k && wantKeys.has(k);
      });

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

      if (toAdd.length === 0 && keptPromo.length === prevPromo.length) return prev;

      return [...prevNonPromo, ...keptPromo, ...toAdd];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoTick, user, selectedEmirate, emirates, isLoading]);

  const loadCartFromStorage = async () => {
    try {
      const [cartData, emirateData, shippingRatesData] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(EMIRATE_STORAGE_KEY),
        AsyncStorage.getItem(SHIPPING_RATES_STORAGE_KEY),
      ]);

      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        const rawItems = Array.isArray(parsedCart) ? parsedCart : [];

        // Normalize saved cart:
        // - If product has variants but selectedSize is empty, pick a default variant size (fixes duplicates from Home -> Product flows)
        // - Ensure stored unit price matches the selected size
        // - Merge duplicates by (productId + color + size)
        const normalized = rawItems.map((it) => {
          const product = it?.product;
          if (!product || isPromotionItem(it)) return it;

          const selectedSize = normalizeSizeKey(product, it?.selectedSize);

          if (selectedSize && Array.isArray(product?.variants)) {
            const v = product.variants.find((vv) => String(vv?.size || '').trim() === selectedSize);
            const vp = Number(v?.price);
            if (Number.isFinite(vp) && vp > 0) {
              const variantOriginal = Number(v?.originalPrice);
              const serverConfirmed = hasServerDiscount(variantOriginal, vp, product.variants, product);
              const discountPct = Number(user?.discountPercentage);
              const inferredOriginal = serverConfirmed
                ? inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct })
                : null;
              const keptOriginal =
                (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
                inferredOriginal ||
                null;
              return {
                ...it,
                selectedSize,
                product: {
                  ...product,
                  price: vp,
                  displayPrice: vp,
                  originalPrice: keptOriginal,
                },
              };
            }
          }

          return { ...it, selectedSize };
        });

        const merged = normalized.reduce((acc, it) => {
          if (!it) return acc;
          if (isPromotionItem(it)) {
            acc.push(it);
            return acc;
          }
          const pid = String(it?.product?.id || '');
          const color = String(it?.selectedColor || '');
          const size = normalizeSizeKey(it?.product, it?.selectedSize);
          const key = `${pid}::${color}::${size}`;

          const idx = acc.findIndex((x) => {
            if (!x || isPromotionItem(x)) return false;
            const xKey = `${String(x?.product?.id || '')}::${String(x?.selectedColor || '')}::${normalizeSizeKey(x?.product, x?.selectedSize)}`;
            return xKey === key;
          });

          if (idx >= 0) {
            const prevQty = Number(acc[idx]?.quantity) || 0;
            const addQty = Number(it?.quantity) || 0;
            acc[idx] = { ...acc[idx], quantity: prevQty + addQty };
          } else {
            acc.push({ ...it, selectedSize: size });
          }
          return acc;
        }, []);

        setItems(merged);
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
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to add
   * @param {string} selectedColor - Selected color variant
   * @param {string} selectedSize - Selected size variant
   * @param {Object} itemMeta - Optional item-level metadata (e.g. { fromBundle, bundleDiscountPercent })
   */
  const addItem = (product, quantity = 1, selectedColor = '', selectedSize = '', itemMeta = null) => {
    // Prevent price-on-request products from being added to cart
    if (product?.isPriceOnRequest) return;

    const normalizedColor = selectedColor || '';
    const isBundleAdd = itemMeta?.fromBundle === true;
    // Bundle items already have correct pricing — don't auto-pick a variant size
    // (which would cause the bag to read variant prices instead of bundle prices).
    const normalizedSize = isBundleAdd ? '' : normalizeSizeKey(product, selectedSize);
    const normalizedProduct = (() => {
      // Bundle items already have correct pricing from the bundle builder —
      // skip variant/discount inference to avoid inflating originalPrice.
      if (isBundleAdd) return product;

      // If a size variant is selected and the product includes variant pricing, store the selected variant price
      // as the product unit price in the cart item.
      if (normalizedSize && Array.isArray(product?.variants) && product.variants.length > 0) {
        const v = product.variants.find((vv) => String(vv?.size || '').trim() === String(normalizedSize).trim());
        const vp = Number(v?.price);
        if (Number.isFinite(vp) && vp > 0) {
          const variantOriginal = Number(v?.originalPrice);
          const productOriginal = Number(product?.originalPrice);
          const serverConfirmed = hasServerDiscount(variantOriginal, vp, product.variants, product);
          const discountPct = Number(user?.discountPercentage);
          const inferredOriginal = serverConfirmed
            ? inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct })
            : null;
          const keptOriginal =
            (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
            inferredOriginal ||
            null;
          return {
            ...product,
            price: vp,
            displayPrice: vp,
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
    
    const newItem = {
      product: normalizedProduct,
      quantity,
      selectedColor: normalizedColor,
      selectedSize: normalizedSize,
      addedAt: new Date().toISOString(),
      ...(itemMeta?.fromBundle ? { fromBundle: true, bundleDiscountPercent: itemMeta.bundleDiscountPercent || 0 } : {}),
    };

    setItems(prev => {
      const existingIdx = prev.findIndex(item =>
        item.product.id === normalizedProduct.id &&
        item.selectedColor === normalizedColor &&
        item.selectedSize === normalizedSize &&
        !isPromotionItem(item)
      );
      if (existingIdx >= 0) {
        return prev.map((item, i) =>
          i === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, newItem];
    });

    bumpPromoTick();
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

    bumpPromoTick();
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

    bumpPromoTick();
    log.debug('Updated quantity', { productId, quantity });
  };

  /**
   * Update item color variant
   */
  const updateColor = (productId, newColor, oldColor = '', selectedSize = '') => {
    const normalizedOldColor = oldColor || '';
    const normalizedSize = selectedSize || '';
    const normalizedNewColor = newColor || '';

    setItems(prev => {
      const matchOld = (item) =>
        item.product.id === productId &&
        item.selectedColor === normalizedOldColor &&
        item.selectedSize === normalizedSize;

      const itemToUpdate = prev.find(matchOld);
      if (!itemToUpdate) return prev;

      const matchNew = (item) =>
        item.product.id === productId &&
        item.selectedColor === normalizedNewColor &&
        item.selectedSize === normalizedSize &&
        item !== itemToUpdate;

      const existingWithNewColor = prev.find(matchNew);

      if (existingWithNewColor) {
        return prev
          .map(item =>
            matchNew(item)
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
              : item
          )
          .filter(item => item !== itemToUpdate);
      }

      let updatedProduct = itemToUpdate.product;
      const variants = updatedProduct?.variants;
      if (Array.isArray(variants) && normalizedSize) {
        const v = variants.find(vv => String(vv?.size || '').trim() === normalizedSize);
        const vp = Number(v?.price);
        if (Number.isFinite(vp) && vp > 0) {
          const variantOriginal = Number(v?.originalPrice);
          const serverConfirmed = hasServerDiscount(variantOriginal, vp, variants, updatedProduct);
          const discountPct = Number(user?.discountPercentage);
          const inferredOriginal = serverConfirmed
            ? inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct })
            : null;
          const keptOriginal =
            (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
            inferredOriginal ||
            null;
          updatedProduct = { ...updatedProduct, price: vp, displayPrice: vp, originalPrice: keptOriginal };
        }
      }

      return prev.map(item =>
        item === itemToUpdate
          ? { ...item, selectedColor: normalizedNewColor, product: updatedProduct }
          : item
      );
    });

    bumpPromoTick();
    log.debug('Updated color', { productId, oldColor, newColor });
  };

  /**
   * Update item size variant
   */
  const updateSize = (productId, newSize, oldSize = '', selectedColor = '') => {
    const normalizedOldSize = oldSize || '';
    const normalizedColor = selectedColor || '';
    const normalizedNewSize = newSize || '';

    setItems(prev => {
      const matchOld = (item) =>
        item.product.id === productId &&
        item.selectedSize === normalizedOldSize &&
        item.selectedColor === normalizedColor;

      const itemToUpdate = prev.find(matchOld);
      if (!itemToUpdate) return prev;

      const matchNew = (item) =>
        item.product.id === productId &&
        item.selectedSize === normalizedNewSize &&
        item.selectedColor === normalizedColor &&
        item !== itemToUpdate;

      const existingWithNewSize = prev.find(matchNew);

      if (existingWithNewSize) {
        return prev
          .map(item =>
            matchNew(item)
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity }
              : item
          )
          .filter(item => item !== itemToUpdate);
      }

      // Update size and recalculate price from the new variant.
      // Do NOT use itemToUpdate.product.originalPrice for the "server confirmed discount"
      // check — after a prior size switch it may be an inferred value. Instead use:
      //   1. The new variant's own originalPrice (if server set it)
      //   2. Any variant carrying a server-set originalPrice
      //   3. The product's discountLabel (set by API, never overwritten by cart mutations)
      const variants = itemToUpdate.product?.variants;
      let updatedProduct = itemToUpdate.product;
      if (Array.isArray(variants)) {
        const newVariant = variants.find(v => String(v?.size || '').trim() === normalizedNewSize);
        const vp = Number(newVariant?.price);
        if (Number.isFinite(vp) && vp > 0) {
          const variantOriginal = Number(newVariant?.originalPrice);
          const serverConfirmed = hasServerDiscount(variantOriginal, vp, variants, itemToUpdate.product);
          const discountPct = Number(user?.discountPercentage);
          const inferredOriginal = serverConfirmed
            ? inferOriginalFromUserDiscount({ discountedPrice: vp, discountPct })
            : null;
          const keptOriginal =
            (Number.isFinite(variantOriginal) && variantOriginal > vp ? variantOriginal : null) ||
            inferredOriginal ||
            null;
          updatedProduct = {
            ...updatedProduct,
            price: vp,
            displayPrice: vp,
            originalPrice: keptOriginal,
          };
        }
      }

      return prev.map(item =>
        item === itemToUpdate
          ? { ...item, selectedSize: normalizedNewSize, product: updatedProduct }
          : item
      );
    });

    bumpPromoTick();
    log.debug('Updated size', { productId, oldSize, newSize });
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setItems([]);
    bumpPromoTick();
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
          fromBundle: item.fromBundle || item.product?.fromBundle || false,
          bundleDiscountPercent: item.bundleDiscountPercent || item.product?.bundleDiscountPercent || 0,
          originalPrice: item.product?.originalPrice || null,
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

  const getTotalItems = useCallback(() => {
    return items.filter((it) => !isPromotionItem(it)).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [items]);

  const isInCart = useCallback((productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    return items.some(item => 
      !isPromotionItem(item) &&
      item.product.id === productId && 
      item.selectedColor === normalizedColor && 
      item.selectedSize === normalizedSize
    );
  }, [items]);

  const getItemQuantity = useCallback((productId, selectedColor = '', selectedSize = '') => {
    const normalizedColor = selectedColor || '';
    const normalizedSize = selectedSize || '';
    const item = items.find(it => 
      !isPromotionItem(it) &&
      it.product.id === productId && 
      it.selectedColor === normalizedColor && 
      it.selectedSize === normalizedSize
    );
    return item ? item.quantity : 0;
  }, [items]);

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

  const getCartTotals = useCallback(() => {
    return calculateCartTotals(items, user, selectedEmirate, {
      emirates,
      freeShippingThreshold: shippingRates?.freeShippingThreshold,
      vatRate: shippingRates?.vatRate,
    });
  }, [items, user, selectedEmirate, emirates, shippingRates]);

  const getCartSummary = useCallback(() => {
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
  }, [getCartTotals, getTotalItems]);

  const getAvailableEmirates = useCallback(() => {
    return emirates?.length ? emirates : UAE_EMIRATES;
  }, [emirates]);

  const value = useMemo(() => ({
    items,
    selectedEmirate,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    updateColor,
    updateSize,
    clearCart,
    setSelectedEmirate,
    saveOrderToDatabase,
    getTotalItems,
    isInCart,
    getItemQuantity,
    getCartTotals,
    getCartSummary,
    getAvailableEmirates,
    shippingRates,
    reloadShippingRates: loadShippingRates,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items, selectedEmirate, isLoading, shippingRates, getTotalItems, isInCart, getItemQuantity, getCartTotals, getCartSummary, getAvailableEmirates]);

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
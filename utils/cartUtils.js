/**
 * Minimal cart utilities - Database-driven approach
 * 
 * Note: These are simplified client-side utilities for cart functionality.
 * Server should handle final pricing calculations during checkout.
 */

import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isUserDiscountExcludedProduct, isDeviceProduct, isBeautyBoxProduct } from './productRules';
import { getPricingDisplay } from './pricingDisplay';

// UAE Emirates for shipping - fallback data (used when /api/mobile/shipping-rates is unavailable).
// MUST match backend mobileCheckoutConfig.ts to avoid display vs. charge mismatch.
// Last synced: 2026-02-06
export const UAE_EMIRATES = [
  { name: 'Dubai', shippingCost: 45 },
  { name: 'Abu Dhabi', shippingCost: 70 },
  { name: 'Sharjah', shippingCost: 70 },
  { name: 'Ajman', shippingCost: 70 },
  { name: 'Ras Al Khaimah', shippingCost: 70 },
  { name: 'Fujairah', shippingCost: 70 },
  { name: 'Umm Al Quwain', shippingCost: 70 }
];

const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000;

const hasUsableCartContract = (pricing, hasUserDiscount) => {
  if (!pricing?.hasContract) return false;
  // If a saved cart only has a guest contract, keep legacy user-discount
  // fallback after login until a user-aware product payload refreshes it.
  if (hasUserDiscount && pricing.canSeePrice === false) return false;
  return true;
};

export function getBuildSetDiscountForCount(count) {
  const n = Number(count) || 0;
  if (n >= 5) return 20;
  if (n >= 4) return 15;
  if (n >= 3) return 10;
  if (n >= 2) return 5;
  return 0;
}

export function isBuildSetBundleItem(item) {
  return Boolean(
    item?.fromBundle === true ||
    item?.product?.fromBundle === true ||
    Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) > 0
  );
}

const getStoredBundleRetailPrice = (item) => {
  const product = item?.product || {};
  const selectedSize = String(item?.selectedSize || '').trim();
  const selectedColor = String(item?.selectedColor || '').trim();
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selectedVariant = variants.find((variant) => {
    const size = String(variant?.size || '').trim();
    const color = String(variant?.color || '').trim();
    const sizeMatches = selectedSize ? size === selectedSize : true;
    const colorMatches = selectedColor ? color === selectedColor : true;
    return sizeMatches && colorMatches;
  });
  const variantPrice = Number(selectedVariant?.price);
  const variantOriginal = Number(selectedVariant?.originalPrice);

  // Build Your Set discounts are applied to the selected size's retail price.
  // Do not reverse-calculate from the current line price when variant data exists:
  // for products like SNOW O2 Cleanser 500ml, the variant retail is already 510 AED.
  if (Number.isFinite(variantOriginal) && variantOriginal > variantPrice) return variantOriginal;
  if (Number.isFinite(variantPrice) && variantPrice > 0) return variantPrice;

  const explicitOriginal = Number(product.originalPrice);
  if (Number.isFinite(explicitOriginal) && explicitOriginal > 0) return explicitOriginal;

  const stalePct = Number(item?.bundleDiscountPercent || product?.bundleDiscountPercent) || 0;
  const staleUnit = Number(product.displayPrice ?? product.price);
  if (stalePct > 0 && stalePct < 100 && Number.isFinite(staleUnit) && staleUnit > 0) {
    return Math.round((staleUnit / (1 - stalePct / 100)) * 100) / 100;
  }

  const pricingBase = Number(product?.pricing?.basePrice || product?.pricing?.originalPrice);
  if (Number.isFinite(pricingBase) && pricingBase > 0) return pricingBase;

  return Number.isFinite(staleUnit) && staleUnit > 0 ? staleUnit : 0;
};

export function getCartBuildSetBundleDiscountPercent(items) {
  const count = Array.isArray(items)
    ? items.filter((item) => !item?.isPromotionItem && String(item?.selectedSize || '').trim() !== '__PROMO__' && isBuildSetBundleItem(item)).length
    : 0;
  return getBuildSetDiscountForCount(count);
}

export function reconcileBuildSetBundleDiscounts(items) {
  if (!Array.isArray(items) || items.length === 0) return items || [];

  const bundleCount = items.filter((item) => !item?.isPromotionItem && String(item?.selectedSize || '').trim() !== '__PROMO__' && isBuildSetBundleItem(item)).length;
  const activePct = getBuildSetDiscountForCount(bundleCount);

  return items.map((item) => {
    if (!isBuildSetBundleItem(item)) return item;

    const product = item?.product || {};
    const retailPrice = getStoredBundleRetailPrice(item);

    if (activePct <= 0) {
      const { fromBundle: _itemFromBundle, bundleDiscountPercent: _itemBundlePct, ...itemRest } = item;
      const {
        fromBundle: _productFromBundle,
        bundleDiscountPercent: _productBundlePct,
        pricing: _pricing,
        ...productRest
      } = product;
      return {
        ...itemRest,
        product: {
          ...productRest,
          price: retailPrice,
          displayPrice: retailPrice,
          originalPrice: null,
          discountLabel: null,
          discountPercentage: 0,
        },
      };
    }

    const discountedPrice = Math.round(retailPrice * (1 - activePct / 100) * 100) / 100;
    const { pricing: _pricing, ...productRest } = product;
    return {
      ...item,
      fromBundle: true,
      bundleDiscountPercent: activePct,
      product: {
        ...productRest,
        price: discountedPrice,
        displayPrice: discountedPrice,
        originalPrice: retailPrice,
        fromBundle: true,
        bundleDiscountPercent: activePct,
      },
    };
  });
}

/**
 * Calculate basic cart totals for display purposes
 * Note: Server should recalculate final totals during checkout
 * @param {Array} items - Cart items 
 * @param {Object} user - User object (for display purposes)
 * @param {string} selectedEmirate - Selected emirate name
 * @param {Array|Object|null} emiratesOverrideOrConfig - emirates array or config object { emirates, freeShippingThreshold, vatRate }
 * @returns {Object} Cart totals for UI display
 */
export function calculateCartTotals(items, user, selectedEmirate, emiratesOverrideOrConfig = null) {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      shipping: 0,
      shippingCost: 0,
      total: 0,
      itemCount: 0,
      vatAmount: 0,
      totalWithVat: 0,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      amountForFreeShipping: DEFAULT_FREE_SHIPPING_THRESHOLD,
      hasFreeShipping: false,
    };
  }

  const config =
    emiratesOverrideOrConfig && !Array.isArray(emiratesOverrideOrConfig) && typeof emiratesOverrideOrConfig === 'object'
      ? emiratesOverrideOrConfig
      : null;
  const emiratesOverride = Array.isArray(emiratesOverrideOrConfig)
    ? emiratesOverrideOrConfig
    : Array.isArray(config?.emirates)
      ? config.emirates
      : null;

  // Calculate subtotal for display:
  // - User-discount excluded products (Beauty Boxes, Hydro Cool Mask): NEVER apply user discount; use server-provided/base pricing.
  // - Other products: if user has a percentage discount and product.originalPrice is present, compute discounted price from originalPrice.
  // - Otherwise, use server-provided displayPrice/price.
  const subtotal = items.reduce((sum, item) => {
    // Promotion items must NEVER affect totals (they're free add-ons).
    // In some flows they can carry originalPrice (e.g., 36 AED) which must not be discounted/added.
    const isPromoItem = item?.isPromotionItem === true || String(item?.selectedSize || '').trim() === '__PROMO__';
    if (isPromoItem) return sum;

    const discountPct = Number(user?.discountPercentage);
    const hasUserDiscount = !!user?.discountType && Number.isFinite(discountPct) && discountPct > 0 && discountPct < 100;
    const isBundleItem = item?.fromBundle === true || item?.product?.fromBundle === true;
    const excludedFromUserDiscount = isUserDiscountExcludedProduct(item.product);
    const forceCanonicalPrice =
      isHydroCoolMask(item.product) || isDeviceProduct(item.product) || hasFixedPriceOverride(item.product);

    // Size variants: if the product carries variants, prefer the selected variant price.
    // This prevents the cart UI from incorrectly reusing base/originalPrice from a different size.
    const selectedSize = String(item?.selectedSize || '').trim();
    const selectedVariant = selectedSize && Array.isArray(item?.product?.variants)
      ? item.product.variants.find((v) => String(v?.size || '').trim() === selectedSize)
      : null;
    const variantPrice = Number(selectedVariant?.price);
    const hasVariantPrice = selectedSize && Number.isFinite(variantPrice) && variantPrice > 0;
    const pricing = getPricingDisplay(item.product, {
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    });
    const useContract = hasUsableCartContract(pricing, hasUserDiscount);

    const rawDisplay =
      useContract
        ? pricing.unitPrice
        : (
            (hasVariantPrice ? variantPrice : undefined) ??
            item.product?.displayPrice ??
            item.product?.price ??
            item.product?.priceIncludingVat ??
            item.product?.price_including_vat ??
            item.price ??
            0
          );

    const productOriginal = useContract ? Number(pricing.originalPrice) : Number(item.product?.originalPrice);
    const variantOriginal = useContract ? Number(pricing.originalPrice) : Number(selectedVariant?.originalPrice);

    const itemPrice = !useContract && forceCanonicalPrice
      ? getCanonicalUnitPrice(item.product)
      : (() => {
          // Bundle items ("Build Your Set"): bundle discount ONLY on retail price — NO VIP/user discount.
          if (isBundleItem) {
            const bundlePct = Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) || 0;
            const retailBase =
              (Number.isFinite(productOriginal) && productOriginal > 0 ? productOriginal : 0) ||
              (useContract && Number.isFinite(pricing.basePrice) && pricing.basePrice > 0 ? pricing.basePrice : 0) ||
              Number(item.product?.price ?? 0);
            // Only apply bundle discount (no VIP)
            if (bundlePct > 0 && bundlePct < 100) {
              return Math.round(retailBase * (1 - bundlePct / 100) * 100) / 100;
            }
            return retailBase;
          }

          // User-aware server contract is final for non-bundle cart lines.
          if (useContract) {
            return Number(rawDisplay);
          }

          // Apply user discount to variant-priced items too (otherwise size-selected items show no discount).
          if (hasVariantPrice) {
            if (!excludedFromUserDiscount && hasUserDiscount) {
              const originalForDiscount =
                (Number.isFinite(variantOriginal) && variantOriginal > 0 ? variantOriginal : NaN) ||
                (Number.isFinite(productOriginal) && productOriginal > 0 ? productOriginal : NaN) ||
                variantPrice;
              const safeOriginal = Math.max(variantPrice, Number(originalForDiscount) || variantPrice);
              return safeOriginal * (1 - discountPct / 100);
            }
            return variantPrice;
          }

          if (!excludedFromUserDiscount && hasUserDiscount) {
            if (Number.isFinite(productOriginal) && productOriginal > 0) {
              return productOriginal * (1 - discountPct / 100);
            }
            // Fallback: use product.price (retail) as base for discount when originalPrice is absent
            // (e.g. product fetched without user context — displayPrice equals retail)
            const retailBase = Number(item.product?.price);
            if (Number.isFinite(retailBase) && retailBase > 0) {
              return retailBase * (1 - discountPct / 100);
            }
          }

          return Number(rawDisplay);
        })();
    const qty = Number(item.quantity) || 0;
    return sum + (Number.isFinite(itemPrice) ? itemPrice * qty : 0);
  }, 0);

  // Get shipping cost for selected emirate
  const list = (Array.isArray(emiratesOverride) && emiratesOverride.length) ? emiratesOverride : UAE_EMIRATES;
  const targetKey = String(selectedEmirate || '').trim().toLowerCase();
  const emirate = list.find(e => String(e.name || '').trim().toLowerCase() === targetKey);
  const baseShipping = emirate ? Number(emirate.shippingCost) || 0 : 0;

  // Free delivery rule: all emirates are FREE for subtotal >= 1000 AED.
  // Prefer server-provided threshold if present; fallback to 1000.
  const freeShippingThresholdRaw = config?.freeShippingThreshold;
  const freeShippingThreshold =
    (Number.isFinite(Number(freeShippingThresholdRaw)) && Number(freeShippingThresholdRaw) > 0)
      ? Number(freeShippingThresholdRaw)
      : DEFAULT_FREE_SHIPPING_THRESHOLD;

  const qualifiesForFreeShipping = Number.isFinite(subtotal) && subtotal >= freeShippingThreshold;
  const shipping = qualifiesForFreeShipping ? 0 : baseShipping;
  const amountForFreeShipping = qualifiesForFreeShipping
    ? 0
    : Math.max(0, freeShippingThreshold - (Number.isFinite(subtotal) ? subtotal : 0));

  // VAT is INCLUDED in prices (and shipping). Compute the included portion for display only.
  const vatRateRaw = config?.vatRate;
  const vatRate =
    (Number.isFinite(Number(vatRateRaw)) && Number(vatRateRaw) >= 0)
      ? Number(vatRateRaw)
      : 0.05;
  const totalWithVat = (Number.isFinite(subtotal) ? subtotal : 0) + shipping;
  const vatAmount = Number.isFinite(totalWithVat) ? Math.round(((totalWithVat * vatRate) / (1 + vatRate)) * 100) / 100 : 0;

  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const totals = {
    subtotal,
    shipping,
    shippingCost: shipping, // alias for UI compatibility
    total: totalWithVat,
    itemCount,
    vatAmount,
    totalWithVat,
    selectedEmirate,
    freeShippingThreshold,
    amountForFreeShipping,
    hasFreeShipping: shipping === 0,
  };
  return totals;
}

/**
 * Get shipping cost for emirate
 * @param {string} emirateName - Emirate name
 * @returns {number} Shipping cost
 */
export function getShippingCost(emirateName) {
  const key = String(emirateName || '').trim().toLowerCase();
  const emirate = UAE_EMIRATES.find(e => String(e.name || '').trim().toLowerCase() === key);
  return emirate ? emirate.shippingCost : 0;
}

/**
 * Compute waterfall discount breakdown for display in order summary.
 * Mirrors the web checkout's waterfall logic (CheckoutClient.tsx).
 *
 * Returns retail total, user (VIP) discount, bundle discount, intermediate subtotal,
 * and convenience booleans/totals for the UI.
 *
 * @param {Array} items - Cart items
 * @param {Object} user - User object (needs discountPercentage)
 * @returns {Object} Waterfall breakdown values
 */
export function computeWaterfallBreakdown(items, user) {
  const empty = {
    retailTotal: 0,
    userDiscountTotal: 0,
    bundleDiscountTotal: 0,
    afterVipSubtotal: 0,
    userDiscountPct: 0,
    bundleDiscountPct: 0,
    hasUserDiscount: false,
    hasBundleDiscount: false,
    hasAnyDiscount: false,
    totalSaved: 0,
  };
  if (!items || items.length === 0) return empty;

  let _retailTotal = 0;
  let _userDiscountTotal = 0;
  let _bundleDiscountTotal = 0;
  let _userDiscountPct = 0;
  let _bundleDiscountPct = 0;

  const discountPct = Number(user?.discountPercentage);
  const hasUserDiscountPct = !!user?.discountType && Number.isFinite(discountPct) && discountPct > 0 && discountPct < 100;

  items.forEach((item) => {
    // Skip promo items (free add-ons)
    const isPromoItem = item?.isPromotionItem === true || String(item?.selectedSize || '').trim() === '__PROMO__';
    if (isPromoItem) return;

    const qty = Number(item.quantity) || 1;
    const product = item.product;

    // --- Determine the retail (original, pre-discount) unit price ---
    const selectedSize = String(item?.selectedSize || '').trim();
    const selectedVariant = selectedSize && Array.isArray(product?.variants)
      ? product.variants.find((v) => String(v?.size || '').trim() === selectedSize)
      : null;
    const variantPrice = Number(selectedVariant?.price);
    const hasVariantPrice = selectedSize && Number.isFinite(variantPrice) && variantPrice > 0;
    const variantOriginal = Number(selectedVariant?.originalPrice);
    const productOriginal = Number(product?.originalPrice);
    const pricing = getPricingDisplay(product, {
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    });

    const forceCanonicalPrice =
      isHydroCoolMask(product) || isDeviceProduct(product) || hasFixedPriceOverride(product);
    const isBundleItem = item?.fromBundle === true || product?.fromBundle === true;
    // Bundle items: NO VIP discount — bundle discount only. Non-bundle excluded products still skip VIP.
    const excludedFromUserDiscount = isBundleItem || isUserDiscountExcludedProduct(product);
    const beautyBox = isBeautyBoxProduct(product);
    const useContract = hasUsableCartContract(pricing, hasUserDiscountPct);

    // Retail unit price: the price *before* any discounts
    let retailUnitPrice;
    if (!useContract && forceCanonicalPrice) {
      retailUnitPrice = getCanonicalUnitPrice(product);
    } else if (hasVariantPrice) {
      const orig = (Number.isFinite(variantOriginal) && variantOriginal > 0) ? variantOriginal
        : (Number.isFinite(productOriginal) && productOriginal > 0) ? productOriginal
        : (Number.isFinite(pricing.originalPrice) && pricing.originalPrice > 0) ? pricing.originalPrice
        : variantPrice;
      retailUnitPrice = Math.max(variantPrice, orig);
    } else if (isBundleItem) {
      // For bundle items, retailUnitPrice = originalPrice (the full retail, pre-any-discount)
      retailUnitPrice =
        (Number.isFinite(productOriginal) && productOriginal > 0 ? productOriginal : 0) ||
        (useContract && Number.isFinite(pricing.originalPrice) && pricing.originalPrice > 0 ? pricing.originalPrice : 0) ||
        (useContract && Number.isFinite(pricing.basePrice) && pricing.basePrice > 0 ? pricing.basePrice : 0) ||
        Number(product?.displayPrice ?? product?.price ?? 0);
    } else if (useContract) {
      retailUnitPrice =
        (Number.isFinite(pricing.originalPrice) && pricing.originalPrice > 0 ? pricing.originalPrice : 0) ||
        (Number.isFinite(pricing.basePrice) && pricing.basePrice > 0 ? pricing.basePrice : 0) ||
        (Number.isFinite(pricing.displayPrice) ? pricing.displayPrice : 0);
    } else {
      const displayPrice = Number(product?.displayPrice ?? product?.price ?? 0);
      retailUnitPrice = (Number.isFinite(productOriginal) && productOriginal > 0)
        ? productOriginal
        : (Number.isFinite(displayPrice) ? displayPrice : 0);
    }

    _retailTotal += retailUnitPrice * qty;

    // --- User (VIP) discount ---
    // Bundle items are excluded from VIP discount (excludedFromUserDiscount is true for them)
    if (!excludedFromUserDiscount && hasUserDiscountPct) {
      const discountAmount = retailUnitPrice * (discountPct / 100);
      _userDiscountTotal += discountAmount * qty;
      _userDiscountPct = discountPct;
    }

    // --- Bundle discount (step 2): applied on retail price (VIP excluded for bundle items) ---
    if (beautyBox) {
      const bbOriginal =
        (Number.isFinite(productOriginal) && productOriginal > 0 ? productOriginal : 0) ||
        (useContract && Number.isFinite(pricing.originalPrice) && pricing.originalPrice > 0 ? pricing.originalPrice : 0) ||
        retailUnitPrice;
      const bbDisplay = useContract
        ? Number(pricing.displayPrice)
        : Number(product?.displayPrice ?? product?.price ?? 0);
      if (Number.isFinite(bbOriginal) && Number.isFinite(bbDisplay) && bbOriginal > bbDisplay) {
        _bundleDiscountTotal += (bbOriginal - bbDisplay) * qty;
        const pct = Math.round(((bbOriginal - bbDisplay) / bbOriginal) * 100);
        if (pct > 0) _bundleDiscountPct = pct;
      }
    }
    // Handle "Build Your Set" bundle items — bundle discount on RETAIL price (no VIP)
    const bundlePct = Number(item?.bundleDiscountPercent || product?.bundleDiscountPercent) || 0;
    if (isBundleItem && bundlePct > 0) {
      // Bundle discount applied directly on retail price (no VIP discount involved)
      const bundleDiscountAmount = retailUnitPrice * (bundlePct / 100);
      if (Number.isFinite(bundleDiscountAmount) && bundleDiscountAmount > 0) {
        _bundleDiscountTotal += bundleDiscountAmount * qty;
        _bundleDiscountPct = bundlePct;
      }
    }
  });

  const retailTotal = Math.round(_retailTotal * 100) / 100;
  const userDiscountTotal = Math.round(_userDiscountTotal * 100) / 100;
  const bundleDiscountTotal = Math.round(_bundleDiscountTotal * 100) / 100;
  const afterVipSubtotal = Math.round((_retailTotal - _userDiscountTotal) * 100) / 100;
  const hasUserDiscount = userDiscountTotal > 0;
  const hasBundleDiscount = bundleDiscountTotal > 0;
  const hasAnyDiscount = hasUserDiscount || hasBundleDiscount;
  const totalSaved = Math.round((userDiscountTotal + bundleDiscountTotal) * 100) / 100;

  return {
    retailTotal,
    userDiscountTotal,
    bundleDiscountTotal,
    afterVipSubtotal,
    userDiscountPct: _userDiscountPct,
    bundleDiscountPct: _bundleDiscountPct,
    hasUserDiscount,
    hasBundleDiscount,
    hasAnyDiscount,
    totalSaved,
  };
}

export default {
  calculateCartTotals,
  getShippingCost,
  computeWaterfallBreakdown,
  UAE_EMIRATES
};




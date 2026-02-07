/**
 * Minimal cart utilities - Database-driven approach
 * 
 * Note: These are simplified client-side utilities for cart functionality.
 * Server should handle final pricing calculations during checkout.
 */

import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isUserDiscountExcludedProduct, isDeviceProduct } from './productRules';

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
    const hasUserDiscount = Number.isFinite(discountPct) && discountPct > 0 && discountPct < 100;
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

    const rawDisplay =
      (hasVariantPrice ? variantPrice : undefined) ??
      item.product?.displayPrice ??
      item.product?.price ??
      item.product?.priceIncludingVat ??
      item.product?.price_including_vat ??
      item.price ??
      0;

    const productOriginal = Number(item.product?.originalPrice);
    const variantOriginal = Number(selectedVariant?.originalPrice);

    const itemPrice = forceCanonicalPrice
      ? getCanonicalUnitPrice(item.product)
      : (() => {
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

          if (!excludedFromUserDiscount && hasUserDiscount && Number.isFinite(productOriginal) && productOriginal > 0) {
            return productOriginal * (1 - discountPct / 100);
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
  const vatAmount = Number.isFinite(totalWithVat) ? (totalWithVat * vatRate) / (1 + vatRate) : 0;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
  const emirate = UAE_EMIRATES.find(e => e.name === emirateName);
  return emirate ? emirate.shippingCost : 0;
}

export default {
  calculateCartTotals,
  getShippingCost,
  UAE_EMIRATES
};




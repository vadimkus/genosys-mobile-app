/**
 * Product-level UI/business rules for the mobile app.
 * Keep these rules small and explicit.
 */

export const normalizeProductName = (product) =>
  String(product?.name || '').trim().toLowerCase();

// Hard, explicit price overrides (temporary safety net when backend/DB is out of sync).
// Keep empty unless we have a confirmed backend issue we must hotfix client-side.
export const FIXED_PRICE_OVERRIDES = [];

// Cushion BB helper (ID 41). Kept for targeted behaviors if needed.
export const isCushionBB = (product) => {
  const id = product?.id == null ? null : String(product.id);
  if (id === '41') return true;
  const name = normalizeProductName(product);
  return name.includes('blemish balm') && name.includes('cushion');
};

export const isBeautyBoxProduct = (product) => {
  const catRaw = String(product?.category || '').trim().toLowerCase();
  const name = normalizeProductName(product);
  // Normalize category by removing non-alphanumerics to catch "Beauty Boxes", "Beauty box", "beauty-boxes", etc.
  const catCompact = catRaw.replace(/[^a-z0-9]/g, '');

  // Category-based detection (most reliable when present)
  if (catRaw === 'beauty boxes' || catRaw === 'beauty box') return true;
  if (catCompact.includes('beautybox')) return true;

  // Name-based fallback (some datasets may not have a stable category)
  if (name.includes('beauty box') || name.includes('beautybox')) return true;

  return false;
};

// Hydro Cool Mask: user discounts must NOT apply (price stays 300 AED).
// We detect by name (stable across environments). If you have a productId, we can harden this to ID-based.
export const isHydroCoolMask = (product) => {
  const name = normalizeProductName(product);
  return name.includes('hydro') && name.includes('cool') && name.includes('mask');
};

// Devices: user discounts must NOT apply (Gentron, LED lamp, HairGen, etc.)
export const isDeviceProduct = (product) => {
  const cat = String(product?.category || '').trim().toLowerCase();
  // Mobile API categories appear as "Device" (singular) in current dataset.
  // Use an inclusive check to handle potential "Devices" or composite categories.
  return cat === 'device' || cat.includes('device');
};

export const getFixedPriceOverride = (product) => {
  const id = product?.id == null ? null : String(product.id);
  const name = normalizeProductName(product);
  const rule = FIXED_PRICE_OVERRIDES.find((r) => {
    if (r?.id && id && String(r.id) === id) return true;
    if (Array.isArray(r?.nameIncludes) && r.nameIncludes.length) {
      return r.nameIncludes.every((chunk) => name.includes(String(chunk).toLowerCase()));
    }
    return false;
  });
  if (!rule) return null;
  const v = Number(rule.price);
  return Number.isFinite(v) ? v : null;
};

export const hasFixedPriceOverride = (product) => getFixedPriceOverride(product) != null;

// Products that should never use the user's percentage discount in the mobile UI.
export const isUserDiscountExcludedProduct = (product) =>
  isBeautyBoxProduct(product) ||
  isHydroCoolMask(product) ||
  isDeviceProduct(product) ||
  hasFixedPriceOverride(product);

// For non-discountable products, prefer the "undiscounted" price:
// - originalPrice if present (often represents the pre-discount/base price)
// - otherwise fallback to price/displayPrice/vat variants
export const getUndiscountedUnitPrice = (product) => {
  const v =
    product?.originalPrice ??
    product?.price ??
    product?.displayPrice ??
    product?.priceIncludingVat ??
    product?.price_including_vat ??
    0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Canonical price used by the mobile app (display + cart payload).
// Prefer fixed overrides (when backend is wrong), otherwise use undiscounted/base price.
export const getCanonicalUnitPrice = (product) => {
  const fixed = getFixedPriceOverride(product);
  if (fixed != null) return fixed;
  return getUndiscountedUnitPrice(product);
};



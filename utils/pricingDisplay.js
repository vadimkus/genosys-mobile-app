/**
 * Read-only pricing display adapter.
 *
 * Prefer the server `product.pricing` contract when present, but keep legacy
 * fields as a fallback for old cached products and old API responses.
 */

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const optionalNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const contractNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const findSelectedVariant = (product, selectedSize, selectedColor) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const size = String(selectedSize || '').trim();
  const color = String(selectedColor || '').trim();
  if (!size && !color) return null;

  return variants.find((variant) => {
    const variantSize = String(variant?.size || '').trim();
    const variantColor = String(variant?.color || '').trim();
    const sizeMatches = size ? variantSize === size : true;
    const colorMatches = color ? variantColor === color : true;
    return sizeMatches && colorMatches;
  }) || null;
};

const getServerPricing = (product) => {
  const pricing = product?.pricing;
  if (!pricing || pricing.source !== 'server') return null;
  return pricing;
};

const hasServerPricing = (product) => getServerPricing(product) != null;

const getPricingDisplay = (product, options = {}) => {
  const pricing = getServerPricing(product);
  const selectedVariant = findSelectedVariant(product, options.selectedSize, options.selectedColor);
  const variantPrice = optionalNumber(selectedVariant?.price);
  const variantOriginal = optionalNumber(selectedVariant?.originalPrice);

  const displayPrice = variantPrice ??
    contractNumber(pricing?.displayPrice) ??
    contractNumber(pricing?.unitPrice) ??
    toNumber(product?.displayPrice ?? product?.price ?? product?.priceIncludingVat ?? product?.price_including_vat);

  const originalCandidate = variantOriginal ??
    optionalNumber(pricing?.originalPrice) ??
    optionalNumber(product?.originalPrice);

  const originalPrice = originalCandidate && originalCandidate > displayPrice + 0.01
    ? originalCandidate
    : null;

  const discountPercentage = toNumber(pricing?.discountPercentage ?? product?.discountPercentage, 0);
  const discountLabel = pricing?.discountLabel ?? product?.discountLabel ?? null;

  return {
    hasContract: Boolean(pricing),
    basePrice: toNumber(pricing?.basePrice ?? product?.price ?? displayPrice, displayPrice),
    displayPrice,
    unitPrice: toNumber(pricing?.unitPrice ?? displayPrice, displayPrice),
    originalPrice,
    discountAmount: toNumber(pricing?.discountAmount, 0),
    discountPercentage,
    discountType: pricing?.discountType ?? (originalPrice ? 'legacy' : 'none'),
    discountLabel,
    hasDiscount: Boolean(originalPrice && originalPrice > displayPrice + 0.01),
    isPriceOnRequest: Boolean(pricing?.isPriceOnRequest ?? product?.isPriceOnRequest),
    canSeePrice: typeof pricing?.canSeePrice === 'boolean' ? pricing.canSeePrice : undefined,
    selectedVariant: selectedVariant || pricing?.selectedVariant || null,
  };
};

const formatAed = (value) => `${toNumber(value).toFixed(2)} AED`;

module.exports = {
  getPricingDisplay,
  getServerPricing,
  hasServerPricing,
  formatAed,
};

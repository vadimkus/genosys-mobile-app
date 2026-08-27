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
    unitPrice: displayPrice,
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

/**
 * The one place that decides what a price looks like.
 *
 * Every storefront - the shop list, the grid tile, favourites and the product
 * page - used to re-derive this from `user.discountPercentage`, from badge
 * text and from a local list of non-discountable products. Those ladders drifted
 * apart: the grid tile omitted the `noDiscount` flag the backend honours, so the
 * same product could advertise a discount in the catalogue that checkout would
 * not give. Pricing is server-authoritative; the app's job is to render what it
 * was sent, not to recompute it.
 *
 * Returns one of four shapes, so a caller only picks a layout:
 *   { kind: 'login' }        price is gated behind sign-in
 *   { kind: 'onRequest' }    quote-only product
 *   { kind: 'single' }       one price
 *   { kind: 'discounted' }   original struck through, price, and a label
 */
const resolvePriceView = (product, options = {}) => {
  const { user } = options;
  const pricing = getPricingDisplay(product, options);

  if (!user) return { kind: 'login' };
  if (pricing.isPriceOnRequest) return { kind: 'onRequest' };

  const base = {
    price: pricing.displayPrice,
    discountType: pricing.discountType,
    discountPercentage: pricing.discountPercentage,
    discountLabel: pricing.discountLabel,
  };

  if (!pricing.hasDiscount) return { kind: 'single', ...base, originalPrice: null };
  return { kind: 'discounted', ...base, originalPrice: pricing.originalPrice };
};

/**
 * The wording beside a discounted price, in the shopper's language.
 *
 * The server sends English prose ("Bundle 15% off", "Black Friday 20% off"), so
 * building the label from `discountType` and the server's percentage keeps
 * Russian and Arabic shoppers from being shown English, and keeps the number
 * honest: it used to be hard-coded to 15% for every bundle regardless of what
 * was actually being charged. The raw label is the last resort, for old cached
 * payloads that carry no structured fields.
 */
const discountLabelFor = (view, t) => {
  const percent = Math.round(Number(view?.discountPercentage) || 0);
  if (percent > 0) {
    if (view.discountType === 'beauty_box') return t('product.bundleDiscountPercent', { percent });
    if (view.discountType === 'black_friday') return t('product.blackFridayPercent', { percent });
    return t('product.discountPercent', { percent });
  }
  const raw = String(view?.discountLabel || '').trim();
  if (!raw) return null;
  const match = raw.match(/^(\d+(?:\.\d+)?)%\s*OFF$/i);
  return match ? t('product.discountPercent', { percent: Math.round(Number(match[1])) }) : raw;
};

module.exports = {
  getPricingDisplay,
  getServerPricing,
  hasServerPricing,
  formatAed,
  resolvePriceView,
  discountLabelFor,
};

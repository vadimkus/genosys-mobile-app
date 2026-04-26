import { calculateCartTotals, computeWaterfallBreakdown } from '../utils/cartUtils.js';

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, received ${actual}`);
  }
}

function product(overrides = {}) {
  return {
    id: 'product-1',
    name: 'Smoke Product',
    price: 100,
    displayPrice: 100,
    category: 'Serums',
    ...overrides,
  };
}

const user = {
  id: 'user-1',
  canSeePrices: true,
  discountPercentage: 10,
};

const shippingConfig = {
  emirates: [{ name: 'Dubai', shippingCost: 45 }],
  freeShippingThreshold: 1000,
  vatRate: 0.05,
};

const contractDiscountItem = {
  product: product({
    price: 200,
    displayPrice: 200,
    pricing: {
      source: 'server',
      basePrice: 200,
      unitPrice: 180,
      displayPrice: 180,
      originalPrice: 200,
      discountPercentage: 10,
      discountLabel: '10% off',
      canSeePrice: true,
      isPriceOnRequest: false,
    },
  }),
  quantity: 2,
};

const guestContractWithLoggedInUser = {
  product: product({
    price: 200,
    displayPrice: 200,
    pricing: {
      source: 'server',
      basePrice: 200,
      unitPrice: 200,
      displayPrice: 200,
      originalPrice: null,
      discountPercentage: 0,
      discountLabel: null,
      canSeePrice: false,
      isPriceOnRequest: false,
    },
  }),
  quantity: 1,
};

const bundleItem = {
  product: product({
    price: 100,
    displayPrice: 100,
    originalPrice: 100,
    fromBundle: true,
    bundleDiscountPercent: 20,
    pricing: {
      source: 'server',
      basePrice: 100,
      unitPrice: 90,
      displayPrice: 90,
      originalPrice: 100,
      discountPercentage: 10,
      discountLabel: '10% off',
      canSeePrice: true,
      isPriceOnRequest: false,
    },
  }),
  quantity: 1,
  fromBundle: true,
  bundleDiscountPercent: 20,
};

const promoItem = {
  product: product({
    id: 'promo-1',
    price: 0,
    displayPrice: 0,
    originalPrice: 36,
    category: 'Promotion',
  }),
  quantity: 1,
  selectedSize: '__PROMO__',
  isPromotionItem: true,
};

const variantContractItem = {
  product: product({
    price: 100,
    displayPrice: 100,
    pricing: {
      source: 'server',
      basePrice: 150,
      unitPrice: 150,
      displayPrice: 150,
      originalPrice: null,
      discountPercentage: 0,
      discountLabel: null,
      canSeePrice: true,
      isPriceOnRequest: false,
    },
    variants: [
      { id: 'v-50', size: '50ml', price: 150, isDefault: true },
      { id: 'v-100', size: '100ml', price: 250, isDefault: false },
    ],
  }),
  quantity: 1,
  selectedSize: '100ml',
};

const contractTotals = calculateCartTotals([contractDiscountItem, promoItem], user, 'Dubai', shippingConfig);
assertEqual('contract subtotal uses server unit price', contractTotals.subtotal, 360);
assertEqual('promo item stays free', contractTotals.itemCount, 3);
assertEqual('contract total includes shipping', contractTotals.total, 405);

const legacyFallbackTotals = calculateCartTotals([guestContractWithLoggedInUser], user, 'Dubai', shippingConfig);
assertEqual('guest contract falls back to legacy user discount after login', legacyFallbackTotals.subtotal, 180);

const bundleTotals = calculateCartTotals([bundleItem], user, 'Dubai', shippingConfig);
assertEqual('bundle keeps explicit bundle discount only', bundleTotals.subtotal, 80);

const variantTotals = calculateCartTotals([variantContractItem], null, 'Dubai', shippingConfig);
assertEqual('selected variant contract display price wins', variantTotals.subtotal, 250);

const waterfall = computeWaterfallBreakdown([contractDiscountItem, bundleItem, promoItem], user);
assertEqual('waterfall retail total includes contract original and bundle retail', waterfall.retailTotal, 500);
assertEqual('waterfall user discount comes from contract original', waterfall.userDiscountTotal, 40);
assertEqual('waterfall bundle discount stays explicit', waterfall.bundleDiscountTotal, 20);
assertEqual('waterfall total saved', waterfall.totalSaved, 60);

console.log('[cart-pricing-contract] contract subtotal:', contractTotals.subtotal);
console.log('[cart-pricing-contract] legacy fallback subtotal:', legacyFallbackTotals.subtotal);
console.log('[cart-pricing-contract] bundle subtotal:', bundleTotals.subtotal);
console.log('[cart-pricing-contract] variant subtotal:', variantTotals.subtotal);
console.log('[cart-pricing-contract] waterfall saved:', waterfall.totalSaved);
console.log('[cart-pricing-contract] 5 cart pricing scenarios passed');

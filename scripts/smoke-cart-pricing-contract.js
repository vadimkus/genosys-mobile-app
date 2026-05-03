import { calculateCartTotals, computeWaterfallBreakdown, reconcileBuildSetBundleDiscounts } from '../utils/cartUtils.js';
import { computeSavingsAED } from '../utils/checkoutFormUtils.js';

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
  discountType: 'VIP',
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

const checkoutSavings = computeSavingsAED([contractDiscountItem, promoItem], contractTotals.subtotal);
assertEqual('checkout savings uses contract original price', checkoutSavings, 40);

const buildSetItems = Array.from({ length: 5 }, (_, index) => ({
  product: product({
    id: `bundle-${index + 1}`,
    price: 80,
    displayPrice: 80,
    originalPrice: 100,
    fromBundle: true,
    bundleDiscountPercent: 20,
  }),
  quantity: 1,
  fromBundle: true,
  bundleDiscountPercent: 20,
}));
const fiveItemBundle = reconcileBuildSetBundleDiscounts(buildSetItems);
assertEqual('5-item build set keeps 20% discount', fiveItemBundle[0].bundleDiscountPercent, 20);
assertEqual('5-item build set subtotal', calculateCartTotals(fiveItemBundle, user, 'Dubai', shippingConfig).subtotal, 400);

const fourItemBundle = reconcileBuildSetBundleDiscounts(buildSetItems.slice(0, 4));
assertEqual('4-item build set downgrades to 15% discount', fourItemBundle[0].bundleDiscountPercent, 15);
assertEqual('4-item build set subtotal', calculateCartTotals(fourItemBundle, user, 'Dubai', shippingConfig).subtotal, 340);

const singleLeftoverBundle = reconcileBuildSetBundleDiscounts(buildSetItems.slice(0, 1));
assertEqual('single build set leftover loses bundle flag', singleLeftoverBundle[0].fromBundle, undefined);
assertEqual('single build set leftover returns to retail subtotal', calculateCartTotals(singleLeftoverBundle, null, 'Dubai', shippingConfig).subtotal, 100);
assertEqual('single build set leftover has no bundle waterfall', computeWaterfallBreakdown(singleLeftoverBundle, null).hasBundleDiscount, false);

const variantBundleItems = [
  {
    product: product({
      id: 'bundle-cleanser',
      price: 510,
      displayPrice: 510,
      fromBundle: true,
      bundleDiscountPercent: 20,
      variants: [
        { id: 'cleanser-180', size: '180ml', price: 330, isDefault: true },
        { id: 'cleanser-500', size: '500ml', price: 510, isDefault: false },
      ],
    }),
    quantity: 1,
    selectedSize: '500ml',
    fromBundle: true,
    bundleDiscountPercent: 20,
  },
  ...buildSetItems.slice(1, 5),
];
const variantBundle = reconcileBuildSetBundleDiscounts(variantBundleItems);
assertEqual('bundle selected variant keeps retail original', variantBundle[0].product.originalPrice, 510);
assertEqual('bundle selected variant applies discount once', variantBundle[0].product.price, 408);
assertEqual('bundle selected variant subtotal', calculateCartTotals(variantBundle, user, 'Dubai', shippingConfig).subtotal, 728);

console.log('[cart-pricing-contract] contract subtotal:', contractTotals.subtotal);
console.log('[cart-pricing-contract] legacy fallback subtotal:', legacyFallbackTotals.subtotal);
console.log('[cart-pricing-contract] bundle subtotal:', bundleTotals.subtotal);
console.log('[cart-pricing-contract] variant subtotal:', variantTotals.subtotal);
console.log('[cart-pricing-contract] waterfall saved:', waterfall.totalSaved);
console.log('[cart-pricing-contract] checkout savings:', checkoutSavings);
console.log('[cart-pricing-contract] build-set single-leftover subtotal:', calculateCartTotals(singleLeftoverBundle, null, 'Dubai', shippingConfig).subtotal);
console.log('[cart-pricing-contract] bundle variant subtotal:', calculateCartTotals(variantBundle, user, 'Dubai', shippingConfig).subtotal);
console.log('[cart-pricing-contract] 13 cart pricing scenarios passed');

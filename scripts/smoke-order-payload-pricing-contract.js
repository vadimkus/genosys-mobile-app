import { buildMobileOrderItemPayload } from '../utils/orderPayloadPricing.js';

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

const contractItem = buildMobileOrderItemPayload({
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
      canSeePrice: true,
      isPriceOnRequest: false,
    },
  }),
  quantity: 2,
});
assertEqual('contract payload uses server unit price', contractItem.price, 180);
assertEqual('contract payload keeps quantity', contractItem.quantity, 2);

const variantItem = buildMobileOrderItemPayload({
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
});
assertEqual('selected variant payload price wins', variantItem.price, 250);
assertEqual('selected variant size is preserved', variantItem.size, '100ml');

const bundleItem = buildMobileOrderItemPayload({
  product: product({
    price: 80,
    displayPrice: 80,
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
      canSeePrice: true,
      isPriceOnRequest: false,
    },
  }),
  quantity: 1,
  fromBundle: true,
  bundleDiscountPercent: 20,
});
assertEqual('bundle payload keeps bundle-only price', bundleItem.price, 80);
assertEqual('bundle payload preserves discount percent', bundleItem.bundleDiscountPercent, 20);
assertEqual('bundle payload preserves retail original price', bundleItem.originalPrice, 100);

const promoItem = buildMobileOrderItemPayload({
  product: product({
    id: 'promo-1',
    price: 36,
    displayPrice: 36,
    originalPrice: 36,
    category: 'Promotion',
  }),
  quantity: 1,
  selectedSize: '__PROMO__',
  isPromotionItem: true,
});
assertEqual('promo payload is free', promoItem.price, 0);
assertEqual('promo payload has null size', promoItem.size, null);

const zeroContractItem = buildMobileOrderItemPayload({
  product: product({
    price: 100,
    displayPrice: 100,
    pricing: {
      source: 'server',
      basePrice: 0,
      unitPrice: 0,
      displayPrice: 0,
      originalPrice: null,
      discountPercentage: 0,
      canSeePrice: true,
      isPriceOnRequest: true,
    },
  }),
  quantity: 1,
});
assertEqual('zero contract price is preserved', zeroContractItem.price, 0);

console.log('[order-payload-pricing-contract] contract price:', contractItem.price);
console.log('[order-payload-pricing-contract] variant price:', variantItem.price);
console.log('[order-payload-pricing-contract] bundle price:', bundleItem.price);
console.log('[order-payload-pricing-contract] promo price:', promoItem.price);
console.log('[order-payload-pricing-contract] 5 order payload pricing scenarios passed');

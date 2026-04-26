const { getPricingDisplay, formatAed } = require('../utils/pricingDisplay');

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
    isPriceOnRequest: false,
    ...overrides,
  };
}

const scenarios = [
  {
    name: 'legacy retail fallback',
    product: product({ price: 125, displayPrice: 125 }),
    expected: { displayPrice: 125, originalPrice: null, hasContract: false, isPriceOnRequest: false },
  },
  {
    name: 'server user discount contract',
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
        isPriceOnRequest: false,
        canSeePrice: true,
      },
    }),
    expected: { displayPrice: 180, originalPrice: 200, hasContract: true, isPriceOnRequest: false },
  },
  {
    name: 'guest contract still preserves display value',
    product: product({
      pricing: {
        source: 'server',
        basePrice: 125,
        unitPrice: 125,
        displayPrice: 125,
        originalPrice: null,
        discountPercentage: 0,
        discountLabel: null,
        isPriceOnRequest: false,
        canSeePrice: false,
      },
    }),
    expected: { displayPrice: 125, originalPrice: null, hasContract: true, isPriceOnRequest: false },
  },
  {
    name: 'beauty box contract',
    product: product({
      category: 'Beauty Boxes',
      price: 1120,
      displayPrice: 1120,
      pricing: {
        source: 'server',
        basePrice: 1120,
        unitPrice: 1120,
        displayPrice: 1120,
        originalPrice: 1318,
        discountPercentage: 15,
        discountLabel: 'Bundle 15% off',
        isPriceOnRequest: false,
        canSeePrice: true,
      },
    }),
    expected: { displayPrice: 1120, originalPrice: 1318, hasContract: true, isPriceOnRequest: false },
  },
  {
    name: 'price on request contract',
    product: product({
      isPriceOnRequest: false,
      pricing: {
        source: 'server',
        basePrice: 0,
        unitPrice: 0,
        displayPrice: 0,
        originalPrice: null,
        discountPercentage: 0,
        discountLabel: null,
        isPriceOnRequest: true,
        canSeePrice: false,
      },
    }),
    expected: { displayPrice: 0, originalPrice: null, hasContract: true, isPriceOnRequest: true },
  },
  {
    name: 'selected variant display override',
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
        isPriceOnRequest: false,
        canSeePrice: true,
      },
      variants: [
        { id: 'v-50', size: '50ml', price: 150, isDefault: true },
        { id: 'v-100', size: '100ml', price: 250, isDefault: false },
      ],
    }),
    options: { selectedSize: '100ml' },
    expected: { displayPrice: 250, originalPrice: null, hasContract: true, isPriceOnRequest: false },
  },
];

for (const scenario of scenarios) {
  const result = getPricingDisplay(scenario.product, scenario.options);
  assertEqual(`${scenario.name} displayPrice`, result.displayPrice, scenario.expected.displayPrice);
  assertEqual(`${scenario.name} originalPrice`, result.originalPrice, scenario.expected.originalPrice);
  assertEqual(`${scenario.name} hasContract`, result.hasContract, scenario.expected.hasContract);
  assertEqual(`${scenario.name} isPriceOnRequest`, result.isPriceOnRequest, scenario.expected.isPriceOnRequest);
  console.log(`[pricing-display] ${scenario.name}: ${formatAed(result.displayPrice)}`);
}

console.log(`[pricing-display] ${scenarios.length} display scenarios passed`);

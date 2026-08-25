const {
  getPricingDisplay,
  formatAed,
  resolvePriceView,
  discountLabelFor,
} = require('../utils/pricingDisplay');

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

// ── The storefront view model ────────────────────────────────────────────────
// Every surface that shows a price renders `resolvePriceView`, so these cases
// are the guarantee that the catalogue, favourites and the product page cannot
// disagree with each other or with what checkout charges.

const signedIn = { id: 'user-1', discountType: 'vip', discountPercentage: 20 };
const label = (key, params) => (params ? `${key}:${params.percent}` : key);

const viewScenarios = [
  {
    name: 'signed out hides the number',
    product: product(),
    user: null,
    expected: { kind: 'login' },
  },
  {
    name: 'quote-only product',
    product: product({ isPriceOnRequest: true }),
    user: signedIn,
    expected: { kind: 'onRequest' },
  },
  {
    name: 'bundle reports the percentage the server charged, not a fixed 15',
    product: product({
      category: 'Beauty Boxes',
      pricing: {
        source: 'server',
        displayPrice: 800,
        originalPrice: 1000,
        discountPercentage: 20,
        discountType: 'beauty_box',
        discountLabel: 'Bundle 20% off',
      },
    }),
    user: signedIn,
    expected: { kind: 'discounted', price: 800, originalPrice: 1000, label: 'product.bundleDiscountPercent:20' },
  },
  {
    name: 'black friday keeps its own wording',
    product: product({
      pricing: {
        source: 'server',
        displayPrice: 80,
        originalPrice: 100,
        discountPercentage: 20,
        discountType: 'black_friday',
        discountLabel: 'Black Friday 20% off',
      },
    }),
    user: signedIn,
    expected: { kind: 'discounted', price: 80, originalPrice: 100, label: 'product.blackFridayPercent:20' },
  },
  {
    // The regression this replaced: the grid tile applied the shopper's own
    // percentage to a product the backend excludes, advertising a price that
    // checkout would not honour.
    name: 'noDiscount product never takes the shopper percentage',
    product: product({ noDiscount: true, price: 300, displayPrice: 300 }),
    user: signedIn,
    expected: { kind: 'single', price: 300, originalPrice: null },
  },
  {
    name: 'device without a contract shows one price',
    product: product({ category: 'Device', price: 5000, displayPrice: 5000 }),
    user: signedIn,
    expected: { kind: 'single', price: 5000, originalPrice: null },
  },
  {
    name: 'stale cached payload still renders its own discount',
    product: product({ displayPrice: 90, originalPrice: 100, discountLabel: '10% OFF' }),
    user: signedIn,
    expected: { kind: 'discounted', price: 90, originalPrice: 100, label: 'product.discountPercent:10' },
  },
];

for (const scenario of viewScenarios) {
  const view = resolvePriceView(scenario.product, { user: scenario.user });
  assertEqual(`${scenario.name} kind`, view.kind, scenario.expected.kind);
  if ('price' in scenario.expected) {
    assertEqual(`${scenario.name} price`, view.price, scenario.expected.price);
  }
  if ('originalPrice' in scenario.expected) {
    assertEqual(`${scenario.name} originalPrice`, view.originalPrice, scenario.expected.originalPrice);
  }
  if ('label' in scenario.expected) {
    assertEqual(`${scenario.name} label`, discountLabelFor(view, label), scenario.expected.label);
  }
  console.log(`[price-view] ${scenario.name}: ${view.kind}`);
}

console.log(`[price-view] ${viewScenarios.length} storefront scenarios passed`);

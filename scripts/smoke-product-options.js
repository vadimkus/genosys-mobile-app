import assert from 'node:assert/strict';
import {
  applyProductOptionPrice,
  extractProductOptions,
  getInitialProductSelection,
  getProductOptionKey,
  getProductOptionPrice,
  isOptionAvailable,
  isProductOptionSelectionRequired,
  isProductSelectionComplete,
  loadCanonicalProductForQuickAdd,
} from '../utils/productOptions.js';

const sizeProduct = {
  id: 'cmr6dajor031ygfnm6rsjkicf',
  name: 'CERABARRIER BIOME GEL CLEANSER',
  hasVariants: true,
  inStock: true,
  price: 380,
  displayPrice: 380,
  pricing: {
    source: 'server',
    basePrice: 380,
    displayPrice: 380,
    unitPrice: 380,
    originalPrice: null,
    discountPercentage: 0,
  },
  variants: [
    { size: '200ml', price: 380, available: true, isDefault: true },
    { size: '600ml', price: 620, available: true, isDefault: false },
  ],
};

const colorProduct = {
  id: '41',
  name: 'SKIN CARING BLEMISH BALM CUSHION',
  hasVariants: true,
  inStock: true,
  price: 300,
  variants: [
    { color: 'Beige', price: 300, available: true, isDefault: true },
    { color: 'Camel', price: 300, available: false, isDefault: false },
    { color: 'Ivory', price: 300, available: true, isDefault: false },
  ],
  colorVariants: [
    { value: 'Beige', label: 'Beige', hex: '#E6D5B8' },
    { value: 'Ivory', label: 'Ivory', hex: '#F5E6D3' },
    { value: 'Camel', label: 'Camel', hex: '#A67C52' },
  ],
};

const apiFallbackColorProduct = {
  id: 'cmljaahes0017e9ex5yfv76en',
  name: 'REVITA GLOW BLEMISH BALM CREAM',
  hasVariants: true,
  price: 250,
  variants: [],
  colorVariants: [
    { value: 'Bright', label: '#01 Bright' },
    { value: 'Natural', label: '#02 Natural' },
  ],
};

assert.equal(isProductOptionSelectionRequired(sizeProduct), true);
assert.deepEqual(getInitialProductSelection(sizeProduct), {
  selectedSize: '',
  selectedColor: '',
});
assert.equal(isProductSelectionComplete(sizeProduct, {}), false);
assert.equal(
  isProductSelectionComplete(sizeProduct, { selectedSize: '600ml' }),
  true
);
assert.equal(getProductOptionPrice(sizeProduct, { selectedSize: '600ml' }), 620);

const colorModel = extractProductOptions(colorProduct);
assert.deepEqual(colorModel.colors.map((option) => option.value), [
  'Beige',
  'Ivory',
  'Camel',
]);
assert.equal(isOptionAvailable(colorModel, 'color', 'Camel', {}), false);
assert.equal(isProductSelectionComplete(colorProduct, { selectedColor: 'Camel' }), false);
assert.equal(isProductSelectionComplete(colorProduct, { selectedColor: 'Ivory' }), true);

const fallbackModel = extractProductOptions(apiFallbackColorProduct);
assert.equal(fallbackModel.colors.length, 2);
assert.equal(fallbackModel.requiresExplicitSelection, true);
assert.equal(
  isProductSelectionComplete(apiFallbackColorProduct, { selectedColor: 'Natural' }),
  true
);

const noOptionProduct = { id: 'plain', price: 100, variants: [] };
assert.equal(isProductOptionSelectionRequired(noOptionProduct), false);
assert.equal(isProductSelectionComplete(noOptionProduct, {}), true);

const singleOptionProduct = {
  id: 'single',
  price: 100,
  variants: [{ size: '50ml', price: 100, available: true }],
};
assert.equal(isProductOptionSelectionRequired(singleOptionProduct), false);
assert.deepEqual(getInitialProductSelection(singleOptionProduct), {
  selectedSize: '50ml',
  selectedColor: '',
});

const staleProduct = { id: 'stale', price: 100, hasVariants: true, variants: [] };
assert.equal(isProductOptionSelectionRequired(staleProduct), true);
assert.equal(isProductSelectionComplete(staleProduct, {}), false);

const discountedSizeProduct = {
  ...sizeProduct,
  pricing: {
    ...sizeProduct.pricing,
    discountPercentage: 50,
    originalPrice: 380,
  },
  variants: [
    { size: '200ml', price: 190, available: true, isDefault: true },
    { size: '600ml', price: 310, available: true, isDefault: false },
  ],
};
const discountedSelection = applyProductOptionPrice(discountedSizeProduct, {
  selectedSize: '600ml',
});
assert.equal(discountedSelection.price, 310);
assert.equal(discountedSelection.pricing.unitPrice, 310);
assert.equal(discountedSelection.pricing.originalPrice, 620);

const beigeKey = getProductOptionKey(colorProduct, { selectedColor: 'Beige' });
const ivoryKey = getProductOptionKey(colorProduct, { selectedColor: 'Ivory' });
assert.notEqual(beigeKey, ivoryKey);
assert.equal(
  beigeKey,
  getProductOptionKey(colorProduct, { selectedColor: 'Beige' })
);

const cart = new Map();
[
  { product: colorProduct, selection: { selectedColor: 'Beige' }, quantity: 1 },
  { product: colorProduct, selection: { selectedColor: 'Ivory' }, quantity: 1 },
  { product: colorProduct, selection: { selectedColor: 'Beige' }, quantity: 2 },
].forEach(({ product, selection, quantity }) => {
  const key = getProductOptionKey(product, selection);
  cart.set(key, (cart.get(key) || 0) + quantity);
});
assert.equal(cart.size, 2);
assert.equal(cart.get(beigeKey), 3);
assert.equal(cart.get(ivoryKey), 1);

const syncedFavoriteSummary = {
  id: sizeProduct.id,
  name: sizeProduct.name,
  price: sizeProduct.price,
};
let requestedFavoriteId = '';

loadCanonicalProductForQuickAdd(syncedFavoriteSummary, async (productId) => {
  requestedFavoriteId = productId;
  return sizeProduct;
})
  .then(async (canonicalFavorite) => {
    assert.equal(requestedFavoriteId, sizeProduct.id);
    assert.equal(canonicalFavorite, sizeProduct);
    assert.equal(isProductOptionSelectionRequired(canonicalFavorite), true);
    assert.equal(isProductSelectionComplete(canonicalFavorite, {}), false);
    await assert.rejects(
      loadCanonicalProductForQuickAdd(syncedFavoriteSummary, async () => null),
      /PRODUCT_UNAVAILABLE/
    );
    console.log('Product option selection smoke tests passed (including stale favorite canonicalization).');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

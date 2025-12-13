/**
 * Product pricing utilities for mobile app
 * Based on website's productPricing.ts implementation
 */

/**
 * Get the price for a specific size variant
 */
export function getPriceForSize(product, size) {
  // Product 1 - Microneedle Roller (all sizes same price)
  if (product.id === '1') {
    return 230;
  }
  
  // Product 10 - Two size options
  if (product.id === '10') {
    return size === '180ml' ? 330 : 510;
  }
  
  // Products 30, 29, 32, 28, 31 - Two size options
  if (['30', '29', '32', '28', '31'].includes(product.id)) {
    return size === '50g' ? 290 : 420;
  }
  
  // Product 15 - Two size options
  if (product.id === '15') {
    return size === '200ml' ? 260 : 490;
  }
  
  // Product 16 - Two size options
  if (product.id === '16') {
    return size === '200ml' ? 260 : 490;
  }
  
  // Product 25 - Two size options
  if (product.id === '25') {
    return size === '20g' ? 204 : 440;
  }
  
  // Default: return product's base price
  return product.price || product.displayPrice;
}

/**
 * Check if a product has size variants
 */
export function hasProductSizeVariants(productId) {
  return ['1', '10', '15', '16', '25', '28', '29', '30', '31', '32'].includes(productId);
}

/**
 * Check if a product has color variants
 */
export function hasProductColorVariants(productId) {
  return productId === '41';
}

/**
 * Get available size options for a product
 */
export function getProductSizeOptions(productId) {
  if (productId === '1') {
    return [
      { value: '0.25mm', label: '0.25mm' },
      { value: '0.5mm', label: '0.5mm' },
      { value: '1.0mm', label: '1.0mm' },
      { value: '1.5mm', label: '1.5mm' },
      { value: '2.0mm', label: '2.0mm' }
    ];
  }
  
  if (productId === '10') {
    return [
      { value: '180ml', label: '180ml' },
      { value: '500ml', label: '500ml' }
    ];
  }
  
  if (productId === '31') {
    return [
      { value: '50g', label: '50g' },
      { value: '230g', label: '230g' }
    ];
  }
  
  if (['30', '29', '32', '28'].includes(productId)) {
    return [
      { value: '50g', label: '50g' },
      { value: '250g', label: '250g' }
    ];
  }
  
  if (productId === '15') {
    return [
      { value: '200ml', label: '200ml' },
      { value: '500ml', label: '500ml' }
    ];
  }
  
  if (productId === '16') {
    return [
      { value: '200ml', label: '200ml' },
      { value: '1000ml', label: '1000ml' }
    ];
  }
  
  if (productId === '25') {
    return [
      { value: '20g', label: '20g' },
      { value: '100g', label: '100g' }
    ];
  }
  
  return [];
}

/**
 * Get available color options for a product
 */
export function getProductColorOptions(productId) {
  if (productId === '41') {
    return [
      { value: 'Beige', label: 'Beige', hex: '#E6D5B8' },
      { value: 'Ivory', label: 'Ivory', hex: '#F5E6D3' },
      { value: 'Camel', label: 'Camel', hex: '#A67C52' }
    ];
  }
  
  return [];
}

/**
 * Get size options with prices for display
 */
export function getSizeOptionsWithPrices(product) {
  const sizeOptions = getProductSizeOptions(product.id);
  return sizeOptions.map(option => ({
    ...option,
    price: getPriceForSize(product, option.value)
  }));
}

/**
 * Get default size for a product
 */
export function getDefaultSize(productId) {
  const options = getProductSizeOptions(productId);
  return options.length > 0 ? options[0].value : null;
}

export default {
  getPriceForSize,
  hasProductSizeVariants,
  hasProductColorVariants,
  getProductSizeOptions,
  getProductColorOptions,
  getSizeOptionsWithPrices,
  getDefaultSize
};
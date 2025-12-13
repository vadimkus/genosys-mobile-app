/**
 * Enhanced Pricing Utilities for Genosys Mobile App
 * Mirrors the pricing logic from the website including VAT, discounts, and variants
 */

// UAE VAT Rate (5%)
export const UAE_VAT_RATE = 0.05;

// Beauty Box Discount
export const BEAUTY_BOX_DISCOUNT_PERCENTAGE = 15;

// Black Friday Settings
export const BLACK_FRIDAY_DISCOUNT_PERCENTAGE = 25;

// Beauty box regular prices (before 15% bundle discount)
const BEAUTY_BOX_REGULAR_PRICES = {
  '55': 1318,    // PROBLEM SKIN CARE BEAUTY BOX
  '56': 1496,    // SKIN BRIGHTENING BEAUTY BOX  
  '57': 1520,    // CHARMING LOOK BEAUTY BOX
  '58': 1390,    // ANTI-AGING BEAUTY BOX
  '59': 1318,    // DEEP MOISTURIZING BEAUTY BOX
};

// UAE Emirates with shipping costs
export const UAE_EMIRATES = [
  { name: 'Dubai', shippingCost: 0 },
  { name: 'Abu Dhabi', shippingCost: 25 },
  { name: 'Sharjah', shippingCost: 15 },
  { name: 'Ajman', shippingCost: 20 },
  { name: 'Ras Al Khaimah', shippingCost: 45 },
  { name: 'Fujairah', shippingCost: 45 },
  { name: 'Umm Al Quwain', shippingCost: 35 }
];

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 1000;

/**
 * Calculate UAE VAT from VAT-inclusive price
 * @param {number} vatInclusiveAmount - Price including VAT
 * @returns {number} VAT amount
 */
export function calculateVAT(vatInclusiveAmount) {
  // VAT = (VAT-inclusive amount / 1.05) * 0.05
  return Math.round(((vatInclusiveAmount / (1 + UAE_VAT_RATE)) * UAE_VAT_RATE) * 100) / 100;
}

/**
 * Calculate price excluding VAT
 * @param {number} vatInclusiveAmount - Price including VAT
 * @returns {number} Price excluding VAT
 */
export function calculatePriceExcludingVAT(vatInclusiveAmount) {
  return Math.round((vatInclusiveAmount / (1 + UAE_VAT_RATE)) * 100) / 100;
}

/**
 * Check if Black Friday sale is active
 * @returns {boolean} Whether Black Friday is active
 */
export function isBlackFridaySaleActive() {
  // For demo purposes, you can enable/disable this
  // In production, this would check against actual dates
  return false; // Set to true during Black Friday period
}

/**
 * Get the price for a specific size variant
 * Mirrors the website's productPricing.ts logic
 * @param {Object} product - The product object
 * @param {string} size - Selected size
 * @returns {number} Price for the size
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
  return product.price;
}

/**
 * Check if a product has size variants
 * @param {string} productId - Product ID
 * @returns {boolean} Whether product has size variants
 */
export function hasProductSizeVariants(productId) {
  return ['1', '10', '15', '16', '25', '28', '29', '30', '31', '32'].includes(productId);
}

/**
 * Check if a product has color variants
 * @param {string} productId - Product ID
 * @returns {boolean} Whether product has color variants
 */
export function hasProductColorVariants(productId) {
  return productId === '41';
}

/**
 * Get available size options for a product
 * @param {string} productId - Product ID
 * @returns {Array} Array of size options
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
 * @param {string} productId - Product ID
 * @returns {Array} Array of color options with hex codes
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
 * Calculate discounted price for a product based on user's discount settings
 * Mirrors the website's discountUtils.ts logic
 * @param {Object} product - The product to calculate discount for
 * @param {Object|null} user - The user with discount settings
 * @returns {Object} DiscountedPrice object with pricing details
 */
export function calculateDiscountedPrice(product, user) {
  const originalPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  let discountedPrice = originalPrice;
  let discountAmount = 0;
  let discountPercentage = 0;
  let hasDiscount = false;
  let isBlackFriday = false;
  let isBeautyBox = false;

  // Beauty box products excluded from Black Friday discounts
  const BLACK_FRIDAY_EXCLUDED_PRODUCT_NUMBERS = ['55', '56', '57', '58', '59'];
  
  // Check if this is a beauty box product
  const isBeautyBoxProduct = product.category === 'Beauty Boxes' || 
    (product.productNumber && BLACK_FRIDAY_EXCLUDED_PRODUCT_NUMBERS.includes(product.productNumber));
  
  // If it's a beauty box, show the built-in 15% discount
  if (isBeautyBoxProduct && product.productNumber) {
    const regularPrice = BEAUTY_BOX_REGULAR_PRICES[product.productNumber];
    if (regularPrice !== undefined) {
      return {
        originalPrice: regularPrice,
        discountedPrice: originalPrice, // The stored price is already the bundle price
        discountAmount: Math.round((regularPrice - originalPrice) * 100) / 100,
        discountPercentage: BEAUTY_BOX_DISCOUNT_PERCENTAGE,
        hasDiscount: true,
        isBlackFriday: false,
        isBeautyBox: true,
        vatAmount: calculateVAT(originalPrice)
      };
    }
  }
  
  // Check if product should be excluded from discounts
  // Exclude if: noDiscount flag is true OR category is "Beauty Boxes" OR category is "Device"
  const isExcludedFromDiscount = product.noDiscount === true || 
    product.category === 'Beauty Boxes' || 
    product.category === 'Device';
  
  // Check if product should be excluded from Black Friday discounts
  const isExcludedFromBlackFriday = isExcludedFromDiscount ||
    (product.productNumber && BLACK_FRIDAY_EXCLUDED_PRODUCT_NUMBERS.includes(product.productNumber));

  // Check if Black Friday sale is active (only applies to logged-in users)
  const blackFridayActive = isBlackFridaySaleActive();
  
  if (blackFridayActive && user && !isExcludedFromBlackFriday) {
    // Black Friday discount applies only to registered/logged-in users
    discountPercentage = BLACK_FRIDAY_DISCOUNT_PERCENTAGE;
    discountAmount = (originalPrice * discountPercentage) / 100;
    discountedPrice = originalPrice - discountAmount;
    hasDiscount = true;
    isBlackFriday = true;
  } else if (user && user.discountType && user.discountPercentage && user.discountPercentage > 0 && !isExcludedFromDiscount) {
    // User-specific discount (only if Black Friday is not active)
    discountPercentage = user.discountPercentage;
    discountAmount = (originalPrice * discountPercentage) / 100;
    discountedPrice = originalPrice - discountAmount;
    hasDiscount = true;
  }

  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercentage,
    hasDiscount,
    isBlackFriday,
    isBeautyBox,
    vatAmount: calculateVAT(discountedPrice)
  };
}

/**
 * Get display price for a product based on user's discount settings
 * @param {Object} product - The product to get price for
 * @param {Object|null} user - The user with discount settings
 * @returns {number} The price to display (discounted if applicable)
 */
export function getDisplayPrice(product, user) {
  const { discountedPrice } = calculateDiscountedPrice(product, user);
  return discountedPrice;
}

/**
 * Check if user can see discounted prices
 * @param {Object|null} user - The user to check
 * @returns {boolean} Whether user can see prices
 */
export function canUserSeePrices(user) {
  return user ? (user.canSeePrices ?? false) : false;
}

/**
 * Calculate shipping cost based on emirate and subtotal
 * @param {string} emirate - Selected emirate
 * @param {number} subtotal - Cart subtotal
 * @returns {number} Shipping cost
 */
export function calculateShippingCost(emirate, subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0; // Free shipping for orders over 1000 AED
  }
  
  const emirateData = UAE_EMIRATES.find(e => e.name === emirate);
  return emirateData ? emirateData.shippingCost : 45; // Default to Dubai shipping cost
}

/**
 * Calculate cart totals with VAT, shipping, and discounts
 * @param {Array} cartItems - Array of cart items
 * @param {Object|null} user - Current user
 * @param {string} selectedEmirate - Selected emirate
 * @returns {Object} Cart totals object
 */
export function calculateCartTotals(cartItems, user, selectedEmirate = 'Dubai') {
  // Calculate subtotal with discounts applied
  const subtotal = cartItems.reduce((total, item) => {
    const pricing = calculateDiscountedPrice(item.product, user);
    return total + (pricing.discountedPrice * item.quantity);
  }, 0);

  // Calculate shipping
  const shippingCost = calculateShippingCost(selectedEmirate, subtotal);
  
  // Calculate VAT from VAT-inclusive prices
  const vatAmount = calculateVAT(subtotal + shippingCost);
  
  // Total is VAT-inclusive
  const total = subtotal + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  };
}


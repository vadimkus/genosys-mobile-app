/**
 * Enhanced Badge System for Genosys Mobile App
 * Mirrors the badge logic from the website
 */

/**
 * Badge types with their styling
 */
export const BADGE_TYPES = {
  BEST_SELLER: {
    text: 'Best Seller',
    color: '#FF6B35',
    textColor: '#ffffff',
    priority: 1
  },
  NEW: {
    text: 'New',
    color: '#007AFF',
    textColor: '#ffffff',
    priority: 2
  },
  SALE: {
    text: 'Sale',
    color: '#E74C3C',
    textColor: '#ffffff',
    priority: 3
  },
  PROFESSIONAL: {
    text: 'PRO',
    color: '#8E44AD',
    textColor: '#ffffff',
    priority: 4
  },
  BUNDLE: {
    text: 'Bundle',
    color: '#27AE60',
    textColor: '#ffffff',
    priority: 5
  },
  TOP_RATED: {
    text: '⭐ Top Rated',
    color: '#F39C12',
    textColor: '#ffffff',
    priority: 6
  },
  OUT_OF_STOCK: {
    text: 'Out of Stock',
    color: '#95A5A6',
    textColor: '#ffffff',
    priority: 10 // Always show if applicable
  },
  IN_STOCK: {
    text: 'In Stock',
    color: '#27AE60',
    textColor: '#ffffff',
    priority: 9 // High priority for stock status
  },
  DISCOUNT: {
    text: 'Discount',
    color: '#E74C3C',
    textColor: '#ffffff',
    priority: 7
  },
  BLACK_FRIDAY: {
    text: 'Black Friday',
    color: '#000000',
    textColor: '#ffffff',
    priority: 0 // Highest priority
  },
  BEAUTY_BOX: {
    text: '15% OFF',
    color: '#E91E63',
    textColor: '#ffffff',
    priority: 8
  }
};

/**
 * Product categories that get specific badges
 */
const CATEGORY_BADGES = {
  'Beauty Boxes': 'BUNDLE'
};

/**
 * Products that are considered "new" (added in the last 30 days or manually marked)
 * In a real app, this would check the product's creation date
 */
const NEW_PRODUCTS = [
  // Product IDs that should show "New" badge
  // This could be dynamically determined by creation date
];

/**
 * Products that are best sellers (high sales volume or manually curated)
 */
const BEST_SELLER_PRODUCTS = [
  '18', // MOISTURE REPLENISHING HYALURON SERUM
  '21', // MULTI VITA RADIANCE SERUM
  '10', // SNOW O₂ CLEANSER
  '31', // MULTI VITA RADIANCE CREAM
  // Add more based on sales data
];

/**
 * Products that are top rated (rating >= 4.8)
 */
function isTopRated(product) {
  return product.rating && product.rating >= 4.8;
}

/**
 * Check if product is out of stock
 */
function isOutOfStock(product) {
  return product.status === 'out_of_stock' || 
         product.stock === false || 
         product.inStock === false;
}

/**
 * Check if product is on sale (has any active discount)
 */
function isOnSale(product, user) {
  if (!user || !user.discountPercentage) return false;
  
  // Exclude products that don't allow discounts
  if (product.noDiscount === true || product.category === 'Beauty Boxes') {
    return false;
  }
  
  return user.discountPercentage > 0;
}

/**
 * Check if product is a bundle/kit
 */
function isBundle(product) {
  const bundleKeywords = ['kit', 'box', 'bundle', 'system', 'pack'];
  const productName = product.name.toLowerCase();
  
  return bundleKeywords.some(keyword => productName.includes(keyword)) ||
         product.category === 'Beauty Boxes';
}

/**
 * Generate badges for a product based on its properties and user context
 * @param {Object} product - Product object
 * @param {Object|null} user - Current user (for discount-based badges)
 * @param {Object|null} pricingInfo - Pricing information from calculateDiscountedPrice
 * @returns {Array} Array of badge objects
 */
export function generateProductBadges(product, user = null, pricingInfo = null) {
  const badges = [];

  // Stock status badges (highest priority except Black Friday)
  if (isOutOfStock(product)) {
    badges.push({
      ...BADGE_TYPES.OUT_OF_STOCK,
      type: 'OUT_OF_STOCK'
    });
  } else {
    // In stock badge for products that are available
    // Special case for product 47 (HR³ MATRIX MESOPECIA KIT) - shows "Order by Request"
    const inStockText = product.id === '47' ? 'Order by Request' : 'In Stock';
    
    badges.push({
      ...BADGE_TYPES.IN_STOCK,
      text: inStockText,
      type: 'IN_STOCK'
    });
  }

  // Black Friday badge (if active and product qualifies)
  if (pricingInfo?.isBlackFriday) {
    badges.push({
      ...BADGE_TYPES.BLACK_FRIDAY,
      text: `${pricingInfo.discountPercentage}% Black Friday`,
      type: 'BLACK_FRIDAY'
    });
  }

  // Beauty Box 15% off is shown in pricing, not as badge

  // User-specific discount is shown in pricing, not as badge

  // Don't add duplicate badges for Beauty Boxes
  const isBeautyBoxProduct = product.category === 'Beauty Boxes' || 
    (pricingInfo?.isBeautyBox === true);

  // Best Seller badge removed - no longer shown on product cards

  // New product badge
  if (NEW_PRODUCTS.includes(product.id) || product.isNew) {
    badges.push({
      ...BADGE_TYPES.NEW,
      type: 'NEW'
    });
  }

  // Sale badge (for general sales, different from user discounts)
  if (isOnSale(product, user) && !pricingInfo?.hasDiscount) {
    badges.push({
      ...BADGE_TYPES.SALE,
      type: 'SALE'
    });
  }

  // Category-based badges (skip for beauty boxes to avoid duplication)
  const categoryBadge = CATEGORY_BADGES[product.category];
  if (categoryBadge && !isBeautyBoxProduct) {
    badges.push({
      ...BADGE_TYPES[categoryBadge],
      type: categoryBadge
    });
  }

  // Bundle badge (skip for beauty boxes since they have their own badge)
  if (isBundle(product) && !isBeautyBoxProduct) {
    badges.push({
      ...BADGE_TYPES.BUNDLE,
      type: 'BUNDLE'
    });
  }

  // Top Rated badge removed - no longer shown on product cards

  // Sort badges by priority (lower number = higher priority)
  badges.sort((a, b) => a.priority - b.priority);

  // Return maximum 3 badges to avoid clutter
  return badges.slice(0, 3);
}

/**
 * Get badge color based on badge type
 * @param {string} badgeType - Badge type
 * @returns {string} Hex color code
 */
export function getBadgeColor(badgeType) {
  return BADGE_TYPES[badgeType]?.color || '#007AFF';
}

/**
 * Get badge text color based on badge type
 * @param {string} badgeType - Badge type
 * @returns {string} Hex color code
 */
export function getBadgeTextColor(badgeType) {
  return BADGE_TYPES[badgeType]?.textColor || '#ffffff';
}

/**
 * Check if a badge type should be displayed prominently
 * @param {string} badgeType - Badge type
 * @returns {boolean} Whether badge should be prominent
 */
export function isBadgeProminent(badgeType) {
  const prominentBadges = ['BLACK_FRIDAY', 'BEST_SELLER', 'NEW', 'SALE'];
  return prominentBadges.includes(badgeType);
}

/**
 * Get product status for display
 * @param {Object} product - Product object
 * @returns {string} Status string
 */
export function getProductStatus(product) {
  if (isOutOfStock(product)) {
    return 'out_of_stock';
  }
  
  if (product.inStock === true || product.stock === true) {
    return 'in_stock';
  }
  
  return 'unknown';
}

/**
 * Format badge text for display
 * @param {Object} badge - Badge object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted badge text
 */
export function formatBadgeText(badge, options = {}) {
  const { 
    maxLength = 20,
    uppercase = true 
  } = options;
  
  let text = badge.text;
  
  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  
  // Apply uppercase if requested
  if (uppercase && !text.includes('⭐') && !text.includes('%')) {
    text = text.toUpperCase();
  }
  
  return text;
}


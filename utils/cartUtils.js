/**
 * Minimal cart utilities - Database-driven approach
 * 
 * Note: These are simplified client-side utilities for cart functionality.
 * Server should handle final pricing calculations during checkout.
 */

// UAE Emirates for shipping - minimal data needed for cart
export const UAE_EMIRATES = [
  { name: 'Dubai', shippingCost: 0 },
  { name: 'Abu Dhabi', shippingCost: 25 },
  { name: 'Sharjah', shippingCost: 15 },
  { name: 'Ajman', shippingCost: 20 },
  { name: 'Ras Al Khaimah', shippingCost: 45 },
  { name: 'Fujairah', shippingCost: 50 },
  { name: 'Umm Al Quwain', shippingCost: 30 }
];

/**
 * Calculate basic cart totals for display purposes
 * Note: Server should recalculate final totals during checkout
 * @param {Array} items - Cart items 
 * @param {Object} user - User object (for display purposes)
 * @param {string} selectedEmirate - Selected emirate name
 * @returns {Object} Cart totals for UI display
 */
export function calculateCartTotals(items, user, selectedEmirate) {
  console.log('🧮 Calculating cart totals (client-side for display only)');
  
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
      vatAmount: 0,
      totalWithVat: 0
    };
  }

  // Calculate subtotal using server-provided prices
  const subtotal = items.reduce((sum, item) => {
    const rawPrice = item.product?.displayPrice ?? item.product?.price ?? item.price ?? 0;
    const itemPrice = Number(rawPrice);
    const qty = Number(item.quantity) || 0;
    return sum + (Number.isFinite(itemPrice) ? itemPrice * qty : 0);
  }, 0);

  // Get shipping cost for selected emirate
  const emirate = UAE_EMIRATES.find(e => e.name === selectedEmirate);
  const shipping = emirate ? Number(emirate.shippingCost) || 0 : 0;

  // Basic VAT calculation (5% UAE VAT)
  const vatRate = 0.05;
  const vatAmount = Number.isFinite(subtotal) ? subtotal * vatRate : 0;
  const totalWithVat = (Number.isFinite(subtotal) ? subtotal : 0) + vatAmount + shipping;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totals = {
    subtotal,
    shipping,
    total: totalWithVat,
    itemCount,
    vatAmount,
    totalWithVat,
    selectedEmirate
  };

  console.log('💰 Cart totals calculated:', totals);
  
  return totals;
}

/**
 * Get shipping cost for emirate
 * @param {string} emirateName - Emirate name
 * @returns {number} Shipping cost
 */
export function getShippingCost(emirateName) {
  const emirate = UAE_EMIRATES.find(e => e.name === emirateName);
  return emirate ? emirate.shippingCost : 0;
}

export default {
  calculateCartTotals,
  getShippingCost,
  UAE_EMIRATES
};




import { isBeautyBoxProduct } from './productRules';

/**
 * Compute display badges for a product card.
 * Shared between shop grid and favorites grid.
 *
 * @param {Object} product - Product object
 * @param {Object} labels  - Translated label strings: { order, inStock, new }
 * @returns {Array<{ text: string, color: string, priority?: number }>}
 */
export function computeProductBadges(product, labels = {}) {
  const nameLower = (product?.name || '').trim().toLowerCase();
  const isOutOfStock = product?.status === 'out_of_stock' || product?.stock === false;
  const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
  const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
  const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
  const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
  const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
  const isRevitaGlow = nameLower.includes('revita glow') || (nameLower.includes('revita') && nameLower.includes('blemish')) || String(product?.id) === '63';
  const isBeautyBox = isBeautyBoxProduct(product);

  const baseBadges = (product?.badges || []).filter((badge) => {
    const text = (badge.text || '').toLowerCase().trim();
    if (text === 'best seller' || text === 'limited edition' || text === '50% off') return false;
    if (isBeautyBox && text.includes('bundle') && text.includes('offer')) return false;
    if (text === 'professional') return false;
    if (text === 'new' && !(isPdrnMask || isBioFermentMask || isRevitaGlow)) return false;
    return true;
  });

  const computedBadges = [];
  // "In Stock" is the default and was cluttering every card, so it's no longer
  // shown. Only the "Order" badge (Mesopecia kit) is computed here; NEW /
  // out-of-stock and other meaningful badges still come through below.
  if (!isOutOfStock && isMesopeciaKit) {
    computedBadges.push({ text: labels.order || 'Order', color: '#FF9500', priority: 0 });
  }

  const hasNewBadge = baseBadges.some((b) => String(b?.text || '').toLowerCase().trim() === 'new');
  if ((isBioFermentMask || isRevitaGlow) && !hasNewBadge) {
    computedBadges.push({ text: labels.new || 'New', color: '#007AFF', priority: 1 });
  }

  return [...computedBadges, ...baseBadges]
    .sort((a, b) => (a.priority || 10) - (b.priority || 10))
    .slice(0, 2);
}

// Pure helpers extracted from app/checkout.js to keep the screen declarative.

import { isUserDiscountExcludedProduct } from './productRules';
import { getPricingDisplay } from './pricingDisplay';

export function isValidEmail(value) {
  const email = String(value || '').trim();
  if (!email) return false;
  // Stricter (still simple) email validation:
  // - must have local@domain.tld
  // - TLD at least 2 chars
  // - no trailing dot
  // - no spaces
  if (email.includes(' ')) return false;
  if (email.endsWith('.')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length < 1) return false;
  if (domain.length < 3) return false;
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false;
  // Basic allowed characters check (keeps it practical for UI validation).
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

// Phone UX (UAE fixed)
export function normalizeUaeToNationalDigits(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';

  // +9715XXXXXXXX / 9715XXXXXXXX
  if (digits.startsWith('971')) {
    return digits.slice(3, 12); // max 9 digits
  }

  // 05XXXXXXXX -> 5XXXXXXXX
  if (digits.startsWith('05')) {
    return digits.slice(1, 10);
  }

  // 5XXXXXXXX
  if (digits.startsWith('5')) {
    return digits.slice(0, 9);
  }

  // Fallback: keep last 9 digits (useful for paste)
  return digits.slice(-9);
}

export function formatUaeNationalForInput(nationalDigitsRaw) {
  const d = String(nationalDigitsRaw || '').replace(/\D/g, '').slice(0, 9);
  if (!d) return '';
  // Format: 5X XXX XXXX
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 9);
  return [p1, p2, p3].filter(Boolean).join(' ').trim();
}

export function isValidUaeMobileNational(nationalDigitsRaw) {
  const d = String(nationalDigitsRaw || '').replace(/\D/g, '');
  return d.length === 9 && d.startsWith('5');
}

export function toE164UaePhone(nationalDigitsRaw) {
  const d = String(nationalDigitsRaw || '').replace(/\D/g, '');
  if (!d) return '';
  return `+971${d.slice(0, 9)}`;
}

export function getDeliveryEtaInfo(selectedEmirate) {
  const emirate = String(selectedEmirate || '').trim();
  const isDubai = emirate.toLowerCase() === 'dubai';
  return {
    isDubai,
    // Dubai: today 1-2 hours; others: tomorrow 24-36 hours
    etaLabel: isDubai ? 'today' : 'tomorrow',
    etaWindow: isDubai ? '1-2 hours' : '24-36 hours',
  };
}

export function computeSavingsAED(items, totalsSubtotal) {
  const paid = (items || []).filter((it) => !(it?.isPromotionItem === true || it?.selectedSize === '__PROMO__'));

  const originalSubtotal = paid.reduce((sum, it) => {
    // Products excluded from user discounts (Beauty Boxes, Devices, Hydro Cool Mask, fixed overrides)
    // should not contribute to "You save" calculations in checkout.
    if (isUserDiscountExcludedProduct(it?.product)) return sum;

    const qty = Number(it?.quantity) || 0;
    const pricing = getPricingDisplay(it?.product, {
      selectedSize: it?.selectedSize,
      selectedColor: it?.selectedColor,
    });
    const original = Number(pricing.originalPrice);
    const current = Number(pricing.displayPrice);
    const unit = Number.isFinite(original) && original > 0 ? original : (Number.isFinite(current) ? current : 0);
    return sum + unit * qty;
  }, 0);

  const savings = (Number(originalSubtotal) || 0) - (Number(totalsSubtotal) || 0);
  return Math.max(0, savings);
}






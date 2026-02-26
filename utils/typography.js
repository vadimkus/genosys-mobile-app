import { Platform } from 'react-native';

/**
 * Centralized typography system for consistent text styling across the app.
 *
 * Usage:
 *   import { T } from '../utils/typography';
 *   <Text style={T.pageTitle}>…</Text>
 *   <Text style={[T.body, { color: '#dc2626' }]}>…</Text>
 */

// ─── Base scale ──────────────────────────────────────────────────────
const WEIGHTS = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  heavy:    '800',
};

// ─── Reusable type styles ────────────────────────────────────────────
export const T = {
  // ── Large headings (hero titles, page titles) ──────────────────────
  pageTitle: {
    fontSize: 24,
    fontWeight: WEIGHTS.bold,
    letterSpacing: -0.4,
    color: '#1D1D1F',
  },
  pageTitleLarge: {
    fontSize: 28,
    fontWeight: WEIGHTS.bold,
    letterSpacing: -0.5,
    color: '#1D1D1F',
  },

  // ── Section headings ───────────────────────────────────────────────
  sectionTitle: {
    fontSize: 20,
    fontWeight: WEIGHTS.bold,
    letterSpacing: -0.3,
    color: '#1D1D1F',
  },
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: WEIGHTS.bold,
    letterSpacing: -0.3,
    color: '#1D1D1F',
  },

  // ── Navigation / header bar ────────────────────────────────────────
  navTitle: {
    fontSize: 17,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },

  // ── Subtitle / supporting text under headings ──────────────────────
  subtitle: {
    fontSize: 15,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
  },

  // ── Body text ──────────────────────────────────────────────────────
  body: {
    fontSize: 16,
    fontWeight: WEIGHTS.regular,
    lineHeight: 24,
    color: '#333333',
  },
  bodySmall: {
    fontSize: 15,
    fontWeight: WEIGHTS.regular,
    lineHeight: 22,
    color: '#555555',
  },

  // ── Labels (form labels, row labels, list item titles) ─────────────
  label: {
    fontSize: 14,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },

  // ── Captions / secondary info ──────────────────────────────────────
  caption: {
    fontSize: 13,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
  },
  captionSmall: {
    fontSize: 12,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
  },
  captionTiny: {
    fontSize: 11,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
  },

  // ── Prices ─────────────────────────────────────────────────────────
  priceLarge: {
    fontSize: 24,
    fontWeight: WEIGHTS.bold,
    color: '#1D1D1F',
  },
  price: {
    fontSize: 16,
    fontWeight: WEIGHTS.bold,
    color: '#1D1D1F',
  },
  priceSmall: {
    fontSize: 15,
    fontWeight: WEIGHTS.bold,
    color: '#1D1D1F',
  },
  priceStrikethrough: {
    fontSize: 14,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
    textDecorationLine: 'line-through',
  },
  priceDiscount: {
    fontSize: 16,
    fontWeight: WEIGHTS.bold,
    color: '#dc2626',
  },

  // ── Buttons ────────────────────────────────────────────────────────
  buttonLarge: {
    fontSize: 18,
    fontWeight: WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  button: {
    fontSize: 16,
    fontWeight: WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: WEIGHTS.semibold,
    color: '#FFFFFF',
  },
  buttonTiny: {
    fontSize: 12,
    fontWeight: WEIGHTS.bold,
    color: '#FFFFFF',
  },

  // ── Badges / pills ────────────────────────────────────────────────
  badge: {
    fontSize: 10,
    fontWeight: WEIGHTS.bold,
    color: '#FFFFFF',
  },
  badgeMedium: {
    fontSize: 12,
    fontWeight: WEIGHTS.bold,
    color: '#FFFFFF',
  },

  // ── Product card specifics ─────────────────────────────────────────
  productName: {
    fontSize: 14,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },
  productCategory: {
    fontSize: 12,
    fontWeight: WEIGHTS.regular,
    color: '#86868B',
  },
  productDescription: {
    fontSize: 11,
    fontWeight: WEIGHTS.regular,
    lineHeight: 15,
    color: '#999999',
  },

  // ── Input fields ──────────────────────────────────────────────────
  input: {
    fontSize: 15,
    fontWeight: WEIGHTS.regular,
    color: '#1D1D1F',
  },

  // ── Monospace (order numbers, codes) ───────────────────────────────
  mono: {
    fontSize: 18,
    fontWeight: WEIGHTS.bold,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#1D1D1F',
  },

  // ── Summary row (cart/checkout totals) ─────────────────────────────
  summaryLabel: {
    fontSize: 14,
    fontWeight: WEIGHTS.medium,
    color: '#555555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: WEIGHTS.semibold,
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: WEIGHTS.bold,
    color: '#1D1D1F',
  },

  // ── FAQ ────────────────────────────────────────────────────────────
  faqQuestion: {
    fontSize: 15,
    fontWeight: WEIGHTS.medium,
    color: '#1D1D1F',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    fontWeight: WEIGHTS.regular,
    color: '#555555',
    lineHeight: 22,
  },

  // ── Link-like text ─────────────────────────────────────────────────
  link: {
    fontSize: 14,
    fontWeight: WEIGHTS.semibold,
    color: '#007AFF',
  },
};

export { WEIGHTS };
export default T;

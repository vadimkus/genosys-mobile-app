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

// ─── Display serif (the website's face) ──────────────────────────────
/**
 * Cormorant Garamond, the same display serif the website sets its headings
 * in. Registered in `app/_layout.js`; the files live in `assets/fonts`.
 *
 * One family per weight, and the serif styles below deliberately omit
 * `fontWeight`. Setting both a custom family and a weight makes iOS
 * synthesise the weight instead of picking the file we shipped, which shows
 * up as smeared strokes at display sizes.
 *
 * Cormorant carries Latin and Cyrillic but no Arabic, so Arabic headings fall
 * back to the system face. Use `serifFamily(locale)` rather than the constants
 * directly on any screen that renders all three languages: naming a family
 * with no glyphs for the script leaves Android rendering tofu.
 */
export const SERIF = {
  regular: 'CormorantGaramond-Regular',
  medium: 'CormorantGaramond-Medium',
  semibold: 'CormorantGaramond-SemiBold',
};

export const serifFamily = (locale, weight = 'regular') =>
  String(locale || '').toLowerCase() === 'ar' ? undefined : SERIF[weight] || SERIF.regular;

// ─── Reusable type styles ────────────────────────────────────────────
export const T = {
  // ── Website display serif ──────────────────────────────────────────
  // Sizes track the site's headings: a hero line, a section title, and a
  // card/subsection title.
  serifDisplay: {
    fontFamily: SERIF.regular,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.2,
    color: '#191716',
  },
  serifTitle: {
    fontFamily: SERIF.regular,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: '#191716',
  },
  serifHeading: {
    fontFamily: SERIF.medium,
    fontSize: 21,
    lineHeight: 26,
    color: '#191716',
  },

  // ── Eyebrow ────────────────────────────────────────────────────────
  // The small red uppercase label the site sets above headings ("BLOG",
  // "CLEANSER", "LATEST ARTICLE"). Sans, not serif, on the site too.
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#dc2626',
  },

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

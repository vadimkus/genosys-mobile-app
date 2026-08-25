import { Platform, StyleSheet } from 'react-native';

/**
 * Apple-native design tokens.
 *
 * Source of truth for the iOS-grade visual language documented in
 * docs/UI_APPLE_NATIVE_REDESIGN.md. Reuse these across screens so the app
 * stays cohesive (Settings / Wallet / App Store feel).
 *
 * Usage:
 *   import { theme } from '../utils/theme';
 *   <View style={[theme.card, theme.shadow.card]} />
 *   const s = theme.statusStyle('confirmed');
 */

// ─── Surface and text palette ─────────────────────────────────────────
/**
 * The website's palette, in the token contract the app screens read.
 *
 * Values come from the `--cera-*` custom properties in
 * `cosmetics-website/components/product/cerabarrier/cerabarrier.css`. The
 * previous iOS system greys are kept in the comments so the swap is legible
 * and reversible.
 *
 * Three greys are interpolated rather than copied: the site needs three text
 * weights, the app needs six, and collapsing the extra ones onto `muted` would
 * flatten metadata into body text.
 */
export const colors = {
  groupedBg: '#faf7f5',      // cream page. was #F2F2F7
  card: '#FFFFFF',           // cards read as paper on cream
  subtleBg: '#f3ece8',       // nested inset rows. was #F8F9FA
  fillSecondary: '#f3ece8',  // tinted buttons. was #F2F2F7

  fill: '#f3ece8',           // tinted chips, progress tracks. was #F3F4F6

  // Text scale, darkest to lightest.
  label: '#191716',          // headings, cera ink. was #1D1D1F
  bodyText: '#3d3734',       // running text, cera body. was #374151
  mutedText: '#665e59',      // supporting text, cera muted. was #6B7280
  secondaryLabel: '#7a716b', // metadata, interpolated. was #8E8E93
  placeholder: '#9a908a',    // placeholders, interpolated. was #9CA3AF
  tertiary: '#c2b7b0',       // disclosure chevrons, interpolated. was #C7C7CC

  separator: '#e8e0db',      // hairlines, cera line. was #E5E5EA
  separatorStrong: '#d9cec7', // input borders. was #D1D5DB

  // Primary actions follow the website's product pages: an ink button with
  // white text, with rose carrying the accents. Brand red stays defined
  // because the logo and a few badges still need it, but it no longer paints
  // buttons.
  cta: '#191716',            // primary button background, cera ink
  ctaText: '#FFFFFF',
  accent: '#8f5a5a',         // links, active icons, prices. cera rose-ink
  accentSoft: '#c98b8b',     // decorative rules, quiet icons. cera rose
  accentBg: '#f7ecec',       // tinted pills behind accent text. cera blush

  flagRed: '#CE1126',        // UAE national red. Not the brand token: the
                             // emirate flags must not follow a rebrand.

  // What a shadow is cast in. Warm rather than black: on cream a black cast
  // greys the surface under it instead of suggesting depth.
  shadowCast: '#3d3734',

  // GENOSYS red. Nothing in the interface paints with it any more: actions are
  // ink, accents are rose, danger is `red`, and the logos in use are the grey
  // and white variants. Kept defined because the mark itself is red wherever it
  // does appear, starting with the app icon. The pressed, light and tint
  // variants were dropped once they had no users.
  brand: '#dc2626',
  blue: '#007AFF',
  green: '#34C759',
  greenDeep: '#16A34A',
  orange: '#FF9500',
  // Destructive: errors, delete, negative values. Deepened from iOS #FF3B30,
  // which only reaches 3.3:1 on cream and fails AA as text. This clears 4.8:1
  // on cream and still takes white at 5.1:1 for filled destructive buttons.
  red: '#D22B1E',
  indigo: '#5856D6',
  purple: '#7C3AED',
  teal: '#30B0C7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
};

// ─── Website design language ("cera") ─────────────────────────────────
/**
 * The palette the website uses on its product, brand and blog pages, copied
 * from the `--cera-*` custom properties in
 * `cosmetics-website/components/product/cerabarrier/cerabarrier.css`.
 *
 * Kept separate from `colors` above rather than replacing it, so introducing
 * these tokens changes nothing on screen. Screens move over one at a time;
 * when the last one has, `colors` can be repointed at these values and the
 * duplication collapses.
 *
 * Rough mapping to the iOS tokens above:
 *   groupedBg      → cream        page background
 *   card           → white        cards stay white on cream
 *   label          → ink          headings
 *   secondaryLabel → muted        supporting text
 *   separator      → line         hairlines
 */
export const cera = {
  cream: '#faf7f5',       // page background
  creamDeep: '#f3ece8',   // pressed states, inset rows
  blush: '#f7ecec',       // tinted panels
  blushDeep: '#efd9d9',
  rose: '#c98b8b',        // decorative rules, quiet icons
  roseInk: '#8f5a5a',     // links and controls on cream
  ink: '#191716',         // headings
  body: '#3d3734',        // running text
  muted: '#665e59',       // captions, metadata
  line: '#e8e0db',        // hairlines and borders
  shot: '#eeeeee',        // packshot stage
};

// Retained so the pilot's import keeps resolving; `colors` now holds these
// values, so the two are the same object shape and this can go once no screen
// imports it.
export const ceraColors = colors;

// 10% alpha helper for tinted capsules / button backgrounds.
export const tint = (hex, alpha = '1A') => `${hex}${alpha}`;

// ─── Elevation ────────────────────────────────────────────────────────
export const shadow = {
  // Warm and very faint. A black shadow reads as grey dirt against cream
  // rather than as depth, which is why the website separates cards with a
  // hairline instead. Around a hundred styles here still lean on this for
  // definition, so it is softened rather than removed, and `surfaces.card`
  // now carries the hairline that does the real work.
  card: {
    shadowColor: cera.body,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  // Lift under a primary button. Matches the ink CTA shadow the website uses:
  // low, wide and dark, not a coloured glow.
  cta: (hex) => ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
  }),
};

// ─── Reusable surfaces ────────────────────────────────────────────────
export const surfaces = {
  // The hairline is what defines a card on cream. Styles that set their own
  // border override this; styles that set none now get an edge instead of
  // relying on a shadow to imply one.
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  hairline: {
    height: Platform.select({ ios: 0.5, default: 1 }),
    backgroundColor: colors.separator,
  },
  iconTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

/**
 * Map an order/payment status string to a semantic color set used for the
 * tinted status capsule (background + text + leading dot).
 */
export const statusStyle = (status) => {
  const s = String(status || '').trim().toLowerCase();
  let color = colors.secondaryLabel;
  if (s === 'pending') color = colors.orange;
  else if (s === 'processing' || s === 'shipped' || s === 'shipping') color = colors.blue;
  else if (s === 'out_for_delivery') color = colors.orange;
  else if (s === 'confirmed' || s === 'paid' || s === 'completed' || s === 'delivered') color = colors.greenDeep;
  else if (s === 'cancelled' || s === 'canceled' || s === 'failed' || s === 'refunded' || s === 'deleted') color = colors.red;
  return { color, bg: tint(color, '1A') };
};

export const theme = {
  colors,
  cera,
  ceraColors,
  tint,
  shadow,
  surfaces,
  statusStyle,
};

export default theme;

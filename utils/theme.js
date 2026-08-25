import { Platform } from 'react-native';

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

// ─── System colors (approximate iOS system palette) ───────────────────
export const colors = {
  groupedBg: '#F2F2F7',      // systemGroupedBackground
  card: '#FFFFFF',           // secondarySystemGroupedBackground
  subtleBg: '#F8F9FA',       // nested inset rows
  fillSecondary: '#F2F2F7',  // secondary system fill (tinted buttons)

  fill: '#F3F4F6',           // tinted chips, progress tracks

  // Text scale, darkest to lightest. Screens had accumulated five near-black
  // heading colours and seven mid-greys from mixing the iOS palette with the
  // website's old Tailwind one; these six roles replace all of them.
  label: '#1D1D1F',          // headings
  bodyText: '#374151',       // running text
  mutedText: '#6B7280',      // supporting text
  secondaryLabel: '#8E8E93', // metadata, systemGray
  placeholder: '#9CA3AF',    // placeholders, disabled text
  tertiary: '#C7C7CC',       // disclosure chevrons

  separator: '#E5E5EA',      // opaque separator
  separatorStrong: '#D1D5DB', // input borders, dividers that need to read

  brand: '#dc2626',          // GENOSYS red
  brandDark: '#B91C1C',      // pressed state
  brandLight: '#EF4444',     // secondary accents
  brandTint: '#FEF2F2',      // washed background behind red text
  blue: '#007AFF',
  green: '#34C759',
  greenDeep: '#16A34A',
  orange: '#FF9500',
  red: '#FF3B30',
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

// 10% alpha helper for tinted capsules / button backgrounds.
export const tint = (hex, alpha = '1A') => `${hex}${alpha}`;

// ─── Elevation ────────────────────────────────────────────────────────
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  // Colored CTA glow (use sparingly, primary buttons only)
  cta: (hex) => ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  }),
};

// ─── Reusable surfaces ────────────────────────────────────────────────
export const surfaces = {
  card: {
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
  tint,
  shadow,
  surfaces,
  statusStyle,
};

export default theme;

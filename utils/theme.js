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

  label: '#1D1D1F',          // primary text
  secondaryLabel: '#8E8E93', // systemGray
  tertiary: '#C7C7CC',       // disclosure chevrons, placeholders
  separator: '#E5E5EA',      // opaque separator

  brand: '#dc2626',          // GENOSYS red
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
  else if (s === 'confirmed' || s === 'paid' || s === 'completed' || s === 'delivered') color = colors.greenDeep;
  else if (s === 'cancelled' || s === 'canceled' || s === 'failed' || s === 'refunded' || s === 'deleted') color = colors.red;
  return { color, bg: tint(color, '1A') };
};

export const theme = {
  colors,
  tint,
  shadow,
  surfaces,
  statusStyle,
};

export default theme;

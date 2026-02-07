/**
 * Haptic feedback utility
 * Provides light, medium, and contextual haptics across the app.
 * Falls back silently on unsupported devices / Expo Go.
 */

import * as Haptics from 'expo-haptics';

const safe = (fn) => {
  try {
    fn();
  } catch {
    // Haptics not available (simulator, Expo Go on Android, etc.)
  }
};

/** Light tap - for toggles, selections, tab switches */
export const lightTap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Medium tap - for add-to-bag, confirm actions */
export const mediumTap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Heavy tap - for destructive actions, errors */
export const heavyTap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

/** Success - for order placed, item added */
export const success = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Warning - for validation errors */
export const warning = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));

/** Error - for failed actions */
export const error = () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/** Selection tick - for picker changes, category switch */
export const selectionTick = () => safe(() => Haptics.selectionAsync());

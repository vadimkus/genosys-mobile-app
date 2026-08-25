/**
 * The floating tab bar's dimensions, in one place.
 *
 * The bar is detached from the bottom edge — inset, rounded and on a shadow,
 * the same object the header is — which means it no longer reserves its own
 * space in the layout the way a docked bar does. Any screen that scrolls
 * underneath it has to leave room, so the number it leaves and the number the
 * bar occupies have to come from the same place or the last row ends up behind
 * the tabs.
 */

export const TAB_BAR_HEIGHT = 62;
export const TAB_BAR_INSET = 12;

/**
 * Space to leave at the bottom of a scrolling tab screen.
 *
 * `insets.bottom` is the home indicator on a notched phone and zero elsewhere,
 * where the bar needs its own margin instead.
 */
export function tabBarSpace(insets) {
  const bottom = insets?.bottom || 0;
  return TAB_BAR_HEIGHT + TAB_BAR_INSET + (bottom || TAB_BAR_INSET);
}

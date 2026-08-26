/**
 * Where the product page's floating pill sits, and how much room the gallery
 * has to leave for it.
 *
 * Pulled out of the screen because the relationship between the two is the
 * whole point and it is easy to break: the pill floats over the scroll view, so
 * nothing in the layout stops the photograph from sliding underneath it. It did
 * exactly that, and the claim slides are artwork with a headline across the top,
 * so the bar was taking the first line of the claim with it.
 *
 * Every measurement is taken from the top of the window. The screen hands
 * SafeAreaView only its side edges for that reason: both bars place themselves
 * from `insets`, so letting the container pad the top as well would apply the
 * same inset twice and leave the headroom depending on how absolute children
 * read that padding.
 */

/** Height of the pill itself. */
export const HEADER_PILL_HEIGHT = 48;

/** Gap above the pill, between it and the status bar. */
export const HEADER_PILL_TOP = 8;

/** Clearance below the pill, before the photograph starts. */
export const HEADER_PILL_GAP = 8;

export function pdpHeaderGeometry(insetTop = 0) {
  const headerTop = insetTop + HEADER_PILL_TOP;
  const pillBottom = headerTop + HEADER_PILL_HEIGHT;
  return {
    /** `top` for the absolutely positioned pill. */
    headerTop,
    /** Bottom edge of the pill, in window coordinates. */
    pillBottom,
    /** How far the pill travels to clear the screen, status bar strip and all. */
    hideDistance: pillBottom + HEADER_PILL_GAP,
    /** Blank headroom above the gallery, so no part of it is behind the pill. */
    galleryTopInset: pillBottom + HEADER_PILL_GAP,
  };
}

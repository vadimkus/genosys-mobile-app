/**
 * The product page's pill floats over the scroll view, so nothing in the layout
 * stops the photograph from sliding underneath it - and for a while it did,
 * taking the headline off the top of every claim slide with it.
 *
 * These check the one relationship that keeps it out: the gallery's headroom
 * always reaches past the bottom of the pill, on every handset, including the
 * ones with no notch at all.
 *
 *   npm run smoke:pdp-header-clearance
 */

const assert = require('assert');
const { readFileSync } = require('fs');
const { join } = require('path');

// The helper is an ES module with no imports of its own, so it can be read back
// as source and evaluated here rather than pulled through the app's bundler.
const source = readFileSync(join(__dirname, '..', 'utils', 'pdpHeaderGeometry.js'), 'utf8');
// eslint-disable-next-line no-new-func
const { pdpHeaderGeometry, HEADER_PILL_HEIGHT, HEADER_PILL_GAP } = new Function(
  `${source.replace(/^export /gm, '')}
   return { pdpHeaderGeometry, HEADER_PILL_HEIGHT, HEADER_PILL_TOP, HEADER_PILL_GAP };`
)();

// No notch, notch, Dynamic Island, and a large Android status bar.
const INSETS = [0, 20, 44, 47, 59, 62];

for (const inset of INSETS) {
  const g = pdpHeaderGeometry(inset);

  assert.ok(
    g.galleryTopInset >= g.pillBottom,
    `inset ${inset}: gallery starts at ${g.galleryTopInset}, behind a pill ending at ${g.pillBottom}`
  );
  assert.strictEqual(
    g.galleryTopInset - g.pillBottom,
    HEADER_PILL_GAP,
    `inset ${inset}: clearance under the pill drifted from ${HEADER_PILL_GAP}`
  );
  // The pill has to take the status bar strip with it when it goes, or it
  // parks half on screen.
  assert.ok(
    g.hideDistance >= g.headerTop + HEADER_PILL_HEIGHT,
    `inset ${inset}: pill does not travel far enough to leave the screen`
  );
  assert.ok(g.headerTop >= inset, `inset ${inset}: pill would sit under the status bar`);
}
console.log(`[pdp-header-clearance] gallery clears the pill on ${INSETS.length} inset profiles`);

// The screen must actually apply the headroom, not just compute it.
const screen = readFileSync(join(__dirname, '..', 'app', 'product', '[id].js'), 'utf8');
assert.ok(
  screen.includes('pdpHeaderGeometry(insets.top)'),
  'the product screen no longer takes its header geometry from the shared helper'
);
assert.ok(
  /height: galleryTopInset/.test(screen),
  'the product screen no longer reserves the headroom above the gallery'
);
// SafeAreaView padding the top as well would double the inset and put the
// headroom back at the mercy of how absolute children read that padding.
assert.ok(
  /edges=\{\['left', 'right'\]\}/.test(screen),
  'the product screen container is padding edges it should be leaving to the bars'
);
console.log('[pdp-header-clearance] the screen applies it');

console.log('\n[pdp-header-clearance] all checks passed');

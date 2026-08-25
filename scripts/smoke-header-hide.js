/**
 * The hide-on-scroll decision, run against the gestures that break naive
 * versions of this pattern.
 *
 * `shouldHideHeader` lives in a component file that imports React Native, which
 * a plain node script cannot load, so the function is re-read from source and
 * evaluated on its own. It is pure and has no imports, which is the reason it
 * was pulled out of the scroll listener in the first place.
 */

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'CollapsibleHeader.js'),
  'utf8'
);

const constants = ['DIRECTION_THRESHOLD']
  .map((name) => source.match(new RegExp(`const ${name} = \\d+;`))[0])
  .join('\n');
const fn = source.match(/export function shouldHideHeader\([\s\S]*?\n\}/)[0].replace('export ', '');
// eslint-disable-next-line no-new-func
const shouldHideHeader = new Function(`${constants}\n${fn}\nreturn shouldHideHeader;`)();

const HEADER = 100;
let failures = 0;

/** Replays a series of scroll offsets and returns the bar's state at each step. */
function replay(offsets) {
  let isHidden = false;
  let lastY = offsets[0];
  return offsets.slice(1).map((y) => {
    isHidden = shouldHideHeader({ y, lastY, headerHeight: HEADER, isHidden });
    lastY = y;
    return isHidden;
  });
}

function check(name, offsets, expected) {
  const actual = replay(offsets);
  const got = actual.map((v) => (v ? 'hidden' : 'shown')).join(' ');
  const want = expected.map((v) => (v ? 'hidden' : 'shown')).join(' ');
  if (got !== want) {
    console.error(`  ${name}\n    expected: ${want}\n    actual:   ${got}`);
    failures += 1;
    return;
  }
  console.log(`[header-hide] ${name}`);
}

check(
  'scrolling down into content hides it',
  [0, 120, 260, 400],
  [true, true, true]
);

check(
  // Crossing out of the protected zone by a hair is still a downward scroll,
  // but a one-pixel one, so nothing should move yet.
  'creeping past the top zone does not hide it',
  [95, 101, 104],
  [false, false]
);

check(
  'scrolling back up brings it straight back',
  [0, 400, 300, 200],
  [true, false, false]
);

check(
  'near the top it stays put however you scroll',
  [0, 40, 90, 20],
  [false, false, false]
);

check(
  // A thumb resting on the glass sends a stream of tiny deltas. Without the
  // threshold the bar flaps once per frame.
  'jitter under the threshold changes nothing',
  [200, 500, 503, 501, 505, 502],
  [true, true, true, true, true]
);

check(
  // iOS rubber-band at the bottom of a short page swings the offset back and
  // forth; the bar should not chatter with it.
  'a small bounce does not flip it',
  [200, 600, 597, 599],
  [true, true, true]
);

check(
  'a decisive flick up past the threshold reveals it',
  [200, 600, 560],
  [true, false]
);

if (failures) {
  console.error(`\n${failures} header-hide scenario(s) failed`);
  process.exit(1);
}
console.log('\n[header-hide] all scroll scenarios passed');

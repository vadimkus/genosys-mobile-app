/**
 * Account card: photo URIs stay loadable, and a small spend still paints a bar.
 */
import { pickProfilePicture, resolveProfilePictureUri } from '../utils/userProfile.js';
import { visibleTierProgressFill, visibleTierProgressPercent } from '../utils/tierProgress.js';

let failures = 0;
function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures += 1;
    console.error(`  FAIL ${label}\n    expected: ${e}\n    actual:   ${a}`);
  } else {
    console.log(`  ok   ${label}`);
  }
}

console.log('profile picture');
check('keeps the first real photo', pickProfilePicture('', null, 'https://genosys.ae/me.jpg'), 'https://genosys.ae/me.jpg');
check('resolves a site path', resolveProfilePictureUri('/images/me.jpg'), 'https://genosys.ae/images/me.jpg');
check('leaves a data URL alone', resolveProfilePictureUri('data:image/jpeg;base64,abc').startsWith('data:'), true);
check('empty stays empty', resolveProfilePictureUri(''), '');

console.log('rewards bar');
const silverByOrders = { currentSpent: 432, nextTierAt: 5000, progressPercent: 0 };
check('uses spend over the Gold line when the API percent is zero', Math.round(visibleTierProgressPercent(silverByOrders)), 9);
check('keeps a visible fill for that spend', visibleTierProgressFill(silverByOrders) >= 8, true);
check('a true empty bar stays empty', visibleTierProgressFill({ currentSpent: 0, nextTierAt: 5000, progressPercent: 0 }), 0);

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\naccount profile ok');

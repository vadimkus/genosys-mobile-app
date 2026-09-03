// Soft update gate: the comparison that decides badge and prompt.
import { compareVersions, isUpdateAvailable } from '../utils/version.js';
const cases = [
  ['1.12.0', '1.12.0', false], ['1.12.0', '1.13.0', true], ['1.12.0', '1.12.1', true],
  ['1.12.0', '2.0.0', true], ['1.12.1', '1.12.0', false], ['1.12', '1.12.0', false],
  ['1.9.0', '1.10.0', true], ['1.12.0', '', false], ['1.12.0', 'fallback', false], ['', '1.12.0', true],
];
let bad = 0;
for (const [i, l, want] of cases) {
  const got = isUpdateAvailable(i, l);
  if (got !== want) { bad++; console.log(`FAIL installed=${i} latest=${l} want=${want} got=${got}`); }
}
if (compareVersions('1.10.0', '1.9.0') !== 1) { bad++; console.log('FAIL 1.10 must be newer than 1.9'); }
console.log(bad ? `${bad} failures` : `app update gate ok (${cases.length + 1} checks)`);
process.exit(bad ? 1 : 0);

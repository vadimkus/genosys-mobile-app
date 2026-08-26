/**
 * The add / edit address validator, run against the cases that matter.
 *
 * The screen used to report three required fields through one alert and to
 * reject a phone number for its punctuation, so the cases below lean on each
 * field being reported separately and on numbers written the way people write
 * them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateAddressForm,
  firstAddressError,
  isValidUaePhone,
  normalizePhoneInput,
} from '../utils/addressFormValidation.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The screen looks messages up by key; the tests only care which key fired.
const t = (key) => key;

const complete = {
  name: 'Vadim Sagatdinov',
  phone: '+971559152985',
  address: 'Villa 12, Street 4, Jumeirah',
};

const cases = [
  ['a complete address passes', complete, []],

  ['a missing name is reported', { ...complete, name: '  ' }, ['name']],
  ['a missing street address is reported', { ...complete, address: '' }, ['address']],

  ['an empty phone is reported as missing, not malformed',
    { ...complete, phone: '' }, ['phone']],
  ['a non-UAE phone is reported', { ...complete, phone: '+447700900123' }, ['phone']],

  ['every problem is reported at once, not one at a time',
    {}, ['name', 'phone', 'address']],
];

let failures = 0;
for (const [label, values, expected] of cases) {
  const got = Object.keys(validateAddressForm(values, t)).sort();
  const want = [...expected].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures += 1;
    console.error(`✗ ${label}\n    expected [${want}]\n    got      [${got}]`);
  }
}

// Numbers as people actually punctuate them. Everything the old spaces-only
// check accepted still has to pass, and the punctuated forms it wrongly
// rejected now pass too.
const phones = [
  ['+971559152985', true, 'international, unspaced'],
  ['+971 55 915 2985', true, 'international, spaced'],
  ['+971 55-915-2985', true, 'international, dashed'],
  ['0559152985', true, 'local, unspaced'],
  ['(055) 915 2985', true, 'local, bracketed'],
  ['055 915 2985', true, 'local, spaced'],
  ['042295861', true, 'local landline'],
  ['+447700900123', false, 'not a UAE number'],
  ['5591529', false, 'too short'],
  ['+9715591529851234', false, 'too long'],
  ['', false, 'empty'],
  ['not a phone', false, 'not a number at all'],
];
for (const [input, want, label] of phones) {
  if (isValidUaePhone(input) !== want) {
    failures += 1;
    console.error(`✗ ${label}: ${JSON.stringify(input)} should be ${want ? 'valid' : 'invalid'}`);
  }
}

if (normalizePhoneInput('+971 55-915 2985') !== '+971559152985') {
  failures += 1;
  console.error('✗ normalizing keeps a leading plus and drops the punctuation');
}
if (normalizePhoneInput('(055) 915 2985') !== '0559152985') {
  failures += 1;
  console.error('✗ normalizing a local number drops the brackets');
}

// An empty form should send the user to the top of it, not to whichever key
// the object happened to enumerate first.
const allBad = validateAddressForm({}, t);
if (firstAddressError(allBad) !== 'name') {
  failures += 1;
  console.error(`✗ the first error is the topmost field\n    got ${firstAddressError(allBad)}`);
}
if (firstAddressError({}) !== null) {
  failures += 1;
  console.error('✗ a clean form has no first error');
}

// Every message the validator can produce has to exist in all three locales,
// plus the banner the screen shows above the form.
const locales = ['en', 'ru', 'ar'];
const keys = new Set(
  Object.values(allBad)
    .concat(Object.values(validateAddressForm({ ...complete, phone: '+447700900123' }, t)))
    .concat(['addAddress.fixFieldsBelow'])
);
for (const locale of locales) {
  const messages = JSON.parse(
    fs.readFileSync(path.join(dirname, '..', 'i18n', 'messages', `${locale}.json`), 'utf8')
  );
  for (const key of keys) {
    const [section, name] = key.split('.');
    if (!messages[section] || !messages[section][name]) {
      failures += 1;
      console.error(`✗ ${locale} is missing ${key}`);
    }
  }
}

if (failures) {
  console.error(`\n[address-validation] ${failures} check(s) failed`);
  process.exit(1);
}
console.log(
  `[address-validation] ${cases.length} form scenarios, ${phones.length} phone formats and ${locales.length} locales passed`
);

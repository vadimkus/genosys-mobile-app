/**
 * The edit-profile validator, run against the cases that matter.
 *
 * The screen used to collapse five required fields into one "please fill in all
 * required fields" alert, so the cases below lean on each field being reported
 * separately.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProfileForm, firstProfileError } from '../utils/profileValidation.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The screen looks messages up by key; the tests only care which key fired.
const t = (key) => key;

const complete = {
  firstName: 'Vadim',
  lastName: 'Sagatdinov',
  contactEmail: 'vadim@example.com',
  phone: '+971559152985',
};

const cases = [
  ['a complete profile passes', complete, []],

  ['a missing first name is reported', { ...complete, firstName: '  ' }, ['firstName']],
  ['a missing last name is reported', { ...complete, lastName: '' }, ['lastName']],
  ['a missing phone is reported', { ...complete, phone: '   ' }, ['phone']],

  ['an empty contact email is reported as missing, not malformed',
    { ...complete, contactEmail: '' }, ['contactEmail']],
  ['a malformed contact email is reported',
    { ...complete, contactEmail: 'vadim@' }, ['contactEmail']],
  ['a contact email is trimmed before checking',
    { ...complete, contactEmail: '  vadim@example.com  ' }, []],

  // The read-only account email is never submitted by this screen, so it is
  // deliberately not validated here.
  ['the read-only account email is not validated',
    { ...complete, email: '' }, []],

  ['every problem is reported at once, not one at a time',
    {}, ['firstName', 'lastName', 'contactEmail', 'phone']],
];

let failures = 0;
for (const [label, values, expected] of cases) {
  const errors = validateProfileForm(values, t);
  const got = Object.keys(errors).sort();
  const want = [...expected].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures += 1;
    console.error(`✗ ${label}\n    expected [${want}]\n    got      [${got}]`);
  }
}

// An empty form should send the user to the top of it, not to whichever key
// the object happened to enumerate first.
const allBad = validateProfileForm({}, t);
if (firstProfileError(allBad) !== 'firstName') {
  failures += 1;
  console.error(`✗ the first error is the topmost field\n    got ${firstProfileError(allBad)}`);
}
if (firstProfileError({}) !== null) {
  failures += 1;
  console.error('✗ a clean form has no first error');
}

// Every message the validator can produce has to exist in all three locales,
// plus the banner the screen shows above the form.
const locales = ['en', 'ru', 'ar'];
const keys = new Set(
  Object.values(allBad)
    .concat(Object.values(validateProfileForm({ ...complete, contactEmail: 'x@' }, t)))
    .concat(['editProfile.fixFieldsBelow'])
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
  console.error(`\n[profile-validation] ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`[profile-validation] ${cases.length} validation scenarios and ${locales.length} locales passed`);

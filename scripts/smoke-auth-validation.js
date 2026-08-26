/**
 * The sign-in / sign-up validator, run against the cases that matter.
 *
 * Runs under tsx, like the other smoke scripts, so the util can be imported as
 * written rather than re-read as text.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateAuthForm, firstAuthError } from '../utils/authValidation.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));



// The screen looks messages up by key; the tests only care which key fired.
const t = (key) => key;

const complete = {
  name: 'Vadim Sagatdinov',
  email: 'vadim@example.com',
  normalizedEmail: 'vadim@example.com',
  password: 'longenough1',
  phone: '+971559152985',
  address: 'Building, street, area',
  emirate: 'Dubai',
  privacyConsent: true,
};

const cases = [
  ['a complete sign-up passes', complete, { isLogin: false }, []],
  ['a complete sign-in passes', { ...complete, name: '', phone: '', address: '', emirate: '' }, { isLogin: true }, []],

  ['sign-up wants a name', { ...complete, name: '  ' }, { isLogin: false }, ['name']],
  ['sign-in does not', { ...complete, name: '' }, { isLogin: true }, []],

  ['an empty email is reported as missing, not malformed',
    { ...complete, email: '', normalizedEmail: '' }, { isLogin: false }, ['email']],
  ['a malformed email is reported',
    { ...complete, email: 'vadim@', normalizedEmail: 'vadim@' }, { isLogin: false }, ['email']],
  ['an unconfirmed typo suggestion blocks submission',
    { ...complete, emailSuggestion: 'vadim@gmail.com', confirmedEmail: null }, { isLogin: false }, ['email']],
  ['confirming the address entered clears it',
    { ...complete, emailSuggestion: 'vadim@gmail.com', confirmedEmail: complete.normalizedEmail },
    { isLogin: false }, []],

  ['sign-up enforces eight characters', { ...complete, password: 'short' }, { isLogin: false }, ['password']],
  ['sign-in does not, so legacy accounts still work',
    { ...complete, password: 'short', name: '', phone: '', address: '', emirate: '' }, { isLogin: true }, []],
  ['a missing password is reported as missing, not short',
    { ...complete, password: '' }, { isLogin: false }, ['password']],

  ['sign-up wants phone, address and emirate',
    { ...complete, phone: ' ', address: '', emirate: '' }, { isLogin: false }, ['phone', 'address', 'emirate']],
  ['sign-in wants none of them',
    { ...complete, phone: '', address: '', emirate: '', name: '' }, { isLogin: true }, []],

  ['consent is required either way', { ...complete, privacyConsent: false }, { isLogin: false }, ['consent']],
  ['including when signing in',
    { ...complete, privacyConsent: false, name: '', phone: '', address: '', emirate: '' }, { isLogin: true }, ['consent']],

  ['every problem is reported at once, not one at a time',
    { normalizedEmail: '', privacyConsent: false }, { isLogin: false },
    ['name', 'email', 'password', 'phone', 'address', 'emirate', 'consent']],
];

let failures = 0;
for (const [label, values, options, expected] of cases) {
  const errors = validateAuthForm(values, { ...options, t });
  const got = Object.keys(errors).sort();
  const want = [...expected].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures += 1;
    console.error(`✗ ${label}\n    expected [${want}]\n    got      [${got}]`);
  }
}

// An empty form should send the user to the top of it, not to whichever key
// the object happened to enumerate first.
const allBad = validateAuthForm({ normalizedEmail: '', privacyConsent: false }, { isLogin: false, t });
if (firstAuthError(allBad) !== 'name') {
  failures += 1;
  console.error(`✗ the first error is the topmost field\n    got ${firstAuthError(allBad)}`);
}
if (firstAuthError({}) !== null) {
  failures += 1;
  console.error('✗ a clean form has no first error');
}

// Every message the validator can produce has to exist in all three locales.
const locales = ['en', 'ru', 'ar'];
const keys = new Set(Object.values(allBad).concat(Object.values(
  validateAuthForm({ ...complete, password: 'short', email: 'x@', normalizedEmail: 'x@' }, { isLogin: false, t })
)));
for (const locale of locales) {
  const messages = JSON.parse(fs.readFileSync(path.join(dirname, '..', 'i18n', 'messages', `${locale}.json`), 'utf8'));
  for (const key of keys) {
    const [section, name] = key.split('.');
    if (!messages[section] || !messages[section][name]) {
      failures += 1;
      console.error(`✗ ${locale} is missing ${key}`);
    }
  }
}

if (failures) {
  console.error(`\n[auth-validation] ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`[auth-validation] ${cases.length} validation scenarios and ${locales.length} locales passed`);

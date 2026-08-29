#!/usr/bin/env node
/**
 * Interface chrome is sentence case, matching the website.
 *
 * The catalogue also holds product names and marketing copy, which are not
 * chrome and keep their capitals. Proper nouns inside chrome strings are
 * protected by name, because "Contact support via WhatsApp" is a chrome label
 * with a brand in it.
 *
 * Mirrors __tests__/lib/labelCase.test.ts on the website and the pass in
 * scripts/label-case-sentence.py there. Keep the three in step.
 */

import { readFileSync } from 'node:fs';

const NOT_CHROME = [
  /^product\.routine.*Title$/,
  /^product\.pc.*Benefit.*Title$/,
  /^product\.pcDefault.*Title$/,
  /^orderEmail\./,
  /^about\./,
  /^training\./,
  /^terms\./,
  /^privacy\./,
  /^legal\./,
];

const PROTECTED_PHRASES = [
  'Apple Pay', 'Google Pay', 'Samsung Pay', 'Black Friday', 'Cyber Monday',
  'United Arab Emirates', 'Abu Dhabi', 'Ras Al Khaimah', 'Umm Al Quwain',
  'Eid Al Etihad', 'Middle East', 'Beauty Genie', 'Glass Skin',
  'Gene Re-Birth System', 'Gene Re-Birth', 'Google Play', 'App Store',
  'Play Store', 'Marina Mall', 'Dubai Marina', 'Mall of the Emirates',
  'Dubai Mall',
];

const PROTECTED_WORDS = new Set([
  'Genosys', 'GENOSYS', 'Montaji', 'DTS', 'MG', 'FZ-LLC', 'LLC', 'Genie',
  'Apple', 'Google', 'Samsung', 'WhatsApp', 'Instagram', 'Facebook', 'TikTok',
  'Stripe', 'PayPal', 'Tabby', 'Tamara', 'Visa', 'Mastercard', 'Amex',
  'Carrefour', 'Quiqup', 'Aramex', 'Talabat', 'Careem', 'Noon',
  'UAE', 'Dubai', 'Abu', 'Dhabi', 'Sharjah', 'Ajman', 'Fujairah',
  'Ras', 'Khaimah', 'Umm', 'Quwain', 'United', 'Arab', 'Emirates',
  'Korea', 'Korean', 'Saudi', 'Arabia', 'Etihad', 'Eid',
  'AED', 'USD', 'EUR', 'VAT', 'TRN', 'ID', 'OTP', 'PIN', 'SMS', 'COD',
  'SPF', 'PA', 'INCI', 'PDRN', 'EGF', 'MTS', 'DNA', 'RNA', 'UV', 'UVA',
  'UVB', 'LED', 'RF', 'AHA', 'BHA', 'PHA', 'AI', '3D', '2D',
  'Silver', 'Gold', 'Platinum', 'Bronze', 'VIP',
  'iOS', 'Android', 'PWA', 'FAQ', 'FAQs', 'CEO', 'PDF', 'QR',
  'Mon', 'Tue', 'Tues', 'Wed', 'Thu', 'Thur', 'Thurs', 'Fri', 'Sat', 'Sun',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Sept', 'Oct',
  'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]);

const NOISE = /\{[^}]*\}|<[^>]*>|https?:\/\/\S+/g;
const CLAUSE_BREAK = /^[\u2022|\u00b7\u2013\-/:]$|[\u2600-\u27bf\u{1f300}-\u{1faff}]/u;

function flatten(node, prefix = '') {
  if (typeof node === 'string') return [[prefix, node]];
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k)
  );
}

function offendingWords(raw) {
  let guarded = raw;
  for (const phrase of [...PROTECTED_PHRASES].sort((a, b) => b.length - a.length)) {
    guarded = guarded.split(phrase).join(' ');
  }

  const offenders = [];
  let newClause = true;
  for (const word of guarded.split(' ')) {
    if (!word) continue;
    const opensClause = /^[("'\u2018\u201c[]/.test(word);
    if (!newClause && !opensClause) {
      const bare = word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
      const allCaps = bare === bare.toUpperCase() && bare.length > 1;
      const pluralAcronym =
        bare.length > 2 &&
        bare.endsWith('s') &&
        bare.slice(0, -1) === bare.slice(0, -1).toUpperCase();
      if (
        /^\p{Lu}/u.test(bare) &&
        bare.length > 1 &&
        !allCaps &&
        !pluralAcronym &&
        !PROTECTED_WORDS.has(bare)
      ) {
        offenders.push(bare);
      }
    }
    newClause = CLAUSE_BREAK.test(word);
  }
  return offenders;
}

const en = JSON.parse(readFileSync('i18n/messages/en.json', 'utf8'));
const problems = [];
let checked = 0;

for (const [key, value] of flatten(en)) {
  if (NOT_CHROME.some((p) => p.test(key))) continue;
  const text = value.replace(NOISE, ' ').trim();
  const words = text.split(/\s+/);
  if (words.length < 2 || words.length > 8) continue;
  if (/[.!?](\s|$)/.test(text)) continue;
  checked += 1;
  const bad = offendingWords(value);
  if (bad.length) {
    problems.push(`  ${key} = "${value}"  -> lowercase: ${bad.join(', ')}`);
  }
}

if (problems.length) {
  console.error(`label case: ${problems.length} problem(s)\n`);
  console.error(problems.join('\n'));
  console.error(
    '\nInterface chrome is sentence case. If one of these is a proper noun,'
  );
  console.error('add it to PROTECTED_WORDS here and in the website guard.');
  process.exit(1);
}

console.log(`label case ok in ${checked} chrome labels`);

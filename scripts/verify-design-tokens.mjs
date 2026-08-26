/**
 * Fails if this repo's design tokens have drifted from design-tokens.json.
 *
 * The mobile app and the website are separate repositories, so neither can
 * import the other's tokens at build time. Instead both carry an identical
 * copy of design-tokens.json and both run a check like this one against their
 * own native definition — the `cera` export and `T.eyebrow` here, CSS custom
 * properties on the website.
 *
 * Run: npm run verify:tokens
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const tokens = JSON.parse(read('design-tokens.json'));
const failures = [];

/* ── The cera palette, as the `cera` export in utils/theme.js ─────────── */

// theme.js imports react-native, which will not load outside Metro, so the
// object is read as source rather than imported.
const theme = read('utils/theme.js');
const ceraBlock = theme.match(/export const cera = \{([\s\S]*?)\n\};/);

if (!ceraBlock) {
  failures.push('`export const cera` not found in utils/theme.js');
} else {
  const body = ceraBlock[1];
  for (const [name, expected] of Object.entries(tokens.color)) {
    if (name.startsWith('$')) continue;
    const match = body.match(new RegExp(`\\b${name}:\\s*'([^']+)'`));
    if (!match) {
      failures.push(`cera.${name} is missing from utils/theme.js`);
      continue;
    }
    const actual = match[1].trim().toLowerCase();
    if (actual !== expected.toLowerCase()) {
      failures.push(`cera.${name} is ${actual} in theme.js but ${expected} in design-tokens.json`);
    }
  }
}

/* ── The eyebrow, in utils/typography.js ──────────────────────────────── */

const typography = read('utils/typography.js');
const eyebrowBlock = typography.match(/\n  eyebrow: \{([\s\S]*?)\n  \},/);

if (!eyebrowBlock) {
  failures.push('`eyebrow` style not found in utils/typography.js');
} else {
  const body = eyebrowBlock[1];
  const prop = (name) => {
    const m = body.match(new RegExp(`${name}:\\s*'?([^,']+)'?,`));
    return m ? m[1].trim() : null;
  };
  const eyebrow = tokens.typography.eyebrow;
  // The web expresses tracking in em; React Native takes px. Resolve against
  // the shared font size so the two describe the same rendered result.
  const expectedTracking = eyebrow.fontSize * eyebrow.letterSpacingEm;
  const checks = [
    ['fontSize', String(eyebrow.fontSize)],
    ['fontWeight', String(eyebrow.fontWeight)],
    ['letterSpacing', String(expectedTracking)],
    ['textTransform', eyebrow.textTransform],
  ];
  for (const [name, expected] of checks) {
    const actual = prop(name);
    if (actual !== expected) {
      failures.push(
        `T.eyebrow.${name} is ${actual ?? 'unset'} but design-tokens.json implies ${expected}`
      );
    }
  }
}

/* ── Checksum, so the website repo can prove it holds the same file ───── */

const checksum = createHash('sha256').update(read('design-tokens.json')).digest('hex');

/* ── Report ───────────────────────────────────────────────────────────── */

if (failures.length > 0) {
  console.error('\n[design-tokens] this repo has drifted from design-tokens.json:\n');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('\nEither correct the value above, or change design-tokens.json and');
  console.error('carry the same change to cosmetics-website.\n');
  process.exit(1);
}

const count = Object.keys(tokens.color).filter((k) => !k.startsWith('$')).length;
console.log(`[design-tokens] ${count} colours and the eyebrow match design-tokens.json`);
console.log(`[design-tokens] v${tokens.version} sha256 ${checksum.slice(0, 16)}`);
console.log('[design-tokens] cosmetics-website must report the same version and sha256');

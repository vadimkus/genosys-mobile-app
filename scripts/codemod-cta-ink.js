#!/usr/bin/env node
/**
 * Moves primary actions from brand red to the website's ink CTA.
 *
 * The bespoke product pages on genosys.ae use no red at all: the primary
 * button is `--cera-ink` with white text, and rose carries the accents. This
 * brings the app to that convention.
 *
 * `colors.brand` had been standing in for four different jobs - button fill,
 * accent text, active borders, tinted washes - so the split is by property:
 *
 *   backgroundColor  → cta        ink button
 *   color            → accent     rose-ink text and icons
 *   borderColor      → accent     active/selected outline
 *   tintColor        → accent
 *   tint(brand)      → accentBg   blush wash
 *   shadow.cta(brand)→ cta        the glow must match the button
 *
 * The emirate flags were pointed at `colors.flagRed` first, by hand. They used
 * the brand token, and a rebrand must not repaint a national flag.
 *
 * Run:  node scripts/codemod-cta-ink.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const BY_PROP = {
  backgroundColor: 'cta',
  color: 'accent',
  borderColor: 'accent',
  borderTopColor: 'accent',
  borderBottomColor: 'accent',
  borderLeftColor: 'accent',
  borderRightColor: 'accent',
  borderStartColor: 'accent',
  borderEndColor: 'accent',
  tintColor: 'accent',
  placeholderTextColor: 'accent',
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full, out);
    } else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const files = [...walk(path.join(ROOT, 'app')), ...walk(path.join(ROOT, 'components'))];

const tally = {};
let total = 0;
const touched = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let count = 0;
  const bump = t => { count++; total++; tally[t] = (tally[t] || 0) + 1; };

  let next = src
    // tint(colors.brand) and tint(colors.brand, '14') → the blush wash
    .replace(/tint\(colors\.brand(?:\s*,\s*[^)]*)?\)/g, () => {
      bump('accentBg');
      return 'colors.accentBg';
    })
    // The CTA glow has to match the button it sits under
    .replace(/cta\(colors\.brand\)/g, () => {
      bump('cta (shadow)');
      return 'cta(colors.cta)';
    })
    // prop: colors.brand
    .replace(/(\b[A-Za-z]+)(\s*:\s*)colors\.brand\b/g, (m, prop, sep) => {
      const token = BY_PROP[prop];
      if (!token) return m;
      bump(token);
      return `${prop}${sep}colors.${token}`;
    })
    // prop={colors.brand}
    .replace(/(\b[A-Za-z]+)=\{colors\.brand\}/g, (m, prop) => {
      const token = BY_PROP[prop];
      if (!token) return m;
      bump(token);
      return `${prop}={colors.${token}}`;
    });

  // Pass 2: what is left sits in ternaries, defaults and props passed down to
  // shared components - `tileColor={colors.brand}`,
  // `color={active ? colors.brand : colors.tertiary}`. No property name is
  // attached, so these are read as accents, which is what they are.
  //
  // Icon tiles are the exception. A 28px filled square in ink, repeated down
  // every settings screen, reads as heavy furniture; the website uses rose
  // circles for exactly this job.
  next = next
    .replace(/\btileColor=\{colors\.brand\}/g, () => {
      bump('accentSoft');
      return 'tileColor={colors.accentSoft}';
    })
    .replace(/(backgroundColor:\s*[A-Za-z.]+\s*\|\|\s*)colors\.brand\b/g, (m, head) => {
      bump('accentSoft');
      return `${head}colors.accentSoft`;
    })
    .replace(/\bcolors\.brandTint\b/g, () => {
      bump('accentBg');
      return 'colors.accentBg';
    })
    .replace(/\bcolors\.brandLight\b/g, () => {
      bump('accentSoft');
      return 'colors.accentSoft';
    })
    .replace(/\bcolors\.brand\b(?!Dark)/g, () => {
      bump('accent');
      return 'colors.accent';
    });

  if (count === 0) continue;
  touched.push([path.relative(ROOT, file), count]);
  if (!DRY) fs.writeFileSync(file, next);
}

touched.sort((a, b) => b[1] - a[1]);
console.log(`${DRY ? '[dry] ' : ''}${total} replacements across ${touched.length} files\n`);
for (const [t, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  colors.${t}`);
}
console.log('\nTop files:');
for (const [f, n] of touched.slice(0, 12)) console.log(`  ${String(n).padStart(4)}  ${f}`);

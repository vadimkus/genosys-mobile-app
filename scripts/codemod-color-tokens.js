#!/usr/bin/env node
/**
 * Replaces hard-coded colour literals with tokens from `utils/theme.js`.
 *
 * Stage 1 of the design alignment (see docs/DESIGN_ALIGNMENT_WITH_WEBSITE.md).
 * The point is not tidiness: stage 2 repaints the whole app by changing token
 * values, and that only works if screens read from tokens rather than naming
 * colours inline.
 *
 * Scope is deliberately narrow. Only structural neutrals and the brand red are
 * swept, because those are the ones stage 2 repoints. Status colours — greens,
 * ambers, blues, WhatsApp, Google, flags, gold — carry meaning that survives
 * the retheme and are left exactly as they are.
 *
 * `shadowColor` is skipped throughout. It is always black by design and has
 * nothing to do with the surface palette.
 *
 * Run:  node scripts/codemod-color-tokens.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

// ── Mapping ───────────────────────────────────────────────────────────
// Several near-identical values collapse onto one role. That is the intent:
// five shades of near-black heading text is five chances to drift.
const MAP = {
  // Headings
  '#1d1d1f': 'label',
  '#111827': 'label',
  '#1f2937': 'label',
  '#0b0b0c': 'label',
  '#1a1a1a': 'label',
  '#000000': 'label',

  // Running text
  '#374151': 'bodyText',
  '#333333': 'bodyText',
  '#333': 'bodyText',
  '#3c3c43': 'bodyText',

  // Supporting text
  '#6b7280': 'mutedText',
  '#4b5563': 'mutedText',
  '#555555': 'mutedText',
  '#555': 'mutedText',
  '#666666': 'mutedText',
  '#666': 'mutedText',
  '#6e6e73': 'mutedText',

  // Metadata
  '#8e8e93': 'secondaryLabel',
  '#86868b': 'secondaryLabel',
  '#999999': 'secondaryLabel',
  '#999': 'secondaryLabel',

  // Placeholders / disabled
  '#9ca3af': 'placeholder',
  '#a0a0a8': 'placeholder',

  // Chevrons
  '#c7c7cc': 'tertiary',
  '#c6c6c8': 'tertiary',
  '#d1d1d6': 'tertiary',
  '#ccc': 'tertiary',

  // Surfaces
  '#ffffff': 'white',
  '#fff': 'white',
  '#f2f2f7': 'groupedBg',
  '#f2f2f4': 'groupedBg',
  '#f0f0f2': 'groupedBg',
  '#ececef': 'groupedBg',
  '#e8e8ed': 'groupedBg',
  '#f3f4f6': 'fill',
  '#f0f0f0': 'fill',
  '#f5f5f5': 'fill',
  '#f1f5f9': 'fill',
  '#f8f9fa': 'subtleBg',
  '#f9fafb': 'subtleBg',
  '#f5f5f7': 'subtleBg',

  // Lines
  '#e5e5ea': 'separator',
  '#e5e7eb': 'separator',
  '#d1d5db': 'separatorStrong',

  // Brand
  '#dc2626': 'brand',
  '#d81e05': 'brand',
  '#ef4444': 'brandLight',
  '#b91c1c': 'brandDark',
  '#991b1b': 'brandDark',
  '#fef2f2': 'brandTint',
};

// White reads as two different roles depending on what it paints: a card
// surface, or text sitting on the brand red.
const PROP_OVERRIDE = {
  backgroundColor: { '#ffffff': 'card', '#fff': 'card' },
};

const SKIP_PROPS = new Set(['shadowColor']);

// ── Files ─────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const files = [
  ...walk(path.join(ROOT, 'app')),
  ...walk(path.join(ROOT, 'components')),
  path.join(ROOT, 'utils/typography.js'),
].filter(f => f !== path.join(ROOT, 'utils/theme.js'));

// ── Transform ─────────────────────────────────────────────────────────
function themeImportPath(file) {
  const rel = path.relative(path.dirname(file), path.join(ROOT, 'utils/theme'));
  return rel.startsWith('.') ? rel : './' + rel;
}

function ensureImport(source, file) {
  const importRe = /import\s*\{([^}]*)\}\s*from\s*'([^']*utils\/theme)'/;
  const existing = source.match(importRe);

  if (existing) {
    const names = existing[1].split(',').map(s => s.trim()).filter(Boolean);
    if (names.includes('colors')) return source;
    return source.replace(importRe, `import { colors, ${names.join(', ')} } from '${existing[2]}'`);
  }

  // Insert after the last top-level import so the new line keeps the block
  // together rather than floating above `use strict`-style preambles.
  const lines = source.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
  }
  const stmt = `import { colors } from '${themeImportPath(file)}';`;
  if (lastImport === -1) return stmt + '\n' + source;
  lines.splice(lastImport + 1, 0, stmt);
  return lines.join('\n');
}

function tokenFor(prop, hex) {
  const override = PROP_OVERRIDE[prop];
  if (override && override[hex]) return override[hex];
  return MAP[hex] || null;
}

let totalReplacements = 0;
const touched = [];
const perToken = {};

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let count = 0;

  // Three shapes appear in this codebase:
  //   style objects  prop: '#fff'
  //   JSX strings    prop="#fff"
  //   JSX expression prop={'#fff'}
  let next = original
    .replace(/(\b[A-Za-z]+)(\s*:\s*)(['"])(#[0-9a-fA-F]{3,6})\3/g, (m, prop, sep, _q, hex) => {
      if (SKIP_PROPS.has(prop)) return m;
      const token = tokenFor(prop, hex.toLowerCase());
      if (!token) return m;
      count++;
      perToken[token] = (perToken[token] || 0) + 1;
      return `${prop}${sep}colors.${token}`;
    })
    .replace(/(\b[A-Za-z]+)=(['"])(#[0-9a-fA-F]{3,6})\2/g, (m, prop, _q, hex) => {
      if (SKIP_PROPS.has(prop)) return m;
      const token = tokenFor(prop, hex.toLowerCase());
      if (!token) return m;
      count++;
      perToken[token] = (perToken[token] || 0) + 1;
      return `${prop}={colors.${token}}`;
    })
    .replace(/(\b[A-Za-z]+)=\{(['"])(#[0-9a-fA-F]{3,6})\2\}/g, (m, prop, _q, hex) => {
      if (SKIP_PROPS.has(prop)) return m;
      const token = tokenFor(prop, hex.toLowerCase());
      if (!token) return m;
      count++;
      perToken[token] = (perToken[token] || 0) + 1;
      return `${prop}={colors.${token}}`;
    });

  if (count === 0) continue;

  next = ensureImport(next, file);
  totalReplacements += count;
  touched.push([path.relative(ROOT, file), count]);
  if (!DRY) fs.writeFileSync(file, next);
}

// ── Pass 2: literals inside expressions ───────────────────────────────
// Pass 1 only sees `prop: '#fff'` and `prop="#fff"`. It misses the same
// colours sitting in ternaries, default arguments and function returns —
// `color={selected ? '#fff' : '#6B7280'}`, `chevronColor = '#86868B'`.
//
// Those have no property name attached, so this pass cannot tell a card
// surface from text on red. It maps white to `white`; the two tokens hold the
// same value today, and a swatch default reading `colors.white` is honest.
//
// Black is excluded: it is nearly always a shadow, and `shadowColor` lines are
// skipped outright. Unquoted hex is left alone too — `VideoLaunchScreen`
// carries real CSS in a template literal, and that is not ours to tokenise.
const PASS2 = { ...MAP };
delete PASS2['#000'];
delete PASS2['#000000'];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let count = 0;

  const next = original
    .split('\n')
    .map(line => {
      if (line.includes('shadowColor')) return line;
      return line.replace(/(['"])(#[0-9a-fA-F]{3,6})\1/g, (m, _q, hex) => {
        const token = PASS2[hex.toLowerCase()];
        if (!token) return m;
        count++;
        perToken[token] = (perToken[token] || 0) + 1;
        return `colors.${token}`;
      });
    })
    .join('\n');

  if (count === 0) continue;

  const withImport = ensureImport(next, file);
  totalReplacements += count;
  const seen = touched.find(t => t[0] === path.relative(ROOT, file));
  if (seen) seen[1] += count;
  else touched.push([path.relative(ROOT, file), count]);
  if (!DRY) fs.writeFileSync(file, withImport);
}

touched.sort((a, b) => b[1] - a[1]);
console.log(`${DRY ? '[dry run] ' : ''}${totalReplacements} replacements across ${touched.length} files\n`);
console.log('By token:');
for (const [t, n] of Object.entries(perToken).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  colors.${t}`);
}
console.log('\nTop files:');
for (const [f, n] of touched.slice(0, 15)) console.log(`  ${String(n).padStart(4)}  ${f}`);

#!/usr/bin/env node
/**
 * The shopping container has one name per language.
 *
 *   English  Bag
 *   Russian  Корзина
 *   Arabic   السلة
 *
 * Arabic is the one that actually went wrong: the copy used الحقيبة, a handbag,
 * on roughly 250 buttons across the app and the website. It reads as "add this
 * to your handbag". This guard stops it coming back, and stops "Cart" drifting
 * back into the English strings, which is what put "Add to Cart" and
 * "Add to Bag" on the same screen in the first place.
 *
 * Only customer-visible strings are checked. Three kinds of "cart" are internal
 * and deliberately allowed:
 *
 *   identifiers   `currentStep="cart"`, `step.key === 'cart'` - the label these
 *                 render comes from t('checkout.progressCart'), which says Bag
 *   logs          log.error('Failed to add product to cart') - developer text
 *   route paths   `cleanPath === 'cart'` - inbound deep links must keep
 *                 accepting /cart or every link already in the wild breaks
 *
 * So a string is only flagged if it reads like a sentence: it has to contain a
 * space. Function names like `handleAddToCart` are internal too; renaming them
 * would be churn with nothing behind it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIRS = ['app', 'components', 'i18n', 'utils'];
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.json']);

const HANDBAG = /حقيب/;
// "cart"/"carts" as a word inside a quoted string that also contains a space,
// so `handleAddToCart`, `cartItems` and the bare 'cart' identifier and route
// path do not trip it.
const CART_IN_COPY = /(['"`])([^'"`\n]*\s[^'"`\n]*\bcarts?\b[^'"`\n]*|[^'"`\n]*\bcarts?\b[^'"`\n]*\s[^'"`\n]*)\1/i;
const IS_LOG = /\b(log|console)\.\w+\(/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.has(extname(name))) out.push(full);
  }
  return out;
}

const problems = [];
let files = 0;

for (const dir of DIRS) {
  for (const file of walk(dir)) {
    files += 1;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (HANDBAG.test(line)) {
        problems.push(`${file}:${i + 1}  handbag (حقيبة) - the container is السلة\n    ${line.trim()}`);
      }
      // Comments describe code, not the customer's screen.
      const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      if (IS_LOG.test(code)) return;
      const cart = CART_IN_COPY.exec(code);
      if (cart) {
        problems.push(`${file}:${i + 1}  "cart" in copy - the word is "bag"\n    ${cart[2].trim()}`);
      }
    });
  }
}

if (problems.length) {
  console.error(`bag wording: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`bag wording ok in ${files} files`);

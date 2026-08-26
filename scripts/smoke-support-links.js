/**
 * The support number used to be a literal in thirteen places while a config knob
 * sat unread, so pointing the env var at a new number moved one screen and left
 * the rest dialling the old one. This guards both halves of that: the helper
 * builds links from the config, and no screen goes back to hardcoding.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '..');

let failures = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    failures += 1;
    console.error(`  FAIL ${label}\n    expected: ${expected}\n    actual:   ${actual}`);
  } else {
    console.log(`  ok   ${label}`);
  }
}

// --- link building -------------------------------------------------------
const NUMBER = '971585487665';

function whatsAppUrl(message, number = NUMBER) {
  const text = String(message || '').trim();
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}

function display(n) {
  const m = /^(971)(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(n);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}` : n ? `+${n}` : '';
}

console.log('link building');
check('no message', whatsAppUrl(), `https://wa.me/${NUMBER}`);
check('blank message is treated as none', whatsAppUrl('   '), `https://wa.me/${NUMBER}`);
check(
  'message is encoded exactly once',
  whatsAppUrl('Order #123 & help'),
  `https://wa.me/${NUMBER}?text=Order%20%23123%20%26%20help`,
);
check('arabic message survives', whatsAppUrl('مرحباً'), `https://wa.me/${NUMBER}?text=${encodeURIComponent('مرحباً')}`);
check('uae display grouping', display(NUMBER), '+971 58 548 76 65');
check('non-uae falls back', display('4479460000'), '+4479460000');
check('empty stays empty', display(''), '');

// --- nothing hardcodes the number again ----------------------------------
console.log('no hardcoded support number');
const skip = new Set(['node_modules', '.git', 'docs', 'scripts', '.expo', 'dist']);
const offenders = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) {
      const rel = path.relative(root, full);
      if (rel === 'config/auth.js') continue; // the one place it belongs
      const src = fs.readFileSync(full, 'utf8');
      if (src.includes(NUMBER)) offenders.push(rel);
    }
  }
})(root);

if (offenders.length) {
  failures += 1;
  console.error(`  FAIL the number is hardcoded in:\n    ${offenders.join('\n    ')}`);
} else {
  console.log('  ok   only config/auth.js carries the number');
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nsupport links ok');

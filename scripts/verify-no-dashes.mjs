/**
 * No em dashes, no en dashes. Anywhere a customer might read one.
 *
 * The house rule is absolute, and it had been broken quietly for a long time: 548 files
 * across the app and the website carried one, including the delivery window on the Lock
 * Screen card and the copy in the order notifications.
 *
 * A dash is easy to reintroduce, because it arrives by copy and paste from a document, a
 * translation or a model. This fails the build instead.
 *
 * Escape sequences are fine: `\u2014` in a regex is not a dash in the output. Only the
 * literal characters are rejected.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['i18n', 'app', 'components', 'utils', 'services', 'contexts', 'widgets'];
const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.json'];
const DASH = /[\u2014\u2013]/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const offenders = [];
for (const dir of DIRS) {
  for (const file of walk(path.join(root, dir))) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (DASH.test(line)) offenders.push([path.relative(root, file), i + 1, line.trim()]);
    });
  }
}

if (offenders.length) {
  console.error(`\n${offenders.length} em or en dash(es) found. Use a plain hyphen.\n`);
  for (const [file, line, text] of offenders.slice(0, 20)) {
    console.error(`  ${file}:${line}`);
    console.error(`    ${text.slice(0, 120)}`);
  }
  if (offenders.length > 20) console.error(`  ... and ${offenders.length - 20} more`);
  console.error('\n  node scripts/sweep-dashes.mjs --apply   fixes these.\n');
  process.exit(1);
}

console.log(`no em or en dashes in ${DIRS.length} directories`);

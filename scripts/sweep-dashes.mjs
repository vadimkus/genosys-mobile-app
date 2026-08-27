/**
 * Replace every em dash and en dash in customer-facing copy with a plain hyphen.
 *
 * The house rule is absolute: never an em dash or en dash in anything that leaves
 * the building. This sweeps the strings a customer actually reads.
 *
 * Three shapes, because a blind character swap reads badly in one of them:
 *
 *   1–2 hours          -> 1-2 hours        (a range: no spaces either side)
 *   Delivered — thank  -> Delivered - thank (already spaced: keep the spaces)
 *   overnight—do not   -> overnight - do not (unspaced prose: add them, or the
 *                                             two words weld into one)
 *
 * Comments are left alone. They are not output, and rewriting them would bury the
 * change that matters in noise. In JavaScript and TypeScript only the contents of
 * string literals are touched; JSON has no comments so the whole file is fair game.
 *
 *   node scripts/sweep-dashes.mjs           # report only
 *   node scripts/sweep-dashes.mjs --apply   # write
 */
import fs from 'fs';
import path from 'path';

const apply = process.argv.includes('--apply');
const DASH = /[\u2014\u2013]/;

/** The three shapes above, in the order they must be tried. */
function swap(text) {
  return text
    .replace(/(\d)\s*[\u2014\u2013]\s*(\d)/g, '$1-$2')
    .replace(/ [\u2014\u2013] /g, ' - ')
    .replace(/([^\s])[\u2014\u2013]([^\s])/g, '$1 - $2')
    .replace(/[\u2014\u2013]/g, '-');
}

/**
 * Whole files, comments included.
 *
 * An earlier version tried to touch only string literals and leave comments alone. It
 * cannot be done with a regex: JSDoc is full of backticks, so the literal matcher pairs
 * them across comment blocks and rewrites great swathes of prose anyway. Since the rule
 * covers every file that gets saved, the honest thing is to sweep the file.
 */
const CODE = ['.js', '.jsx', '.ts', '.tsx', '.json'];

const TARGETS = [
  {
    repo: '/Users/vadimkus/genosys-mobile-app',
    dirs: ['i18n', 'app', 'components', 'utils', 'services', 'contexts', 'widgets', 'scripts'],
    exts: CODE,
  },
  {
    repo: '/Users/vadimkus/cosmetics-website',
    dirs: ['messages', 'lib', 'components', 'data', 'app', '__tests__'],
    exts: CODE,
  },
];

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

let changedFiles = 0;
let changedStrings = 0;

for (const target of TARGETS) {
  const files = target.files
    ? target.files.map((f) => path.join(target.repo, f))
    : target.dirs.flatMap((d) => walk(path.join(target.repo, d), target.exts));

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    if (!DASH.test(before)) continue;

    const after = swap(before);
    if (after === before) continue;

    changedFiles += 1;
    const rel = path.relative(target.repo, file);
    const repo = path.basename(target.repo);

    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    const diffs = [];
    for (let i = 0; i < beforeLines.length; i++) {
      if (beforeLines[i] !== afterLines[i]) diffs.push([i + 1, beforeLines[i], afterLines[i]]);
    }
    changedStrings += diffs.length;

    console.log(`\n${repo}/${rel}  (${diffs.length} line${diffs.length === 1 ? '' : 's'})`);
    for (const [line, from, to] of diffs.slice(0, 6)) {
      console.log(`  ${line}  - ${from.trim().slice(0, 118)}`);
      console.log(`  ${line}  + ${to.trim().slice(0, 118)}`);
    }
    if (diffs.length > 6) console.log(`  ... and ${diffs.length - 6} more`);

    if (apply) fs.writeFileSync(file, after);
  }
}

console.log(
  `\n${changedFiles} file(s), ${changedStrings} line(s)` + (apply ? ' written.' : '. Dry run: pass --apply to write.')
);

/**
 * The information pages are meant to look like one another.
 *
 * They had drifted: the hero's padding came in four combinations, the title was
 * `pageTitle` on seven pages and the smaller `sectionTitle` on brand, the subtitle was
 * `body` on two and `subtitle` on three, and about, brand and contact each opened with
 * the GENOSYS logo — repeating on every page what the header already said, and pushing
 * the content below the fold.
 *
 * This pins the shape: one hero component, no page rebuilding it by hand, and no logo
 * back in a hero.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const PAGES = [
  'app/profile/help.js',
  'app/about.js',
  'app/brand.js',
  'app/partners.js',
  'app/training.js',
  'app/locations.js',
  'app/faq.js',
  'app/contact.js',
];

let failures = 0;
function check(label, ok, detail) {
  if (ok) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? `\n    ${detail}` : ''}`);
  }
}

console.log('every information page uses the shared hero');
for (const page of PAGES) {
  const src = read(page);
  check(`${page.replace('app/', '')} renders <PageHero`, src.includes('<PageHero'));
}

console.log('none of them rebuilds it');
for (const page of PAGES) {
  const src = read(page);
  const rebuilt = ['heroSection', 'heroTitle', 'heroSubtitle'].filter((s) =>
    new RegExp(`styles\\.${s}\\b`).test(src)
  );
  check(`${page.replace('app/', '')} has no local hero styles`, rebuilt.length === 0, rebuilt.join(', '));
}

console.log('no logo in a hero');
for (const page of PAGES) {
  const src = read(page);
  check(`${page.replace('app/', '')} carries no logo`, !/genosys-logo/.test(src));
}

console.log('the hero itself');
const hero = read('components/PageHero.js');
check('title is the page title size', /\.\.\.T\.pageTitle/.test(hero));
check('subtitle is body, not the smaller subtitle', /\.\.\.T\.body/.test(hero) && !/\.\.\.T\.subtitle/.test(hero));
check('subtitle is optional', /subtitle \?/.test(hero));

// The shell around it was already consistent; keep it that way.
console.log('the page shell');
for (const page of PAGES) {
  const src = read(page);
  check(`${page.replace('app/', '')} hides its header on scroll`, /hideOnScroll:\s*true/.test(src));
  check(`${page.replace('app/', '')} clears the header`, /paddingTop:\s*headerHeight/.test(src));
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\npage shell ok');

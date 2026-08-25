/**
 * Checks the shape the product page expects from `product.bespokeContent`.
 *
 * The copy comes from the website's bespoke pages, flattened server-side into
 * blocks. That flattening reads the shape of each section rather than knowing
 * the products by name, so the risk is not that it crashes — it is that a
 * section quietly arrives in a form the renderer skips, and a claim disappears
 * from the app while still being on the website.
 *
 * Run against the live API: node scripts/smoke-bespoke-content.js
 * Or a local one:           MOBILE_API=http://127.0.0.1:3000/api/mobile node scripts/smoke-bespoke-content.js
 */

const API = process.env.MOBILE_API || 'https://genosys.ae/api/mobile';
const KEY = process.env.EXPO_PUBLIC_API_KEY || 'genosys_secure_mobile_2025_v1';
const PRODUCTS = process.env.PRODUCTS
  ? process.env.PRODUCTS.split(',')
  : ['8', '41', '51', '64', '65'];
const LOCALES = ['en', 'ru', 'ar'];

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

function checkBlock(where, block, fail) {
  if (!isText(block.key)) fail(`${where}: block has no key`);
  // The renderer titles a block from `title`, falling back to `eyebrow`. With
  // neither it draws nothing at all.
  if (!isText(block.title) && !isText(block.eyebrow)) {
    fail(`${where}/${block.key}: no title and no eyebrow, the block would not render`);
  }
  const parts = ['intro', 'body', 'note', 'disclaimer'];
  for (const part of parts) {
    if (block[part] !== undefined && !isText(block[part])) fail(`${where}/${block.key}: ${part} is not text`);
  }
  for (const [field, shape] of [
    ['bullets', (v) => isText(v)],
    ['entries', (v) => isText(v.title) || isText(v.body)],
    ['rows', (v) => isText(v.label) && isText(v.value)],
    ['questions', (v) => isText(v.question) && isText(v.answer)],
    ['lists', (v) => Array.isArray(v.items) && v.items.every(isText)],
  ]) {
    if (block[field] === undefined) continue;
    if (!Array.isArray(block[field]) || block[field].length === 0) {
      fail(`${where}/${block.key}: ${field} is empty or not an array`);
      continue;
    }
    const bad = block[field].filter((v) => !shape(v));
    if (bad.length) fail(`${where}/${block.key}: ${bad.length} malformed ${field}`);
  }
  const hasContent = parts.some((p) => isText(block[p])) ||
    ['bullets', 'entries', 'rows', 'questions', 'lists'].some((f) => block[f]?.length);
  if (!hasContent) fail(`${where}/${block.key}: heading with nothing under it`);
}

async function main() {
  const failures = [];
  const fail = (message) => failures.push(message);
  let checkedBlocks = 0;

  for (const product of PRODUCTS) {
    const structures = new Map();
    for (const locale of LOCALES) {
      const where = `product ${product} ${locale}`;
      const response = await fetch(`${API}/products/${product}?locale=${locale}`, {
        headers: { 'x-api-key': KEY, locale },
      });
      if (!response.ok) {
        fail(`${where}: HTTP ${response.status}`);
        continue;
      }
      const body = await response.json();
      const content = (body.data || body.product || body)?.bespokeContent;
      if (!content) {
        fail(`${where}: no bespokeContent`);
        continue;
      }
      if (!isText(content.headline)) fail(`${where}: no headline`);
      if (!Array.isArray(content.blocks) || content.blocks.length === 0) {
        fail(`${where}: no blocks`);
        continue;
      }
      for (const block of content.blocks) {
        checkBlock(where, block, fail);
        checkedBlocks += 1;
      }
      structures.set(locale, content.blocks.map((b) => b.key).join(','));
      console.log(
        `[bespoke-content] ${where}: ${content.blocks.length} blocks, ` +
          `${(Buffer.byteLength(JSON.stringify(content), 'utf8') / 1024).toFixed(1)} KB`
      );
    }
    // A shopper reading in Russian must not be shown fewer sections than one
    // reading in English.
    const shapes = new Set(structures.values());
    if (shapes.size > 1) {
      fail(`product ${product}: locales disagree on which blocks exist`);
      for (const [locale, shape] of structures) console.log(`    ${locale}: ${shape}`);
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} problem(s):`);
    failures.forEach((f) => console.error('  ' + f));
    process.exit(1);
  }
  console.log(`\n[bespoke-content] ${checkedBlocks} blocks across ${PRODUCTS.length} products passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

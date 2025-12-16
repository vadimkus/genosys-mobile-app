import { asText } from './productDetailUtils';

export function parseBeautyBoxDescription(rawText) {
  const text = asText(rawText || '').trim();
  if (!text) {
    return { description: '', pricingLine: '', title: '', items: [] };
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const idxPricing = lines.findIndex((l) => /^regular price:/i.test(l));
  const idxTitle = lines.findIndex((l) => /beauty box\s*:/i.test(l));
  const idxKit = lines.findIndex((l) => /^kit includes:?/i.test(l));

  const descriptionLines =
    idxPricing > 0 ? lines.slice(0, idxPricing) : lines.slice(0, Math.min(lines.length, 3));
  const description = descriptionLines.join('\n\n').trim();
  const pricingLine = idxPricing >= 0 ? lines[idxPricing] : '';
  const titleLine = idxTitle >= 0 ? lines[idxTitle] : '';
  const title = titleLine
    .replace(/^❤️\s*/i, '')
    .replace(/^beauty box\s*:\s*/i, '')
    .trim();

  const startItems =
    idxKit >= 0
      ? idxKit + 1
      : idxTitle >= 0
        ? idxTitle + 1
        : idxPricing >= 0
          ? idxPricing + 1
          : 0;
  const itemLines = startItems > 0 ? lines.slice(startItems) : [];

  const items = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const body = current.body.join('\n').trim();
    items.push({
      index: current.index,
      header: current.header.trim(),
      body,
    });
    current = null;
  };

  for (const l of itemLines) {
    const m = l.match(/^(\d+)\.\s*(.+)$/);
    if (m) {
      flush();
      current = { index: Number(m[1]), header: m[2], body: [] };
      continue;
    }
    if (!current) {
      // Ignore stray lines before first item
      continue;
    }
    current.body.push(l);
  }
  flush();

  return { description, pricingLine, title, items };
}




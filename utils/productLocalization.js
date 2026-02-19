/**
 * Helpers to display product fields in the currently selected app locale.
 *
 * Backend support (recommended):
 * - Provide `localizedName` / `localizedDescription` (already resolved per locale)
 * OR provide fields like `nameRu`, `nameAr`, `descriptionRu`, `descriptionAr`.
 *
 * Client will gracefully fallback to English `name`/`description`.
 */

const normLocale = (locale) => String(locale || 'en').toLowerCase().split('-')[0];

const pickFirstNonEmpty = (...values) => {
  for (const v of values) {
    const s = typeof v === 'string' ? v.trim() : '';
    if (s) return s;
  }
  return '';
};

/**
 * Categories coming from the backend are intended to be canonical English values, but in practice
 * they can arrive with inconsistent casing and/or composite values like "Cushion BB, Sun".
 *
 * We centralize normalization here so all screens behave consistently (filtering, search labels, i18n).
 */
const CATEGORY_CANONICAL_BY_KEY = {
  all: 'All',
  microneedling: 'Microneedling',
  'pro solution': 'PRO Solution',
  cleanser: 'Cleanser',
  peeling: 'Peeling',
  'toner/mist': 'Toner/Mist',
  'toner / mist': 'Toner/Mist',
  serum: 'Serum',
  cream: 'Cream',
  mask: 'Mask',
  sun: 'Sun',
  'cushion bb': 'Cushion BB',
  'scalp/hair': 'Scalp/Hair',
  'scalp / hair': 'Scalp/Hair',
  'eye care': 'Eye Care',
  'eye zone': 'Eye Care',
  device: 'Device',
  devices: 'Device',
  'holiday kits': 'Holiday Kits',
  kits: 'Holiday Kits',
  'beauty boxes': 'Beauty Boxes',
  'beauty box': 'Beauty Boxes',
  'bio meso': 'Bio Meso',
  'bio-meso': 'Bio Meso',
  'skin concern': 'Skin Concern',
};

export const normalizeCategoryCanonical = (rawCategory) => {
  if (!rawCategory) return null;
  const key = String(rawCategory).trim().toLowerCase();
  return CATEGORY_CANONICAL_BY_KEY[key] || null;
};

/**
 * Parse a raw category value into canonical category tags.
 * - Supports composite strings like "Cushion BB, Sun"
 * - Dedupes and preserves canonical casing
 */
export const getCanonicalCategoryTagsFromRaw = (rawCategory) => {
  if (!rawCategory) return [];
  const raw = String(rawCategory);
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const tags = new Set();
  if (parts.length) {
    parts.forEach((p) => {
      const canon = normalizeCategoryCanonical(p);
      if (canon) tags.add(canon);
    });
  } else {
    const canon = normalizeCategoryCanonical(raw);
    if (canon) tags.add(canon);
  }
  return Array.from(tags);
};

/**
 * Some products should appear in multiple category tabs (UX expectation).
 * Example: Cushion BB + Blemish Balm should also be shown under "Sun".
 */
export const getCategoryTagsForProduct = (product) => {
  const tags = new Set();
  const rawCat = String(product?.category || '');
  getCanonicalCategoryTagsFromRaw(rawCat).forEach((t) => tags.add(t));

  const rawCatLower = rawCat.toLowerCase();
  const nameLower = String(product?.name || '').toLowerCase();

  // If backend category explicitly includes "sun" (e.g. "Cushion BB, Sun") treat as Sun too.
  if (rawCatLower.includes('sun')) tags.add('Sun');

  // Cushion BB products should also be part of Sun.
  if (tags.has('Cushion BB')) tags.add('Sun');

  // Blemish Balm should also be part of Sun even if categorized differently.
  if (nameLower.includes('blemish balm')) tags.add('Sun');

  return Array.from(tags);
};

export const getLocalizedProductName = (product, locale) => {
  const l = normLocale(locale);
  if (!product) return '';

  if (l === 'ar') {
    return (
      pickFirstNonEmpty(
        product.localizedName,
        product.nameAr,
        product.name_ar,
        product.arName,
        product.ar_name
      ) || pickFirstNonEmpty(product.name)
    );
  }

  if (l === 'ru') {
    return (
      pickFirstNonEmpty(
        product.localizedName,
        product.nameRu,
        product.name_ru,
        product.ruName,
        product.ru_name
      ) || pickFirstNonEmpty(product.name)
    );
  }

  return pickFirstNonEmpty(product.localizedName, product.name);
};

export const getLocalizedProductDescription = (product, locale) => {
  const l = normLocale(locale);
  if (!product) return '';

  if (l === 'ar') {
    return (
      pickFirstNonEmpty(
        product.localizedDescription,
        product.descriptionAr,
        product.description_ar,
        product.arDescription,
        product.ar_description
      ) || pickFirstNonEmpty(product.description)
    );
  }

  if (l === 'ru') {
    return (
      pickFirstNonEmpty(
        product.localizedDescription,
        product.descriptionRu,
        product.description_ru,
        product.ruDescription,
        product.ru_description
      ) || pickFirstNonEmpty(product.description)
    );
  }

  return pickFirstNonEmpty(product.localizedDescription, product.description);
};

/**
 * Some products currently ship with a localized `size` string coming from the backend
 * (e.g. RU: "1 набор"). When the app is in EN/AR this looks broken.
 *
 * Until backend provides `sizeRu/sizeAr` (or `localizedSize`), normalize the most common tokens.
 */
export const getLocalizedProductSize = (product, locale) => {
  const l = normLocale(locale);
  const raw = pickFirstNonEmpty(
    product?.localizedSize,
    product?.sizeAr,
    product?.size_ar,
    product?.arSize,
    product?.ar_size,
    product?.sizeRu,
    product?.size_ru,
    product?.ruSize,
    product?.ru_size,
    product?.size
  );
  const s = String(raw || '').trim();
  if (!s) return '';

  const hasCyrillic = /[\u0400-\u04FF]/.test(s);
  let out = s;

  // RU → EN/AR fallback for common "kit/set" size label.
  if (hasCyrillic && l !== 'ru') {
    const replacement = l === 'ar' ? 'مجموعة' : 'set';
    // NOTE: JS \b word boundaries are ASCII-centric and won't match Cyrillic reliably.
    out = out.replace(/набор/gi, replacement);
    return out;
  }

  // EN "set" → AR
  if (l === 'ar') {
    out = out.replace(/\bset\b/gi, 'مجموعة');
  }

  // EN "set" → RU (if backend ever sends EN size while in RU)
  if (l === 'ru' && !hasCyrillic) {
    out = out.replace(/\bset\b/gi, 'набор');
  }

  return out;
};

/**
 * Category labels are stored in DB in English (canonical values).
 * This helper returns a translation key for a given canonical category.
 */
export const getCategoryTranslationKey = (category) => {
  const c =
    normalizeCategoryCanonical(category) ||
    // Fallback for composite categories: use first canonical tag, if any
    getCanonicalCategoryTagsFromRaw(category)?.[0] ||
    String(category || '').trim();
  switch (c) {
    case 'All':
      return 'categories.all';
    case 'Microneedling':
      return 'categories.microneedling';
    case 'PRO Solution':
      return 'categories.proSolution';
    case 'Cleanser':
      return 'categories.cleanser';
    case 'Peeling':
      return 'categories.peeling';
    case 'Toner/Mist':
      return 'categories.tonerMist';
    case 'Serum':
      return 'categories.serum';
    case 'Cream':
      return 'categories.cream';
    case 'Mask':
      return 'categories.mask';
    case 'Sun':
      return 'categories.sun';
    case 'Cushion BB':
      return 'categories.cushionBB';
    case 'Scalp/Hair':
      return 'categories.scalpHair';
    case 'Eye Care':
      return 'categories.eyeCare';
    case 'Device':
      return 'categories.device';
    case 'Holiday Kits':
      return 'categories.holidayKits';
    case 'Beauty Boxes':
      return 'categories.beautyBoxes';
    case 'Bio Meso':
      return 'categories.bioMeso';
    case 'Skin Concern':
      return 'categories.skinConcern';
    default:
      return null;
  }
};



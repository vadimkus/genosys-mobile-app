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
 * Category labels are stored in DB in English (canonical values).
 * This helper returns a translation key for a given canonical category.
 */
export const getCategoryTranslationKey = (category) => {
  const c = String(category || '').trim();
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
    default:
      return null;
  }
};



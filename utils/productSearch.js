import {
  getCategoryTagsForProduct,
  getCategoryTranslationKey,
  getLocalizedProductDescription,
  getLocalizedProductName,
  normalizeCategoryCanonical,
} from './productLocalization';

export const normalizeProductSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u064B-\u0652]/g, '');

const getQueryTokens = (query) =>
  normalizeProductSearchText(query).split(/\s+/).filter(Boolean);

const getSearchFields = (product, { locale = 'en', t = (key) => key } = {}) => {
  const canonical = normalizeCategoryCanonical(product?.category) || '';
  const canonicalKey = canonical ? getCategoryTranslationKey(canonical) : null;
  const canonicalLabel = canonicalKey ? t(canonicalKey) : canonical;
  const tagLabels = getCategoryTagsForProduct(product).map((tag) => {
    const key = getCategoryTranslationKey(tag);
    return key ? t(key) : tag;
  });
  const variantTerms = (product?.variants || []).flatMap((variant) => [
    variant?.color,
    variant?.size,
  ]);

  const names = [
    getLocalizedProductName(product, locale),
    product?.name,
    product?.nameRu || product?.name_ru,
    product?.nameAr || product?.name_ar,
  ].map(normalizeProductSearchText).filter(Boolean);

  const descriptions = [
    getLocalizedProductDescription(product, locale),
    product?.description,
    product?.descriptionRu || product?.description_ru,
    product?.descriptionAr || product?.description_ar,
  ].map(normalizeProductSearchText).filter(Boolean);

  const secondary = [
    product?.category,
    product?.size,
    canonical,
    canonicalLabel,
    ...tagLabels,
    ...variantTerms,
  ].map(normalizeProductSearchText).filter(Boolean);

  return { names, descriptions, secondary };
};

export const matchesProductSearch = (product, query, options) => {
  const tokens = getQueryTokens(query);
  if (tokens.length === 0) return true;

  const fields = getSearchFields(product, options);
  const haystack = [
    ...fields.names,
    ...fields.descriptions,
    ...fields.secondary,
  ].join(' ');

  return tokens.every((token) => haystack.includes(token));
};

export const getProductSearchRelevance = (product, query, options) => {
  const normalizedQuery = normalizeProductSearchText(query).trim();
  const tokens = getQueryTokens(query);
  if (!normalizedQuery || tokens.length === 0) return 0;

  const { names, descriptions, secondary } = getSearchFields(product, options);
  let score = 0;

  for (const name of names) {
    if (name === normalizedQuery) score = Math.max(score, 1000);
    if (name.startsWith(normalizedQuery)) score = Math.max(score, 900);
    if (name.includes(normalizedQuery)) score = Math.max(score, 800);
    if (tokens.every((token) => name.includes(token))) score = Math.max(score, 700);
    score += tokens.filter((token) => name.includes(token)).length * 50;
  }

  score += secondary.reduce(
    (total, value) =>
      total + tokens.filter((token) => value.includes(token)).length * 25,
    0
  );
  score += descriptions.reduce(
    (total, value) =>
      total + tokens.filter((token) => value.includes(token)).length * 5,
    0
  );

  return score;
};

export const filterAndRankProductsForSearch = (products, query, options) => {
  if (!String(query || '').trim()) return products;

  return products
    .filter((product) => matchesProductSearch(product, query, options))
    .map((product, index) => ({
      product,
      index,
      relevance: getProductSearchRelevance(product, query, options),
    }))
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .map(({ product }) => product);
};

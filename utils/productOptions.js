const normalizeValue = (value) => String(value ?? '').trim();

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const optionKey = (value) => normalizeValue(value).toLocaleLowerCase();

const uniqueOptions = (options) => {
  const merged = new Map();
  options.forEach((option) => {
    const key = optionKey(option?.value);
    if (!key) return;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, option);
      return;
    }
    merged.set(key, {
      ...existing,
      ...option,
      available: existing.available !== false || option.available !== false,
      isDefault: existing.isDefault === true || option.isDefault === true,
      price: existing.isDefault === true ? existing.price : option.price,
      originalPrice: existing.isDefault === true ? existing.originalPrice : option.originalPrice,
    });
  });
  return Array.from(merged.values());
};

const mergeOptions = (primary, fallback) => {
  const merged = new Map();
  [...fallback, ...primary].forEach((option) => {
    const key = optionKey(option?.value);
    if (!key) return;
    merged.set(key, { ...(merged.get(key) || {}), ...option });
  });
  return Array.from(merged.values());
};

export function extractProductOptions(product) {
  const variants = asArray(product?.variants)
    .filter((variant) => normalizeValue(variant?.size) || normalizeValue(variant?.color))
    .map((variant) => ({
      ...variant,
      size: normalizeValue(variant?.size),
      color: normalizeValue(variant?.color),
      available: variant?.available !== false,
    }));

  const sizeOptions = uniqueOptions(
    variants
      .filter((variant) => variant.size)
      .map((variant) => ({
        value: variant.size,
        label: variant.size,
        price: Number(variant.price),
        originalPrice: Number(variant.originalPrice),
        available: variant.available,
        isDefault: variant.isDefault === true,
      }))
  );

  const variantColorOptions = uniqueOptions(
    variants
      .filter((variant) => variant.color)
      .map((variant) => ({
        value: variant.color,
        label: variant.color,
        price: Number(variant.price),
        originalPrice: Number(variant.originalPrice),
        available: variant.available,
        isDefault: variant.isDefault === true,
      }))
  );

  const apiColorOptions = uniqueOptions(
    asArray(product?.colorVariants).map((color) => ({
      value: normalizeValue(color?.value ?? color?.color),
      label: normalizeValue(color?.label ?? color?.value ?? color?.color),
      hex: normalizeValue(color?.hex) || null,
      available: color?.available !== false && color?.inStock !== false,
      isDefault: color?.isDefault === true,
    }))
  );

  const colorOptions = mergeOptions(variantColorOptions, apiColorOptions);
  const missingOptionData =
    product?.hasVariants === true &&
    sizeOptions.length === 0 &&
    colorOptions.length === 0;

  return {
    variants,
    sizes: sizeOptions,
    colors: colorOptions,
    required: {
      size: sizeOptions.length > 1,
      color: colorOptions.length > 1,
    },
    missingOptionData,
    requiresExplicitSelection:
      missingOptionData || sizeOptions.length > 1 || colorOptions.length > 1,
  };
}

export function getInitialProductSelection(product) {
  const model = extractProductOptions(product);
  return {
    selectedSize: model.sizes.length === 1 ? model.sizes[0].value : '',
    selectedColor: model.colors.length === 1 ? model.colors[0].value : '',
  };
}

export function isProductOptionSelectionRequired(product) {
  return extractProductOptions(product).requiresExplicitSelection;
}

export function isOptionAvailable(model, dimension, value, selection = {}) {
  const normalizedValue = normalizeValue(value);
  const options = dimension === 'size' ? model?.sizes : model?.colors;
  const option = asArray(options).find((candidate) => candidate.value === normalizedValue);
  if (!option || option.available === false) return false;

  const variants = asArray(model?.variants);
  const matchingDimension = variants.filter((variant) =>
    dimension === 'size'
      ? variant.size === normalizedValue
      : variant.color === normalizedValue
  );
  if (matchingDimension.length === 0) return option.available !== false;

  const otherValue = dimension === 'size'
    ? normalizeValue(selection.selectedColor)
    : normalizeValue(selection.selectedSize);
  const otherField = dimension === 'size' ? 'color' : 'size';
  const compatible = otherValue
    ? matchingDimension.filter((variant) => !variant[otherField] || variant[otherField] === otherValue)
    : matchingDimension;

  return compatible.some((variant) => variant.available !== false);
}

export function resolveSelectedProductVariant(product, selection = {}) {
  const model = extractProductOptions(product);
  const selectedSize = normalizeValue(selection.selectedSize);
  const selectedColor = normalizeValue(selection.selectedColor);
  if (!selectedSize && !selectedColor) return null;

  const candidates = model.variants.filter((variant) => {
    const sizeMatches = selectedSize ? variant.size === selectedSize : !variant.size;
    const colorMatches = selectedColor ? variant.color === selectedColor : !variant.color;
    return sizeMatches && colorMatches;
  });

  return candidates.find((variant) => variant.available !== false) || candidates[0] || null;
}

export function getProductOptionPrice(product, selection = {}) {
  const selectedVariant = resolveSelectedProductVariant(product, selection);
  const variantPrice = Number(selectedVariant?.price);
  if (Number.isFinite(variantPrice) && variantPrice >= 0) return variantPrice;

  const contractPrice = Number(product?.pricing?.unitPrice ?? product?.pricing?.displayPrice);
  if (Number.isFinite(contractPrice) && contractPrice >= 0) return contractPrice;

  const productPrice = Number(product?.displayPrice ?? product?.price);
  return Number.isFinite(productPrice) ? productPrice : 0;
}

export function isProductSelectionComplete(product, selection = {}) {
  const model = extractProductOptions(product);
  if (model.missingOptionData) return false;

  const selectedSize = normalizeValue(selection.selectedSize);
  const selectedColor = normalizeValue(selection.selectedColor);
  if (model.required.size && !selectedSize) return false;
  if (model.required.color && !selectedColor) return false;
  if (selectedSize && !isOptionAvailable(model, 'size', selectedSize, selection)) return false;
  if (selectedColor && !isOptionAvailable(model, 'color', selectedColor, selection)) return false;
  return true;
}

export function applyProductOptionPrice(product, selection = {}) {
  const price = getProductOptionPrice(product, selection);
  const selectedVariant = resolveSelectedProductVariant(product, selection);
  const originalCandidate = Number(selectedVariant?.originalPrice);
  const discountPercentage = Number(product?.pricing?.discountPercentage);
  const inferredOriginal =
    Number.isFinite(discountPercentage) &&
    discountPercentage > 0 &&
    discountPercentage < 100
      ? price / (1 - discountPercentage / 100)
      : null;
  const originalPrice =
    Number.isFinite(originalCandidate) && originalCandidate > price
      ? originalCandidate
      : (inferredOriginal && inferredOriginal > price ? inferredOriginal : product?.originalPrice);
  const pricing = product?.pricing && product.pricing.source === 'server'
    ? {
        ...product.pricing,
        basePrice: originalPrice || price,
        displayPrice: price,
        unitPrice: price,
        originalPrice: originalPrice || null,
      }
    : product?.pricing;

  return {
    ...product,
    price,
    displayPrice: price,
    originalPrice,
    ...(pricing ? { pricing } : {}),
  };
}

export function getProductOptionKey(product, selection = {}) {
  return [
    normalizeValue(product?.id),
    normalizeValue(selection.selectedColor),
    normalizeValue(selection.selectedSize),
  ].join('::');
}

export { normalizeValue as normalizeProductOptionValue };

import { getPricingDisplay } from './pricingDisplay';

function getBundleRetailBase(item, pricing) {
  const selectedSize = String(item?.selectedSize || '').trim();
  const selectedColor = String(item?.selectedColor || '').trim();
  const variants = Array.isArray(item?.product?.variants) ? item.product.variants : [];
  const selectedVariant = variants.find((variant) => {
    const size = String(variant?.size || '').trim();
    const color = String(variant?.color || '').trim();
    const sizeMatches = selectedSize ? size === selectedSize : true;
    const colorMatches = selectedColor ? color === selectedColor : true;
    return sizeMatches && colorMatches;
  });
  const variantPrice = Number(selectedVariant?.price);
  const variantOriginal = Number(selectedVariant?.originalPrice);
  return (
    (Number.isFinite(variantOriginal) && variantOriginal > variantPrice ? variantOriginal : 0) ||
    (Number.isFinite(variantPrice) && variantPrice > 0 ? variantPrice : 0) ||
    (Number.isFinite(Number(item?.product?.originalPrice)) && Number(item.product.originalPrice) > 0 ? Number(item.product.originalPrice) : 0) ||
    (Number.isFinite(Number(pricing?.basePrice)) && Number(pricing.basePrice) > 0 ? Number(pricing.basePrice) : 0) ||
    (Number.isFinite(Number(item?.product?.price)) && Number(item.product.price) > 0 ? Number(item.product.price) : 0)
  );
}

function getBundleUnitPrice(item, pricing) {
  const bundlePct = Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) || 0;
  const retailBase = getBundleRetailBase(item, pricing);

  if (bundlePct > 0 && bundlePct < 100 && retailBase > 0) {
    return Math.round(retailBase * (1 - bundlePct / 100) * 100) / 100;
  }

  return Number(pricing?.unitPrice) || retailBase || 0;
}

export function buildMobileOrderItemPayload(item) {
  const productId = item?.product?.id || item?.id;
  const isPromo = item?.isPromotionItem === true || String(item?.selectedSize || '').trim() === '__PROMO__';
  const isBundleItem = item?.fromBundle === true || item?.product?.fromBundle === true;
  const pricing = getPricingDisplay(item?.product, {
    selectedSize: item?.selectedSize,
    selectedColor: item?.selectedColor,
  });
  const unitPrice = isPromo
    ? 0
    : isBundleItem
      ? getBundleUnitPrice(item, pricing)
      : Number(pricing.unitPrice);
  const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;

  return {
    productId,
    id: productId,
    name: item?.product?.name || item?.name,
    price: safeUnitPrice,
    quantity: Number(item?.quantity) || 0,
    image: item?.product?.image_url || item?.product?.image || item?.image,
    size: isPromo ? null : (item?.selectedSize && item.selectedSize !== '__PROMO__' ? item.selectedSize : (item?.size || null)),
    color: item?.selectedColor || item?.color,
    isPromotionItem: isPromo,
    promotionKey: item?.promotionKey || null,
    fromBundle: isBundleItem,
    bundleDiscountPercent: isBundleItem ? (Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) || 0) : 0,
    originalPrice: isBundleItem ? getBundleRetailBase(item, pricing) : 0,
  };
}

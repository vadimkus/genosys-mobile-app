import { getPricingDisplay } from './pricingDisplay';

function getBundleUnitPrice(item, pricing) {
  const bundlePct = Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) || 0;
  const retailBase =
    (Number.isFinite(Number(item?.product?.originalPrice)) && Number(item.product.originalPrice) > 0 ? Number(item.product.originalPrice) : 0) ||
    (Number.isFinite(Number(pricing?.basePrice)) && Number(pricing.basePrice) > 0 ? Number(pricing.basePrice) : 0) ||
    (Number.isFinite(Number(item?.product?.price)) && Number(item.product.price) > 0 ? Number(item.product.price) : 0);

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
    originalPrice: isBundleItem ? (Number(item?.product?.originalPrice || pricing.basePrice) || 0) : 0,
  };
}

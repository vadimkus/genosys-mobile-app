/**
 * Single source of truth for out-of-stock detection (M1).
 *
 * The mobile products API sends `stock: boolean` (mapped from DB `inStock`),
 * but screens historically checked different fields (`stock === 0`,
 * `status === 'out_of_stock'`, ...) so the grid and PDP could contradict
 * each other. This helper unions every explicit signal and stays
 * conservative: missing/undefined stock info is treated as in stock.
 */
export function isProductOutOfStock(product) {
  if (!product) return false;
  return (
    product.stock === false ||
    product.stock === 0 ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    product.outOfStock === true ||
    product.available === false
  );
}

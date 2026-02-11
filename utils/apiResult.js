/**
 * Standardized API Result Type
 * 
 * All API functions should return this shape for consistent error handling.
 * This prevents the inconsistency where some functions throw, some return null,
 * and some return fallback objects.
 * 
 * Usage:
 *   const result = await fetchProducts();
 *   if (result.ok) {
 *     // result.data is the response data
 *   } else {
 *     // result.error is the error message
 *     // result.status is the HTTP status (if applicable)
 *   }
 */

/**
 * Create a success result
 * @param {*} data - The response data
 * @returns {{ ok: true, data: *, error: null }}
 */
export function ok(data) {
  return { ok: true, data, error: null };
}

/**
 * Create an error result
 * @param {string} error - Error message
 * @param {number} [status] - HTTP status code
 * @returns {{ ok: false, data: null, error: string, status?: number }}
 */
export function err(error, status) {
  return { ok: false, data: null, error: error || 'Unknown error', status };
}

/**
 * Wrap an async function to always return an ApiResult
 * Catches thrown errors and converts them to err() results.
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that returns ApiResult
 */
export function wrapApi(fn) {
  return async (...args) => {
    try {
      const result = await fn(...args);
      // If the function already returns our shape, pass through
      if (result && typeof result === 'object' && 'ok' in result) {
        return result;
      }
      // If it returns a legacy { success, data/error } shape, normalize
      if (result && typeof result === 'object' && 'success' in result) {
        return result.success
          ? ok(result.data || result)
          : err(result.error || 'Request failed');
      }
      return ok(result);
    } catch (error) {
      return err(error?.message || 'Network error');
    }
  };
}

/**
 * Check if a result is successful
 * Works with both new (ok/error) and legacy (success/error) shapes
 */
export function isOk(result) {
  if (!result || typeof result !== 'object') return false;
  if ('ok' in result) return result.ok === true;
  if ('success' in result) return result.success === true;
  return false;
}

export default { ok, err, wrapApi, isOk };

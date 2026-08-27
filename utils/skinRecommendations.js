/**
 * Skin Recommendations Engine
 * Filters and scores products based on user's skin profile.
 * Uses the same product fields as the web version:
 *   skinType, targetConcerns, usage, ageGroup
 */

/**
 * Score a product against the user's skin profile.
 * Returns a numeric score (higher = better match).
 *
 * @param {Object} product
 * @param {{ skinType: string, ageGroup: string, concerns: string[], usage: string }} profile
 * @returns {number}
 */
function scoreProduct(product, profile) {
  let score = 0;
  const pSkinTypes = parseField(product.skinType);
  const pConcerns = parseField(product.targetConcerns);
  const pUsage = parseField(product.usage);
  const pAgeGroups = parseField(product.ageGroup);

  // Skin type match (strong signal)
  if (pSkinTypes.length > 0 && profile.skinType) {
    const norm = profile.skinType.toLowerCase();
    if (pSkinTypes.some((s) => s.toLowerCase() === norm || s.toLowerCase() === 'all')) {
      score += 30;
    }
  } else if (pSkinTypes.length === 0) {
    // No skin type restriction means it's broadly suitable
    score += 10;
  }

  // Concern matches (strongest signal)
  if (pConcerns.length > 0 && profile.concerns.length > 0) {
    const normConcerns = profile.concerns.map((c) => c.toLowerCase());
    const matches = pConcerns.filter((c) => normConcerns.includes(c.toLowerCase()));
    score += matches.length * 20;
  }

  // Usage match
  if (pUsage.length > 0 && profile.usage) {
    const norm = profile.usage.toLowerCase();
    if (pUsage.some((u) => u.toLowerCase() === norm || u.toLowerCase() === 'both')) {
      score += 15;
    }
  } else if (pUsage.length === 0) {
    score += 5;
  }

  // Age group match
  if (pAgeGroups.length > 0 && profile.ageGroup) {
    const norm = profile.ageGroup.toLowerCase();
    if (pAgeGroups.some((a) => a.toLowerCase() === norm || a.toLowerCase() === 'all')) {
      score += 10;
    }
  } else if (pAgeGroups.length === 0) {
    score += 3;
  }

  return score;
}

/**
 * Parse a JSON-array string, comma-separated string, or array field into a
 * normalized array. Product fields from the API (e.g. targetConcerns) are
 * JSON strings like '["anti-aging","hydration"]' - naive comma-splitting
 * left brackets/quotes on the values and every match failed.
 */
function parseField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) return arr.map((v) => String(v).trim()).filter(Boolean);
    } catch { /* fall through to comma split */ }
  }
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Get recommended products for a skin profile.
 *
 * @param {Array} products - Full product catalog
 * @param {{ skinType: string, ageGroup: string, concerns: string[], usage: string }} profile
 * @param {number} limit - Max results to return
 * @returns {Array<{ product: Object, score: number }>}
 */
export function getRecommendations(products, profile, limit = 12) {
  if (!products || !products.length || !profile) return [];

  const scored = products
    .filter((p) => {
      // Exclude out-of-stock and promo items
      if (p.status === 'out_of_stock' || p.stock === false) return false;
      return true;
    })
    .map((product) => ({
      product,
      score: scoreProduct(product, profile),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

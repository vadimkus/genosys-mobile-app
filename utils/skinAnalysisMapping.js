/**
 * Canonical vocabulary mapping for the skin analysis quiz.
 *
 * The recommendations API (/api/skin-recommendations) scores products against
 * canonical keys: lowercase skin types ("oily"), kebab-case concerns
 * ("acne-blemishes"), and web age groups ("young-adult"). The quiz UI uses
 * display labels ("Oily", "Acne", "Under 25") — these maps translate them.
 * The server also normalizes aliases defensively, but new clients should
 * always send canonical values.
 */

export const SKIN_TYPE_TO_CANONICAL = {
  Normal: 'normal',
  Dry: 'dry',
  Oily: 'oily',
  Combination: 'combination',
  Sensitive: 'sensitive',
};

export const CONCERN_TO_CANONICAL = {
  Acne: 'acne-blemishes',
  Wrinkles: 'anti-aging',
  'Dark Spots': 'brightening',
  Dryness: 'hydration',
  Sensitivity: 'sensitivity',
  Pores: 'pore-care',
  Redness: 'sensitivity',
  Dullness: 'brightening',
};

export const AGE_TO_CANONICAL = {
  'Under 25': 'young-adult',
  '25-35': 'adult',
  '35-45': 'adult',
  '45-55': 'mature',
  '55+': 'mature',
};

export const USAGE_TO_CANONICAL = {
  Professional: 'professional',
  'At-Home': 'at-home',
  Both: 'both',
};

/** Map display concern labels to a deduplicated canonical list. */
export function toCanonicalConcerns(labels) {
  const out = [];
  for (const label of labels || []) {
    const canonical = CONCERN_TO_CANONICAL[label] || String(label).trim().toLowerCase();
    if (canonical && !out.includes(canonical)) out.push(canonical);
  }
  return out;
}

/**
 * Product Configuration for Native App
 * 
 * Static fallback configuration for:
 * - Additional images (gallery)
 * - Video URLs
 * - Documentation/PDF links
 *
 * API/DB product fields are the source of truth. These maps are used only
 * when the backend does not provide product media or documentation.
 * 
 * Images and videos are served from genosys.ae
 */

const ASSET_ORIGIN = 'https://genosys.ae';

function toAssetUrl(url) {
  if (!url || typeof url !== 'string') return null;
  return url.startsWith('http') ? url : `${ASSET_ORIGIN}${url}`;
}

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeStringArray(value) {
  const parsed = parseMaybeJson(value);
  if (!parsed) return [];
  const items = Array.isArray(parsed) ? parsed : [parsed];
  return items
    .map((item) => (typeof item === 'string' ? item : item?.url || item?.src || item?.path))
    .map(toAssetUrl)
    .filter(Boolean);
}

function normalizeDocs(value) {
  const parsed = parseMaybeJson(value);
  if (!parsed) return [];
  const items = Array.isArray(parsed) ? parsed : [parsed];

  return items
    .map((doc) => {
      if (typeof doc === 'string') {
        const url = toAssetUrl(doc);
        return url ? { title: 'Product guide', url } : null;
      }

      const url = toAssetUrl(doc?.url || doc?.href || doc?.path || doc?.fileUrl);
      if (!url) return null;

      return {
        title: doc?.title || doc?.name || doc?.label || 'Product guide',
        url,
      };
    })
    .filter(Boolean);
}

export const PRODUCT_CONFIG = {
  '9': {
    images: ['/images/AWS.jpg', '/images/Second/aws1.jpg', '/images/Second/aws2.jpg'],
  },
  '10': {
    images: ['/images/SNOW.jpg', '/images/Second/cleanser_big.jpg'],
    videoUrl: '/videos/Cleanser_02.mp4',
  },
  '13': {
    images: ['/images/SRS.jpg', '/images/Second/sss1.jpg', '/images/Second/sss2.jpg'],
  },
  '19': {
    images: ['/images/ASE.jpg', '/images/Second/allserum_big.jpg'],
    videoUrl: '/videos/allserum.mp4',
  },
  '26': {
    images: ['/images/EGF.jpg', '/images/Second/egf_big.jpg'],
    videoUrl: '/videos/egf.mp4',
  },
  '38': {
    images: ['/images/EZE.jpg', '/images/Second/ez.jpg', '/images/Second/ez1.jpg'],
  },
  '51': {
    images: ['/images/BFAD.png', '/images/Second/ferment_big.jpg', '/images/Third/Ferment_3.jpeg', '/images/Third/ferment_high.jpeg'],
  },
  '52': {
    images: ['/images/PDRN.png', '/images/Second/pdrnnn.jpg'],
    videoUrl: '/videos/pdrn.mp4',
  },
  '35': {
    images: ['/images/HYDR.jpg', '/images/Second/hmask_big.jpg'],
  },
  '12': {
    images: ['/images/EPI.jpg', '/images/Second/eppi_big.jpg'],
  },
  '6': {
    images: ['/images/CTS.jpg', '/images/Second/cts_big.jpg', '/images/Second/cts_big2.jpg'],
  },
  '50': {
    images: ['/images/EYEZ.jpg', '/images/Second/ekit_big.jpg'],
  },
  '21': {
    images: ['/images/RADS.jpg', '/images/Second/rd_big.jpg'],
    videoUrl: '/videos/rserum.mp4',
  },
  '39': {
    images: ['/images/SPF50.jpg', '/images/Second/50big.jpg'],
  },
  '42': {
    images: ['/images/BLEM.jpg', '/images/Second/bbbig.jpg'],
  },
  '11': {
    images: ['/images/DEF.jpg', '/images/Second/def_big.jpg'],
  },
  '40': {
    images: ['/images/SSUN.jpg', '/images/Second/40big.jpg'],
  },
};

// Documentation links per product
export const PRODUCT_DOCS = {
  '1': [{ title: 'Overview of Microneedling', url: `${ASSET_ORIGIN}/documents/ppt/Overview%20of%20Microneedling_S.pdf` }],
  '4': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '5': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '6': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '7': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '8': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '9': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '12': [{ title: 'EPI TURNOVER BOOSTING PEELING GEL Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20EPI%20TURNOVER%20BOOSTING%20PEELING%20GEL.pdf` }],
  '13': [{ title: 'Microneedling Protocols (Carboxy + Power Solutions)', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_Microneedling_Protocols.pdf` }],
  '14': [{ title: 'MICROBIOME ENERGY INFUSING MIST Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20MICROBIOME%20ENERGY%20INFUSING%20MIST.pdf` }],
  '18': [{ title: 'MOISTURE REPLENISHING HYALURON SERUM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20MOISTURE%20REPLENISHING%20HYALURON%20SERUM.pdf` }],
  '21': [{ title: 'MULTI VITA RADIANCE SERUM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20MULTI%20VITA%20RADIANCE%20SERUM.pdf` }],
  '29': [{ title: 'MOISTURE REPLENISHING HYALURON CREAM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20MOISTURE%20REPLENISHING%20HYALURON%20CREAM.pdf` }],
  '31': [{ title: 'MULTI VITA RADIANCE CREAM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20MULTI%20VITA%20RADIANCE%20CREAM.pdf` }],
  '33': [{ title: 'EyeCell EYE PEPTIDE GEL PATCH Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20EyeCell%20EYE%20PEPTIDE%20GEL%20PATCH.pdf` }],
  '38': [{ title: 'EZ CO₂ MASK KIT Guide', url: `${ASSET_ORIGIN}/documents/ppt/Genosys%20Ez%20Co2%20Mask.pdf` }],
  '39': [{ title: 'ULTRA SHIELD SUN CREAM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20ULTRA%20SHIELD%20SUN%20CREAM.pdf` }],
  '41': [{ title: 'SKIN CARING BLEMISH BALM CUSHION Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20SKIN%20CARING%20BLEMISH%20BALM%20CUSHION.pdf` }],
  '43': [{ title: 'HR³ MATRIX HAIR TONIC α Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20HR3%20MATRIX%20HAIR%20TONIC%20ALPHA.pdf` }],
  '45': [{ title: 'HR³ MATRIX HAIR SOLUTION α Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20HR3%20MATRIX%20HAIR%20SOLUTION%20ALPHA.pdf` }],
  '46': [{ title: 'HR³ MATRIX SCALP PEELING α Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20HR3%20MATRIX%20SCALP%20PEELING%20ALPHA.pdf` }],
  '48': [{ title: 'Hair-GENTRON Guide', url: `${ASSET_ORIGIN}/documents/ppt/HAIR%20GENTRON.pdf` }],
  '49': [{ title: 'GENO-LED IR II Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENO-LED%20IR%20II_2025.pdf` }],
  '50': [{ title: 'EyeCell EYE ZONE CARE KIT Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20EyeCell%20EYE%20ZONE%20CARE%20SYSTEM.pdf` }],
  '51': [{ title: 'BIO-FERMENT AGE DEFYING POWDER MASK Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20BIO-FERMENT%20AGE%20DEFYING%20POWDER%20MASK.pdf` }],
  '52': [{ title: 'SKIN REBOOT PDRN MASK PACK Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20SKIN%20REBOOT%20PDRN%20MASK%20PACK.pdf` }],
  '11': [{ title: 'SKIN DEFENDER Product Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20SKIN%20DEFENDER%20LIP%20%26%20EYE%20MAKEUP%20REMOVER.pdf` }],
  '15': [{ title: 'INTENSIVE PROBLEM CONTROL TONER', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS%20INTENSIVE%20PROBLEM%20CONTROL%20TONER.pdf` }],
  '60': [{ title: 'BIO MESO PDRN EXPERT AMPOULE 60000 Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_BIO_MESO_PDRN_EXPERT_AMPOULE_60000.pdf` }],
  '63': [{ title: 'REVITA GLOW BLEMISH BALM CREAM Guide', url: `${ASSET_ORIGIN}/documents/ppt/GENOSYS_REVITA_GLOW_BB_CREAM.pdf` }],
};

/**
 * Get all images for a product (DB/API images preferred, config as fallback)
 * 
 * Priority order:
 *   1. DB/API gallery fields (dynamic – updated from backend without app resubmission)
 *   2. Single main `image` field from API
 *   3. Hardcoded PRODUCT_CONFIG images (static fallback only)
 *
 * @param {string} productId 
 * @param {Object} product - product data from API (may have .images JSON string)
 * @returns {string[]} Array of full image URLs
 */
export function getProductImages(productId, product) {
  const id = String(productId);
  const config = PRODUCT_CONFIG[id];

  // Priority 1: DB/API gallery fields (dynamic – no app update needed)
  const apiImages = [
    ...normalizeStringArray(product?.images),
    ...normalizeStringArray(product?.galleryImages),
    ...normalizeStringArray(product?.additionalImages),
  ];

  if (apiImages.length > 0) {
    return apiImages;
  }

  // Priority 2: Single main image from API
  const mainImage = toAssetUrl(product?.image);
  if (mainImage) {
    return [mainImage];
  }
  
  // Priority 3: Hardcoded config images (static fallback for products without API images)
  if (config?.images?.length) {
    return config.images.map(toAssetUrl).filter(Boolean);
  }
  
  return [];
}

/**
 * Get video URL for a product (API preferred, config as fallback)
 * 
 * Priority order:
 *   1. product.videoUrl from API/DB (dynamic – no app update needed)
 *   2. Hardcoded PRODUCT_CONFIG videoUrl (static fallback)
 *
 * @param {string} productId
 * @param {Object} [product] - product data from API (may have .videoUrl)
 * @returns {string|null}
 */
export function getProductVideoUrl(productId, product) {
  // Priority 1: API/DB videoUrl (dynamic)
  const apiVideoUrl = toAssetUrl(product?.videoUrl || product?.videoURL || product?.video);
  if (apiVideoUrl) {
    return apiVideoUrl;
  }
  
  // Priority 2: Hardcoded config (static fallback)
  const config = PRODUCT_CONFIG[String(productId)];
  return toAssetUrl(config?.videoUrl);
}

/**
 * Get documentation links for a product (API preferred, local config as fallback)
 * 
 * Priority order:
 *   1. product documentation fields from API/DB (dynamic – no app update needed)
 *   2. Hardcoded PRODUCT_DOCS (static fallback)
 *
 * @param {string} productId
 * @param {Object} [product] - product data from API (may have .documentation array)
 * @returns {Array<{title: string, url: string}>}
 */
export function getProductDocs(productId, product) {
  // Priority 1: API-provided documentation (dynamic – no app update needed)
  const apiDocs = [
    ...normalizeDocs(product?.documentation),
    ...normalizeDocs(product?.documents),
    ...normalizeDocs(product?.productDocuments),
    ...normalizeDocs(product?.documentationLinks),
  ];

  if (apiDocs.length > 0) {
    return apiDocs;
  }
  
  // Priority 2: Hardcoded local config (static fallback)
  return PRODUCT_DOCS[String(productId)] || [];
}

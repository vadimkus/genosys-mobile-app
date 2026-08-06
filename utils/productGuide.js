const DEFAULT_ORIGIN = 'https://genosys.ae';
const ALLOWED_HOST = 'genosys.ae';
const VIEWER_PATH = '/pdf-viewer';

const firstParam = (value) => (Array.isArray(value) ? value[0] : value);

export function canonicalizeProductGuideUrl(value) {
  const raw = firstParam(value);
  if (!raw || typeof raw !== 'string') return null;

  try {
    const url = new URL(raw, DEFAULT_ORIGIN);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== ALLOWED_HOST) return null;
    if (!url.pathname.toLowerCase().endsWith('.pdf')) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export function buildProductGuideViewerUrl(pdfUrl) {
  const canonicalUrl = canonicalizeProductGuideUrl(pdfUrl);
  if (!canonicalUrl) return null;
  return `${DEFAULT_ORIGIN}${VIEWER_PATH}?file=${encodeURIComponent(canonicalUrl)}`;
}

export function getProductGuideSourceUrl(pdfUrl, platform) {
  const canonicalUrl = canonicalizeProductGuideUrl(pdfUrl);
  if (!canonicalUrl) return null;

  // WKWebView's top-level PDF renderer provides native multi-page scrolling
  // and pinch zoom. Putting a document viewer inside the website iframe leaves
  // iOS with nested scrolling, which WebKit does not reliably hand off.
  return platform === 'ios' ? canonicalUrl : buildProductGuideViewerUrl(canonicalUrl);
}

export function isAllowedProductGuideNavigation(requestUrl, canonicalPdfUrl, options = {}) {
  if (!requestUrl || typeof requestUrl !== 'string') return false;
  if (requestUrl === 'about:blank') return true;

  try {
    const requested = new URL(requestUrl);
    const canonical = canonicalizeProductGuideUrl(canonicalPdfUrl);
    const viewer = buildProductGuideViewerUrl(canonical);
    const isTopFrame = options.isTopFrame !== false;

    if (requested.protocol !== 'https:') return false;

    if (requested.hostname.toLowerCase() === ALLOWED_HOST) {
      if (requestUrl === viewer || requestUrl === canonical) return true;
      if (!isTopFrame && requested.pathname.startsWith('/_next/')) return true;
      return false;
    }

    // The production viewer intentionally embeds Google Docs for reliable
    // cross-platform PDF rendering. Keep this exception subframe-only.
    return (
      !isTopFrame &&
      requested.hostname.toLowerCase() === 'docs.google.com' &&
      requested.pathname.startsWith('/viewer')
    );
  } catch {
    return false;
  }
}

export function getProductGuideFilename(pdfUrl) {
  const canonical = canonicalizeProductGuideUrl(pdfUrl);
  if (!canonical) return 'product-guide.pdf';

  const encodedName = new URL(canonical).pathname.split('/').pop() || 'product-guide.pdf';
  let decodedName = encodedName;
  try {
    decodedName = decodeURIComponent(encodedName);
  } catch {
    // Keep the server-provided encoded filename if it contains malformed escapes.
  }

  const safeName = decodedName
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName || 'product-guide'}.pdf`;
}

export const PRODUCT_GUIDE_ORIGIN = DEFAULT_ORIGIN;

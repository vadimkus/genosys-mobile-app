/**
 * Expo Router native intent handler.
 *
 * Rewrites incoming deep links / universal links (`genosys://` and
 * `https://genosys.ae`) into valid in-app route paths BEFORE Expo Router
 * resolves them against the file tree.
 *
 * Why this is required:
 *   The website uses PLURAL product URLs (`/products/<id>`), while the app
 *   route is SINGULAR (`app/product/[id].js`). Expo Router's built-in linking
 *   resolves the universal link first, fails to match `products/<id>`, and
 *   renders the "Unmatched Route" screen. This handler maps the web URL shape
 *   to the real route so shared links (e.g. from WhatsApp) open correctly.
 *
 * Expo Router calls `redirectSystemPath` for both cold-start (initial: true)
 * and warm (initial: false) links, passing the full URL as `path`. It must
 * return a route path string.
 */

import * as Linking from 'expo-linking';

const WEB_DOMAIN = 'genosys.ae';
const LOCALE_PREFIX = /^(en|ar|ru)\//;

// Top-level segments that already map 1:1 to a file route. Anything matching
// these (including sub-paths like `blog/<slug>` or `profile/<sub>`) is handed
// straight to Expo Router. Everything else falls back to the in-app WebView.
const KNOWN_ROUTE_SEGMENTS = new Set([
  'about',
  'blog',
  'brand',
  'bundle-builder',
  'chat',
  'checkout',
  'concern-detail',
  'contact',
  'delivery',
  'faq',
  'favorites',
  'locations',
  'partners',
  'profile',
  'skin-analysis',
  'skin-concerns',
  'training',
]);

function getCleanPath(url) {
  let path = '';
  try {
    const parsed = Linking.parse(url);
    path = (parsed.path || '').replace(/^\/+/, '').replace(/\/+$/, '');

    // `genosys://product/123` is parsed with `product` as the host on iOS.
    // Normalize it to the same `product/123` shape as the https URLs.
    if (String(url || '').startsWith('genosys://')) {
      try {
        const urlObj = new URL(url);
        const host = String(urlObj.hostname || '').replace(/^\/+|\/+$/g, '');
        const pathname = String(urlObj.pathname || '').replace(/^\/+|\/+$/g, '');
        path = [host, pathname].filter(Boolean).join('/') || path;
      } catch {
        // Keep the Linking.parse result.
      }
    }
  } catch {
    return '';
  }
  return path.replace(LOCALE_PREFIX, '');
}

function toWebViewPath(originalUrl, cleanPath) {
  const webUrl = String(originalUrl || '').startsWith('http')
    ? originalUrl
    : `https://${WEB_DOMAIN}/${cleanPath}`;
  return `/webview?url=${encodeURIComponent(webUrl)}&title=`;
}

export function redirectSystemPath({ path }) {
  try {
    const cleanPath = getCleanPath(path);

    // No path (app opened from home screen / bare scheme) → leave untouched.
    if (!cleanPath) return path;

    // Product listing page.
    if (cleanPath === 'products') return '/(tabs)/shop';

    // Skin concern detail: products/concern/<slug>.
    if (cleanPath.startsWith('products/concern/')) {
      const slug = cleanPath.replace('products/concern/', '').split('/')[0];
      if (slug) return `/concern-detail?slug=${encodeURIComponent(slug)}`;
    }

    // Skin concerns listing.
    if (cleanPath === 'products/concern' || cleanPath === 'skin-concerns') {
      return '/skin-concerns';
    }

    // Product detail: `products/<id>` (web, plural) or `product/<id>` (scheme).
    // This is the mismatch that produced the "Unmatched Route" screen.
    if (cleanPath.startsWith('products/') || cleanPath.startsWith('product/')) {
      const id = cleanPath.replace(/^products?\//, '').split('/')[0];
      if (id) return `/product/${encodeURIComponent(id)}`;
    }

    // Cart / bag.
    if (cleanPath === 'cart' || cleanPath === 'bag') return '/(tabs)/bag';

    // Orders tab.
    if (cleanPath === 'orders') return '/(tabs)/orders';

    // Order tracking: track/<orderNumber>.
    if (cleanPath.startsWith('track/')) {
      const orderNumber = cleanPath.replace('track/', '').split('/')[0];
      if (orderNumber) return `/profile/orders/${encodeURIComponent(orderNumber)}`;
      return '/(tabs)/orders';
    }

    // Skin analysis / recommendation aliases.
    if (cleanPath === 'skin-recommendation') return '/skin-analysis';

    // Paths that already map 1:1 to a native route.
    const firstSegment = cleanPath.split('/')[0];
    if (KNOWN_ROUTE_SEGMENTS.has(firstSegment)) {
      return `/${cleanPath}`;
    }

    // Any other genosys.ae content page → open inside the app WebView so the
    // link never dead-ends on an "Unmatched Route" screen.
    return toWebViewPath(path, cleanPath);
  } catch {
    return path;
  }
}

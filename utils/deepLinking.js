/**
 * Deep Linking URL Handler
 * Maps incoming web URLs and custom scheme URLs to app routes.
 * Supports: genosys:// scheme + https://genosys.ae universal links
 */

import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { createLogger } from './logger';

const log = createLogger('DeepLink');

const WEB_DOMAIN = 'genosys.ae';

const getCleanPathFromUrl = (url) => {
  const parsed = Linking.parse(url);
  let path = (parsed.path || '').replace(/^\/+/, '').replace(/\/+$/, '');

  // `genosys://product/123` is parsed with `product` as the host on iOS.
  // Normalize it to the same `product/123` shape as triple-slash URLs.
  if (String(url || '').startsWith('genosys://')) {
    try {
      const urlObj = new URL(url);
      const host = String(urlObj.hostname || '').replace(/^\/+/, '').replace(/\/+$/, '');
      const pathname = String(urlObj.pathname || '').replace(/^\/+/, '').replace(/\/+$/, '');
      path = [host, pathname].filter(Boolean).join('/') || path;
    } catch {
      // Keep Linking.parse result.
    }
  }

  return {
    cleanPath: path.replace(/^(en|ar|ru)\//, ''),
    queryParams: parsed.queryParams || {},
  };
};

const shouldForceLoginOnColdStart = (url) => {
  try {
    const { cleanPath } = getCleanPathFromUrl(url);

    if ((cleanPath.startsWith('products/') || cleanPath.startsWith('product/')) && cleanPath !== 'products/concern') {
      const id = cleanPath.replace(/^products?\//, '');
      if (id && !id.startsWith('concern/')) {
        return true;
      }
    }

    if (cleanPath.startsWith('track/')) {
      const orderNumber = cleanPath.replace('track/', '');
      if (orderNumber) return true;
    }
  } catch {
    // Fall through to normal deep-link handling if parsing fails.
  }

  return false;
};

/**
 * Parse a URL and navigate to the matching in-app route.
 * Returns true if the URL was handled, false otherwise.
 */
export function handleDeepLink(url) {
  if (!url) return false;

  // Security: validate URL origin
  const ALLOWED_HOSTS = ['genosys.ae', 'www.genosys.ae'];
  const ALLOWED_SCHEMES = ['genosys', 'https', 'http'];
  
  try {
    // For custom scheme URLs (genosys://), skip host validation
    if (!url.startsWith('genosys://')) {
      const urlObj = new URL(url);
      if (!ALLOWED_HOSTS.includes(urlObj.hostname)) {
        log.warn('Deep link rejected: untrusted host', { url, host: urlObj.hostname });
        return false;
      }
      if (!ALLOWED_SCHEMES.includes(urlObj.protocol.replace(':', ''))) {
        log.warn('Deep link rejected: untrusted scheme', { url, scheme: urlObj.protocol });
        return false;
      }
    }
  } catch {
    // URL parsing failed for custom scheme - that's OK, Linking.parse handles it
  }

  // Sanitize: reject URLs with suspicious patterns
  if (url.includes('javascript:') || url.includes('data:') || url.includes('<script')) {
    log.warn('Deep link rejected: suspicious content', { url });
    return false;
  }

  try {
    const parsed = Linking.parse(url);
    log.debug('Deep link received', { url, path: parsed.path, params: parsed.queryParams });

    const path = (parsed.path || '').replace(/^\/+/, '').replace(/\/+$/, '');
    // Strip locale prefix (en/, ar/, ru/)
    const { cleanPath } = getCleanPathFromUrl(url);

    // Products listing page
    if (cleanPath === 'products') {
      router.push('/(tabs)/shop');
      return true;
    }

    // Skin concerns — specific concern detail page
    if (cleanPath.startsWith('products/concern/') && cleanPath.split('/').length >= 3) {
      const slug = cleanPath.replace('products/concern/', '').split('/')[0];
      if (slug) {
        router.push({ pathname: '/concern-detail', params: { slug } });
        return true;
      }
    }

    // Skin concerns — list page
    if (cleanPath === 'skin-concerns' || cleanPath === 'products/concern') {
      router.push('/skin-concerns');
      return true;
    }

    // Product detail: products/[id], product/[id], or products/[slug]
    if (cleanPath.startsWith('products/') || cleanPath.startsWith('product/')) {
      const id = cleanPath.replace(/^products?\//, '');
      if (id) {
        router.push({ pathname: '/product/[id]', params: { id } });
        return true;
      }
    }

    // Cart / Bag
    if (cleanPath === 'cart' || cleanPath === 'bag') {
      router.push('/(tabs)/bag');
      return true;
    }

    // Orders
    if (cleanPath === 'orders') {
      router.push('/(tabs)/orders');
      return true;
    }

    // Order tracking: track/[orderNumber]
    if (cleanPath.startsWith('track/')) {
      const orderNumber = cleanPath.replace('track/', '');
      if (orderNumber) {
        router.push({
          pathname: '/profile/orders/[id]',
          params: { id: orderNumber },
        });
      } else {
        router.push('/(tabs)/orders');
      }
      return true;
    }

    // Profile
    if (cleanPath === 'profile') {
      router.push('/profile');
      return true;
    }

    // Favorites
    if (cleanPath === 'favorites') {
      router.push('/favorites');
      return true;
    }

    // Skin analysis / recommendation
    if (cleanPath === 'skin-recommendation' || cleanPath === 'skin-analysis') {
      router.push('/skin-analysis');
      return true;
    }

    // Chat
    if (cleanPath === 'chat') {
      router.push('/chat');
      return true;
    }

    // Checkout
    if (cleanPath === 'checkout') {
      router.push('/checkout');
      return true;
    }

    // Native screens (migrated from WebView)
    if (cleanPath === 'bundle-builder') {
      router.push('/bundle-builder');
      return true;
    }
    if (cleanPath === 'blog' || cleanPath === 'blog/') {
      router.push('/blog');
      return true;
    }
    if (cleanPath.startsWith('blog/')) {
      const slug = cleanPath.replace('blog/', '');
      if (slug) {
        router.push(`/blog/${slug}`);
        return true;
      }
    }
    if (cleanPath === 'training') {
      router.push('/training');
      return true;
    }
    if (cleanPath === 'locations') {
      router.push('/locations');
      return true;
    }
    if (cleanPath === 'brand') {
      router.push('/brand');
      return true;
    }
    if (cleanPath === 'delivery') {
      router.push('/delivery');
      return true;
    }
    if (cleanPath === 'faq') {
      router.push('/faq');
      return true;
    }
    if (cleanPath === 'partners') {
      router.push('/partners');
      return true;
    }
    if (cleanPath === 'about') {
      router.push('/about');
      return true;
    }
    if (cleanPath === 'contact') {
      router.push('/contact');
      return true;
    }

    // Remaining web content pages → open in WebView as fallback
    const webViewPaths = ['certificates'];
    for (const wp of webViewPaths) {
      if (cleanPath === wp || cleanPath.startsWith(`${wp}/`)) {
        const webUrl = `https://${WEB_DOMAIN}/${path}`;
        router.push({ pathname: '/webview', params: { url: webUrl, title: '' } });
        return true;
      }
    }

    // Fallback: open as webview if it's a genosys.ae URL
    if (url.includes(WEB_DOMAIN)) {
      router.push({ pathname: '/webview', params: { url, title: '' } });
      return true;
    }

    log.debug('Unhandled deep link', { url, cleanPath });
    return false;
  } catch (error) {
    log.error('Deep link error', error?.message);
    return false;
  }
}

/**
 * Set up deep link listeners. Call once at app startup.
 * Returns a cleanup function.
 */
export function setupDeepLinkListener() {
  // Handle URL that opened the app
  Linking.getInitialURL().then((url) => {
    if (url) {
      log.debug('App opened with URL', { url });
      // Small delay to let navigation mount
      setTimeout(() => {
        if (shouldForceLoginOnColdStart(url)) {
          router.replace('/auth/login');
          return;
        }
        handleDeepLink(url);
      }, 500);
    }
  });

  // Handle URL while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    if (event.url) {
      log.debug('URL received while running', { url: event.url });
      handleDeepLink(event.url);
    }
  });

  return () => subscription.remove();
}

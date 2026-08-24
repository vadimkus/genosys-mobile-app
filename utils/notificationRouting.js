/**
 * Where a tapped push notification should take the user.
 *
 * Order notifications used to be the only kind the app sent, so the tap handler
 * matched `order_status` and silently dropped everything else. The website now
 * also pushes blog announcements, and will push more types over time, so this
 * resolves a destination generically instead.
 *
 * Two steps, in order:
 *   1. `notificationRoute` — a direct in-app route for the types we know.
 *   2. `notificationUrl` + `handleDeepLink` — every payload carries a `url`, and
 *      the deep-link router already maps every web path shape to a native route,
 *      strips /en /ar /ru prefixes, and falls back to the in-app WebView. Reusing
 *      it means a new notification type works without touching this file.
 */

import { router } from 'expo-router';
import { handleDeepLink } from './deepLinking';
import { createLogger } from './logger';

const log = createLogger('NotificationRoute');

const WEB_ORIGIN = 'https://genosys.ae';

/**
 * Direct route for a known notification type, or null to fall through to the
 * URL handler.
 */
export function notificationRoute(data) {
  if (!data || typeof data !== 'object') return null;

  // Expo pushes send `order_status`; the web push sender uses `order-status`.
  if ((data.type === 'order_status' || data.type === 'order-status') && data.orderId) {
    return `/profile/orders/${data.orderId}`;
  }

  // Blog announcements carry the slug separately because `url` is locale-prefixed
  // (`/ru/blog/<slug>`) while the native route never is.
  if (data.type === 'blog_post' && data.slug) {
    return `/blog/${data.slug}`;
  }

  return null;
}

/** Absolute genosys.ae URL from a payload's `url`, which may be a bare path. */
export function notificationUrl(data) {
  const raw = data && typeof data.url === 'string' ? data.url.trim() : '';
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${WEB_ORIGIN}${raw}`;
  return null;
}

/**
 * Navigate for a tapped notification. Returns true when it went somewhere, so
 * the caller can log the payloads that dead-end.
 */
export function navigateFromNotification(data) {
  try {
    const route = notificationRoute(data);
    if (route) {
      router.push(route);
      return true;
    }

    const url = notificationUrl(data);
    if (url && handleDeepLink(url)) return true;

    log.debug('Notification tap had no destination', data);
    return false;
  } catch (e) {
    log.warn('Failed to navigate from notification:', e?.message);
    return false;
  }
}

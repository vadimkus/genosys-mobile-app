import * as Notifications from 'expo-notifications';
import { createLogger } from './logger';

const log = createLogger('appBadge');

/**
 * One owner for the app icon badge.
 *
 * Two things want to set it: unread notifications, which clear it to zero
 * when the app comes to the foreground, and the store update, which wants a
 * single "1" to stay until the person has installed the new version. Without
 * a shared owner the first would wipe the second every time the app opened.
 * Notification code calls `clearNotificationBadge()`, which lowers the count
 * to whatever the update still needs.
 */
let updateBadgeOn = false;

async function apply(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (e) {
    log.warn('Failed to set app badge:', e?.message);
  }
}

export function setUpdateAvailableBadge(on) {
  updateBadgeOn = !!on;
  return apply(updateBadgeOn ? 1 : 0);
}

export function clearNotificationBadge() {
  return apply(updateBadgeOn ? 1 : 0);
}

import { Platform } from 'react-native';
import { buildOrderActivityState, shouldTrackOrder } from './orderActivity';
import { getOrderId, getOrderNumber, sortOrdersNewestFirst } from './orderModel';
import { createLogger } from './logger';

const log = createLogger('OrderLiveActivity');

/**
 * Keeps the Lock Screen card in step with the customer's orders.
 *
 * One card at a time, for the newest order still in flight. Two cards for two orders
 * would be noise, and the common case is one order on the way.
 *
 * Everything in here is JavaScript, so it ships over the air. The only part that needed a
 * binary was the widget extension target itself — which means the card's behaviour,
 * wording and lifecycle can all be changed later without another App Store round.
 *
 * The card is started locally today. When the server's APNs channel is ready, the tokens
 * collected by `registerTokens` let it start and update the card while the app is not
 * running at all; nothing here has to change for that except where `start` is called.
 */

let activity = null;
let activityOrderId = null;

/** `expo-widgets` is iOS-only, and Live Activities need iOS 16.2. */
function available() {
  return Platform.OS === 'ios';
}

/**
 * Loaded lazily and defensively.
 *
 * This runs on every orders-screen load, including on Android and including on builds
 * made before the widget target existed. A missing native module must be a no-op, not a
 * crash on someone's order history.
 */
function load() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../widgets/OrderActivity').default;
  } catch (e) {
    log.debug('Live Activity unavailable in this build:', e?.message);
    return null;
  }
}

export async function syncOrderActivity(orders, t) {
  if (!available()) return;
  const OrderActivity = load();
  if (!OrderActivity) return;

  const tracked = sortOrdersNewestFirst(Array.isArray(orders) ? orders : []).find(shouldTrackOrder);

  try {
    // Nothing in flight: retire whatever is on screen.
    if (!tracked) {
      await endActivity(t, orders);
      return;
    }

    const state = buildOrderActivityState(tracked, t);
    const id = getOrderId(tracked) || getOrderNumber(tracked);

    // A different order took over, so the old card is stale.
    if (activity && activityOrderId !== id) await endActivity(t, orders);

    if (activity) {
      await activity.update(state);
      return;
    }

    activity = await OrderActivity.start(state, `genosys://profile/orders/${id}`);
    activityOrderId = id;
    log.debug('Started Live Activity for order', id);
  } catch (e) {
    // A card that fails to appear must never take the orders screen with it.
    log.warn('Could not sync Live Activity:', e?.message);
  }
}

/**
 * Show the finished state briefly rather than yanking the card away, which is what the
 * customer wants to see at the end: delivered, or cancelled and why.
 */
async function endActivity(t, orders) {
  if (!activity) return;
  const finished = (Array.isArray(orders) ? orders : []).find(
    (o) => (getOrderId(o) || getOrderNumber(o)) === activityOrderId
  );
  try {
    await activity.end(
      'default',
      finished ? buildOrderActivityState(finished, t) : undefined,
      new Date()
    );
  } catch (e) {
    log.warn('Could not end Live Activity:', e?.message);
  }
  activity = null;
  activityOrderId = null;
}

/**
 * Hand ActivityKit's tokens to the server so it can drive the card by push later.
 *
 * Two different tokens, and mixing them up is the usual reason a Live Activity push
 * reports success and shows nothing:
 *   - push-to-start is app-wide, and starts a card when the app is not running
 *   - the per-activity token updates one card that already exists
 *
 * Neither is the ordinary device push token.
 */
export function registerTokens(send) {
  if (!available()) return () => {};
  const OrderActivity = load();
  if (!OrderActivity) return () => {};

  const subs = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addPushToStartTokenListener } = require('expo-widgets');
    subs.push(
      addPushToStartTokenListener((event) => {
        send({ kind: 'push-to-start', token: event.activityPushToStartToken }).catch(() => {});
      })
    );
  } catch (e) {
    log.debug('No push-to-start token stream:', e?.message);
  }

  return () => subs.forEach((s) => s?.remove?.());
}

export default { syncOrderActivity, registerTokens };

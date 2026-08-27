import { Platform } from 'react-native';
import { buildOrderActivityState, shouldTrackOrder } from './orderActivity';
import { getOrderId, getOrderNumber, sortOrdersNewestFirst } from './orderModel';
import { getWidgetLogoUri } from './widgetAssets';
import { createLogger } from './logger';

const log = createLogger('OrderLiveActivity');

/**
 * The logo path and the customer's rewards standing, for the card.
 *
 * Both are best-effort: a card without them is still a complete card, so neither is
 * allowed to delay or fail the thing the customer actually came for.
 */
async function decorations(token) {
  const extras = {};
  extras.logoUri = await getWidgetLogoUri();

  if (token) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { fetchMembership } = require('../services/api');
      const membership = await fetchMembership(token);
      const data = membership?.data ?? membership;
      if (data?.tier) extras.tier = data.tier;
      const balance = Number(data?.points?.balance);
      if (Number.isFinite(balance)) extras.points = balance;
    } catch (e) {
      log.debug('No rewards standing for the card:', e?.message);
    }
  }

  return extras;
}

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

/**
 * Raise the card the moment an order is placed.
 *
 * Waiting for the customer to open the Orders tab is too late: the whole point of the
 * card is that it is there when they lock the phone after checking out. There is no order
 * object to hand yet, only what checkout knows, so the state is built from that — the
 * server's own status arrives at the next sync and corrects anything.
 */
export async function startOrderActivityForNewOrder({
  orderNumber,
  orderId,
  paymentMethod,
  paymentStatus,
  t,
  send,
  authToken,
}) {
  if (!available()) return;
  const OrderActivity = load();
  if (!OrderActivity) return;

  try {
    // A new order is PENDING: accepted by us, nothing shipped. The card shows an empty
    // bar and "waiting to be confirmed", which is exactly true.
    const order = { orderNumber, paymentMethod, paymentStatus, status: 'PENDING' };
    const state = buildOrderActivityState(order, t, await decorations(authToken));
    const id = orderId || orderNumber;

    await retireStrays(OrderActivity, t);
    activity = await OrderActivity.start(state, `genosys://profile/orders/${id}`);
    activityOrderId = String(id);
    log.debug('Started Live Activity at checkout for', orderNumber);
    reportActivityToken(activity, String(orderNumber), send);
  } catch (e) {
    log.warn('Could not start Live Activity at checkout:', e?.message);
  }
}

/**
 * End every card this app already has running.
 *
 * `activity` is module state, so it is lost when the app restarts while the card lives on
 * in the system. Without this, each new order stacked another card on the Lock Screen —
 * the system groups them under the app name, so two orders read as two cards rather than
 * one that moved. `getInstances` is the only view of what is genuinely still up.
 */
async function retireStrays(OrderActivity, t) {
  try {
    const running = OrderActivity.getInstances?.() ?? [];
    for (const instance of running) {
      await instance.end('immediate').catch(() => {});
    }
  } catch (e) {
    log.debug('Could not retire previous activities:', e?.message);
  }
  activity = null;
  activityOrderId = null;
}

export async function syncOrderActivity(orders, t, send, authToken) {
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

    const state = buildOrderActivityState(tracked, t, await decorations(authToken));
    const id = getOrderId(tracked) || getOrderNumber(tracked);

    if (activity && activityOrderId === id) {
      await activity.update(state);
      return;
    }

    // Either a different order took over, or the app restarted and lost track of a card
    // that is still on screen. Both end the same way.
    await retireStrays(OrderActivity, t);
    activity = await OrderActivity.start(state, `genosys://profile/orders/${id}`);
    activityOrderId = id;
    log.debug('Started Live Activity for order', id);
    // Not awaited: the card is already up, and the server only needs this to carry on
    // updating it later.
    reportActivityToken(activity, state.orderNumber, send);
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

/**
 * Hand the server the token for the card we just raised, so it can keep updating it after
 * the app is gone. Called once per activity, from `syncOrderActivity`.
 */
async function reportActivityToken(instance, orderNumber, send) {
  if (!send || !instance?.getPushToken) return;
  try {
    const token = await instance.getPushToken();
    if (token) await send({ kind: 'activity', token, orderNumber });
  } catch (e) {
    log.debug('No activity token to report:', e?.message);
  }
}

export default { syncOrderActivity, registerTokens };

import { Platform } from 'react-native';
import { buildOrderActivityState, shouldTrackOrder } from './orderActivity';
import { getOrderId, getOrderNumber, sortOrdersNewestFirst } from './orderModel';
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
  // Do not pass logoUri. The widget Image paints the PNG across the whole card.

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
 * binary was the widget extension target itself - which means the card's behaviour,
 * wording and lifecycle can all be changed later without another App Store round.
 *
 * The card is started locally today. When the server's APNs channel is ready, the tokens
 * collected by `registerTokens` let it start and update the card while the app is not
 * running at all; nothing here has to change for that except where `start` is called.
 */

let activity = null;
let activityOrderId = null;
/** The token subscription for whichever card is current. See `watchActivityToken`. */
let tokenSub = null;

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
 * object to hand yet, only what checkout knows, so the state is built from that - the
 * server's own status arrives at the next sync and corrects anything.
 */
export async function startOrderActivityForNewOrder({
  orderNumber,
  orderId,
  paymentMethod,
  paymentStatus,
  emirate,
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
    // The emirate decides the delivery promise, and a prepaid order is already one step
    // in - so without it a Dubai card order would start with no window on it.
    const order = { orderNumber, paymentMethod, paymentStatus, emirate, status: 'PENDING' };
    const state = buildOrderActivityState(order, t, await decorations(authToken));
    const id = orderId || orderNumber;

    await retireStrays(OrderActivity, t);
    activity = await OrderActivity.start(state, `genosys://profile/orders/${id}`);
    activityOrderId = String(id);
    log.debug('Started Live Activity at checkout for', orderNumber);
    watchActivityToken(activity, orderNumber, send);
  } catch (e) {
    log.warn('Could not start Live Activity at checkout:', e?.message);
  }
}

/**
 * End every card this app already has running.
 *
 * `activity` is module state, so it is lost when the app restarts while the card lives on
 * in the system. Without this, each new order stacked another card on the Lock Screen -
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
  tokenSub?.remove?.();
  tokenSub = null;
  activity = null;
  activityOrderId = null;
}

/**
 * Move the card from an order-status notification.
 *
 * The status push already carries everything the card needs - order number and new
 * status - so the card can advance the instant the notification lands, with no round trip
 * and no screen to open.
 *
 * This is not a substitute for the APNs channel. It only fires when the app is running or
 * has just been opened by the tap; a force-quit app cannot move its own card. Only a
 * push addressed to the ActivityKit token can do that.
 */
export async function updateOrderActivityFromPush(data, t) {
  if (!available()) return;
  const type = data?.type;
  if (type !== 'order_status' && type !== 'order-status') return;

  const orderNumber = data.orderNumber || data.order_number;
  if (!orderNumber || !data.status) return;

  const OrderActivity = load();
  if (!OrderActivity) return;

  try {
    // Payment method is not in the payload, so keep whatever the card already shows by
    // reusing its own labels rather than recomputing them and risking a COD card
    // suddenly reading "Paid".
    const order = { orderNumber, status: data.status, paymentMethod: data.paymentMethod };
    const state = buildOrderActivityState(order, t);

    if (activity && activityOrderId) {
      await activity.update(state);
      log.debug('Advanced the card from a push:', data.status);
      return;
    }

    // The app was not running when the card went up, so adopt whatever is on screen.
    const running = OrderActivity.getInstances?.() ?? [];
    const first = running[0];
    if (first) {
      await first.update(state);
      activity = first;
      activityOrderId = String(orderNumber);
    }
  } catch (e) {
    log.warn('Could not advance the card from a push:', e?.message);
  }
}

export async function syncOrderActivity(orders, t, send, authToken) {
  if (!available()) return;
  const OrderActivity = load();
  if (!OrderActivity) return;

  const tracked = sortOrdersNewestFirst(Array.isArray(orders) ? orders : []).find(shouldTrackOrder);

  try {
    // Nothing in flight: take down whatever is on screen. A card we hold gets the graceful
    // ending, with its final state left up for a moment; one we only know about through
    // `getInstances` - the server's, or our own from before a restart - can only be cut.
    if (!tracked) {
      if (activity) await endActivity(t, orders);
      else await retireStrays(OrderActivity, t);
      return;
    }

    const state = buildOrderActivityState(tracked, t, await decorations(authToken));
    const id = getOrderId(tracked) || getOrderNumber(tracked);

    if (activity && activityOrderId === id) {
      await activity.update(state);
    } else if (!activity && (await adoptRunningCard(OrderActivity, state, id, send))) {
      // Adopted a card this process never started - see `adoptRunningCard`.
    } else {
      // A different order has taken over. End the old card before raising the new one.
      await retireStrays(OrderActivity, t);
      activity = await OrderActivity.start(state, `genosys://profile/orders/${id}`);
      activityOrderId = id;
      log.debug('Started Live Activity for order', id);
      watchActivityToken(activity, state.orderNumber, send);
    }

    // Every path ends here, including the one where we simply updated a card we were
    // already holding. A duplicate raised while the app was closed is invisible to that
    // path, and leaving it on screen is exactly the two-card bug.
    await pruneDuplicates(OrderActivity);
  } catch (e) {
    // A card that fails to appear must never take the orders screen with it.
    log.warn('Could not sync Live Activity:', e?.message);
  }
}

/**
 * Take over a card that is already on screen, rather than raising a second one.
 *
 * There are two things that can put a card up - this app, and the server by push - and
 * only one of them can be tracked in a module variable that dies with the process. So the
 * running instances are the only honest answer to "is there already a card?".
 */
async function adoptRunningCard(OrderActivity, state, id, send) {
  const existing = (OrderActivity.getInstances?.() ?? [])[0];
  if (!existing) return false;

  await existing.update(state);
  activity = existing;
  activityOrderId = id;
  watchActivityToken(existing, state.orderNumber, send);
  log.debug('Adopted the card already on screen for order', id);
  return true;
}

/**
 * One order, one card. Ends anything running that is not the card we are holding.
 *
 * `getId` is ActivityKit's own identifier, so this compares what is actually on the Lock
 * Screen rather than trusting a module variable that does not survive a restart.
 */
async function pruneDuplicates(OrderActivity) {
  try {
    const keep = activity?.getId?.();
    if (!keep) return;

    const strays = (OrderActivity.getInstances?.() ?? []).filter(
      (instance) => instance?.getId?.() !== keep
    );
    for (const stray of strays) {
      await stray.end('immediate').catch(() => {});
    }
    if (strays.length) log.debug('Ended', strays.length, 'duplicate card(s)');
  } catch (e) {
    log.debug('Could not prune duplicate cards:', e?.message);
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
  tokenSub?.remove?.();
  tokenSub = null;
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
 * Hand the server the token for a card, and keep handing it over if it changes.
 *
 * This must be a subscription, not a question. `getPushToken()` returns null when the
 * token "is not yet available", and it is never available in the moment an activity
 * starts - ActivityKit delivers it asynchronously, slightly later.
 *
 * Asking once and giving up is what produced two cards for one order: the server never
 * learned the token for the card the app had raised, so on the next status change it saw
 * an order with no card and raised its own. The customer got the old card, frozen, next
 * to a new one.
 *
 * It still asks as well as listens, because an adopted card may have had its token issued
 * long before we started watching.
 */
function watchActivityToken(instance, orderNumber, send) {
  tokenSub?.remove?.();
  tokenSub = null;
  if (!send || !instance) return;

  const relay = (token) => {
    if (!token) return;
    send({ kind: 'activity', token, orderNumber: String(orderNumber) }).catch(() => {});
  };

  try {
    tokenSub = instance.addPushTokenListener?.((event) => relay(event?.pushToken));
  } catch (e) {
    log.debug('No activity token stream:', e?.message);
  }

  try {
    instance.getPushToken?.().then(relay).catch(() => {});
  } catch (e) {
    log.debug('No activity token yet:', e?.message);
  }
}

export default { syncOrderActivity, registerTokens };

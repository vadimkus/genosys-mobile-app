import { getOrderProgress } from './orderModel';

/**
 * Turn an order into the flat props the Lock Screen card renders.
 *
 * The widget extension runs in its own runtime with a tight time budget and often while
 * the app is not running, so it derives nothing: everything it draws arrives as a plain
 * string or number, already translated. This is the only place that translation happens.
 *
 * It is also the wire format. The server sends the same shape inside an APNs payload, and
 * ActivityKit decodes nothing if it does not match — a push that reports success and
 * displays nothing is the usual symptom. Keep this, `OrderActivityProps` in
 * `widgets/OrderActivity.tsx`, and the server's payload builder in step.
 *
 * `t` is the app's translator. On the server the same shape is built from its own
 * message catalogue.
 */
export function buildOrderActivityState(order, t, extras) {
  const progress = getOrderProgress(order);
  const done = progress.cancelled ? 0 : progress.steps.filter((s) => s.done).length;

  const steps = [
    progress.firstStepIsPayment ? t('ordersDetail.statusPaid') : t('ordersDetail.statusConfirmed'),
    t('ordersDetail.statusShipped'),
    t('ordersDetail.statusDelivered'),
  ];

  const state = {
    orderNumber: String(order?.orderNumber || order?.order_number || order?.id || ''),
    done,
    status: statusLine(progress, t),
    steps,
    cancelled: progress.cancelled,
  };

  const eta = etaLine(order, done, progress.cancelled, t);
  if (eta) state.eta = eta;

  // Optional, and only ever added when known. The card falls back to a text wordmark and
  // hides the rewards line rather than showing an empty one, so a payload without these —
  // which is every payload the server sends — is still a complete card.
  if (extras?.logoUri) state.logoUri = extras.logoUri;
  if (extras?.tier) state.tier = String(extras.tier);
  if (Number.isFinite(extras?.points)) state.points = Math.round(extras.points);

  return state;
}

/**
 * The delivery promise, or nothing.
 *
 * Three rules, each one there to stop the card saying something we have not agreed to.
 * Mirrored by `etaFor` in the website's `lib/liveActivityPayload.ts`.
 *
 * 1. **Dubai only gets the hours.** One to two hours is the Careem service inside Dubai;
 *    everywhere else is 24 to 36. Printing the Dubai window nationwide would promise an
 *    Al Ain customer something no courier is going to do.
 * 2. **Nothing before we accept.** While an order waits to be confirmed we have not taken
 *    it on and the courier clock has not started.
 * 3. **Nothing once it is over.** Delivered or cancelled, an estimate is noise.
 *
 * The wording matches what the customer read at checkout on purpose: the card restates
 * the promise rather than inventing a second one.
 */
function etaLine(order, done, cancelled, t) {
  if (cancelled || done < 1 || done >= 3) return null;

  const emirate = String(order?.customerEmirate || order?.emirate || '').trim();
  if (!emirate) return null;

  return emirate.toLowerCase() === 'dubai'
    ? t('ordersDetail.activityEtaDubai')
    : t('ordersDetail.activityEtaOther');
}

/** The sentence under the bar: what is happening now, not what happened. */
function statusLine(progress, t) {
  if (progress.cancelled) return t('ordersDetail.trackerCancelled');
  if (progress.completed) return t('ordersDetail.trackerComplete');
  return [
    t('ordersDetail.activityAwaitingConfirmation'),
    t('ordersDetail.activityPreparing'),
    t('ordersDetail.activityOnItsWay'),
  ][progress.currentIndex];
}

/**
 * Whether an order is worth putting on the Lock Screen.
 *
 * A card that never changes is clutter, so a delivered or cancelled order does not get
 * one — it gets a final update and then ends.
 */
export function shouldTrackOrder(order) {
  const progress = getOrderProgress(order);
  return !progress.cancelled && !progress.completed;
}

export default { buildOrderActivityState, shouldTrackOrder };

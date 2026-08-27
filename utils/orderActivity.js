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

  // Optional, and only ever added when known. The card falls back to a text wordmark and
  // hides the rewards line rather than showing an empty one, so a payload without these —
  // which is every payload the server sends — is still a complete card.
  if (extras?.logoUri) state.logoUri = extras.logoUri;
  if (extras?.tier) state.tier = String(extras.tier);
  if (Number.isFinite(extras?.points)) state.points = Math.round(extras.points);

  return state;
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

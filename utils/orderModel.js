export const getOrderKey = (order) => String(
  order?.id ||
  order?.orderId ||
  order?.orderNumber ||
  order?.order_number ||
  order?.number ||
  ''
);

export const getOrderNumber = (order) => String(
  order?.orderNumber ||
  order?.order_number ||
  order?.number ||
  order?.id ||
  ''
);

export const getOrderId = (order) => String(order?.id || order?.orderId || '').trim();

export const isCancelledOrDeletedOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  const paymentStatus = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return (
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'deleted' ||
    paymentStatus === 'deleted'
  );
};

export const isPaidLikeOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  const paymentStatus = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return status === 'paid' || status === 'confirmed' || paymentStatus === 'paid' || paymentStatus === 'confirmed';
};

export const isCodLikeOrder = (order) => {
  const paymentMethod = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  return paymentMethod === 'cod' || paymentMethod === 'cash' || paymentMethod === 'cash_on_delivery' || paymentMethod === 'cash on delivery';
};

export const isCardLikeOrder = (order) => {
  const paymentMethod = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  if (!paymentMethod) return false;
  return paymentMethod.includes('card') || paymentMethod.includes('stripe') || paymentMethod.includes('apple') || paymentMethod.includes('online');
};

export const getOrderPaymentUrl = (order) => String(
  order?.paymentUrl ||
  order?.paymentLink ||
  order?.payment_url ||
  order?.payment_link ||
  ''
).trim();

export const canResumeOrderPayment = (order) => {
  return !isPaidLikeOrder(order) && !isCodLikeOrder(order) && (!!getOrderPaymentUrl(order) || isCardLikeOrder(order));
};

export const isUserDeletableOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  const paymentStatus = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return status === 'pending' && paymentStatus !== 'paid' && paymentStatus !== 'confirmed';
};

/**
 * How far along a status is, on a 0-3 scale that matches the three-step tracker.
 *
 * The server's ladder is PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED, but
 * the tracker only has three stops, so confirmed and processing share one: both mean
 * accepted and not yet handed to a courier. Values the website does not send but older
 * orders and MoySklad still carry ('paid', 'completed') are mapped to their equivalents.
 */
const STATUS_RANK = {
  pending: 0,
  confirmed: 1,
  processing: 1,
  paid: 1,
  shipped: 2,
  out_for_delivery: 2,
  delivered: 3,
  completed: 3,
};

const statusRank = (order) => {
  const status = String(order?.status || '').trim().toLowerCase().replace(/\s+/g, '_');
  return STATUS_RANK[status] ?? 0;
};

/** Money actually received. Deliberately stricter than `isPaidLikeOrder`, which counts
 *  'confirmed' as paid — true for a card order, never true for cash on delivery. */
export const isOrderSettled = (order) => {
  const paymentStatus = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  if (paymentStatus === 'paid') return true;
  // COD settles at the door, so a delivered COD order is paid even if nobody updated
  // the payment field afterwards.
  if (isCodLikeOrder(order) && statusRank(order) >= 3) return true;
  return String(order?.status || '').toLowerCase() === 'paid';
};

export const ORDER_STEP_KEYS = ['accepted', 'shipped', 'delivered'];

/**
 * The three-step tracker's state for one order.
 *
 * The first step is where cash on delivery breaks a naive "paid -> shipped -> delivered"
 * bar: the money arrives at the door, so step one could never complete before step three
 * and every COD customer would watch an empty bar until the courier knocked. So step one
 * means *accepted*, and only its label changes with the payment method:
 *
 *   prepaid (card, Apple Pay, bank transfer)  Paid      Shipped   Delivered
 *   cash on delivery                          Confirmed Shipped   Delivered · paid on delivery
 *
 * One bar, one progress rule, one label difference. Payment is a note on step one when it
 * is taken up front and on step three when it is taken at the door.
 *
 * Returns `currentIndex` as the step being worked on — the first incomplete one, or the
 * last if everything is done.
 */
export const getOrderProgress = (order) => {
  const cancelled = isCancelledOrDeletedOrder(order);
  const cod = isCodLikeOrder(order);
  const rank = statusRank(order);
  const settled = isOrderSettled(order);

  // Prepaid orders wait on the money; COD orders wait on us accepting the order.
  const accepted = cod ? rank >= 1 : settled || rank >= 1;

  const done = cancelled ? [false, false, false] : [accepted, rank >= 2, rank >= 3];

  const steps = ORDER_STEP_KEYS.map((key, i) => ({
    key,
    done: done[i],
    // Only one step is "current", and only while the order is still moving.
    current: !cancelled && !done[i] && done.slice(0, i).every(Boolean),
  }));

  const firstOpen = done.findIndex((d) => !d);
  const doneCount = done.filter(Boolean).length;

  return {
    steps,
    cancelled,
    cod,
    settled,
    // The label swap on step one, and the note on step three.
    firstStepIsPayment: !cod,
    paidOnDelivery: cod,
    completed: !cancelled && done.every(Boolean),
    currentIndex: cancelled ? 0 : firstOpen === -1 ? done.length - 1 : firstOpen,
    // 0..1 of the steps completed.
    fraction: cancelled ? 0 : doneCount / done.length,
  };
};

export const mergeOrders = (...groups) => {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((order) => {
    if (!order) return;
    const key = getOrderKey(order);
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    merged.push(order);
  });

  return merged;
};

export const filterVisibleOrders = (orders) => {
  return (Array.isArray(orders) ? orders : []).filter((order) => !isCancelledOrDeletedOrder(order));
};

export const sortOrdersNewestFirst = (orders) => {
  return [...(Array.isArray(orders) ? orders : [])].sort((a, b) => {
    const da = new Date(a?.createdAt || a?.created_at || a?.date || 0).getTime() || 0;
    const db = new Date(b?.createdAt || b?.created_at || b?.date || 0).getTime() || 0;
    return db - da;
  });
};

export default {
  getOrderKey,
  getOrderId,
  getOrderNumber,
  getOrderPaymentUrl,
  isCancelledOrDeletedOrder,
  isPaidLikeOrder,
  isOrderSettled,
  getOrderProgress,
  ORDER_STEP_KEYS,
  isCodLikeOrder,
  isCardLikeOrder,
  isUserDeletableOrder,
  canResumeOrderPayment,
  mergeOrders,
  filterVisibleOrders,
  sortOrdersNewestFirst,
};

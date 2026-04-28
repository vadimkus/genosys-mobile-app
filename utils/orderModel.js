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
  isCodLikeOrder,
  isCardLikeOrder,
  isUserDeletableOrder,
  canResumeOrderPayment,
  mergeOrders,
  filterVisibleOrders,
  sortOrdersNewestFirst,
};

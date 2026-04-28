import { fetchUserOrderById, fetchUserOrders, deleteUserOrder } from './api';
export {
  canResumeOrderPayment,
  filterVisibleOrders,
  getOrderId,
  getOrderKey,
  getOrderNumber,
  getOrderPaymentUrl,
  isCancelledOrDeletedOrder,
  isCardLikeOrder,
  isCodLikeOrder,
  isPaidLikeOrder,
  isUserDeletableOrder,
  mergeOrders,
  sortOrdersNewestFirst,
} from '../utils/orderModel';
import {
  canResumeOrderPayment,
  filterVisibleOrders,
  getOrderId,
  getOrderKey,
  getOrderNumber,
  getOrderPaymentUrl,
  isCancelledOrDeletedOrder,
  isCardLikeOrder,
  isCodLikeOrder,
  isPaidLikeOrder,
  isUserDeletableOrder,
  mergeOrders,
  sortOrdersNewestFirst,
} from '../utils/orderModel';

export const fetchOrders = async (token, params = {}) => {
  if (!token) return [];
  const orders = await fetchUserOrders(token, params);
  return Array.isArray(orders) ? orders : [];
};

export const fetchOrdersOverview = async (token) => {
  if (!token) return [];

  const [pending, recent] = await Promise.all([
    fetchOrders(token, { status: 'pending', page: 1, limit: 20 }).catch(() => []),
    fetchOrders(token, { page: 1, limit: 50 }).catch(() => []),
  ]);

  return sortOrdersNewestFirst(filterVisibleOrders(mergeOrders(pending, recent)));
};

export const fetchActiveOrdersForBadge = async (token) => {
  const orders = await fetchOrders(token, { page: 1, limit: 100 }).catch(() => []);
  return filterVisibleOrders(orders);
};

export const findOrder = async (token, idOrNumber) => {
  const id = String(idOrNumber || '').trim();
  if (!token || !id) return null;

  try {
    const detail = await fetchUserOrderById(token, id);
    if (detail) return detail;
  } catch {
    // Not every backend route supports lookup by both id and order number.
  }

  const orders = await fetchOrders(token, { page: 1, limit: 50 }).catch(() => []);
  return (
    orders.find((order) => getOrderId(order) === id) ||
    orders.find((order) => getOrderNumber(order) === id) ||
    null
  );
};

export const removeOrder = async (token, orderId) => {
  return deleteUserOrder(token, orderId);
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
  fetchOrders,
  fetchOrdersOverview,
  fetchActiveOrdersForBadge,
  findOrder,
  removeOrder,
};

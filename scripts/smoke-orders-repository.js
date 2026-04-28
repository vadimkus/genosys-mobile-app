import {
  canResumeOrderPayment,
  filterVisibleOrders,
  getOrderKey,
  getOrderNumber,
  isPaidLikeOrder,
  isUserDeletableOrder,
  mergeOrders,
  sortOrdersNewestFirst,
} from '../utils/orderModel.js';

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, received ${actual}`);
  }
}

function assertTrue(name, actual) {
  if (!actual) throw new Error(`${name}: expected true`);
}

function assertFalse(name, actual) {
  if (actual) throw new Error(`${name}: expected false`);
}

const pending = {
  id: 'order-1',
  orderNumber: 'GEN2604270001',
  status: 'pending',
  paymentStatus: 'pending',
  paymentMethod: 'card',
  createdAt: '2026-04-27T09:00:00Z',
};

const paid = {
  id: 'order-2',
  order_number: 'GEN2604270002',
  status: 'confirmed',
  payment_status: 'paid',
  payment_method: 'stripe',
  created_at: '2026-04-27T10:00:00Z',
};

const deleted = {
  id: 'order-3',
  orderNumber: 'GEN2604270003',
  status: 'deleted',
  createdAt: '2026-04-27T11:00:00Z',
};

assertEqual('order key uses id first', getOrderKey(pending), 'order-1');
assertEqual('order number supports snake case', getOrderNumber(paid), 'GEN2604270002');

const merged = mergeOrders([pending], [{ ...pending }, paid], [deleted]);
assertEqual('merge dedupes by stable key', merged.length, 3);

const visible = filterVisibleOrders(merged);
assertEqual('visible orders hide deleted/cancelled', visible.length, 2);

const sorted = sortOrdersNewestFirst(visible);
assertEqual('newest order first', sorted[0].id, 'order-2');

assertFalse('pending card order is not paid', isPaidLikeOrder(pending));
assertTrue('paid confirmed order is paid-like', isPaidLikeOrder(paid));
assertTrue('pending card order can resume payment', canResumeOrderPayment(pending));
assertFalse('paid order cannot resume payment', canResumeOrderPayment(paid));
assertTrue('pending unpaid order can be deleted by user', isUserDeletableOrder(pending));
assertFalse('paid order cannot be deleted by user', isUserDeletableOrder(paid));

console.log('orders repository smoke passed');

/**
 * The three-step order tracker.
 *
 * The rule worth guarding is the first step. A naive "paid -> shipped -> delivered" bar
 * is wrong for cash on delivery, where the money arrives at the door: every COD customer
 * would watch an empty first step until the courier knocked. So step one means *accepted*,
 * and only its label changes with the payment method.
 */
import { getOrderProgress, isOrderSettled } from '../utils/orderModel.js';

let failures = 0;
function check(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures += 1;
    console.error(`  FAIL ${label}\n    expected: ${e}\n    actual:   ${a}`);
  } else {
    console.log(`  ok   ${label}`);
  }
}

const doneFlags = (order) => getOrderProgress(order).steps.map((s) => s.done);

// --- cash on delivery ----------------------------------------------------
console.log('cash on delivery');
const cod = (status, paymentStatus) => ({ paymentMethod: 'cod', status, paymentStatus });

check('a new order has nothing done', doneFlags(cod('PENDING', 'pending')), [false, false, false]);
check('confirming completes step one', doneFlags(cod('CONFIRMED', 'pending')), [true, false, false]);
check('processing is still step one', doneFlags(cod('PROCESSING', 'pending')), [true, false, false]);
check('shipped completes step two', doneFlags(cod('SHIPPED', 'pending')), [true, true, false]);
check('delivered completes all three', doneFlags(cod('DELIVERED', 'pending')), [true, true, true]);

// The whole point: a COD customer sees progress before any money changes hands.
check('step one does not wait for payment', getOrderProgress(cod('CONFIRMED', 'pending')).steps[0].done, true);
check('and is labelled as acceptance, not payment', getOrderProgress(cod('CONFIRMED', 'pending')).firstStepIsPayment, false);
check('with the payment note on delivery', getOrderProgress(cod('CONFIRMED', 'pending')).paidOnDelivery, true);

// Delivered COD is settled even when nobody updated the payment field afterwards.
check('delivered COD counts as settled', isOrderSettled(cod('DELIVERED', 'pending')), true);
check('undelivered COD does not', isOrderSettled(cod('SHIPPED', 'pending')), false);

// --- prepaid -------------------------------------------------------------
console.log('prepaid');
const card = (status, paymentStatus) => ({ paymentMethod: 'stripe', status, paymentStatus });

check('unpaid and unconfirmed has nothing done', doneFlags(card('PENDING', 'pending')), [false, false, false]);
check('payment alone completes step one', doneFlags(card('PENDING', 'paid')), [true, false, false]);
check('confirmation also completes step one', doneFlags(card('CONFIRMED', 'pending')), [true, false, false]);
check('delivered completes all three', doneFlags(card('DELIVERED', 'paid')), [true, true, true]);
check('step one is labelled as payment', getOrderProgress(card('PENDING', 'paid')).firstStepIsPayment, true);
check('with no note on delivery', getOrderProgress(card('PENDING', 'paid')).paidOnDelivery, false);

// A failed card payment must not look like progress.
check('a failed payment leaves step one open', doneFlags(card('PENDING', 'failed')), [false, false, false]);

// --- cancelled -----------------------------------------------------------
console.log('cancelled');
check('a cancelled order shows no progress', doneFlags({ paymentMethod: 'cod', status: 'CANCELLED' }), [false, false, false]);
check('even one that had shipped', doneFlags({ paymentMethod: 'stripe', status: 'CANCELLED', paymentStatus: 'refunded' }), [false, false, false]);
check('and is flagged as such', getOrderProgress({ status: 'CANCELLED' }).cancelled, true);

// --- the current step ----------------------------------------------------
console.log('current step');
check('a new order is working on step one', getOrderProgress(cod('PENDING')).currentIndex, 0);
check('a confirmed order is working on step two', getOrderProgress(cod('CONFIRMED')).currentIndex, 1);
check('a shipped order is working on step three', getOrderProgress(cod('SHIPPED')).currentIndex, 2);
check('a delivered order stays on the last', getOrderProgress(cod('DELIVERED')).currentIndex, 2);
check('exactly one step is current mid-flight', getOrderProgress(cod('CONFIRMED')).steps.filter((s) => s.current).length, 1);
check('none is current once complete', getOrderProgress(cod('DELIVERED')).steps.filter((s) => s.current).length, 0);
check('none is current when cancelled', getOrderProgress({ status: 'CANCELLED' }).steps.filter((s) => s.current).length, 0);

// --- shapes the server actually sends ------------------------------------
console.log('field-name tolerance');
check('snake_case payment method', doneFlags({ payment_method: 'cod', status: 'CONFIRMED' }), [true, false, false]);
check('snake_case payment status', doneFlags({ payment_method: 'stripe', status: 'PENDING', payment_status: 'paid' }), [true, false, false]);
check('lowercase status', doneFlags(cod('delivered')), [true, true, true]);
check('an unknown status is treated as the start', doneFlags(cod('SOMETHING_NEW')), [false, false, false]);
check('a missing order does not throw', doneFlags(undefined), [false, false, false]);

// --- the fraction, for the bar -------------------------------------------
console.log('fraction');
check('nothing done', getOrderProgress(cod('PENDING')).fraction, 0);
check('one of three', Math.round(getOrderProgress(cod('CONFIRMED')).fraction * 100), 33);
check('all three', getOrderProgress(cod('DELIVERED')).fraction, 1);
check('cancelled is empty', getOrderProgress({ status: 'CANCELLED' }).fraction, 0);

/**
 * The tracker lights the segment leading to a dot once that dot is reached, which it
 * reads off the *next* step rather than the current one. Stated here so the rule is
 * pinned even though the drawing lives in the component.
 */
console.log('connecting segments');
const litAfter = (order) => {
  const s = getOrderProgress(order);
  return s.steps.slice(0, -1).map((_, i) => !s.cancelled && s.steps[i + 1].done);
};
check('nothing reached: no segments', litAfter(cod('PENDING')), [false, false]);
check('only the first dot: still none', litAfter(cod('CONFIRMED')), [false, false]);
check('second dot reached: first segment', litAfter(cod('SHIPPED')), [true, false]);
check('third dot reached: both', litAfter(cod('DELIVERED')), [true, true]);
check('cancelled: none', litAfter({ status: 'CANCELLED' }), [false, false]);

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\norder progress ok');

/**
 * The three-step order tracker.
 *
 * The rule worth guarding is the first step. A naive "paid -> shipped -> delivered" bar
 * is wrong for cash on delivery, where the money arrives at the door: every COD customer
 * would watch an empty first step until the courier knocked. So step one means *accepted*,
 * and only its label changes with the payment method.
 */
import { getOrderProgress, isOrderSettled } from '../utils/orderModel.js';
import { buildOrderActivityState, shouldTrackOrder } from '../utils/orderActivity.js';
import en from '../i18n/messages/en.json' with { type: 'json' };

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

/**
 * The Lock Screen card's props are a wire format: the server sends the same shape inside
 * an APNs payload, and ActivityKit decodes nothing if it does not match. The usual
 * symptom is a push that reports success and displays nothing, so the shape is pinned
 * here rather than discovered on a device.
 */
console.log('live activity payload');
// Stands in for the app's translator, interpolation included — a stub that ignored params
// would let an unfilled "{place}" through here and onto a customer's Lock Screen.
const t = (key, params) => {
  const value = key.split('.').reduce((o, k) => (o || {})[k], en) ?? key;
  if (typeof value !== 'string' || !params) return value;
  return Object.entries(params).reduce(
    (out, [name, replacement]) => out.split(`{${name}}`).join(String(replacement)),
    value
  );
};
const state = buildOrderActivityState({ orderNumber: '46125502', paymentMethod: 'cod', status: 'SHIPPED' }, t);

check('carries exactly the widget’s props', Object.keys(state).sort(), [
  'cancelled',
  'done',
  'orderLabel',
  'orderNumber',
  'status',
  'steps',
]);
check('the number reads as a sentence', state.orderLabel, 'Order #46125502');
check('order number is a string', typeof state.orderNumber, 'string');
check('done is a number the bar can use', state.done, 2);
check('three step labels', state.steps.length, 3);
check('labels are translated, not keys', state.steps, ['Confirmed', 'Shipped', 'Delivered']);
check('status line is present tense', state.status, 'On its way to you');

const prepaid = buildOrderActivityState({ orderNumber: '1', paymentMethod: 'stripe', status: 'PENDING', paymentStatus: 'paid' }, t);
check('prepaid says Paid, not Confirmed', prepaid.steps[0], 'Paid');
check('and is one step in', prepaid.done, 1);

const done = buildOrderActivityState({ orderNumber: '1', paymentMethod: 'cod', status: 'DELIVERED' }, t);
check('a finished order reads as finished', done.status, 'Delivered — thank you');
check('with the bar full', done.done, 3);

const gone = buildOrderActivityState({ orderNumber: '1', status: 'CANCELLED' }, t);
check('a cancelled order empties the bar', gone.done, 0);
check('and says so', gone.status, 'This order was cancelled');
check('and is flagged', gone.cancelled, true);

/**
 * The delivery promise.
 *
 * This is the one thing on the card that is a commitment rather than a report, so the
 * rules are pinned here on both sides. One to two hours is the Careem service inside
 * Dubai; everywhere else is 24 to 36. Nothing is promised before we accept the order,
 * and nothing once it is over.
 */
console.log('delivery promise');
const withEmirate = (emirate, status) =>
  buildOrderActivityState({ orderNumber: '1', paymentMethod: 'cod', status, customerEmirate: emirate }, t);

check('Dubai gets the hours', withEmirate('Dubai', 'CONFIRMED').eta, 'Arriving in Dubai within 1–2 hours');
check('and is not case-sensitive', withEmirate('dubai', 'CONFIRMED').eta, 'Arriving in Dubai within 1–2 hours');

// Naming the destination is what makes two different windows read as fair rather than
// arbitrary. A customer in Ajman should be able to see why theirs says a day and a half.
check('Abu Dhabi does not', withEmirate('Abu Dhabi', 'CONFIRMED').eta, 'Arriving in Abu Dhabi within 24–36 hours');
check('nor Sharjah', withEmirate('Sharjah', 'SHIPPED').eta, 'Arriving in Sharjah within 24–36 hours');
check('however the place was typed', withEmirate('ras al-khaimah', 'CONFIRMED').eta, 'Arriving in Ras Al Khaimah within 24–36 hours');
check('and a place we do not translate falls back to what was entered', withEmirate('Al Ain', 'CONFIRMED').eta, 'Arriving in Al Ain within 24–36 hours');
check('no placeholder is left unfilled', withEmirate('Dubai', 'CONFIRMED').eta.includes('{place}'), false);

// The three silences. Each is a promise we have no business making.
check('nothing before we accept', 'eta' in withEmirate('Dubai', 'PENDING'), false);
check('nothing once delivered', 'eta' in withEmirate('Dubai', 'DELIVERED'), false);
check('nothing when cancelled', 'eta' in withEmirate('Dubai', 'CANCELLED'), false);
check('nothing without an emirate', 'eta' in buildOrderActivityState({ orderNumber: '1', status: 'CONFIRMED' }, t), false);
check('nor for a blank one', 'eta' in withEmirate('   ', 'CONFIRMED'), false);

// The server sends snake_case in places; the card must not go silent because of it.
check('accepts the plain field name too', buildOrderActivityState({ orderNumber: '1', status: 'CONFIRMED', emirate: 'Dubai' }, t).eta, 'Arriving in Dubai within 1–2 hours');

/**
 * The logo path and the rewards standing are decoration: a card without them is still a
 * complete card, and the server — which cannot know a device-local file path — sends
 * neither. So they must never appear as empty keys.
 */
console.log('optional decoration');
const bare = buildOrderActivityState({ orderNumber: '1', status: 'SHIPPED' }, t);
check('absent when not supplied', ['tier', 'points'].filter((k) => k in bare), []);

const dressed = buildOrderActivityState({ orderNumber: '1', status: 'SHIPPED' }, t, {
  tier: 'SILVER',
  points: 1240.4,
});
// The widget prints these verbatim, so the words and the rounding happen here.
check('the tier says whose it is', dressed.tier, 'Your tier: SILVER');
check('points are rounded and carry their unit', dressed.points, '1240 pts');

const partial = buildOrderActivityState({ orderNumber: '1', status: 'SHIPPED' }, t, { tier: 'GOLD' });
check('a tier without points is still fine', partial.tier, 'Your tier: GOLD');
check('and adds no points key', 'points' in partial, false);
check('nothing added for a guest', 'tier' in buildOrderActivityState({ orderNumber: '1' }, t, {}), false);

// Nothing that cannot change belongs on the Lock Screen.
console.log('what gets a card');
check('an order on its way does', shouldTrackOrder({ paymentMethod: 'cod', status: 'SHIPPED' }), true);
check('a delivered one does not', shouldTrackOrder({ paymentMethod: 'cod', status: 'DELIVERED' }), false);
check('a cancelled one does not', shouldTrackOrder({ status: 'CANCELLED' }), false);

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\norder progress ok');

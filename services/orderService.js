/**
 * Genosys Order Service
 * Handles order submission to website API with proper database saving and email notifications
 */

import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';
import { buildMobileOrderItemPayload } from '../utils/orderPayloadPricing';
import { authenticatedFetch } from './authFetch';

const log = createLogger('orderService');

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;
const ORDER_TIMEOUT_MS = 15000;

function getToken(orderOrToken) {
  if (!orderOrToken) return '';
  if (typeof orderOrToken === 'string') return orderOrToken;
  return orderOrToken?.userToken || orderOrToken?.token || orderOrToken?.accessToken || '';
}

/**
 * Get CSRF token for order submission
 * @returns {Promise<string>} CSRF token
 */
function getAuthHeader(orderData) {
  const token = orderData?.userToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getMobileHeaders(orderData) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...getAuthHeader(orderData),
  };
}

async function readResponseBody(response) {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getSafeOrderErrorMessage(kind) {
  if (kind === 'timeout') return 'The connection timed out. Please check your network and try again.';
  if (kind === 'card') return 'Could not start card payment. Please try again.';
  if (kind === 'resume') return 'Could not start payment for this order yet. Please try again later.';
  return 'Could not place order. Please try again.';
}

// This module runs outside React and has no translator. The message above is
// the English fallback; the code is what the checkout screen translates, so
// a Russian or Arabic user is not shown an English sentence under a localised
// one. Keys live at checkout.orderErrors.<code>.
function orderError(kind) {
  const error = new Error(getSafeOrderErrorMessage(kind));
  error.code = ['timeout', 'card', 'resume'].includes(kind) ? kind : 'generic';
  return error;
}

async function postMobileJson(url, payload, orderDataOrToken, kind) {
  const token = getToken(orderDataOrToken);
  const headers = typeof orderDataOrToken === 'string'
    ? {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        Authorization: `Bearer ${orderDataOrToken}`,
      }
    : getMobileHeaders(orderDataOrToken);

  // Every other call goes through httpClient and its 15 s limit; this one
  // needs the token-refresh retry in authenticatedFetch, so it carries its own.
  // Without it a hung connection left "Place order" spinning until the app was
  // force-quit. The server has already given up on its side long before then.
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), ORDER_TIMEOUT_MS) : null;
  let response;
  try {
    response = await authenticatedFetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      ...(controller ? { signal: controller.signal } : {}),
    }, token);
  } catch (error) {
    if (error?.name === 'AbortError') {
      log.warn('Mobile order request timed out', { kind, url });
      throw orderError('timeout');
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const body = await readResponseBody(response);
  if (!response.ok) {
    log.warn('Mobile order request failed', {
      kind,
      url,
      status: response.status,
      message: body?.error || body?.message || '',
    });
    throw orderError(kind);
  }
  return body;
}

/**
 * Attempt to get a Stripe payment URL for an existing (pending/unpaid) order.
 *
 * Expected backend behavior (recommended):
 * - If order already has a paymentUrl/paymentLink, return it.
 * - Otherwise create or reuse a Stripe session/payment-intent and return a URL.
 *
 * This function is defensive and tries a few common payload shapes.
 *
 * @param {Object} args
 * @param {string} args.token - user auth token
 * @param {string|number} [args.orderId]
 * @param {string} [args.orderNumber]
 * @param {Object} [args.order] - optional order object that may already include paymentUrl/paymentLink
 */
export async function getPaymentUrlForExistingOrder({ token, orderId, orderNumber, order } = {}) {
  const t = getToken(token) || getToken(order);
  if (!t) {
    return { success: false, error: 'Login required to process payment.' };
  }

  // If backend already provides the link, use it.
  const existingUrl = order?.paymentUrl || order?.paymentLink || order?.payment_url || order?.payment_link || '';
  if (existingUrl) {
    return { success: true, paymentUrl: String(existingUrl) };
  }

  const id = orderId != null ? String(orderId) : (order?.id ? String(order.id) : '');
  const num = orderNumber || order?.orderNumber || order?.order_number || order?.number || '';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${t}`,
  };

  // Try a few likely endpoints/payloads (we can align backend to one canonical route).
  const attempts = [
    // Canonical (recommended backend): POST /checkout/stripe with orderId/orderNumber to resume payment
    { url: `${API_BASE_URL}/checkout/stripe`, body: { orderId: id, orderNumber: String(num || ''), resume: true } },
    { url: `${API_BASE_URL}/checkout/stripe`, body: { orderId: id, resume: true } },
    { url: `${API_BASE_URL}/checkout/stripe`, body: { orderNumber: String(num || ''), resume: true } },

    // Alternate: POST /orders/{id}/pay
    ...(id ? [{ url: `${API_BASE_URL}/orders/${id}/pay`, body: { orderNumber: String(num || '') } }] : []),
  ];

  for (const attempt of attempts) {
    try {
      const res = await authenticatedFetch(attempt.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(attempt.body),
      }, t);

      if (!res.ok) continue;

      const json = await readResponseBody(res);
      const paymentUrl = json?.paymentUrl || json?.paymentLink || json?.url || json?.data?.paymentUrl || '';
      if (paymentUrl) {
        return { success: true, paymentUrl: String(paymentUrl), raw: json };
      }
    } catch (e) {
      log.warn('Payment resume attempt failed', {
        url: attempt.url,
        error: e?.message || e,
      });
      // continue
    }
  }

  return {
    success: false,
    error:
      'Could not start payment for this order yet. Please try again later, or contact support if the issue persists.',
  };
}

/**
 * Submit Cash on Delivery order
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Order submission result
 */
export async function submitCODOrder(orderData) {
  if (!Array.isArray(orderData?.items) || orderData.items.length === 0) {
    return { success: false, error: 'Order must contain at least one item' };
  }

  log.debug('Submitting COD order', { orderNumber: orderData?.orderNumber });
  
  try {
    // Mobile endpoint (no CSRF): requires Authorization token
    const orderPayload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      // send emirate in multiple common fields to satisfy backend validators
      emirate: orderData.emirate,
      deliveryEmirate: orderData.emirate,
      shippingEmirate: orderData.emirate,
      customerEmirate: orderData.emirate,
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        address: orderData.customerAddress,
        emirate: orderData.emirate,
        customerEmirate: orderData.emirate,
      },
      items: orderData.items.map(buildMobileOrderItemPayload),
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      vatAmount: orderData.vatAmount,
      total: orderData.total,
      paymentMethod: 'cod',
      orderNotes: orderData.orderNotes || '',
      source: 'mobile_app',
      locale: orderData.locale || 'en',
      // Discount fields for email templates and order records
      discountPercentage: orderData.discountPercentage || 0,
      discountAmount: orderData.discountAmount || 0,
      bundleDiscountPercentage: orderData.bundleDiscountPercentage || 0,
      bundleDiscountAmount: orderData.bundleDiscountAmount || 0,
      // GENOSYS Rewards points to redeem (server validates and clamps)
      ...(orderData.redeemPoints > 0 ? { redeemPoints: orderData.redeemPoints } : {}),
      clientPricingSnapshot: orderData.clientPricingSnapshot || null,
      // Email/notification hints (backend may use these)
      sendEmails: true,
      notifyAdmin: true,
    };

    const result = await postMobileJson(`${API_BASE_URL}/orders`, orderPayload, orderData, 'cod');
    const orderNumberFromApi =
      result?.orderNumber ||
      result?.data?.orderNumber ||
      result?.data?.order?.orderNumber ||
      '';
    const orderIdFromApi =
      result?.orderId ||
      result?.id ||
      result?.data?.id ||
      result?.data?.orderId ||
      '';
    log.debug('COD order submitted successfully', {
      success: result.success,
      orderNumber: orderNumberFromApi || orderData.orderNumber,
      orderId: orderIdFromApi
    });

    return {
      success: true,
      orderId: orderIdFromApi,
      orderNumber: orderNumberFromApi || orderData.orderNumber,
      message: result.message || 'Order placed successfully'
    };

  } catch (error) {
    log.error('COD order submission failed', error?.message || error);
    return {
      success: false,
      error: getSafeOrderErrorMessage('cod'),
      errorCode: error?.code || 'generic',
    };
  }
}

/**
 * Submit Card Payment order (support link method)
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Order submission result
 */
export async function submitCardOrder(orderData) {
  if (!Array.isArray(orderData?.items) || orderData.items.length === 0) {
    return { success: false, error: 'Order must contain at least one item' };
  }

  log.debug('Submitting Card order', { orderNumber: orderData?.orderNumber });
  
  try {
    // Mobile Stripe checkout endpoint (no CSRF): requires Authorization token
    const orderPayload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        address: orderData.customerAddress,
        emirate: orderData.emirate,
      },
      emirate: orderData.emirate,
      paymentMethod: 'card',
      items: orderData.items.map(buildMobileOrderItemPayload),
      shippingCost: Number(orderData.shippingCost) || 0,
      vatAmount: Number(orderData.vatAmount) || 0,
      subtotal: Number(orderData.subtotal) || 0,
      total: Number(orderData.total) || 0,
      orderNotes: orderData.orderNotes || '',
      locale: orderData.locale || 'en',
      // Discount fields for email templates and order records
      discountPercentage: orderData.discountPercentage || 0,
      discountAmount: orderData.discountAmount || 0,
      bundleDiscountPercentage: orderData.bundleDiscountPercentage || 0,
      bundleDiscountAmount: orderData.bundleDiscountAmount || 0,
      clientPricingSnapshot: orderData.clientPricingSnapshot || null,
      sendEmails: true,
      notifyAdmin: true,
      source: 'mobile_app',
    };

    const result = await postMobileJson(`${API_BASE_URL}/checkout/stripe`, orderPayload, orderData, 'card');
    log.debug('Card order submitted successfully', {
      success: result.success,
      orderNumber: result.orderNumber || orderData.orderNumber,
      orderId: result.orderId || result.id,
      paymentUrl: result.paymentUrl || result.paymentLink
    });

    return {
      success: true,
      orderId: result.orderId || result.id,
      orderNumber: result.orderNumber || orderData.orderNumber,
      message: result.message || 'Order request submitted successfully',
      paymentUrl: result.paymentUrl || result.paymentLink || null,
    };

  } catch (error) {
    log.error('Card order submission failed', error?.message || error);
    return {
      success: false,
      error: getSafeOrderErrorMessage('card'),
      errorCode: error?.code || 'card',
    };
  }
}

/**
 * Create a Stripe PaymentIntent for the native Payment Sheet (card / Apple Pay /
 * Google Pay / Link). Persists/updates the order server-side (PENDING) exactly
 * like submitCardOrder, but returns a clientSecret to confirm in-app instead of
 * a hosted-checkout URL.
 *
 * @param {Object} orderData - same shape as submitCardOrder
 * @returns {Promise<{success:boolean, orderId?:string, orderNumber?:string, clientSecret?:string, error?:string}>}
 */
export async function createCardPaymentSheetIntent(orderData) {
  if (!Array.isArray(orderData?.items) || orderData.items.length === 0) {
    return { success: false, error: 'Order must contain at least one item' };
  }

  log.debug('Creating card Payment Sheet intent', { orderNumber: orderData?.orderNumber });

  try {
    const intentPayload = {
      orderNumber: orderData.orderNumber,
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        address: orderData.customerAddress,
      },
      emirate: orderData.emirate,
      items: orderData.items.map(buildMobileOrderItemPayload),
      orderNotes: orderData.orderNotes || '',
      locale: orderData.locale || 'en',
      // GENOSYS Rewards points to redeem (server validates and clamps)
      ...(orderData.redeemPoints > 0 ? { redeemPoints: orderData.redeemPoints } : {}),
    };

    // Canonical Payment Sheet route (handles card / Apple Pay / Google Pay /
    // Link). The backend also keeps the legacy /payments/applepay/intent
    // alias for app versions shipped before the rename.
    const result = await postMobileJson(
      `${API_BASE_URL}/payments/sheet/intent`,
      intentPayload,
      orderData,
      'card'
    );

    const clientSecret = result?.clientSecret || result?.client_secret || '';
    if (!result?.success || !clientSecret) {
      log.warn('Payment Sheet intent missing clientSecret', { success: result?.success });
      return { success: false, error: getSafeOrderErrorMessage('card'), errorCode: 'card' };
    }

    return {
      success: true,
      orderId: result.orderId || result.id || '',
      orderNumber: result.orderNumber || orderData.orderNumber,
      clientSecret,
    };
  } catch (error) {
    log.error('Payment Sheet intent creation failed', error?.message || error);
    return { success: false, error: getSafeOrderErrorMessage('card'), errorCode: error?.code || 'card' };
  }
}

/**
 * Generate professional order number
 * @returns {string} Professional order number (GEN + YYMMDD + 4-digit sequence)
 */
export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const entropy = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return `GEN${year}${month}${day}${seq}${entropy}`;
}

// Card / Apple Pay / Google Pay / Link are handled by the native Stripe Payment
// Sheet via createCardPaymentSheetIntent (PaymentIntent confirmed in-app).
// Note: Apple's 15-30% IAP commission does NOT apply here - these are physical
// goods, which Apple requires to use standard payment processing (no Apple cut).
// getPaymentUrlForExistingOrder remains the hosted fallback for retrying older
// pending orders.

export default {
  submitCODOrder,
  submitCardOrder,
  createCardPaymentSheetIntent,
  getPaymentUrlForExistingOrder,
  generateOrderNumber,
};


/**
 * Genosys Order Service
 * Handles order submission to website API with proper database saving and email notifications
 */

import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('orderService');

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

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
      const res = await fetch(attempt.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(attempt.body),
      });

      if (!res.ok) {
        // Continue trying other shapes; keep last error in case all fail.
        continue;
      }

      const json = await res.json().catch(() => ({}));
      const paymentUrl = json?.paymentUrl || json?.paymentLink || json?.url || json?.data?.paymentUrl || '';
      if (paymentUrl) {
        return { success: true, paymentUrl: String(paymentUrl), raw: json };
      }
    } catch {
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
      items: orderData.items.map(item => {
        const productId = item.product?.id || item.id;
        const rawPrice = item.product?.displayPrice ?? item.product?.price ?? item.price ?? 0;
        const price = Number(rawPrice);
        const quantity = Number(item.quantity) || 0;
        const isPromo = item.isPromotionItem === true;
        return {
          // Required by backend
          productId,
          quantity,
          price: Number.isFinite(price) ? price : 0,

          // Keep compatibility fields (safe extras)
          id: productId,
          name: item.product?.name || item.name,
          image: item.product?.image_url || item.product?.image || item.image,
          size: isPromo ? null : (item.selectedSize && item.selectedSize !== '__PROMO__' ? item.selectedSize : (item.size || null)),
          color: item.selectedColor || item.color,
          isPromotionItem: isPromo,
          promotionKey: item.promotionKey || null,
        };
      }),
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      vatAmount: orderData.vatAmount,
      total: orderData.total,
      paymentMethod: 'cod',
      orderNotes: orderData.orderNotes || '',
      source: 'mobile_app',
      locale: 'en',
      // Email/notification hints (backend may use these)
      sendEmails: true,
      notifyAdmin: true,
    };

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getMobileHeaders(orderData),
      body: JSON.stringify(orderPayload),
    });

    log.debug('COD order response status', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData = {};
      try { errorData = errorText ? JSON.parse(errorText) : {}; } catch {}
      throw new Error(`Order submission failed: ${response.status} - ${errorData.error || errorData.message || errorText || 'Unknown error'}`);
    }

    const result = await response.json();
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
      error: error.message || 'Failed to submit order',
      details: error
    };
  }
}

/**
 * Submit Card Payment order (support link method)
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Order submission result
 */
export async function submitCardOrder(orderData) {
  log.debug('Submitting Card order', { orderNumber: orderData?.orderNumber });
  
  try {
    // Mobile Stripe checkout endpoint (no CSRF): requires Authorization token
    const orderPayload = {
      orderNumber: orderData.orderNumber,
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        address: orderData.customerAddress,
      },
      emirate: orderData.emirate,
      items: orderData.items.map(item => ({
        id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        price: item.product?.displayPrice || item.product?.price || item.price,
        quantity: item.quantity,
        image: item.product?.image_url || item.product?.image || item.image,
        size: item.isPromotionItem === true ? null : (item.selectedSize && item.selectedSize !== '__PROMO__' ? item.selectedSize : (item.size || null)),
        color: item.selectedColor || item.color,
        isPromotionItem: item.isPromotionItem === true,
        promotionKey: item.promotionKey || null,
      })),
      shippingCost: orderData.shippingCost,
      vatAmount: orderData.vatAmount,
      subtotal: orderData.subtotal,
      total: orderData.total,
      orderNotes: orderData.orderNotes || '',
    };

    const response = await fetch(`${API_BASE_URL}/checkout/stripe`, {
      method: 'POST',
      headers: getMobileHeaders(orderData),
      body: JSON.stringify(orderPayload),
    });

    log.debug('Card order response status', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData = {};
      try { errorData = errorText ? JSON.parse(errorText) : {}; } catch {}
      throw new Error(`Card order submission failed: ${response.status} - ${errorData.error || errorData.message || errorText || 'Unknown error'}`);
    }

    const result = await response.json();
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
      error: error.message || 'Failed to submit card order',
      details: error
    };
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
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `GEN${year}${month}${day}${sequence}`;
}

export default {
  submitCODOrder,
  submitCardOrder,
  getPaymentUrlForExistingOrder,
  generateOrderNumber,
};


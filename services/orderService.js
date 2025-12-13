/**
 * Genosys Order Service
 * Handles order submission to website API with proper database saving and email notifications
 */

import AUTH_CONFIG from '../config/auth';

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

/**
 * Get CSRF token for order submission
 * @returns {Promise<string>} CSRF token
 */
async function getCSRFToken() {
  try {
    const response = await fetch('https://genosys.ae/api/csrf-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('❌ Failed to get CSRF token:', error);
    throw error;
  }
}

/**
 * Submit Cash on Delivery order
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Order submission result
 */
export async function submitCODOrder(orderData) {
  console.log('📦 Submitting COD order:', orderData.orderNumber);
  
  try {
    // Get CSRF token
    const csrfToken = await getCSRFToken();
    console.log('🔐 Got CSRF token for order submission');
    
    // Prepare order payload matching website API expectations
    const orderPayload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      emirate: orderData.emirate,
      items: orderData.items.map(item => ({
        id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        price: item.product?.displayPrice || item.product?.price || item.price,
        quantity: item.quantity,
        image: item.product?.image_url || item.product?.image || item.image,
        size: item.selectedSize || item.size,
        color: item.selectedColor || item.color,
      })),
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      vatAmount: orderData.vatAmount,
      total: orderData.total,
      locale: 'en', // Default to English
      orderNotes: orderData.orderNotes || ''
    };

    console.log('📧 Sending COD order to website API:', {
      orderNumber: orderPayload.orderNumber,
      customerEmail: orderPayload.customerEmail,
      total: orderPayload.total,
      itemCount: orderPayload.items.length
    });

    const response = await fetch('https://genosys.ae/api/orders/cod-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'User-Agent': 'GenosysMobileApp/1.0.0 (Mobile Order)',
      },
      body: JSON.stringify(orderPayload),
    });

    console.log('📡 COD order API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Order submission failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ COD order submitted successfully:', {
      success: result.success,
      orderNumber: result.orderNumber,
      orderId: result.orderId
    });

    return {
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      message: result.message || 'Order placed successfully'
    };

  } catch (error) {
    console.error('❌ COD order submission failed:', error);
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
  console.log('💳 Submitting Card order:', orderData.orderNumber);
  
  try {
    // Get CSRF token
    const csrfToken = await getCSRFToken();
    console.log('🔐 Got CSRF token for card order submission');
    
    // Prepare order payload matching website API expectations
    const orderPayload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      emirate: orderData.emirate,
      items: orderData.items.map(item => ({
        id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        price: item.product?.displayPrice || item.product?.price || item.price,
        quantity: item.quantity,
        image: item.product?.image_url || item.product?.image || item.image,
        size: item.selectedSize || item.size,
        color: item.selectedColor || item.color,
        total: (item.product?.displayPrice || item.product?.price || item.price) * item.quantity
      })),
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      vatAmount: orderData.vatAmount,
      total: orderData.total,
      locale: 'en', // Default to English
      orderNotes: orderData.orderNotes || ''
    };

    console.log('💳 Sending card order to website API:', {
      orderNumber: orderPayload.orderNumber,
      customerEmail: orderPayload.customerEmail,
      total: orderPayload.total,
      itemCount: orderPayload.items.length
    });

    const response = await fetch('https://genosys.ae/api/orders/support-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'User-Agent': 'GenosysMobileApp/1.0.0 (Mobile Order)',
      },
      body: JSON.stringify(orderPayload),
    });

    console.log('📡 Card order API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Card order submission failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Card order submitted successfully:', {
      success: result.success,
      orderNumber: result.orderNumber,
      orderId: result.orderId
    });

    return {
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      message: result.message || 'Order request submitted successfully'
    };

  } catch (error) {
    console.error('❌ Card order submission failed:', error);
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
  generateOrderNumber,
};


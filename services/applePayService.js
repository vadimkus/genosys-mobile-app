import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { debugLog, errorLog } from '../utils/logger';

const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const MERCHANT_IDENTIFIER = 'merchant.ae.genosys.app';
const APPLE_PAY_MERCHANT_COUNTRY_CODE = 'AE';
const APPLE_PAY_CURRENCY_CODE = 'AED';

export const getStripeConfigStatus = () => {
  const key = String(STRIPE_PUBLISHABLE_KEY || '');
  return {
    hasPublishableKey: !!key,
    publishableKeyPrefix: key ? key.slice(0, 7) : '',
    publishableKeyLength: key.length,
    merchantIdentifier: MERCHANT_IDENTIFIER,
    merchantCountryCode: APPLE_PAY_MERCHANT_COUNTRY_CODE,
    currencyCode: APPLE_PAY_CURRENCY_CODE,
  };
};

// IMPORTANT:
// - In Expo Go, Stripe native modules are not available.
// - In production/TestFlight builds, we need a deterministic module load (dynamic import can be flaky).
let stripeModule = null;
let stripeModuleTried = false;
let stripeModuleError = null;

function getStripe() {
  if (stripeModuleTried) return stripeModule;
  stripeModuleTried = true;

  try {
    // Use require() so Metro always includes the module in the bundle.
    // If native side isn't present (Expo Go / missing plugin), this will throw and we can handle it.
    // eslint-disable-next-line global-require
    stripeModule = require('@stripe/stripe-react-native');
    return stripeModule;
  } catch (e) {
    stripeModuleError = e;
    errorLog('[ApplePay] Stripe native module not available (use a dev build / production build):', e?.message || e);
    return null;
  }
}

export const getStripeRuntimeStatus = () => ({
  moduleLoaded: !!stripeModule,
  tried: stripeModuleTried,
  errorMessage: stripeModuleError ? String(stripeModuleError?.message || stripeModuleError) : '',
});

/**
 * Apple Pay Service
 * 
 * Handles Apple Pay initialization, availability checks, and payment processing
 * using Stripe's React Native SDK.
 */

/**
 * Initialize Stripe with Apple Pay support
 */
export const initializeStripe = async () => {
  try {
    if (Platform.OS !== 'ios') {
      debugLog('[ApplePay] Skipping Stripe initialization - not iOS');
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      errorLog('[ApplePay] Missing Stripe publishable key');
      return;
    }

    const stripe = getStripe();
    if (!stripe?.initStripe) return;

    await stripe.initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: MERCHANT_IDENTIFIER,
      urlScheme: 'genosys',
    });

    debugLog('[ApplePay] Stripe initialized successfully');
  } catch (error) {
    errorLog('[ApplePay] Failed to initialize Stripe:', error);
  }
};

/**
 * Check if Apple Pay is available on this device
 */
export const checkApplePayAvailability = async () => {
  try {
    if (Platform.OS !== 'ios') {
      return false;
    }

    const stripe = getStripe();
    if (!stripe?.isPlatformPaySupported) return false;

    // On iOS, `isPlatformPaySupported()` checks Apple Pay.
    const isSupported = await stripe.isPlatformPaySupported();
    debugLog('[ApplePay] Apple Pay (Platform Pay) supported:', isSupported);
    return !!isSupported;
  } catch (error) {
    errorLog('[ApplePay] Error checking Apple Pay availability:', error);
    return false;
  }
};

/**
 * Present Apple Pay payment sheet
 * 
 * @param {Object} params - Payment parameters
 * @param {string} params.clientSecret - Stripe PaymentIntent client secret
 * @param {Array} params.cartItems - Items in the cart
 * @param {number} params.totalAmount - Total amount in AED
 * @param {Object} params.customerInfo - Customer information
 */
export const presentApplePaySheet = async ({ 
  clientSecret, 
  cartItems,
  lineItems,
  totalAmount,
  customerInfo,
  labels,
}) => {
  try {
    debugLog('[ApplePay] Confirming Platform Pay payment (Apple Pay)...');
    const stripe = getStripe();
    if (!stripe?.confirmPlatformPayPayment) {
      const runtime = getStripeRuntimeStatus();
      const details = runtime?.errorMessage ? ` (${runtime.errorMessage})` : '';
      return { success: false, error: { message: `Stripe native module not available${details}` } };
    }

    const safeLabels = labels || {};
    const totalLabel = safeLabels.total || 'Total';

    // Stripe RN v0.50.x uses Platform Pay (Apple Pay on iOS).
    // Apple Pay expects cartItems with `paymentType` and `amount` as string.
    const baseItems = Array.isArray(lineItems) && lineItems.length
      ? lineItems
      : (Array.isArray(cartItems) ? cartItems : []).map(item => ({
          label: item.product?.name || item.name || 'Item',
          amount: ((Number(item.product?.displayPrice ?? item.product?.price ?? item.price ?? 0) * (Number(item.quantity) || 0))).toFixed(2),
        }));

    const platformPayCartItems = [
      ...baseItems.map((it) => ({
        label: String(it.label || 'Item'),
        amount: Number(it.amount || 0).toFixed(2),
        paymentType: 'Immediate',
      })),
      {
        label: totalLabel,
        amount: Number(totalAmount || 0).toFixed(2),
        paymentType: 'Immediate',
      },
    ];

    const { error, paymentIntent, paymentMethod } = await stripe.confirmPlatformPayPayment(clientSecret, {
      applePay: {
        merchantCountryCode: APPLE_PAY_MERCHANT_COUNTRY_CODE,
        currencyCode: APPLE_PAY_CURRENCY_CODE,
        cartItems: platformPayCartItems,
      },
    });

    if (error) {
      errorLog('[ApplePay] Apple Pay payment failed:', error);
      return { success: false, error };
    }

    debugLog('[ApplePay] Apple Pay payment confirmed successfully');
    return { success: true, paymentIntent, paymentMethod };

  } catch (error) {
    errorLog('[ApplePay] Exception in presentApplePaySheet:', error);
    return { success: false, error };
  }
};


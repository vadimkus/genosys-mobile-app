import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PAYMENT_METHOD_KEY = 'genosys_default_payment_method';

// Supported values in the app
// Note: Apple Pay was removed due to Apple's high in-app payment fees (15-30%)
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
};

export async function getDefaultPaymentMethod() {
  try {
    const value = await AsyncStorage.getItem(DEFAULT_PAYMENT_METHOD_KEY);
    // Backward/forward compatibility: accept known values only.
    // Users who previously saved a preference (including 'cod') keep that choice.
    if (value === PAYMENT_METHODS.CARD || value === PAYMENT_METHODS.COD) {
      return value;
    }
    // First-time users default to CARD (matches web checkout).
    return PAYMENT_METHODS.CARD;
  } catch {
    return PAYMENT_METHODS.CARD;
  }
}

export async function setDefaultPaymentMethod(method) {
  const safe =
    method === PAYMENT_METHODS.CARD
      ? PAYMENT_METHODS.CARD
      : PAYMENT_METHODS.COD;
  await AsyncStorage.setItem(DEFAULT_PAYMENT_METHOD_KEY, safe);
  return safe;
}




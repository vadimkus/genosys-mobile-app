import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PAYMENT_METHOD_KEY = 'genosys_default_payment_method';

// Supported values in the app
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
  APPLE_PAY: 'apple_pay',
};

export async function getDefaultPaymentMethod() {
  try {
    const value = await AsyncStorage.getItem(DEFAULT_PAYMENT_METHOD_KEY);
    // Backward/forward compatibility: accept known values only.
    if (
      value === PAYMENT_METHODS.CARD ||
      value === PAYMENT_METHODS.COD ||
      value === PAYMENT_METHODS.APPLE_PAY
    ) {
      return value;
    }
    return PAYMENT_METHODS.COD;
  } catch {
    return PAYMENT_METHODS.COD;
  }
}

export async function setDefaultPaymentMethod(method) {
  const safe =
    method === PAYMENT_METHODS.APPLE_PAY
      ? PAYMENT_METHODS.APPLE_PAY
      : method === PAYMENT_METHODS.CARD
        ? PAYMENT_METHODS.CARD
        : PAYMENT_METHODS.COD;
  await AsyncStorage.setItem(DEFAULT_PAYMENT_METHOD_KEY, safe);
  return safe;
}




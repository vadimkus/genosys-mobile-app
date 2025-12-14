import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PAYMENT_METHOD_KEY = 'genosys_default_payment_method';

// Supported values in the app
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
};

export async function getDefaultPaymentMethod() {
  try {
    const value = await AsyncStorage.getItem(DEFAULT_PAYMENT_METHOD_KEY);
    // Legacy support: previously we stored 'apple_pay' as a separate choice.
    // Card payments already support Apple Pay / Google Pay in Stripe, so we map it to CARD.
    if (value === 'apple_pay') return PAYMENT_METHODS.CARD;
    if (value === PAYMENT_METHODS.CARD || value === PAYMENT_METHODS.COD) return value;
    return PAYMENT_METHODS.COD;
  } catch {
    return PAYMENT_METHODS.COD;
  }
}

export async function setDefaultPaymentMethod(method) {
  const safe =
    method === PAYMENT_METHODS.CARD
      ? PAYMENT_METHODS.CARD
      : method === 'apple_pay'
        ? PAYMENT_METHODS.CARD
        : PAYMENT_METHODS.COD;
  await AsyncStorage.setItem(DEFAULT_PAYMENT_METHOD_KEY, safe);
  return safe;
}




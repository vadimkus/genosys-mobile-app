/**
 * The order the fields appear in, which is also the order to report them in:
 * the first entry with a message is the one to send the user to.
 */
export const ADDRESS_FIELD_ORDER = ['name', 'phone', 'address'];

/**
 * Reduce a typed phone number to the digits, keeping a leading `+`.
 *
 * The previous check stripped spaces only, so a number punctuated the way
 * people actually write them ("+971 50-123 4567", "(050) 123 4567") was
 * rejected for its dashes and brackets rather than for its digits.
 */
export function normalizePhoneInput(raw) {
  const s = String(raw || '').trim();
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Deliveries are UAE-only, so the courier needs a reachable UAE number. Both
 * the international and the local form are accepted.
 *
 * Note this is deliberately looser than checkout's `isValidUaeMobileNational`,
 * which takes mobiles only. Tightening this to match would reject landlines
 * that saved fine until now, so the two are left as they are.
 */
export function isValidUaePhone(raw) {
  return /^(\+971|0)[0-9]{8,9}$/.test(normalizePhoneInput(raw));
}

/**
 * Every problem with the address form in one pass, keyed by field.
 *
 * Collecting them rather than returning at the first failure is what lets the
 * form mark each offending field instead of showing one alert at a time.
 *
 * @param values  the form's current values
 * @param t       message lookup
 * @returns       an object keyed by field name; empty means valid
 */
export function validateAddressForm(values, t) {
  const { name = '', phone = '', address = '' } = values || {};
  const errors = {};

  if (!String(name).trim()) errors.name = t('addAddress.nameRequired');

  const trimmedPhone = String(phone).trim();
  if (!trimmedPhone) {
    errors.phone = t('addAddress.phoneRequired');
  } else if (!isValidUaePhone(trimmedPhone)) {
    errors.phone = t('addAddress.validationInvalidUaePhone');
  }

  if (!String(address).trim()) errors.address = t('addAddress.addressRequired');

  return errors;
}

/** The field to take the user to, or null when the form is clean. */
export function firstAddressError(errors) {
  return ADDRESS_FIELD_ORDER.find((key) => errors[key]) || null;
}

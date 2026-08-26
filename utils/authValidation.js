import { isEmailAddressSyntaxValid } from './emailAddressValidation';

/**
 * The order the fields appear in, which is also the order to report them in:
 * the first entry with a message is the one to send the user to.
 */
export const AUTH_FIELD_ORDER = ['name', 'email', 'password', 'phone', 'address', 'emirate', 'consent'];

/**
 * Every problem with the sign-in / sign-up form in one pass, keyed by field.
 *
 * Collecting them rather than returning at the first failure is what lets the
 * form show all of them at once instead of one modal at a time.
 *
 * @param values     the form's current values, plus `normalizedEmail`
 * @param options    `isLogin`, and `t` to look up the message text
 * @returns          an object keyed by field name; empty means valid
 */
export function validateAuthForm(values, { isLogin, t }) {
  const {
    name = '',
    email = '',
    normalizedEmail = '',
    password = '',
    phone = '',
    address = '',
    emirate = '',
    privacyConsent = false,
    emailSuggestion = null,
    confirmedEmail = null,
  } = values;

  const errors = {};

  if (!isLogin && !name.trim()) errors.name = t('authScreen.nameRequired');

  if (!email.trim()) {
    errors.email = t('authScreen.emailRequired');
  } else if (!isEmailAddressSyntaxValid(normalizedEmail)) {
    errors.email = t('authScreen.invalidEmail');
  } else if (emailSuggestion && confirmedEmail !== normalizedEmail) {
    errors.email = t('authScreen.emailSuggestionRequired');
  }

  if (!password) {
    errors.password = t('authScreen.passwordRequired');
  } else if (!isLogin && password.length < 8) {
    // Register-only, aligned with the server + reset-password policy. Signing in
    // is not length-checked, so legacy accounts with shorter passwords still
    // work; the server validates the credentials anyway.
    errors.password = t('authScreen.passwordMinLength');
  }

  if (!isLogin) {
    if (!phone.trim()) errors.phone = t('authScreen.phoneRequired');
    if (!address.trim()) errors.address = t('authScreen.addressRequired');
    if (!emirate) errors.emirate = t('authScreen.emirateRequired');
  }

  if (!privacyConsent) errors.consent = t('authScreen.privacyRequiredMessage');

  return errors;
}

/** The field to take the user to, or null when the form is clean. */
export function firstAuthError(errors) {
  return AUTH_FIELD_ORDER.find((key) => errors[key]) || null;
}

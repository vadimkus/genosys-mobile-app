import { isEmailAddressSyntaxValid } from './emailAddressValidation';

/**
 * The editable fields in the order they appear on the screen, which is also the
 * order to report them in: the first entry with a message is the one to send
 * the user to. `email` is absent because it is read-only on this form.
 */
export const PROFILE_FIELD_ORDER = ['firstName', 'lastName', 'contactEmail', 'phone'];

/**
 * Every problem with the edit-profile form in one pass, keyed by field.
 *
 * Collecting them rather than returning at the first failure is what lets the
 * form mark each offending field. The screen previously showed a single
 * "please fill in all required fields" alert covering five separate inputs,
 * which did not tell the user which one it meant.
 *
 * @param values  the form's current values
 * @param t       message lookup
 * @returns       an object keyed by field name; empty means valid
 */
export function validateProfileForm(values, t) {
  const {
    firstName = '',
    lastName = '',
    contactEmail = '',
    phone = '',
  } = values || {};

  const errors = {};

  if (!String(firstName).trim()) errors.firstName = t('editProfile.firstNameRequired');
  if (!String(lastName).trim()) errors.lastName = t('editProfile.lastNameRequired');

  const trimmedContact = String(contactEmail || '').trim();
  if (!trimmedContact) {
    errors.contactEmail = t('editProfile.contactEmailRequired');
  } else if (!isEmailAddressSyntaxValid(trimmedContact)) {
    errors.contactEmail = t('editProfile.validationInvalidContactEmail');
  }

  if (!String(phone).trim()) errors.phone = t('editProfile.phoneRequired');

  return errors;
}

/** The field to take the user to, or null when the form is clean. */
export function firstProfileError(errors) {
  return PROFILE_FIELD_ORDER.find((key) => errors[key]) || null;
}

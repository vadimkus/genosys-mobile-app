/**
 * Support contact links.
 *
 * `AUTH_CONFIG.WHATSAPP_NUMBER` already existed and is driven by
 * `EXPO_PUBLIC_WHATSAPP_NUMBER`, but only the contact screen read it — every
 * other "chat to us" button in the app carried the number as a literal. Pointing
 * the env var at a new number therefore moved one screen and left twelve others
 * dialling the old one, which is worse than having no knob at all.
 *
 * Everything that opens WhatsApp or the phone dialler goes through here.
 */
import { Linking } from 'react-native';
import { AUTH_CONFIG } from '../config/auth';
import { log } from './logger';

/** Digits only — wa.me rejects '+', spaces and dashes. */
export function supportWhatsAppNumber() {
  return String(AUTH_CONFIG.WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
}

/**
 * The same number formatted for display, so a screen that both shows and dials
 * it cannot drift into showing one number and calling another.
 * UAE numbers group as +971 58 548 76 65; anything else falls back to +digits.
 */
export function supportWhatsAppDisplay() {
  const n = supportWhatsAppNumber();
  const m = /^(971)(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(n);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}` : n ? `+${n}` : '';
}

/** wa.me link, with an optional prefilled message. */
export function whatsAppUrl(message) {
  const number = supportWhatsAppNumber();
  const text = String(message || '').trim();
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}

/**
 * Open WhatsApp. Never throws: a missing WhatsApp install rejects the promise,
 * and a support link failing is not worth interrupting whatever the user was
 * doing, so it is logged rather than surfaced.
 */
export function openWhatsApp(message) {
  const number = supportWhatsAppNumber();
  if (!number) {
    log.warn('No support WhatsApp number configured');
    return Promise.resolve(false);
  }
  return Linking.openURL(whatsAppUrl(message))
    .then(() => true)
    .catch((error) => {
      log.warn('Could not open WhatsApp', error?.message || error);
      return false;
    });
}

/** Voice call to the same support number. */
export function callSupport() {
  const number = supportWhatsAppNumber();
  if (!number) return Promise.resolve(false);
  return Linking.openURL(`tel:+${number}`)
    .then(() => true)
    .catch((error) => {
      log.warn('Could not open dialler', error?.message || error);
      return false;
    });
}

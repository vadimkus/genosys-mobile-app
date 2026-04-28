import { getAddressLine, parseGenosysAddress } from './addressUtils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isAppleRelayEmail = (email) => String(email || '').toLowerCase().includes('@privaterelay.appleid.com');

export const isValidEmailValue = (email) => EMAIL_RE.test(String(email || '').trim());

export const getUserDisplayNameParts = (user = {}) => {
  const rawName = String(user?.name || '').trim();
  const firstName = String(user?.firstName || user?.first_name || '').trim();
  const lastName = String(user?.lastName || user?.last_name || '').trim();

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const parts = rawName ? rawName.split(/\s+/) : [];
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

export const normalizeUserProfile = (user = {}) => {
  const authEmail = String(user?.email || '').trim();
  const contactEmail = String(user?.contactEmail || user?.contact_email || '').trim();
  const primaryEmail = contactEmail || authEmail;
  const parsedAddress = parseGenosysAddress(user?.address || '');
  const { firstName, lastName } = getUserDisplayNameParts(user);

  return {
    id: user?.id || user?.userId || '',
    token: user?.token || user?.accessToken || '',
    name: String(user?.name || `${firstName} ${lastName}`).trim(),
    firstName,
    lastName,
    email: authEmail,
    contactEmail,
    primaryEmail,
    hasAppleRelayEmail: isAppleRelayEmail(authEmail),
    phone: String(user?.phone || parsedAddress?.phone || '').trim(),
    birthday: user?.birthday || user?.dateOfBirth || '',
    gender: user?.gender || '',
    discountPercentage: Number(user?.discountPercentage ?? user?.discount_percentage ?? 0) || 0,
    addressRaw: user?.address || '',
    addressDetails: parsedAddress,
    addressLine: getAddressLine(parsedAddress || (user?.address || '')),
    emirate: String(user?.emirate || parsedAddress?.emirate || '').trim(),
    profilePicture: user?.profilePicture || user?.profile_picture || null,
  };
};

export const getOrderContactEmail = (order, user = {}) => {
  const profile = normalizeUserProfile(user);
  const orderEmail = String(order?.customerEmail || order?.customer_email || '').trim();
  if (isAppleRelayEmail(orderEmail) && profile.contactEmail) return profile.contactEmail;
  return orderEmail || profile.primaryEmail;
};

export default {
  isAppleRelayEmail,
  isValidEmailValue,
  getUserDisplayNameParts,
  normalizeUserProfile,
  getOrderContactEmail,
};

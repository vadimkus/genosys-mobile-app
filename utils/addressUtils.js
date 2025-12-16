const V1_PREFIX = 'GENOSYS_ADDR_V1:';

export function parseGenosysAddress(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const str = raw.trim();
  if (!str) return null;

  if (str.startsWith(V1_PREFIX)) {
    const jsonPart = str.slice(V1_PREFIX.length);
    try {
      const obj = JSON.parse(jsonPart);
      if (!obj || typeof obj !== 'object') return null;
      return obj;
    } catch {
      return null;
    }
  }

  // If backend ever returns pure JSON as a string, handle it.
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const obj = JSON.parse(str);
      if (obj && typeof obj === 'object' && ('address' in obj || 'emirate' in obj || 'city' in obj)) {
        return obj;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function getAddressLine(rawOrObj) {
  if (!rawOrObj) return '';
  if (typeof rawOrObj === 'string') {
    const parsed = parseGenosysAddress(rawOrObj);
    if (parsed?.address) return String(parsed.address);
    // Strip prefix if malformed but still starts with it
    if (rawOrObj.startsWith(V1_PREFIX)) return '';
    return rawOrObj;
  }
  if (typeof rawOrObj === 'object' && rawOrObj.address) return String(rawOrObj.address);
  return '';
}

export function formatAddressForDisplay(rawOrObj) {
  const obj = typeof rawOrObj === 'string' ? parseGenosysAddress(rawOrObj) : rawOrObj;
  if (!obj || typeof obj !== 'object') return typeof rawOrObj === 'string' ? rawOrObj : '';

  const parts = [];
  const line = obj.address ? String(obj.address).trim() : '';
  const city = obj.city ? String(obj.city).trim() : '';
  const emirate = obj.emirate ? String(obj.emirate).trim() : '';
  const country = obj.country ? String(obj.country).trim() : '';

  if (line) parts.push(line);
  if (city) parts.push(city);
  if (emirate && emirate !== city) parts.push(emirate);
  if (country) parts.push(country);

  return parts.filter(Boolean).join(', ');
}




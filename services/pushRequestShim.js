import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('PushApi');
const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

// Minimal request helper (mirrors databaseService apiRequest behavior for JSON endpoints)
export async function apiRequest(endpoint, options = {}) {
  try {
    const { headers: extraHeaders = {}, ...rest } = options || {};
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...extraHeaders,
      },
    });
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text().catch(() => '');
    const isJson = contentType.includes('application/json');
    const data = isJson && raw ? JSON.parse(raw) : (raw ? { error: raw } : {});
    if (!res.ok) {
      return { success: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { success: true, data };
  } catch (e) {
    log.error('Network error', e?.message || e);
    return { success: false, error: 'Network error' };
  }
}



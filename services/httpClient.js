import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';
import { authenticatedFetch } from './authFetch';

const log = createLogger('httpClient');

const DEFAULT_TIMEOUT_MS = 15000;
const JSON_CONTENT_TYPE = 'application/json';

export class HttpClientError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'HttpClientError';
    this.status = details.status || 0;
    this.url = details.url || '';
    this.body = details.body || '';
    this.isNetworkError = !!details.isNetworkError;
  }
}

export const getSafeHttpErrorMessage = (error, fallback = 'Request failed. Please try again.') => {
  if (!error) return fallback;
  if (error instanceof HttpClientError) return fallback;
  return fallback;
};

export const apiHeaders = ({
  token,
  locale,
  userId,
  acceptJson = true,
  json = true,
  apiKey = true,
  extra = {},
} = {}) => {
  const headers = {
    ...(json ? { 'Content-Type': JSON_CONTENT_TYPE } : {}),
    ...(acceptJson ? { Accept: JSON_CONTENT_TYPE } : {}),
    ...(apiKey ? { 'x-api-key': AUTH_CONFIG.API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(locale ? { 'x-locale': String(locale) } : {}),
    ...(userId ? { 'x-user-id': String(userId) } : {}),
    ...extra,
  };

  return Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined && value !== null));
};

const readResponseBody = async (response) => {
  const text = await response.text().catch(() => '');
  if (!text) return { text: '', data: null };

  try {
    return { text, data: JSON.parse(text) };
  } catch {
    return { text, data: null };
  }
};

export async function httpRequest(url, options = {}, config = {}) {
  const {
    authenticated = false,
    token = null,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    safeMessage = 'Request failed. Please try again.',
  } = config;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const requestOptions = {
      ...options,
      ...(controller ? { signal: controller.signal } : {}),
    };
    const response = authenticated
      ? await authenticatedFetch(url, requestOptions, token)
      : await fetch(url, requestOptions);

    const { text, data } = await readResponseBody(response);

    if (!response.ok) {
      log.warn('HTTP request failed', {
        status: response.status,
        url,
        body: String(text || '').slice(0, 200),
      });
      throw new HttpClientError(safeMessage, {
        status: response.status,
        url,
        body: text,
      });
    }

    return data ?? text;
  } catch (error) {
    if (error instanceof HttpClientError) throw error;

    const isAbort = error?.name === 'AbortError';
    log.warn(isAbort ? 'HTTP request timed out' : 'HTTP network request failed', {
      url,
      error: error?.message || error,
    });
    throw new HttpClientError(safeMessage, {
      url,
      isNetworkError: true,
      body: String(error?.message || error || ''),
    });
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function getJson(url, config = {}) {
  const headers = apiHeaders(config.headers || {});
  return httpRequest(url, { method: 'GET', headers }, config);
}

export async function sendJson(url, body, config = {}) {
  const headers = apiHeaders(config.headers || {});
  return httpRequest(
    url,
    {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
    },
    config
  );
}

export default {
  HttpClientError,
  apiHeaders,
  getSafeHttpErrorMessage,
  httpRequest,
  getJson,
  sendJson,
};

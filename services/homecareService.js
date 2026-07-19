import AUTH_CONFIG from '../config/auth';
import { getJson, sendJson } from './httpClient';

const endpoint = (suffix = '') =>
  `${AUTH_CONFIG.WEB_ORIGIN}/api/partner/homecare-scripts${suffix}`;

const requestConfig = (token, method) => ({
  ...(method ? { method } : {}),
  authenticated: true,
  token,
  headers: { token },
  safeMessage: 'Unable to update Homecare Scripts. Please try again.',
});

export async function fetchHomecareScripts(token) {
  return getJson(endpoint(), requestConfig(token));
}

export async function createHomecareScript(token, input) {
  return sendJson(endpoint(), input, requestConfig(token, 'POST'));
}

export async function updateHomecareScript(token, scriptId, input) {
  return sendJson(endpoint(`/${encodeURIComponent(scriptId)}`), input, requestConfig(token, 'PUT'));
}

export async function revokeHomecareScript(token, scriptId) {
  return sendJson(endpoint(`/${encodeURIComponent(scriptId)}`), {}, requestConfig(token, 'DELETE'));
}

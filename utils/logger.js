/* eslint-disable no-console */

/**
 * Lightweight logger with __DEV__ gating.
 * - debug/info are only printed in development
 * - warn/error are printed always (but still prefixed for easy filtering)
 */

function safeToString(value) {
  try {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return '[unserializable]';
    }
  }
}

// Simple top-level helpers used across services.
// Many call sites already include their own prefix (e.g. "[ApplePay]"), so we don't add one here.
export function debugLog(...args) {
  if (!__DEV__) return;
  console.log(...args);
}

export function infoLog(...args) {
  if (!__DEV__) return;
  console.log(...args);
}

export function warnLog(...args) {
  console.warn(...args);
}

export function errorLog(...args) {
  console.error(...args.map((a) => (typeof a === 'string' ? a : safeToString(a))));
}

export function createLogger(scope) {
  const prefix = scope ? `[${scope}]` : '[app]';

  const debug = (...args) => {
    if (!__DEV__) return;
    console.log(prefix, ...args);
  };

  const info = (...args) => {
    if (!__DEV__) return;
    console.log(prefix, ...args);
  };

  const warn = (...args) => {
    console.warn(prefix, ...args);
  };

  const error = (message, extra) => {
    if (extra === undefined) {
      console.error(prefix, message);
      return;
    }
    console.error(prefix, message, typeof extra === 'string' ? extra : safeToString(extra));
  };

  return { debug, info, warn, error };
}



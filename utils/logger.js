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
    if (!__DEV__) return;
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



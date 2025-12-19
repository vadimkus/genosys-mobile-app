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
  const rawLevel =
    (typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined) ||
    '';
  const defaultLevel = __DEV__ ? 'info' : 'warn';
  const level = String(rawLevel || defaultLevel).trim().toLowerCase();
  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  const threshold = LEVELS[level] ?? LEVELS[defaultLevel];
  if (threshold < LEVELS.debug) return;
  console.log(...args);
}

export function infoLog(...args) {
  const rawLevel =
    (typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined) ||
    '';
  const defaultLevel = __DEV__ ? 'info' : 'warn';
  const level = String(rawLevel || defaultLevel).trim().toLowerCase();
  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  const threshold = LEVELS[level] ?? LEVELS[defaultLevel];
  if (threshold < LEVELS.info) return;
  console.log(...args);
}

export function warnLog(...args) {
  const rawLevel =
    (typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined) ||
    '';
  const defaultLevel = __DEV__ ? 'info' : 'warn';
  const level = String(rawLevel || defaultLevel).trim().toLowerCase();
  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  const threshold = LEVELS[level] ?? LEVELS[defaultLevel];
  if (threshold < LEVELS.warn) return;
  console.warn(...args);
}

export function errorLog(...args) {
  const rawLevel =
    (typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined) ||
    '';
  const defaultLevel = __DEV__ ? 'info' : 'warn';
  const level = String(rawLevel || defaultLevel).trim().toLowerCase();
  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  const threshold = LEVELS[level] ?? LEVELS[defaultLevel];
  if (threshold < LEVELS.error) return;
  console.error(...args.map((a) => (typeof a === 'string' ? a : safeToString(a))));
}

export function createLogger(scope) {
  const prefix = scope ? `[${scope}]` : '[app]';

  const rawLevel =
    (typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined) ||
    '';

  // Default behavior:
  // - Dev (Expo): reduce noise by default (info+ only)
  // - Prod: warnings+ only
  const defaultLevel = __DEV__ ? 'info' : 'warn';
  const level = String(rawLevel || defaultLevel).trim().toLowerCase();

  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  const threshold = LEVELS[level] ?? LEVELS[defaultLevel];
  const canLog = (kind) => threshold >= (LEVELS[String(kind || '').toLowerCase()] ?? 0);

  const debug = (...args) => {
    if (!canLog('debug')) return;
    console.log(prefix, ...args);
  };

  const info = (...args) => {
    if (!canLog('info')) return;
    console.log(prefix, ...args);
  };

  const warn = (...args) => {
    if (!canLog('warn')) return;
    console.warn(prefix, ...args);
  };

  const error = (message, extra) => {
    if (!canLog('error')) return;
    if (extra === undefined) {
      console.error(prefix, message);
      return;
    }
    console.error(prefix, message, typeof extra === 'string' ? extra : safeToString(extra));
  };

  return { debug, info, warn, error };
}



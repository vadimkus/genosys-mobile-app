/**
 * Compare two dotted versions numerically. Returns -1, 0 or 1.
 * Missing segments count as 0, so 1.12 equals 1.12.0.
 */
export function compareVersions(a, b) {
  const x = String(a || '').split('.').map(Number);
  const y = String(b || '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((x[i] || 0) < (y[i] || 0)) return -1;
    if ((x[i] || 0) > (y[i] || 0)) return 1;
  }
  return 0;
}

/** True when the installed build is older than what the store has. */
export function isUpdateAvailable(installed, latest) {
  if (!latest || !/^\d+\.\d+/.test(String(latest))) return false;
  return compareVersions(installed, latest) < 0;
}

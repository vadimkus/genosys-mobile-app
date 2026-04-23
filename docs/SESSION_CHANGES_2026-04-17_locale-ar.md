# Mobile App — Arabic Language Switch Fix (2026-04-17)

## Problem

User reported: from the in-app language menu, switching to Arabic did
nothing — after the app restarted, it came back in the previous
language. Russian and English switching worked.

## Root Cause

`contexts/LocalizationContext.js` — `setLocale()` executed in this order:

1. `await applyRTLIfNeeded(safe)` → toggles `I18nManager.forceRTL` and
   calls `Updates.reloadAsync()` when the RTL flag must change.
   `Updates.reloadAsync()` tears down the JS runtime and restarts the
   app. Any code after it never executes.
2. `setLocaleState(safe)` — never reached.
3. `AsyncStorage.setItem(STORAGE_KEY, safe)` — never reached.

So switching to/from Arabic:

- forced RTL correctly,
- reloaded the app,
- but left `@language` in AsyncStorage unchanged.

On the next startup, `useEffect` rehydrated the old locale from
AsyncStorage, and the app came up in the previous language.

RU ↔ EN worked because neither triggers an RTL toggle, so no reload
happens and the `setItem` call executes.

## Fix

Persist to AsyncStorage **before** running the RTL toggle + reload:

```js
const setLocale = useCallback(async (nextLocale) => {
  const next = String(nextLocale || '').toLowerCase();
  const safe = SUPPORTED.includes(next) ? next : 'en';
  try {
    await AsyncStorage.setItem(STORAGE_KEY, safe);
  } catch {
    // ignore
  }
  setLocaleState(safe);
  await applyRTLIfNeeded(safe); // may reloadAsync() — OK, store is already written
}, [applyRTLIfNeeded]);
```

After the app restarts, the hydration `useEffect` reads the new locale
from AsyncStorage and renders Arabic (or whichever locale the user
chose).

## Files Changed

- `contexts/LocalizationContext.js` — reorder write/reload in `setLocale`.

## Verification

- EN → AR: app reloads, comes back in Arabic with RTL ✓
- AR → EN: app reloads, comes back in English with LTR ✓
- RU → AR: app reloads, comes back in Arabic with RTL ✓
- AR → RU: app reloads, comes back in Russian with LTR ✓
- EN → RU, RU → EN: unchanged (still work as before) ✓

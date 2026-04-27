# Session: iOS order history not showing (full chat documentation)

**Date:** 2026-04-26 → 2026-04-27 (UAE)  
**App:** `genosys-mobile-app` (Expo / React Native)  
**Platform:** Apple iPhone (App Store build)  
**Website (context only):** `cosmetics-website` — mobile orders API already supports login + contact email matching via `getCustomerEmailWhere` (see `__tests__/api/mobile-orders-history.test.ts`).

---

## 1. User-visible problem

- **Symptom:** Orders tab showed a **red badge with `3`**, but the Orders screen showed **“No orders yet”** (empty state with unicorn illustration).
- **User actions:** Force-closed and reopened the app multiple times; issue persisted until diagnostics and the final merge fix.

---

## 2. What we ruled out (and what stuck)

### 2.1 Apple / contact email mismatch (backend)

- The website route `GET /api/mobile/orders` uses `getCustomerEmailWhere(user)` so Apple relay + `contactEmail` are intended to match historical rows.
- This was **not** the final explanation once diagnostics showed the API returning **30 local rows** and **3 shared active** rows for the same account.

### 2.2 `paymentStatus: cancelled` hiding rows

- Early fix removed filtering that hid orders when `paymentStatus` was `cancelled` / `canceled`, because Stripe can leave a session cancelled while the order row is still active.
- **Committed:** `fb7559a` — `fix(orders): show active Apple orders` (file: `app/profile/orders.js`).
- User still saw empty history after OTA — so this alone was insufficient.

### 2.3 EAS Update runtime mismatch (critical discovery)

- First OTAs for the order-history fix were published with **runtime `1.9.0`** (from `app.json` at publish time).
- **`eas build:list` showed the current iOS store binary:** `appVersion` **1.9.0**, `appBuildVersion` **79**, but **`runtimeVersion` embedded in that build was `1.0.0`** — not `1.9.0`.
- **Implication:** iPhones on that build **do not receive** updates published only to runtime `1.9.0`.
- **Mitigation:** Republish the same JS fixes to **`production` branch, iOS-only, runtime `1.0.0`** by temporarily setting `expo.runtimeVersion` in `app.json` to `1.0.0` during `eas update`, then restoring to `1.9.0` for source consistency.

**Note:** Repo `ios/GenosysUAE/Supporting/Expo.plist` now shows `EXUpdatesRuntimeVersion` **1.9.0**; the next native iOS build should be checked in EAS so **`runtimeVersion` in the build metadata matches** `app.json` / plist (avoid another split).

### 2.4 Badge vs screen: two different data paths

- **Tab badge** (`contexts/OrdersContext.js`): fetches orders, filters out `DELETED` / `CANCELLED` **order status**, sets `ordersCount`.
- **Orders screen** (`app/profile/orders.js`): fetched `pending` + `recent` separately and maintained its own `orders` array.
- **Failure mode:** badge could be correct while the screen path returned data that **filtered to zero** after render-time rules.

**Change:** `OrdersContext` now also stores **`orders`** (active list after status filter) and exposes them on context.

### 2.5 Diagnostic empty-state block (temporary)

To stop guessing on-device, the Orders empty state rendered **selectable JSON** including:

- `build`: `orders-diag-2026-04-26-2358` (marker proving OTA applied)
- `runtime` from `expo-constants`
- `local` = length of screen’s merged fetch
- `shared` = length of context active orders
- `token`, masked `email` / `contactEmail`
- `last.pending`, `last.recent`, `last.statuses` (first few `status/paymentStatus` pairs)

### 2.6 Final root cause (from user’s diagnostic screenshot)

Example shape (abridged):

```json
{
  "local": 30,
  "shared": 3,
  "last": {
    "recent": 30,
    "statuses": ["DELETED/pending", "DELETED/pending", ...]
  }
}
```

**Interpretation:**

- The **recent orders page** (`limit: 30`) was dominated by **`DELETED`** orders (soft-deleted rows still returned by API ordering).
- The screen logic **preferred the non-empty `local` list** and applied “hide deleted” **before** considering the **shared active `3`** from context.
- Result: **all 30 filtered out** → empty list, while badge still showed **3** from context.

**Fix:** In `sortedOrders`, **merge** `[...localScreenOrders, ...contextActiveOrders]`, **de-dupe** by id/orderNumber, **then** apply deleted/cancelled filtering. This preserves the **3 active** records even when the first API page is all deleted.

---

## 3. Code changes (files)

| File | Role |
|------|------|
| `app/profile/orders.js` | Removed over-aggressive `paymentStatus` cancelled filter; added diagnostics; merged local+context orders before filtering deleted; tracks fetch diagnostics in state. |
| `contexts/OrdersContext.js` | Stores `orders` array (active after status filter) alongside `ordersCount`; clears on logout / errors. |
| `docs/SESSION_CHANGES_2026-04-26_android-google-auth-build.md` | Running log of OTAs and follow-ups (Android build context + order-history notes). |
| `app.json` | **Only temporarily** set `runtimeVersion` to `1.0.0` when publishing iOS OTAs for the legacy runtime; **restored to `1.9.0`** in source after each publish. |

---

## 4. EAS Update publications (chronological, high signal)

Branch: **`production`** unless noted.  
Messages are the `eas update -m` strings.

### 4.1 Order visibility (payment status)

- **Runtime `1.9.0`**, platforms android+ios — “Fix native order history visibility”  
  - Group: `9436e08c-9bc9-4f53-afb4-409dd4e550fe`  
  - iOS: `019dcac0-42bc-72e8-909f-ad4e686caa1d`  
  - Android: `019dcac0-42bc-7fb3-a7a3-12ef36596d08`

### 4.2 Same fix for **installed iOS runtime `1.0.0`**

- **Runtime `1.0.0`**, iOS only — “Fix native order history visibility for current iOS runtime”  
  - Group: `d12bb4ed-7a52-4a54-9813-8b09ba881dbe`  
  - iOS: `019dcb53-cb6f-78c1-8fb0-c59b282a63f2`

### 4.3 Shared orders source (context list exposed)

- **Runtime `1.0.0`**, iOS only — “Use shared active orders on iOS history”  
  - Group: `8ad38b91-8c8b-4d0e-abe6-b761ad10a67e`  
  - iOS: `019dcb5a-f4af-7f52-bdcb-5d4f976859f7`
- **Runtime `1.9.0`**, android+ios — “Use shared active orders for history”  
  - Group: `8a8662de-7601-4fe5-8368-20369cad1987`  
  - iOS: `019dcb5b-abbc-712d-bb76-984d01c684e1`  
  - Android: `019dcb5b-abbc-7b15-a0be-227ca24e36ee`

### 4.4 Empty-state diagnostics

- **Runtime `1.0.0`**, iOS only — “Add iOS orders empty-state diagnostics”  
  - Group: `99128a74-5e5c-4c63-902a-27bf167c921f`  
  - iOS: `019dcb61-2f71-7c2b-933e-7f9a550cf739`
- **Runtime `1.9.0`**, android+ios — “Add orders empty-state diagnostics”  
  - Group: `a1cc42c9-57fb-4848-99b3-e800dd7fa79b`  
  - iOS: `019dcb61-e674-76cf-bd56-a05c54340912`  
  - Android: `019dcb61-e674-7373-8264-884f90f22654`

### 4.5 Final merge fix (deleted page vs active context)

- **Runtime `1.0.0`**, iOS only — “Fix iOS order history deleted-page merge”  
  - Group: `79803a6b-05a1-4afb-9d48-d2d949659985`  
  - iOS: `019dcb64-5cf3-748b-9b7d-802df51a7bcc`
- **Runtime `1.9.0`**, android+ios — “Fix order history deleted-page merge”  
  - Group: `3d0373fa-6b3f-45f0-aa74-2872d09b8ff3`  
  - iOS: `019dcb65-2692-795d-98b9-1e27582b0579`  
  - Android: `019dcb65-2692-7e50-a53e-4ba805213a7b`

**Dashboard pattern:**  
`https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/<group-id>`

---

## 5. How to verify on device

1. Open app, stay ~10–15s (OTA download / `checkForUpdates` path in `app/_layout.js`).
2. Force-close.
3. Reopen, open **Orders**.
4. **Expected after final merge OTA:** list shows **3** active orders (matching badge).  
5. If empty state appears, the **diagnostic JSON** should show `build: orders-diag-2026-04-26-2358` and counts; use that to distinguish OTA-not-applied vs API/filter issues.

**If diagnostic JSON never appears:** OTA not applying — confirm `runtimeVersion` on the installed binary vs update target; may need a **new native iOS build** with correct embedded runtime.

---

## 6. Follow-ups (recommended)

1. **Remove or gate diagnostics** behind `__DEV__` or a hidden toggle before long-term release (currently always on empty state when this bundle is active).
2. **Next iOS EAS build:** confirm `eas build:list` reports **`runtimeVersion: 1.9.0`** (or align app policy explicitly) so OTAs do not need dual publishes.
3. **Backend (optional):** consider excluding `status: DELETED` from default `GET /api/mobile/orders` pagination, or add `includeDeleted` query param — reduces client complexity and payload noise.

---

## 7. Git / repo state at documentation time

- **Last pushed commit:** `fb7559a` — `fix(orders): show active Apple orders`
- **Working tree (uncommitted)** at time of writing:  
  - `app/profile/orders.js`  
  - `contexts/OrdersContext.js`  
  - `docs/SESSION_CHANGES_2026-04-26_android-google-auth-build.md`  
  - Plus this new file: `docs/SESSION_CHANGES_2026-04-27_ios-order-history-full-chat.md`

**Action:** Commit and push the above when ready so repo matches shipped OTAs after `fb7559a`.

---

## 8. Related docs

- `docs/SESSION_CHANGES_2026-04-26_android-google-auth-build.md` — incremental OTA log including order-history follow-ups.
- Website tests: `cosmetics-website/__tests__/api/mobile-orders-history.test.ts` — email matching for Apple relay + contact email.

---

*Generated to capture the full decision tree and shipments from the Cursor chat about native Apple order history.*

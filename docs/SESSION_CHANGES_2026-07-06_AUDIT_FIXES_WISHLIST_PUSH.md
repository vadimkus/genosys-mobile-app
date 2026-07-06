# Session Changes — Audit Fixes: Wishlist, Push, Addresses (2026-07-06)

Part of the five-element audit (full write-up:
`cosmetics-website/docs/SESSION_CHANGES_2026-07-06_FIVE_ELEMENT_AUDIT_FIXES.md`).
Commit `602dc38`, shipped OTA (runtime 1.10.5, iOS + Android).

## Fixes

1. **Wishlist removes finally work** — `removeFromWishlist` sent
   `DELETE /user/wishlist/<id>` (no such route → 404 on every remove, item
   restored on next sync). Now sends `?productId=` query param matching the
   server. Server side was also rewritten to real DB storage the same day.
2. **Guest favorites survive login** — sync used to overwrite local favorites
   with server data (which was always empty). Now local-only favorites are
   pushed to the server first, then the merged list is applied.
3. **Push token cleared on logout** — prevents the next user on a shared
   device from receiving the previous user's order notifications.
4. **Notification taps deep-link to the order** — `/profile/orders/[id]`
   instead of the orders list (`findOrder` accepts both id and order number).
5. **Android `orders` channel registered up-front** — server sends order
   pushes on `channelId: 'orders'`; the channel now exists (with HIGH
   importance) before the first push can arrive.
6. **Address delete** — deleting one address emptied the entire list in the
   UI (stale "single address" assumption); now removes only the deleted one.

## Deploy

JS-only — OTA via EAS Update, no native rebuild required.

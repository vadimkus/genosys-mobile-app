# Session Changes — 2026-07-08 — Full Bug Sweep: All 39 Findings Fixed

Follow-up to `SESSION_CHANGES_2026-07-08_full-app-sweep-analysis.md` (the audit
that produced the list: 4 critical, 13 high, 15 medium, 7 low). This session
fixed every item, one by one, in severity order. Shipped OTA on runtime 1.10.5.

## Critical (4)

| # | Fix | Files |
|---|---|---|
| C1 | Cart no longer cleared before payment confirmation succeeds | `app/payment/stripe.js` |
| C2 | Duplicate order number race on resubmit eliminated (single order number per checkout session) | `app/checkout.js` |
| C3 | Stale auth token after refresh — AuthContext now propagates the refreshed token everywhere | `contexts/AuthContext.js` |
| C4 | `shippingRates` dependency fixed so totals recompute when rates load | `contexts/CartContext.js` |

## High (13)

- **H1** Payment Sheet state fully reset between attempts (`stripe.js`)
- **H2** Plaintext password no longer persisted (`AuthContext.js`)
- **H3** VAT vs shipping order verified aligned with web — no change needed (`cartUtils`)
- **H4** Concurrent favorites syncs serialized (`FavoritesContext.js`)
- **H5** Stale `saveOrderToDatabase` closure fixed (`CartContext.js`)
- **H6** Refresh abort propagation in `services/authFetch.js`
- **H7** Camera permission: `canAskAgain=false` now routes to `Linking.openSettings()` (`skin-analysis-camera.js`)
- **H8** ErrorBoundary fallback localized via new `tStatic()` (`components/ErrorBoundary.js`, `contexts/LocalizationContext.js`)
- **H9** A11y: icon-only buttons app-wide got `accessibilityRole` + localized `accessibilityLabel` (see A11y pass below)
- **H10** Tap targets: bag steppers / remove / clear got `hitSlop` to reach ~44pt
- **H11** Apple Sign-In alerts localized (`auth/login.js` + 3 locales)
- **H12** RTL cold start: Arabic now applies RTL after AsyncStorage locale hydration (`LocalizationContext.js`)
- **H13** Card payments now call canonical `/api/mobile/payments/sheet/intent` (new backend alias; old applepay path kept for shipped builds) (`services/orderService.js` + website)

## Medium (15)

- **M1** Shared out-of-stock util `utils/stock.js` (new) — used by shop grid, `ProductGridItem`, PDP
- **M2** Stable FlatList keys (`item.id`, no index) in shop grid
- **M3** `ShopGridCard` memoized + virtualization tuning (`initialNumToRender/maxToRenderPerBatch/windowSize`)
- **M4** PDP refetches product on login/logout and locale change
- **M5** Cart line quantity capped at 99 (matches web)
- **M6** Shipping rates reload after re-auth (`bag.js` dep array)
- **M7** bundle-builder migrated from `l()` to `t()` (29 keys under `bundleBuilder.*`) + add-to-cart failures now alert instead of silently passing
- **M8** Skin-analysis add-to-bag failures now alert (`skin-analysis-camera.js`, `SkinAnalysisResults.js`)
- **M9** `UIManager.setLayoutAnimationEnabledExperimental` now skipped on Fabric/new-arch Android (deprecation warning) — `CollapsibleSection.js`, `profile/orders.js`, `faq.js`
- **M10** Zero-total checkout guard (`checkout.js`)
- **M11** Favorites login race fixed (`FavoritesContext.js`)
- **M12** `clientSecret` status validated before presenting sheet (`stripe.js`)
- **M13** Dead splash code removed: `BrandedLaunchScreen.js` deleted, Expo Go-only `showLaunch` branch removed from `app/_layout.js`
- **M14** Canonical skin-type keys (`utils/skinAnalysisMapping.js`)
- **M15** Checkout resubmit race guard (`checkout.js`)

## Low (7)

- **L1** `/chat` added to `CHAT_HIDDEN_ROUTES` — floating chat button no longer overlaps the full-screen chat route (`AuthWrapper.js`)
- **L2** Safe area verified: `ImageLightbox` + `PrivacyPolicyModal` both read `useSafeAreaInsets()` (no SafeAreaView-in-Modal first-open race left); `PrivacyPolicyModal` close button labeled
- **L3/L4** A11y long tail (see below)
- Plus review stars, review edit/delete, address options labels

## A11y pass (H9/H10/L3/L4) — every icon-only control labeled

- `CollapsibleHeader` (app-wide): back + refresh buttons labeled via `tStatic`, title gets `accessibilityRole="header"`
- `CollapsibleFooter` (bag + checkout): chevron labeled show/hide details + expanded state
- Bag: qty +/− steppers (labels + disabled state + hitSlop), per-item remove (with product name), header clear-bag
- PDP: back/share/wishlist header buttons (wishlist announces selected state), video play button
- Shop: favorites heart (with count), search clear
- FAQ: search clear; Chat + ChatButton: back, send (disabled state)
- Favorites: per-item heart remove; Login: show/hide password eye
- Profile: promo megaphone; edit gender-modal close; help return-modal close
- Addresses: header add (+), per-card ellipsis options
- Orders: hold-to-delete trash; ProductReviews: interactive stars, edit/delete
- CheckoutAddressForm: saved-address modal close
- Skin-analysis camera: back + capture buttons

New i18n keys (EN/AR/RU, parity verified): `common.refresh`, `common.showDetails`,
`common.hideDetails`, `bag.removeItem`, `authScreen.showPassword`,
`authScreen.hidePassword`.

## Website (cosmetics-website repo)

- `app/api/mobile/payments/sheet/intent/route.ts` (new): canonical alias re-exporting the applepay intent handler
- `app/api/mobile/payments/applepay/intent/route.ts`: 500 error `details` hidden in production

## Verification

- Babel parse-check passed on all ~45 modified JS files (`babel-preset-expo`)
- Locale JSON parity: EN/AR/RU key sets identical, all files valid JSON
- ProgressBar kept (used by ProgressCard ← bag.js); TrustStrip/ParallaxScrollView/HeroCard were already gone

## Next (agreed order)

1. Dependency planning (Expo SDK 57, Stripe RN 0.68, Sentry 8) — separate session
2. Feature discussion (replenishment reminders, loyalty, back-in-stock, referrals) — after deps

# Apple-Native UI Redesign (Whole App)

Date: 2026-06-20

## Context

Rolled a cohesive, first-party iOS ("Apple-native") visual language across the
entire GENOSYS UAE app, then reorganized navigation, cleaned up dead code,
polished assets/copy, and documented App Store metadata. Everything was shipped
incrementally to TestFlight via **EAS Update (OTA)** on branch `production`,
runtime `1.10.4`, then committed and pushed.

- Mobile commit: `59fbc47` (pushed to `origin/main`).
- Website commit: `55bcbd4f` (date bump + gray unicorn asset; pushed, deployed).
- All changes are **presentation-only** — business logic, payments, RTL, and
  accessibility were preserved throughout.

## Design system (source of truth)

- `utils/theme.js` — design tokens: `colors` (systemGroupedBackground `#F2F2F7`,
  card `#FFFFFF`, label, secondaryLabel, tertiary, separator, brand `#dc2626`,
  blue/green/greenDeep/orange/red/indigo/purple/teal/whatsapp), `tint()`,
  `shadow.card` / `shadow.cta()`, `surfaces.card`/`hairline`/`iconTile`, and
  `statusStyle()` for tinted status capsules.
- `components/CollapsibleHeader.js` — reusable **scroll-aware** nav header (+
  `useCollapsibleHeader()` hook). Transparent at top, fades a white fill +
  hairline in on scroll; owns the top safe-area inset; RTL-aware; optional
  `onBack` / `onRefresh` / `right` slots (text actions hug content via `sideAuto`).
- `docs/UI_APPLE_NATIVE_REDESIGN.md` — full pattern guide (cards, icon tiles,
  status capsules, button hierarchy, motion, the scroll-aware header pattern,
  shared-scroll-container pattern, and the per-screen rollout log).

Shared pattern: grouped-gray page background, white floating cards
(`surfaces.card` + `shadow.card`), Settings-style rows (28×28 icon tile + label +
chevron), tinted status capsules, one filled primary (brand) per screen, subtle
fade+lift mount motion.

## Screens redesigned

- **Tabs / core:** `app/(tabs)/shop.js` (kept brand/search header; product grid →
  soft cards, tinted chips/badges), `app/(tabs)/bag.js` (Animated.FlatList,
  CollapsibleFooter kept), `app/profile/orders.js` + `app/profile/orders/[id].js`
  (gold-standard list/detail), `app/favorites.js`.
- **Checkout / payments:** `app/checkout.js` + `components/checkout/*`
  (CheckoutAddressForm, CheckoutOrderHeaderCard, OrderSummaryCard,
  PaymentMethodSelector), `app/payment/stripe.js` (gray unicorn + warm copy, no
  spinner).
- **Profile + sub-pages:** `app/profile.js`, `app/profile/{edit,addresses,
  add-address,payment,billing,help,language,privacy,promo,terms}.js`.
- **Product:** `app/product/[id].js` + `components/product/{CollapsibleSection,
  TrustBadges,ProductReviews,PerfectCombinationCard,BeautyBoxDetails}.js` (kept
  image-overlay hero header).
- **Auth:** `app/auth/{login,forgot-password,reset-password}.js` (kept login's
  branded hero; grouped card forms, iOS social buttons).
- **Former hamburger pages:** `app/{about,brand,delivery,contact,faq,locations,
  partners,training}.js`, `app/blog/index.js`, `app/blog/[slug].js`.
- **Skin-Analysis flow:** `app/skin-concerns.js`, `app/skin-analysis.js`,
  `components/SkinAnalysisResults.js`, `app/skin-analysis-camera.js` (live camera
  viewport intentionally left dark).
- **Other:** `app/bundle-builder.js` (kept gesture layout, white control panel +
  soft product cards), `app/chat.js` (Genie — kept bubble UX, floating cards),
  `components/PrivacyPolicyContent.js` (optional external scroll props so privacy
  gets the live header fade), `components/SkeletonLoader.js` (orders skeleton).

Intentionally NOT converted to CollapsibleHeader (purpose-built / correct as-is):
tab navigator, Shop brand header, Product image-overlay header, Auth branded
hero, OrderSuccessScreen, ImageLightbox, PrivacyPolicyModal, UpdateBanner,
webview, and the live camera viewport + launch/force-update splash screens.

## Navigation IA change

- Removed the **hamburger menu** from the Shop header (button, `NavigationDrawer`
  render, import, and `drawerOpen` state). `headerHeight` kept (language dropdown
  uses it).
- Consolidated all former hamburger items into the **Profile** tab, logically
  grouped: *Explore* (Bundle Builder, AI Skin Analysis, Skin Concern, Blog) and
  *Information* (About, Brand, Partners, Training, Delivery, Locations, FAQ,
  Contact). Deduped the double "Contact"; company/info pages now point to the
  root content routes consistently.

## Deletions / cleanup

- `components/NavigationDrawer.js` (unused after hamburger removal).
- `app/profile/about.js` and `app/profile/contact.js` (orphaned duplicates;
  Profile now uses root `/about` and `/contact`).
- Removed their `<Stack.Screen>` registrations from `app/AuthWrapper.js`.

## Assets & copy

- `assets/genosys-logo-gray.png` — GENOSYS wordmark retinted to `#F2F2F7` (from a
  bluish-gray source) and auto-cropped; bundled asset used on About, Brand,
  Contact, Login (white box removed on gray screens). White logo retained only on
  Shop's white header + launch/force-update splash.
- Gray empty-state unicorn — website `public/images/avatar/gray_uni.jpeg`
  retinted to `#F2F2F7` (background flood-filled, illustration preserved); used in
  bag/favorites/orders empty states and the payment screen; white card frames
  removed so it blends.
- Empty-bag fix: the bottom tab bar is no longer force-hidden when the bag is
  empty (`app/(tabs)/_layout.js` shows it unless the cart has items).
- Shop "TrustStrip" converted from a clipped horizontal strip to a clean stacked
  card; later removed from Shop per request (`components/TrustStrip.js` no longer
  rendered on Shop).
- Payment screen copy: "🔒 Safe checkout." + warm two-line message (en/ar/ru).
- COD order success copy now states the confirmation email was **already sent**
  (`orderSubmittedMessageCOD`, en/ar/ru).
- Privacy/Terms "Last Updated" bumped to **June 20, 2026** (mobile Terms i18n +
  website privacy API + web `/privacy-policy` and `/terms`).

## Website (cosmetics-website, commit `55bcbd4f`, deployed)

- `public/images/avatar/gray_uni.jpeg` (new, retinted).
- `app/api/mobile/privacy-policy/route.ts`, `app/terms/TermsClient.tsx`,
  `app/privacy-policy/PrivacyPolicyClient.tsx` — last-updated → June 20, 2026.

## Localization

Full **en / ar / ru** parity maintained — **1444 keys** in each file, 0 missing.
New keys added this session: `ordersScreen.{support,viewSummary,hideSummary}` (an
earlier orders pass) and `payment.securePaymentTagline`; repurposed
`payment.securePaymentTitle/Subtitle`. All other new strings used existing keys or
inline `l(en,ar,ru)` translators.

## App Store documentation

- `docs/app-store/RELEASE_NOTES_1.10.4.md` — updated to **Build 93**; "What's New"
  and review notes now lead with the redesign; test matrix + version history
  updated.
- `docs/app-store/APP_STORE_COPY_1.10.4.md` — new; copy-paste set for App Store
  Connect: App Name, Subtitle, Keywords, Promotional Text, Description, and
  What's New — each in EN / AR / RU — plus URLs and the review demo account.

## Verification

- `babel-preset-expo` transform passes on every changed `.js` file.
- i18n JSON valid; en/ar/ru key parity = 1444/1444/1444.
- No leftover references to deleted files/routes (`NavigationDrawer`,
  `profile/about`, `profile/contact`).
- Each redesigned screen confirmed to preserve its data fetching, cart/checkout,
  payments, navigation, RTL, and accessibility logic.

## Build / distribution status

- `app.json`: version `1.10.4`, runtimeVersion `1.10.4`, iOS build `93`,
  Android versionCode `88`.
- The entire redesign reaches existing runtime-`1.10.4` installs via OTA. A native
  build is **not** required for those users. A fresh `1.10.4` binary (build 93) is
  only needed to put the redesign in front of **new** App Store/Play downloads if
  the currently-live store build is older than `1.10.4`.

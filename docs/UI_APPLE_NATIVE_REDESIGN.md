# Apple-Native UI Redesign — Investigation & Design System

**Started:** 2026-06-20
**Scope (this pass):** Orders list (`app/profile/orders.js`) + Order Details (`app/profile/orders/[id].js`)
**Goal:** Make screens feel like first-party iOS (Settings / Wallet / App Store), modern and cohesive, then roll the same language across the rest of the app.

This document is the **source of truth** for the mobile app's Apple-native visual language. When we redesign more screens later, reuse the tokens in `utils/theme.js` and the patterns below.

---

## 1. Why the old screens didn't feel native

### Orders list (before)
- White page background with **hard 1px bordered cards** → looks like a web layout, not iOS grouped lists.
- **Giant green "Support via WhatsApp" button on every card** dominated the screen and buried the actual order info.
- **Two competing affordances** for the same card: a "Details ›" pill *and* a chevron that expanded an inline summary. Confusing — iOS uses one tap → push detail.
- **No product imagery** in the list (details screen had thumbnails, list didn't) → low visual richness.
- Delete was a red trash pill, visually loud for a rare/destructive action.
- The card itself wasn't tappable; only the small pill navigated.

### Order details (before)
- **Rainbow of section icons** (blue, green, red, gray, indigo) with no system → busy.
- **Solid filled status badge** (`#007AFF`) — heavier than iOS tinted capsules.
- **Three stacked full-width solid buttons** (blue Reorder + red Pay + green Support) → "button soup", no primary/secondary hierarchy.
- Cards used hard borders instead of soft elevation.
- No entrance motion; content just popped in.

---

## 2. The Apple-native system (tokens live in `utils/theme.js`)

### Color
| Token | Hex | Use |
|---|---|---|
| `groupedBg` | `#F2F2F7` | Screen background (systemGroupedBackground) |
| `card` | `#FFFFFF` | Card surface (secondarySystemGroupedBackground) |
| `subtleBg` | `#F8F9FA` | Nested rows / inset blocks |
| `label` | `#1D1D1F` | Primary text |
| `secondaryLabel` | `#8E8E93` | Secondary text (systemGray) |
| `tertiary` | `#C7C7CC` | Disclosure chevrons, placeholders |
| `separator` | `#E5E5EA` | Hairlines / card edge |
| `brand` | `#dc2626` | GENOSYS red — price, primary CTA |
| `blue` | `#007AFF` | Info / shipped |
| `green` | `#34C759` | Success / paid / delivered |
| `orange` | `#FF9500` | Pending / awaiting action |
| `red` | `#FF3B30` | Cancelled / failed |
| `indigo` | `#5856D6` | Summary / totals |
| `teal` | `#30B0C7` | Location / shipping |
| `whatsapp` | `#25D366` | WhatsApp brand (used tinted, not full-bleed) |

### Surfaces
- **Card:** `borderRadius: 16`, white, **soft shadow** (`shadowOpacity 0.06, radius 10, offset {0,4}, elevation 2`), **no hard border**. A hairline separator is used *inside* cards between rows, not around them.
- Background is always `groupedBg` so white cards read as floating insets.

### Status → semantic color (single source: `theme.statusStyle(status)`)
- `pending` → orange · `processing`/`shipped` → blue · `confirmed`/`paid`/`completed`/`delivered` → green · `cancelled`/`failed`/`refunded` → red · fallback → gray.
- Rendered as a **tinted capsule**: `backgroundColor = color + '1A'` (10% alpha), `color` text, a **leading 6px dot** in the same color. This is the Wallet/App Store status look.

### Icon tiles (iOS Settings pattern)
- Section headers use a **filled rounded-square glyph tile**: `28×28`, `borderRadius 8`, solid semantic color, **white Ionicon (size 17)**, with the section title beside it (`T.label`, weight 700).
- This replaces the old loose multi-color icons and instantly reads as "Settings-grade".

### Buttons (hierarchy, not soup)
- **Primary:** filled brand red, radius 14, height ~52, white bold label, soft brand-tinted shadow.
- **Secondary:** tinted gray (`#F2F2F7` bg / `#E5E5EA` border, `#1D1D1F` label) — e.g. Reorder when Pay is primary.
- **Tertiary / Support:** **tinted** WhatsApp (green text on `#25D366` @ ~12% bg), not a full green slab.
- Only **one** filled primary per screen. Pay is primary when present; otherwise Reorder is primary.

### Motion
- Detail screen content does a subtle **fade + 12px lift** on mount (`Animated`, native driver) — matches `OrderSuccessScreen`.
- Inline expand/collapse uses `LayoutAnimation.easeInEaseOut` (Android opt-in via `UIManager`).
- All taps fire existing `utils/haptics` (light for navigation/toggles, medium for confirm, heavy for destructive).

### Typography
- Keep `utils/typography.js` (`T`). Apple-native tweaks: titles use negative letter-spacing (already in `T.pageTitle`/`sectionTitle`). Order numbers use `T.mono`.

---

## 3. Redesigned Orders list — interaction model

- **Whole card top is one tap target → pushes Order Details** (iOS list semantics) with a trailing `chevron-forward` in `tertiary`.
- Card shows a **product thumbnail** (first item image, with `+N` count when multiple), order number, date · emirate, and a **tinted status capsule**.
- A hairline splits the header from a **meta footer**: payment method (Apple logo when Apple Pay) · payment status on the left; **AED total** (brand red) + item count on the right.
- **Actions are demoted:** a compact row with a quiet **"Summary" disclosure toggle** (expands the existing pricing breakdown in place) and a subtle **trash** icon (long-press to delete, same guard alert). 
- **Pay now** appears as a full-width **primary** button only when the order is resumable.
- **Support** becomes a **tinted** WhatsApp button (compact), no longer a bright slab on every card.

## 4. Redesigned Order Details — structure

- Background `groupedBg`; each section is a **soft-shadow white card**.
- **Order-number hero**: red icon tile + label + `T.mono` number + date row (hairline divider).
- Every section header uses a **semantic icon tile** (status=blue, payment=green, notes=gray, items=brand, shipping=teal, summary=indigo).
- **Status** uses the same tinted capsule + dot as the list (cohesion).
- **Items, discounts, waterfall summary, beauty-box expander, promo items** — logic unchanged; only restyled to the card/hairline system.
- **Actions** follow the primary/secondary/tertiary hierarchy above.
- Content **fades/lifts in** on load.

---

## 5. Shipping / safety

- **100% JS + StyleSheet** changes (plus the additive `utils/theme.js`). **No native modules added** → **OTA-eligible** on channel `production`, runtime `1.10.4` (covers iOS build 92/93 + Android 88).
- No API/contract changes; all data accessors (`ordersRepository`, discount inference, Apple-Pay detection) are reused as-is.
- RTL preserved: every new row keeps `isRTL` row-reverse + text alignment handling.
- New i18n keys added to en/ar/ru: `ordersScreen.viewSummary`, `ordersScreen.hideSummary`, `ordersScreen.support`.

---

## 6. Rollout plan for remaining screens (next passes)

Apply the same tokens to, in priority order:
1. **Profile / Account** (`app/profile.js`) — grouped inset rows + Settings icon tiles.
2. **Bag / Cart** (`app/(tabs)/bag.js`) — card line items, primary checkout button.
3. **Checkout** (`app/checkout.js`) — section cards, summary waterfall already rich.
4. **Shop / Product** — card elevation + capsules for badges.
5. **Addresses / Edit profile** — grouped forms.

Each pass: import `theme`, swap hard borders → soft cards, multi-color icons → icon tiles, filled status → tinted capsules, button soup → primary/secondary/tertiary, add subtle mount motion. **Use the scroll-aware header (below) on every screen.** Keep all business logic intact.

---

## 7. Scroll-aware header (`components/CollapsibleHeader.js`) — use on EVERY screen

The single most "stock-iOS" detail. The nav bar is **transparent at the top** (blends into the grouped-gray background) and **fades a white fill + hairline in as you scroll**, with content scrolling *under* it. Reusable, OTA-safe (100% JS), RTL-aware, includes the safe-area top inset.

### Pattern (drop-in)

```jsx
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';

const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();

return (
  <View style={{ flex: 1, backgroundColor: colors.groupedBg }}>
    <CollapsibleHeader
      title={t('...')}
      scrollY={scrollY}        // omit / pass null to keep the bar permanently solid
      onBack={onBack}          // optional — renders the chevron (auto-flips for RTL)
      onRefresh={onRefresh}    // optional — renders a refresh glyph on the trailing side
      right={<CustomNode/>}    // optional — overrides onRefresh with any node
      isRTL={isRTL}
    />
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingTop: headerHeight }}   // start content below the bar
      refreshControl={<RefreshControl progressViewOffset={headerHeight} ... />}
    >
      {/* ...content... */}
    </Animated.ScrollView>
  </View>
);
```

### Rules
- Container is a plain `View` with `groupedBg` (the header owns the top safe-area inset — **do not** also wrap in `SafeAreaView`, that double-pads).
- `contentContainerStyle.paddingTop = headerHeight` so the first item starts below the bar; the fade reveals the white only once content slides under it.
- Loading / empty / logged-out states (non-scrolling) should add `paddingTop: headerHeight` so they clear the bar; pass `scrollY={null}` (or just don't pass it) so the bar stays subtly visible.
- Fade distance is `28px` of scroll (tuned to feel like the system bar). Animated via `opacity` only → native-driver friendly.

### Applied so far
- `app/profile/orders.js` (list) · `app/profile/orders/[id].js` (details)
- `app/profile.js` (account) · `app/profile/edit.js` (Save action via header `right` slot)
- `app/profile/addresses.js` · `add-address.js` · `payment.js` · `billing.js`
- `app/profile/help.js` · `promo.js` · `language.js` · `privacy.js` · `about.js` · `contact.js` · `terms.js`
- `app/(tabs)/bag.js` (Animated.FlatList; `CollapsibleFooter` kept as sticky checkout; empty-bag now shows tab bar + framed unicorn card)
- `app/checkout.js` + section components `components/checkout/{CheckoutOrderHeaderCard,CheckoutAddressForm,PaymentMethodSelector,OrderSummaryCard}.js`
- `app/(tabs)/shop.js` (home tab — kept brand/search/drawer header, product grid → soft cards, tinted badges/chips; header intentionally NOT scroll-aware to protect the FlatList/drawer)
- `app/product/[id].js` + `components/product/{CollapsibleSection,TrustBadges,ProductReviews,PerfectCombinationCard,BeautyBoxDetails}.js` (kept the image-overlay hero header; info → soft cards, icon-tile section headers, sticky brand CTA)
- `app/favorites.js` (CollapsibleHeader + Animated.ScrollView; soft cards; framed empty state)
- `app/auth/{login,forgot-password,reset-password}.js` (kept login's branded hero; grouped card forms, single brand CTA, iOS social buttons; forgot/reset use CollapsibleHeader)
- Former hamburger destination pages: `app/about.js` · `app/brand.js` · `app/delivery.js` · `app/contact.js` · `app/faq.js` · `app/locations.js` · `app/partners.js` · `app/training.js` · `app/blog/index.js` · `app/blog/[slug].js`

> **Navigation IA change (Jun 20):** the hamburger menu was **removed from the Shop header**. All its items now live in the **Profile** (`app/profile.js`): *Explore* (Bundle Builder, AI Skin Analysis, Skin Concern, Blog) and *Information* (About, Brand, Partners, Training, Delivery, Locations, FAQ, Contact). Company/info/support content rows point to the **root** pages (`/about`, `/contact`, `/brand`, …); account-function rows stay under `/profile/*`. `components/NavigationDrawer.js` is now unused (kept in repo, not imported).

> The header `right` slot hugs its content (`sideAuto`) so a **text** action like "Save" isn't clipped; icon actions still center in 44px.

#### Shared scroll containers (e.g. `PrivacyPolicyContent`)
When a screen renders a **shared component that owns its own ScrollView**, don't fall back to `scrollY={null}`. Instead give the shared component optional scroll props so the parent header can still fade:

```jsx
// shared component
export default function Foo({ onScroll = null, contentTopInset = 0 }) {
  const topInsetStyle = contentTopInset ? { paddingTop: contentTopInset } : null;
  return (
    <Animated.ScrollView onScroll={onScroll || undefined} scrollEventThrottle={16}
      contentContainerStyle={[styles.content, topInsetStyle]}>...</Animated.ScrollView>
  );
}
// parent screen
const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
<CollapsibleHeader title={...} scrollY={scrollY} onBack={onBack} />
<Foo onScroll={onScroll} contentTopInset={headerHeight} />
```
Props are optional → other callers (e.g. `PrivacyPolicyModal`) are unaffected. `privacy.js` uses exactly this; it now has the **live** fade.

### Still to do (future passes)
- Skin-analysis (`skin-analysis.js`, `skin-analysis-camera.js`, `concern-detail.js`, `skin-concerns.js`), `bundle-builder.js`, `chat.js`.
- Two known special cases: Shop home header is not scroll-aware (deliberate, to protect the FlatList/drawer); revisit only if we want the fade there. Product uses its own image-overlay hero header (correct for a PDP).

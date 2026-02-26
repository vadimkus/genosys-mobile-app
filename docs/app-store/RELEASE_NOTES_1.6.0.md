# Release Notes — Version 1.6.0 (Build 67)

## App Store "What's New" Text

> Copy the text below into App Store Connect → "What's New in This Version"

```
Ramadan Kareem! 🌙
A festive video splash greets you every time you open the app this Ramadan.

Smart Update Reminders
The app now checks for the latest version on launch and guides you to update when a new release is available.

Improved Cart Experience
- Remove individual items from the sticky cart bar with one tap
- "Clear all" option for quick bag reset
- Discount savings now highlighted in green

Pricing Accuracy
- Fixed an issue where some products could display incorrect original prices in the cart
- VIP pricing now applies correctly on all product pages including Skin Concerns

Simplified Checkout
- Only two payment methods: Card Payment (Visa, Mastercard, Apple Pay, Google Pay) and Cash on Delivery
- Clearer payment labels across all languages

Full English, Arabic (RTL), and Russian support for all new features.
```

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.6.0 |
| Build | 67 |
| Copyright | © 2026 Genosys Middle East FZ-LLC |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |

## Review Notes for Apple

```
This update adds a Ramadan video splash screen on app launch (5 seconds, tap to skip), a force-update version gating mechanism, and several cart/pricing fixes.

Key areas to review:
1. App launch → Ramadan video plays for 5 seconds (tap anywhere to skip)
2. Skin Concern pages → Add products to bag → Verify correct pricing in sticky bar and bag
3. Sticky cart bar → Per-item remove (x button) and "Clear all" link
4. Checkout → Only "Cash on Delivery" and "Card Payment" options available
5. Profile → Language → Switch to Arabic/Russian → Verify all new labels are translated

Test account credentials are unchanged from previous submissions.
```

## Promotional Text (optional)

```
Ramadan Kareem! Enjoy a festive launch experience, smarter updates, and an improved shopping flow.
```

## Technical Changes

### New Files
- `components/VideoLaunchScreen.js` — Full-screen video splash with caching and fade-out
- `components/ForceUpdateScreen.js` — Blocking update screen with App Store link
- `images/video/ramadan2.mp4` — Bundled Ramadan splash video (5.8MB)

### Server-Side Endpoints (cosmetics-website)
- `GET /api/mobile/app-version` — Returns minimum required version and force update config
- `GET /api/mobile/splash-config` — Returns splash screen video/image configuration

### Modified Files
- `app/_layout.js` — Version check, splash config fetch, video overlay integration
- `app/concern-detail.js` — User context for personalized pricing, sticky bar UX improvements
- `app/(tabs)/bag.js` — Fixed originalForDisplay price inference
- `contexts/CartContext.js` — Conditional originalPrice inference to prevent doubling
- `services/api.js` — Sends x-user-id header for concern detail API
- `utils/cartUtils.js` — Discount fallback for missing originalPrice

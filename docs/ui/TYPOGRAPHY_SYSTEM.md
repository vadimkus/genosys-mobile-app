# Typography System

> Centralized typography for consistent text styling across the entire app.

**Date:** February 26, 2026
**File:** `utils/typography.js`
**Applied to:** 54 files (all screens and components)

---

## Problem

Users reported inconsistent fonts across the app. An audit revealed:

- **No custom font loaded** — the app relies on system defaults (San Francisco on iOS, Roboto on Android), which is correct
- **No centralized typography** — every screen defined its own `fontSize`, `fontWeight`, and `letterSpacing` inline
- **Same semantic elements had different styling** on different screens:
  - Hero titles ranged from 20–28px with weights 600–800 and letterSpacing from -0.3 to -0.5
  - Section titles ranged from 17–22px
  - Body text ranged from 14–16px
  - Buttons ranged from 12–18px
- This created a noticeably inconsistent feel as users navigated between screens

---

## Solution

Created `utils/typography.js` with named text style constants (`T`), then replaced all hardcoded typography values across 54 files with spread references to these constants.

---

## Type Scale

### Headings

| Token | fontSize | fontWeight | letterSpacing | Use |
|-------|----------|------------|---------------|-----|
| `T.pageTitle` | 24 | 700 (bold) | -0.4 | Hero titles, page headings |
| `T.pageTitleLarge` | 28 | 700 (bold) | -0.5 | Product detail name |
| `T.sectionTitle` | 20 | 700 (bold) | -0.3 | Section headings |
| `T.sectionTitleSmall` | 18 | 700 (bold) | -0.3 | Smaller section headings |
| `T.navTitle` | 17 | 600 (semibold) | — | Navigation bar titles |

### Body & Subtitle

| Token | fontSize | fontWeight | lineHeight | Use |
|-------|----------|------------|------------|-----|
| `T.subtitle` | 15 | 400 (regular) | — | Supporting text under headings |
| `T.body` | 16 | 400 (regular) | 24 | Main body text, paragraphs |
| `T.bodySmall` | 15 | 400 (regular) | 22 | Secondary body text |

### Labels & Captions

| Token | fontSize | fontWeight | Use |
|-------|----------|------------|-----|
| `T.label` | 14 | 600 (semibold) | Form labels, row titles |
| `T.labelSmall` | 13 | 600 (semibold) | Smaller labels |
| `T.caption` | 13 | 400 (regular) | Secondary info (gray) |
| `T.captionSmall` | 12 | 400 (regular) | Smaller captions |
| `T.captionTiny` | 11 | 400 (regular) | Smallest captions |

### Prices

| Token | fontSize | fontWeight | Color | Use |
|-------|----------|------------|-------|-----|
| `T.priceLarge` | 24 | 700 (bold) | #1D1D1F | Product detail price |
| `T.price` | 16 | 700 (bold) | #1D1D1F | Standard price |
| `T.priceSmall` | 15 | 700 (bold) | #1D1D1F | Grid card price |
| `T.priceStrikethrough` | 14 | 400 | #86868B | Original price (crossed out) |
| `T.priceDiscount` | 16 | 700 (bold) | #dc2626 | Discounted price (red) |

### Buttons

| Token | fontSize | fontWeight | Use |
|-------|----------|------------|-----|
| `T.buttonLarge` | 18 | 600 (semibold) | Primary CTA buttons |
| `T.button` | 16 | 600 (semibold) | Standard buttons |
| `T.buttonSmall` | 14 | 600 (semibold) | Secondary buttons |
| `T.buttonTiny` | 12 | 700 (bold) | Compact buttons (add to cart on cards) |

### Badges

| Token | fontSize | fontWeight | Use |
|-------|----------|------------|-----|
| `T.badge` | 10 | 700 (bold) | Small badges (In Stock, New) |
| `T.badgeMedium` | 12 | 700 (bold) | Larger badges |

### Product Cards

| Token | fontSize | fontWeight | Use |
|-------|----------|------------|-----|
| `T.productName` | 14 | 600 (semibold) | Product card title |
| `T.productCategory` | 12 | 400 (regular) | Product category label |
| `T.productDescription` | 11 | 400 (regular) | 2-line product description |

### Specialized

| Token | fontSize | fontWeight | Use |
|-------|----------|------------|-----|
| `T.input` | 15 | 400 (regular) | Text input fields |
| `T.mono` | 18 | 700 (bold) | Order numbers, codes (monospace font) |
| `T.summaryLabel` | 14 | 500 (medium) | Cart/checkout summary labels |
| `T.summaryValue` | 14 | 600 (semibold) | Cart/checkout summary values |
| `T.totalLabel` | 18 | 600 (semibold) | Total row label |
| `T.totalValue` | 20 | 700 (bold) | Total row value |
| `T.faqQuestion` | 15 | 500 (medium) | FAQ question text |
| `T.faqAnswer` | 14 | 400 (regular) | FAQ answer text |
| `T.link` | 14 | 600 (semibold) | Link-styled text (blue) |

---

## Usage

### Basic

```javascript
import T from '../utils/typography';

<Text style={T.pageTitle}>Welcome</Text>
<Text style={T.body}>Description text here.</Text>
```

### With Overrides

When a screen needs a different color or additional properties, spread the token first, then override:

```javascript
<Text style={[T.body, { color: '#dc2626' }]}>Red body text</Text>
```

### In StyleSheet

```javascript
import T from '../utils/typography';

const styles = StyleSheet.create({
  title: {
    ...T.sectionTitle,
    marginBottom: 16,
    textAlign: 'center',
  },
  price: {
    ...T.priceDiscount,
    marginTop: 4,
  },
});
```

---

## Files Updated (54 total)

### Tab Screens
- `app/(tabs)/shop.js`
- `app/(tabs)/bag.js`

### Product Screens
- `app/product/[id].js`
- `app/concern-detail.js`
- `app/skin-concerns.js`
- `app/favorites.js`
- `app/bundle-builder.js`

### Profile Screens
- `app/profile.js`
- `app/profile/edit.js`
- `app/profile/addresses.js`
- `app/profile/add-address.js`
- `app/profile/billing.js`
- `app/profile/payment.js`
- `app/profile/orders.js`
- `app/profile/orders/[id].js`
- `app/profile/promo.js`
- `app/profile/privacy.js`
- `app/profile/terms.js`
- `app/profile/help.js`
- `app/profile/contact.js`
- `app/profile/about.js`
- `app/profile/language.js`

### Content Pages
- `app/about.js`
- `app/brand.js`
- `app/blog/index.js`
- `app/blog/[slug].js`
- `app/delivery.js`
- `app/faq.js`
- `app/contact.js`
- `app/locations.js`
- `app/partners.js`
- `app/training.js`

### Auth & Checkout
- `app/auth/login.js`
- `app/auth/forgot-password.js`
- `app/auth/reset-password.js`
- `app/checkout.js`
- `app/payment/stripe.js`

### Other Screens
- `app/chat.js`
- `app/webview.js`
- `app/skin-analysis.js`
- `app/skin-analysis-camera.js`

### Components
- `components/ProductGridItem.js`
- `components/NavigationDrawer.js`
- `components/ChatButton.js`
- `components/HeroCard.js`
- `components/ErrorBoundary.js`
- `components/SkinAnalysisResults.js`
- `components/BrandedLaunchScreen.js`
- `components/PrivacyPolicyContent.js`
- `components/PrivacyPolicyModal.js`
- `components/ProgressCard.js`
- `components/ProductVariantSelector.js`
- `components/product/ProductReviews.js`
- `components/product/TrustBadges.js`

---

## Font Weight Reference

| Name | Value | When to Use |
|------|-------|-------------|
| regular | 400 | Body text, captions, descriptions |
| medium | 500 | Summary labels, FAQ questions |
| semibold | 600 | Labels, buttons, nav titles |
| bold | 700 | Headings, prices, badges |
| heavy | 800 | Special emphasis (language selector) |

---

## Adding New Screens

When creating new screens, always import and use `T` instead of hardcoding font values:

1. Import: `import T from '../utils/typography';`
2. Use the appropriate token in your `StyleSheet.create`
3. If no token fits, consider adding one to `utils/typography.js` rather than hardcoding

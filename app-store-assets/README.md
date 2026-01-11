## App Store screenshots (iPhone + iPad)

This folder is a **ready-to-fill structure** for App Store Connect screenshots.

### Recommended screenshot sets

Apple accepts different device sets depending on your chosen coverage. A safe, commonly used set:

- **iPhone 6.7"** (e.g., iPhone 15 Pro Max): **1290 × 2796**
- **iPhone 6.5"** (e.g., iPhone 11 Pro Max): **1242 × 2688**
- **iPhone 5.5"** (e.g., iPhone 8 Plus): **1242 × 2208**
- **iPad 12.9"** (e.g., iPad Pro 12.9"): **2048 × 2732**
- **iPad 11"** (e.g., iPad Pro 11"): **1668 × 2388**

### Where to put files

Put PNGs into:

- `app-store-assets/screenshots/iphone-6.7/`
- `app-store-assets/screenshots/iphone-6.5/`
- `app-store-assets/screenshots/iphone-5.5/`
- `app-store-assets/screenshots/ipad-12.9/`
- `app-store-assets/screenshots/ipad-11/`

Use consistent names like:

- `01-home.png`
- `02-shop.png`
- `03-product.png`
- `04-bag.png`
- `05-checkout.png`
- `06-orders.png`
- `07-account.png`

### Capturing from iOS Simulator (recommended)

1. Run the app on the simulator (Expo dev / dev client / release build).
2. Navigate to the screen you want.
3. Run:

```bash
./scripts/appstore/capture-ios-screenshot.sh iphone-6.7 01-home
```

Repeat for each screen (change the output name).

Notes:
- The script captures **the currently booted** simulator.
- You can resize/trim later, but ideally capture at the target device resolution.







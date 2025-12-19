# Quick Screenshot Capture

## 🚀 Automated Screenshot Tool

I've created a helper script to make screenshot capture easier!

## Usage:

```bash
cd /Users/vadimkus/genosys-mobile-app
./scripts/capture-screenshots.sh
```

## What it does:

1. ✅ Finds and boots iPhone 15 Pro Max simulator
2. ✅ Opens Simulator app
3. ✅ Guides you through capturing all 10 required screenshots
4. ✅ Saves screenshots with correct naming to `app-store-screenshots/6.7-inch/`
5. ✅ Verifies dimensions automatically

## Steps:

### 1. Run the script:
```bash
./scripts/capture-screenshots.sh
```

### 2. In a separate terminal, start Expo:
```bash
cd /Users/vadimkus/genosys-mobile-app
npx expo start
```
Press `i` to open in iOS simulator

### 3. Follow the prompts:
- Script will prompt you for each screenshot
- Navigate to the specified screen in the app
- Press ENTER when ready to capture
- Script automatically saves with correct naming

## Screenshots to capture:

1. `01-splash-or-home.png` - Home page
2. `02-shop-products.png` - Product grid
3. `03-product-detail.png` - Product detail
4. `04-bag-cart.png` - Shopping bag
5. `05-checkout.png` - Checkout form
6. `06-payment-methods.png` - Payment methods ⭐
7. `07-orders-list.png` - Orders list
8. `08-order-detail.png` - Order details
9. `09-profile.png` - Profile page
10. `10-about-or-help.png` - About/Help page

## Manual Method (Alternative):

If you prefer manual capture:

1. Start app in simulator
2. Navigate to each screen
3. Press: **Command + S** in Simulator
4. Screenshots save to Desktop
5. Move to `app-store-screenshots/6.7-inch/`
6. Rename according to list above

## Verify Screenshots:

```bash
# Check dimensions (should be 1290x2796)
sips -g pixelWidth -g pixelHeight app-store-screenshots/6.7-inch/*.png

# View screenshots
open app-store-screenshots/6.7-inch/
```

## Required Dimensions:

- **iPhone 15 Pro Max:** 1290 × 2796 pixels
- **Format:** PNG or JPG
- **Max size:** 10 MB per file

## Tips:

- ✅ Use real product data
- ✅ Show Apple Pay feature
- ✅ Clean UI (9:41 AM, full battery)
- ✅ No personal/test data
- ✅ Professional appearance

---

**Ready? Run the script and follow the prompts!** 📸


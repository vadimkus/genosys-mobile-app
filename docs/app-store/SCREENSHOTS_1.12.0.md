# App Store screenshots, version 1.12.0

The listing still shows the old red and white design. Build 106 has the current
one: rose buttons, the cream palette, the floating chrome and the Lock Screen
order card.

## What to do

1. Install build 106 from TestFlight.
2. Take the ten screenshots below on your iPhone. Side button and volume up.
3. AirDrop them to this Mac and drop them into `raw/` **in the order below**,
   because the converter numbers them by filename order and that becomes the
   order they appear in the listing.
4. Run:

   ```
   bash ~/genosys-mobile-app/scripts/appstore-screenshots.sh
   ```

That fills `6.5-inch/` and `6.9-inch/` with correctly sized files. Upload the
folder matching the slot in App Store Connect.

## What to capture

Sign in as yourself, not the review account, so the rewards and order history
look real.

| # | Screen | Worth having in frame |
| --- | --- | --- |
| 1 | Home | The rose Add to Bag buttons, the search bar, category pills |
| 2 | Product page | Size or shade selector above the fold, the buy bar |
| 3 | Product detail, scrolled | Ingredients or the routine card |
| 4 | Bag | Two or three items, the total |
| 5 | Checkout | Delivery window and payment options |
| 6 | Order success or Orders | The three step tracker |
| 7 | **Lock Screen with the order card** | The cream card. This is new and no competitor has it |
| 8 | Account | Rewards, tier, points |
| 9 | Blog or a product guide | Depth of content |
| 10 | Partner Portal, optional | Only if the listing should speak to clinics |

Number 7 is the one to get right. Place a cash on delivery order, lock the
phone, screenshot the Lock Screen. It is the single thing in this release that
nothing else on the store does.

## Sizes

| Slot | Pixels | Device |
| --- | --- | --- |
| 6.9 inch | 1290 x 2796 | iPhone 16 Pro Max, 15 Pro Max |
| 6.5 inch | 1242 x 2688 | iPhone 11 Pro Max, XS Max |

Every accepted iPhone size is within 0.2% of the same aspect ratio, so the
resize is invisible. Screenshots from any modern iPhone convert cleanly.

If App Store Connect only asks for one iPhone size, give it 6.9 inch and it
covers the rest.

## Why these were not generated here

Capturing from the iOS Simulator needs three things this Mac does not currently
have: the Xcode licence agreed, an iOS runtime installed (several GB, none are
present - every simulator reports "runtime profile not found"), and a simulator
build of the app. Those need sudo and a long download.

Photographing the real device is also the better result. The simulator has no
real order history, no rewards balance, and cannot show a Lock Screen at all,
which is where the best screenshot in this release lives.

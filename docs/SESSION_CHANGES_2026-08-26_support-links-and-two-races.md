# Support links, a pricing race and a payment double-tap (2026-08-26)

A sweep for "what looks odd". Three real problems, one of which could show a
member the wrong price and one of which sat on the payment screen.

## The support number had a knob that did almost nothing

`config/auth.js` has carried `WHATSAPP_NUMBER`, fed by
`EXPO_PUBLIC_WHATSAPP_NUMBER`, with the comment *"Single source of truth so
contact/help screens don't hardcode it"*. Only `app/contact.js` ever read it.
Thirteen other call sites had the digits inline, including `help.js` — one of the
two screens the comment names.

So changing the env var moved the Contact screen and left the floating chat
button, the product page, favourites, shop, help, delivery, FAQ, skin analysis,
the combination card, checkout and both order screens dialling the old number.
A config knob that silently covers one of fourteen cases is worse than none,
because it reads as done.

New `utils/support.js` owns it: `openWhatsApp(message)`, `callSupport()`,
`whatsAppUrl()`, and `supportWhatsAppDisplay()` for screens that show the number
as well as dial it — `help.js` was printing `+971 58 548 76 65` as a literal
label next to a link, so those could have drifted apart too.

Encoding moved into the helper. Call sites were doing their own
`encodeURIComponent` before interpolating, which is the sort of thing that
double-encodes the first time someone forgets.

`scripts/smoke-support-links.js` covers the link building and then walks the tree
asserting that only `config/auth.js` contains the number, so this cannot quietly
regrow. Wired into `verify:release`.

While there: the two checkout support messages were hardcoded English strings
(`"Hi! I need help with placing order …"`) in an app that ships EN/RU/AR, so a
Russian or Arabic customer hitting a checkout failure got an English message to
send. Added `support.whatsappCheckoutHelpMessage` and
`support.whatsappCheckoutErrorMessage` in all three. The raw server error is
still appended untranslated on purpose — support needs it verbatim to match the
logs.

## A logged-in customer could be shown retail pricing

`app/product/[id].js` re-runs `loadProduct` when `user?.token` changes, and the
comment above it says so deliberately: logging in while the page is open must
replace guest pricing with the member's. But the effect had no cleanup and
`loadProduct` had no cancellation, so both requests stayed in flight and
whichever answered last won `setProduct`.

The server answers a guest request from cache and computes a member's price, so
the guest reply losing the race is not the unlikely ordering — it is the likely
one. The member then sees retail, on a screen with an Add to Bag button under it.

Fixed with a cancellation flag threaded through `loadProduct`, guarding both the
`setProduct` block and the `setLoading(false)` in `finally`.

Also optional-chained `colorVariants[0].value` in the same function. A variant
without a `value` key set the colour to `undefined`, and the stock check on Add
to Bag reads that colour.

## The payment sheet could be initialised twice

`app/payment/stripe.js` auto-starts the sheet on mount and also has a Pay button
guarded by `disabled={busy}`. `busy` is state, so it is still `false` for the
frame between the auto-start firing and the re-render committing — the button is
live in that window.

`sheetReadyRef` did not help: it is only set to `true` after `initPaymentSheet`
resolves, so two callers both find it `false` and both initialise the same
PaymentIntent, which Stripe can reject or present broken.

Added `busyRef`, a synchronous mirror of `busy`, checked at the top of both
`payWithSheet` and `openHosted` and cleared in both `finally` blocks. State
cannot gate a double-tap; a ref can.

## What was checked and found fine

An audit flagged three more as high severity. They do not hold, and are recorded
here so nobody re-opens them:

- **Loyalty balance silently zeroed.** `fetchMembership` has its own try/catch
  and returns `null`, so the caller cannot see a rejection. The `cancelled` flag
  the audit said was missing is also already there.
- **Shipping rates corrupted on API failure.** `fetchShippingRates` validates the
  shape and returns `FALLBACK_SHIPPING_RATES` on any failure. It cannot return
  `undefined`, so the VAT rate cannot go missing this way.
- **Promo items inflating the cart count.** `calculateCartTotals().itemCount`
  does include them, but `getCartSummary` overwrites it with `getTotalItems()`,
  which filters them, and nothing reads the raw value. No screen is affected.

## Verification

`verify:release` green, including the new support-links check. Ten files were
left importing `Linking` without using it after the refactor and were cleaned;
`app/about.js` was already in that state beforehand. Full iOS bundle exported
clean.

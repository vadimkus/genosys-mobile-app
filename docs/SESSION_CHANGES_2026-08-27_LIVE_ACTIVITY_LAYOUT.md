# Lock Screen card — layout, not decoration

Date: 27 Aug 2026

Two passes today. The first made the card legible; the second made it ours.

## Pass one: the giant sun

The white wordmark PNG is a black field with a red mark as the O.
`<Image uiImage>` ignores `frame` and paints the asset across the whole card,
which is where the sun and the stray "SY" behind the copy came from.

Images are out. The mark is text, and `scripts/smoke-widget-layout.js` now fails
the build if an `Image` comes back.

## Pass two: it read like any courier

Legible is not the same as designed. What was wrong:

| Problem | Fix |
| --- | --- |
| Status centred, everything else flush left | One left edge for the whole card |
| Three loose hollow pips, no connection | A real track: nodes joined by rails |
| No brand colour anywhere | Brand red on progress made |
| Two states — done or not | Three: done, in hand, not started |
| Rewards as loud as the steps | Demoted to a quiet last line |

### The track

`Circle` and `Capsule` from `@expo/ui/swift-ui`, not characters. Shapes are
flexible in SwiftUI, so the rails take whatever width the row has left — which
is what keeps the three labels under their own nodes at any text size. The
character bar it replaces could not do that, and the labels drifted right.

Reached nodes are `#dc2626` at 9pt; ahead are grey pips at 7pt, so position
reads from size as well as colour. Colour is never the only signal.

### On using a named colour at all

Everything else is `primary` / `secondary`, because the Lock Screen picks its
own material and named inks disappear on it. The track is the exception: it is
a graphic element, which needs 3:1 rather than 4.5:1, and brand red clears that
on the Lock Screen's material. No text is ever drawn in it.

## Pass three: the delivery promise

The card now carries the window the customer already read at checkout. It is
the only line on the card that is a commitment rather than a report, so it has
three rules, and each one exists to stop us saying something we have not agreed:

1. **Dubai only gets the hours.** One to two hours is the Careem service inside
   Dubai. Everywhere else is 24 to 36. `customerEmirate` decides, and without it
   nothing is printed. Printing the Dubai window nationwide would promise an
   Al Ain customer something no courier is going to do.
2. **Nothing before we accept.** While an order waits to be confirmed we have
   not taken it on and the courier clock has not started. A window there is a
   promise made by a form, not by us.
3. **Nothing once it is over.** Delivered or cancelled, an estimate is noise.

The wording restates checkout rather than inventing a second promise.

The destination is named in the sentence, for the same reason the window is
split at all: two customers get two different promises, and the one holding
the phone should be able to see which applies rather than wondering why theirs
says a day and a half.

Each language phrases it its own way rather than sharing one template. English
takes the place inside the sentence — "Arriving in Dubai within 1–2 hours" —
but Russian would need the accusative after "в", and three of the seven
emirates decline: Шарджа becomes Шарджу, Фуджейра becomes Фуджейру. Russian
and Arabic lead with the place and a colon, natural in both and needing no
grammar a format string cannot do.

An emirate we carry no translation for falls back to whatever was entered at
checkout. "Al Ain" is not one of the seven, but it is still the truth about
where the order is going, and it correctly gets the slower window.

## Pass four: the 160-point budget

Apple truncates a Lock Screen activity taller than **160 points**, and the
standard margin is **14**. That is a hard budget, and it decides the layout
more than taste does.

The proposed version stacked the company name and the order number on separate
rows, which came to roughly 174pt — truncated. Sharing one row brings it to
about 153pt, and it fits comfortably because both are quiet 10–11pt text.

Row order, top to bottom:

```
GENOSYS MIDDLE EAST                    Order #CODM2608270331
We are preparing your order
Arriving in Dubai within 1–2 hours
●━━━━━○━━━━━○
Confirmed          Shipped          Delivered
Your tier: SILVER                                    32 pts
```

The ETA row disappears entirely when there is no promise to make, which is
also what the guidelines ask for: shrink when there is less to say.

### Wording

- **"Order #..."** rather than a bare `#CODM2608270331`. The hash follows the
  same rule as the push notifications — English takes `#`, Russian `№`, Arabic
  neither, because a leading `#` in right-to-left text lands on the wrong end
  of the digits.
- **"Your tier: SILVER"** rather than "You are: SILVER", which is a sentence
  fragment in English and does not translate. The points unit now comes from
  `rewards.points`, so it is `балл.` in Russian and `نقطة` in Arabic instead of
  a hard-coded "pts".
- **"GENOSYS MIDDLE EAST"**, matching the website's desktop wordmark. The full
  `FZ-LLC` suffix was deliberately trimmed from customer-facing copy in the
  April SEO sweep; the Lock Screen is a customer surface, not a document.

The rule is written twice — `etaLine` in the app's `utils/orderActivity.js` and
`etaFor` in the website's `lib/liveActivityPayload.ts` — because the two live in
different repositories and either can be the last to touch a card. Both sides
pin the same cases, so a drift fails a build instead of reaching a customer.

Rendered under the status at 13pt in `primary`, not brand red: at that size it
is body text and owes 4.5:1, which `#dc2626` does not clear on the Lock Screen's
material. The red stays on the track, where 3:1 is the bar.

## Not done

- **No live countdown.** There is no `shippedAt` on the order, so there is no
  honest moment to count from. A window is the strongest claim the data supports.
- **Copy.** "Waiting to be confirmed" is passive for the first state. Changing
  it means moving the app catalogue and the server's in step, and the tests pin
  both — worth doing, but as its own change.

## Shipping

OTA. The layout is the serialised widget function, written into the App Group
when the app opens. Open the app once after updating, then lock the phone.

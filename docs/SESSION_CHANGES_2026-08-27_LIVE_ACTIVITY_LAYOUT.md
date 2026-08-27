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

## Pass six: red was the wrong colour for progress

Brand red painted the whole track — solid for a finished step, half strength
for the step in hand. It was wrong twice over, and Vadim caught it on a device:

1. **Red on a *finished* step reads as an error.** "Confirmed" in red says
   something went wrong with the confirmation.
2. **Red is already spoken for.** `statusStyle` in `utils/theme.js` maps green
   to confirmed, paid and delivered, blue to shipped, orange to pending, and
   **red only to cancelled, failed, refunded and deleted**. A colour cannot
   mean "going well" on the Lock Screen and "gone wrong" three screens away.

Now: **green** for a step that is done, **amber** for the step in hand, **grey**
for what has not started. The leg leading into a node takes that node's colour,
so travelled legs read green and the leg being travelled reads amber — the
track is a path rather than three unrelated pips.

Red is kept for the one case that needs it. A cancelled order stops the track
and puts its status line in red, which is legible as body text where the brand
red would not be: `#FF453A` clears 5.4:1 on this material, `#dc2626` only 3.8:1.

### The values are the dark-surface variants

`theme.js` tunes its green and amber for a cream page, where they clear 4.5:1.
On the Lock Screen's dark material the same values drop to about 4:1 and go
muddy. `#30D158` and `#FF9F0A` clear 10:1 there.

### Considered: the traffic light

The first proposal was green / amber / **red** — red for a step not yet
reached. Rejected for the `statusStyle` collision above, and because under
deuteranopia (about one man in twelve) green, amber and red collapse into three
shades of the same mustard, which is precisely when a colour code matters most.
Grey stays plainly absent, and size carries the signal independently: 7pt
against 10pt.

Both schemes were drawn, with computed contrast and a colour-blind rendering,
before the decision.

### Guarded

`scripts/smoke-widget-layout.js` now fails the build if `#dc2626` is painted on
the card, or if any of the three palette values disappears. It reads the
**string literals** from the AST rather than the serialised text, because Babel
keeps comments — a comment explaining why brand red is gone would otherwise
fail the check that brand red is gone. It did, on the first run.

## Pass seven: the card is cream, and it is ours

`activityBackgroundTint` paints the Lock Screen card cera cream, so it reads as
a piece of the brand rather than another dark slab in the stack. Everything on
it is the app's own cream-tuned palette, measured against `#faf7f5`:

| | | |
| --- | --- | --- |
| ink | 16.75:1 | headline |
| body | 10.97:1 | the delivery promise |
| muted | 5.95:1 | order number, rewards |
| roseInk | 5.21:1 | the wordmark |
| green `#2E7D4F` | 4.73:1 | a step behind us |
| amber `#9A5A00` | 5.13:1 | the step in hand |
| ahead `#968981` | 3.18:1 | a step not started |

The rail ahead is `line`, far below 3:1 on purpose: it is a connector, and the
node it leads to carries the state.

### The Dynamic Island keeps the dark palette

Apple is explicit that compact, minimal and expanded presentations use a black
opaque background and cannot be customised. So there are two palettes, and the
helpers take one as an argument. Painting the card cream and leaving the island
on the same values would have put ink text on black.

### Nothing may be a semantic colour any more

This is the part that would have shipped a blank card. `primary` and
`secondary` follow the **device** appearance, not the surface. On a cream
background, `primary` resolves to white in dark mode and the card goes empty.

Once the background is ours, every foreground has to be ours. The smoke test
now fails the build on any `foregroundStyle('primary')` or `('secondary')`, and
on the tint going missing.

### Two things Apple flags that are worth watching on a device

- **Always-On display.** The system reduces luminance; cream becomes grey and
  ink stays legible, but it is worth a look.
- **StandBy.** A custom background is extended to fill the screen, so this card
  becomes a full-screen cream panel at night. If that reads as too bright, the
  answer is a different tint for that presentation rather than dropping the
  tint everywhere.

## Pass five: the track had no frontier

On a device the track read as a faint hairline with three identical pips, and
at the first step there was no brand colour on the card at all — everything was
grey and white.

Two states were never enough. A solid brand dot on "Shipped" says it *has*
shipped, so the step in hand is now the same red at **half strength**:
unmistakably the frontier, unmistakably not finished. Reached nodes are solid
and 10pt, the step in hand is 10pt at 55%, and what has not started is a 7pt
grey pip — so position reads from size as well as colour, which matters for
anyone who cannot rely on the colour.

A cancelled order gets no frontier at all. `done` is zero whether an order is
new or cancelled, so without an explicit check a cancelled order would light
its first node and claim to be in progress.

### Why not a ring

`Circle().strokeBorder` is the textbook drawing for a step in progress, and
both `strokeBorder` and the `clear` colour exist in `@expo/ui`. It is not used:
nothing in this layout can be checked before it is on a customer's Lock Screen,
and a modifier that silently fails leaves a *hole* in the track exactly where
the current step should be. `opacity` and `frame` are already on screen and
known to render.

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

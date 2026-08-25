# Bringing the app onto the website's design language

Running plan for making the app look like genosys.ae. Every stage ships over
the air; see "What OTA cannot do" for the two things that will eventually need
a store build.

## Where the two stand today

The website speaks a language internally called **cera**, defined as CSS custom
properties in `cosmetics-website/components/product/cerabarrier/cerabarrier.css`
and used on product, brand and blog pages: a cream page, near-black ink for
headings, hairlines in a warm grey, Cormorant Garamond for display type, and
red reserved for small uppercase eyebrows.

The app speaks iOS system: `#F2F2F7` grouped grey, San Francisco throughout,
red fills on primary buttons.

These are two different languages rather than two shades of one, so the work is
a genuine retheme and not a palette tweak.

## Scope

48 screens under `app/`, 24 components under `components/`. Decided Aug 25,
2026: **full cera on every screen**, including checkout and profile, not just
the content surfaces.

## What OTA cannot do

Colours, type, layout, components, spacing, images and fonts all live in the JS
bundle and ship through `eas update`. Two things do not:

- the app icon
- the native splash screen (`app.json`)

Anything needing a **new native dependency** also breaks OTA, because it moves
`runtimeVersion` off `1.11.0`. Nothing in this plan needs one.

## Stages

Each stage is a separate OTA so a regression can be traced to one change.

| Stage | What | Visible? |
|---|---|---|
| **0** | cera tokens + Cormorant loaded | No |
| **1** | Replace hard-coded hex with tokens | Barely |
| 2 | Repoint tokens: cream page, ink headings | Yes, everywhere |
| 3 | Shared components: product card, buttons, headers, tab bar | Yes |
| 4 | Product screen and blog, where the site is most itself | Yes |

Stage 1 came before any repaint on purpose. There were **984 hard-coded hex
values across 65 files** — 220 of them `#ffffff`, 157 `#dc2626` — sitting
alongside the tokens in `utils/theme.js`. Repainting before that sweep would
have meant editing every screen by hand for every subsequent change.

## Stage 0 (done)

`utils/theme.js` gains a `cera` export mirroring the website's custom
properties. It sits **beside** the existing `colors` rather than replacing it,
so nothing changes on screen. When every screen has moved over, `colors` can be
repointed at these values and the duplication collapses.

`utils/typography.js` gains:

- `SERIF` — one family constant per weight
- `serifFamily(locale, weight)` — returns `undefined` for Arabic
- `T.serifDisplay` / `T.serifTitle` / `T.serifHeading`
- `T.eyebrow` — the small red uppercase label the site sets above headings

`app/_layout.js` registers the three faces through `useFonts`. Render is not
gated on the result: nothing sets the face yet, and local files resolve in
milliseconds behind the launch video.

### Two traps worth knowing before stage 2

**Do not set `fontWeight` alongside a Cormorant family.** iOS then synthesises
the weight instead of using the file we shipped, which reads as smeared strokes
at display sizes. Ship one family per weight; the `T.serif*` styles already
omit `fontWeight`.

**Arabic has no Cormorant.** The face carries Latin and Cyrillic (974 glyphs,
verified) but no Arabic block, exactly as on the website. Any screen that
renders all three languages must go through `serifFamily(locale)` rather than
naming a constant, or Android renders tofu where the heading should be.

### Weight and size

Three static TTFs, ~290 KB each, ~870 KB total in the update bundle. Static
per-weight files rather than the variable font, because React Native does not
select variable-font weights reliably.

## Stage 1 (done)

**867 literals replaced across 63 files**, by `scripts/codemod-color-tokens.js`.
Hard-coded hex in `app/` and `components/` went from 984 to 239; what remains
is deliberate.

### What was swept

Only structural neutrals and the brand red — the colours stage 2 repoints.
Status colours are left alone: greens, ambers, blues, WhatsApp, Google, the
emirate flags and the gold accents all carry meaning that survives a retheme
and would be wrong in cream.

`utils/theme.js` gained six roles the palette had been missing, so the sweep
had somewhere to land:

| Token | Value | Role |
|---|---|---|
| `bodyText` | `#374151` | running text |
| `mutedText` | `#6B7280` | supporting text |
| `placeholder` | `#9CA3AF` | placeholders, disabled |
| `fill` | `#F3F4F6` | chips, progress tracks |
| `separatorStrong` | `#D1D5DB` | input borders |
| `brandDark` / `brandLight` / `brandTint` | | pressed, accent, wash |

### The one honest caveat

700 of the replacements are exact. **170 are merges** onto a near neighbour,
because screens had accumulated five near-black heading colours and seven
mid-greys from mixing the iOS palette with the website's old Tailwind one.

Most merges are imperceptible (`#e5e7eb` → `#E5E5EA`, two levels on one
channel). The widest are `#555555` → `#6B7280` and `#333` → `#374151`, around
40 levels on a mid grey, affecting roughly a dozen places. Every one moves
toward the palette stage 2 installs anyway, so the drift is in the direction of
travel rather than away from it.

### Do not tokenise these

`components/VideoLaunchScreen.js` keeps two literal `#ffffff` values. They are
pinned to `ios/GenosysUAE/Images.xcassets/SplashScreenBackground.colorset`,
which is native and cannot ship over the air. A token repointed to cream in
stage 2 would put a coloured surface against a white native launch screen and
read as a flash on cold start. Same reasoning applies to the two
`backgroundColor` entries in `app.json`.

`shadowColor` was skipped throughout: it is black by design and has nothing to
do with the surface palette.

### Fixed along the way (stage 1)

`app/partner-portal.js` referenced `colors.groupedBackground`, which has never
existed — six style rules were silently falling through to a literal. Now
`colors.groupedBg`.

## Stage 2 — pilot on Profile

Rather than repaint everything at once, `app/profile.js` adopts the website
palette alone so the look can be judged on a real screen. Profile was chosen
because it exercises the whole system — page background, cards, hairlines, the
full six-step text scale — while carrying no commercial risk.

Because stage 1 left every style reading from tokens, adopting the palette is
one import:

```js
import { ceraColors as colors, cera, shadow, surfaces } from '../utils/theme';
```

`ceraColors` in `utils/theme.js` is the stage 2 target: the same token contract,
warm values. Ink, body and muted come straight from the site. Three greys are
interpolated along the same axis, because the site only needs three text
weights and the app needs six; collapsing them onto `muted` would flatten
metadata into body text.

| Token | Now | Pilot |
|---|---|---|
| `groupedBg` | `#F2F2F7` | `#faf7f5` cream |
| `subtleBg` / `fill` | `#F8F9FA` | `#f3ece8` |
| `label` | `#1D1D1F` | `#191716` ink |
| `bodyText` | `#374151` | `#3d3734` |
| `mutedText` | `#6B7280` | `#665e59` |
| `secondaryLabel` | `#8E8E93` | `#7a716b` *interpolated* |
| `placeholder` | `#9CA3AF` | `#9a908a` *interpolated* |
| `tertiary` | `#C7C7CC` | `#c2b7b0` *interpolated* |
| `separator` | `#E5E5EA` | `#e8e0db` line |

Beyond colour, three treatments come from the site: the user's name is set in
Cormorant, section headers become tracked uppercase eyebrows in `roseInk`, and
cards sit on a hairline instead of a drop shadow, which muddies on cream.

`CollapsibleHeader` is shared across screens and stays untouched — that belongs
to stage 3.

### The open question: red or ink

The website does not have one answer. Its bespoke product pages — the cera
pages — use **no `#dc2626` at all**; the primary action is
`bg-[var(--cera-ink)]` with white text, and rose carries the accents. Shop,
cart and checkout still lead with red, which appears across 69 web components
and is declared as `--brand-red: #dc2626`, "default solid CTA".

The app currently follows the second convention: red on buttons, prices and
badges, 157 occurrences before stage 1. Moving to ink CTAs is the single
largest visual change in this whole effort and is a brand decision. The pilot
keeps red so that the surfaces and type can be judged on their own.

## Stage 2 — rolled out

`colors` now holds the website palette, so every screen that reads tokens moved
at once. `ceraColors` remains as an alias and can go once nothing imports it.

### Red resolved: ink actions, rose accents

The decision was ink, following the bespoke product pages. `colors.brand` had
been doing four jobs at once, so it was split by what each use was actually
for rather than swapped wholesale:

| Was | Now | Where |
|---|---|---|
| `backgroundColor: brand` | `cta` `#191716` | primary buttons |
| `color` / `borderColor` / `tintColor: brand` | `accent` `#8f5a5a` | links, prices, active icons |
| `tint(brand)` | `accentBg` `#f7ecec` | tinted washes |
| `shadow.cta(brand)` | `cta` | the glow has to match the button |
| icon tiles | `accent` | white icon needs 3:1 against its tile |
| errors, delete, negative values | `red` | danger, never brand |

`brand` stays defined for the logo. `brandDark`, `brandLight` and `brandTint`
no longer have users.

### Two things that had been quietly wrong

The **emirate flags** were painting themselves with `colors.brand`. A rebrand
would have recoloured a national flag. They now use `flagRed` `#CE1126`, the
actual UAE red, which the national flag in the same file was already using.

**Destructive red** was iOS `#FF3B30`, which manages only 3.3:1 on cream and
fails AA as text. Deepened to `#D22B1E`: 4.8:1 on cream, and still takes white
at 5.1:1 for filled destructive buttons.

### Contrast improved rather than regressed

The warm palette reads better than the greys it replaced, measured against the
page background in each case:

| Token | Before | After |
|---|---|---|
| `bodyText` | 9.24 | **10.97** |
| `mutedText` | 4.33 *large only* | **5.95 AA** |
| `secondaryLabel` | 2.92 *fail* | **4.47** |
| `placeholder` | 2.28 *fail* | **2.93** |

White on the ink CTA is 17.9:1. `accent` on cream is 5.2:1.

`placeholder` still falls short, as it did before; it is placeholder text and
disabled state only, never content.

### Still to do (stage 3)

`CollapsibleHeader`, the tab bar, product cards and buttons are shared
components and were not touched beyond the palette they inherit. Several
screens use `colors.card` white as a page background and will read as islands
against cream until they are moved.

## Stage 3 — shared chrome and page surfaces

### Pages that were islands

Fourteen page surfaces were painting themselves white while everything around
them had gone cream, so they read as panels floating on the app rather than as
the page: shop, the product screen, the product guide, the webview backdrop,
the auth gate, the update and error screens, the privacy sheet, the skeleton
loader and the order success screen.

Two matches were left alone on purpose. `concern-detail`'s secondary button and
`homecare-scripts`' points card are a button and a card; white is correct for
both.

### Tab bar and header

Both were white with a black hairline and a drop shadow, which is the iOS
convention and reads as a panel laid over the page. The website separates with
a hairline and nothing else, so:

- the tab bar is cream at 94% opacity, on a warm hairline, with the shadow and
  Android elevation removed
- `CollapsibleHeader` fades in cream rather than white, so scrolling looks like
  the page continuing under its own header instead of a white bar sliding in

Nav titles stay sans. The website uses its serif for content headings, not for
chrome, and Cormorant at 17px is too fine to hold a bar.

### Shadows, warmed and quietened

A black shadow on cream greys the surface beneath it instead of suggesting
depth. Around a hundred styles still lean on `shadow.card` for definition, so
rather than removing it:

- `shadow.card` casts in `#3d3734` at 5% instead of black at 6%
- `surfaces.card` now carries the hairline that does the actual separating
- the twenty ad-hoc `shadowColor: '#000'` declarations became `colors.shadowCast`
- the product card dropped its shadow entirely and kept its border, at a
  slightly larger radius

`shadow.cta` became the website's ink button lift — low, wide, dark — rather
than a coloured glow.

### Brand red is now absent from the interface

Worth stating plainly: after stage 2 and this stage, `colors.brand` has **no
users**. Actions are ink, accents are rose, danger is its own token, and the
logos in use are the grey and white variants. The mark stays red where it is
actually the mark, starting with the app icon, which is native and unchanged.

`brandDark`, `brandLight` and `brandTint` were dropped once they had no users.

### Still to do (stage 4)

The product screen and blog, where the website is most itself: serif headings
in content, the eyebrow-and-rule section rhythm, and the generous spacing the
site uses between blocks.

## Stage 4 — the serif finally does something

Cormorant Garamond has been shipping in the bundle since stage 0 without a
single screen setting it. It now runs where the website runs it: in content,
never in chrome.

| Where | Was | Now |
|---|---|---|
| Product name | sans 24 | serif 28 |
| Product section headings | sans 700 | serif medium 21 |
| Blog page title | sans | serif 34 |
| Blog post card titles | sans | serif 19 |
| Article title | sans 800/24 | serif 30 |
| Comments heading | sans | serif 19 |
| Blog category label | small bold rose | the eyebrow style |

`T.eyebrow` was also still painting itself in brand red, left over from stage 0
when red was a working colour. It is rose now, and has its first user.

### Arabic

Cormorant carries Latin and Cyrillic but no Arabic, and naming a family with no
glyphs for the script leaves Android rendering tofu. Each of the three screens
already applied a `textRTL` style to every heading, so clearing `fontFamily`
there hands Arabic back to the system face in one place per screen. It is a
no-op for the sans text that shares the same style. Every serif call site was
checked for the guard rather than assumed: all five product section headings,
both blog titles, the article title and the comments heading.

Serif styles deliberately carry no `fontWeight`. Setting a custom family and a
weight together makes iOS synthesise the weight instead of using the file we
shipped, which shows as smeared strokes at display sizes. Verified that none of
the new call sites reintroduce one.

### Spacing

Product page sections went to 20pt padding and 18pt between, since the website
separates blocks with air where the app was separating them with borders.

## Stage 5 — corrections, then bands

### Status colours were failing contrast

The iOS status palette is tuned for white and was never rechecked against
cream. Measured on the new background:

| Token | Was | Contrast | Now | Contrast |
|---|---|---|---|---|
| blue | `#007AFF` | 3.77 | `#2A5DA8` | 6.10 |
| green | `#34C759` | 2.08 | `#2E7D4F` | 4.73 |
| greenDeep | `#16A34A` | 3.09 | `#256A42` | 6.12 |
| orange | `#FF9500` | 2.06 | `#9A5A00` | 5.13 |

AA wants 4.5 for text. Green at 2.08 was effectively decorative. All four still
take white at 5:1 or better where they back an icon tile.

### Cool pinks

Fifteen washed pink fills (`#FFF5F5`, `#FEE2E2`, `#FCE8E8`) sat behind
destructive content and read cold against cream. They became `colors.redBg`.
Three of the matches turned out to be borders rather than fills, and a whisper
tint used as a line is invisible, so those got `colors.redLine` instead.

### Dead tokens

`ceraColors`, `ctaText` and `accentSoft` all had zero users. Button labels get
their white from the `T.button*` styles, so `ctaText` was never needed. Removed.

A false alarm worth recording: an audit of the fifteen primary buttons reported
their labels had no colour, which on an ink background would have meant
invisible text on checkout and add-to-bag. They inherit white through
`...T.button`; the audit could not see through the spread.

### Product sections are bands now

The biggest visible change so far. The website runs product copy as full-width
blocks divided by a rule, where the app boxed each one, so the page read as a
stack of widgets rather than as a document. Sections lost their panel and
border and gained 24pt of vertical breathing room with a hairline under each.

Three call sites were adding `shadow.card` on top of the section style. With no
panel underneath, that shadow is just a smudge, so they were stripped.

This is a layout change rather than a colour change, and it is the one most
worth a look before it settles.

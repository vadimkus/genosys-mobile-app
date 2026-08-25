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

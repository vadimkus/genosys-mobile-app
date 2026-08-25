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
| 1 | Replace hard-coded hex with tokens | No |
| 2 | Repoint tokens: cream page, ink headings | Yes, everywhere |
| 3 | Shared components: product card, buttons, headers, tab bar | Yes |
| 4 | Product screen and blog, where the site is most itself | Yes |

Stage 1 comes before any repaint on purpose. There are **984 hard-coded hex
values across 65 files** — 212 of them `#ffffff`, 153 `#dc2626` — sitting
alongside the tokens in `utils/theme.js`. Repainting before that sweep would
mean editing every screen by hand for every subsequent change.

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

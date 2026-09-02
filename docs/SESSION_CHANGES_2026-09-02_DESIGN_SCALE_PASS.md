# Design scale pass: radii and spacing

**Date:** 2 September 2026 (late afternoon)

Follow-up to the text and design sweep, which found the theme had no radius or
spacing scale and the screens showed it.

## What changed

`utils/theme.js` gains two scales: `radius` (2, 4, 8, 12, 14, 16, 20, 24, 28,
pill) and `space` (a 4pt grid with 2 and 6 for tight cases). Existing screens
were then snapped onto them by `scripts/snap-design-scale.py`, under one
rule: a value moves only when the nearest step is at most 2px away, ties round
up. 249 values across 56 files moved. The largest groups: 42 paddings of 5
became 6, 36 of 18 became 20, 31 of 3 became 4, 17 radii of 3 became 4.

Left as they are, by rule: `borderRadius: 0` (square is a choice), 1px
spacing (a hairline), radii of 32 and above (the curve is the element's own
size: avatars, the camera shutter), and any spacing of 32 or more that sits on
the 4pt grid (page and hero insets of 36, 44, 56, 60, 64, 80, 200).

## Why no screenshots

The earlier note said this pass wanted screenshots. There is no Xcode on this
machine, only the command-line tools, so the simulator is unavailable, and
`web` is switched off in `app.json` (turning it on would fight Stripe, widgets
and Live Activity). Rather than skip, the pass was cut down to what is safe
without eyes on it: nothing moved more than 2px, so no element changed shape in
a way that registers as a redesign; it stopped disagreeing with its neighbours.

**Typography was deliberately not touched.** 25 distinct font sizes, with 9,
11, 13 and 15 in heavy use against the ramp in `utils/typography.js`, and 102
uses of weight 800/900. A 1px size change re-wraps text and needs to be seen.
Once a simulator or web preview exists, that is the next pass.

## The guard

`npm run verify:design-scale` (the same script with `--check`) fails on any
radius or spacing off the scale, and prints the fix. Wired into
`verify:release` after `verify:lint`. Verified it reports a planted
`borderRadius: 11` in `app/checkout.js`.

## Verification

Lint clean; tokens, page-shell, header clearance, header hide, widget layout
and label-case guards all pass after the snap. OTA published.

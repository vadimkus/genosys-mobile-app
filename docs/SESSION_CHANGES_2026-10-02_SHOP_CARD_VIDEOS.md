# 2026-10-02 — Shop grid card videos (light sweep)

The website's product-card clips (products 53, 36, 37: a soft light sweep over the real packshot) now
play in the app's Shop grid.

## Behaviour

- The mobile API sends `cardVideo` (e.g. `/videos/cards/36-v1.mp4`) on `/api/mobile/products` and
  `/api/mobile/products/[id]`; `null` for every other product. Added on the website side, commit
  `518dac93e` in cosmetics-website.
- `app/(tabs)/shop.js`: the FlatList's viewability (`itemVisiblePercentThreshold: 70`,
  `minimumViewTime: 300`) decides the turn. Among viewable cards with an unplayed `cardVideo` (and in
  stock), the one nearest the middle index plays. One card at a time; a card that leaves the screen
  stops; when a clip ends the next viewable card can take the turn. Each clip plays once per app
  session (`playedCardVideos`). Off under Reduce Motion.
- `components/CardVideo.js`: mounted only for the active card. `expo-video` player, muted, no loop,
  `audioMixingMode: 'mixWithOthers'` (never interrupts the shopper's music), `surfaceType="textureView"`
  (SurfaceView ignores parent opacity on Android). Fades in on `playingChange`, fades out on
  `playToEnd`, gives up after 4 s if it never starts, and sits in its own error boundary so a failing
  clip only drops the clip, never the grid.

## Delivery

- `expo-video` is already in the 1.13.0 native build (product page videos, `app.json` plugin), so this
  is JavaScript-only: OTA to runtime 1.13.0.
- Checked: ESLint clean; `expo export` bundles for iOS and Android. No simulator on this machine, so
  first on-device look is after the OTA.
- OTA: `npx eas-cli@latest update --branch production --environment production --platform all`,
  runtime `1.13.0`, update group `ae27c467-021d-4a0a-bd31-7179c26f0a98` (commit `f1e39df`).
  Production API confirmed serving `cardVideo` for the three masks before publishing.
- Rollback if needed: republish the previous group on `production`
  (`npx eas-cli@latest update:republish --group 7b3d4df9-b684-4b1f-a07b-fc4839c347c0`, "Mesopecia kit shows as in stock").

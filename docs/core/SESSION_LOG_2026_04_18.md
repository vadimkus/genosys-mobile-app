# Session Log — April 18, 2026

## Summary

Migrated all video and audio playback from deprecated `expo-av` to
`expo-video` + `expo-audio`. `expo-av` is deprecated in Expo SDK 54
and will be **removed in SDK 55** (summer 2026). This migration
unblocks the upcoming SDK upgrade; no user-visible behaviour should
change.

---

## What changed

### Dependencies

| Package | Before | After |
|---|---|---|
| `expo-av` | `~16.0.8` | **Removed** |
| `expo-video` | — | `~3.0.16` (new) |
| `expo-audio` | — | `~1.1.1` (new) |
| `expo-asset` | — | peer of `expo-audio`, installed |

Installed with `npx expo install` so versions stay aligned with SDK 54.
`app.json.plugins` now lists `expo-video`, `expo-audio`, `expo-asset`
(added automatically by the Expo CLI).

### Source files

| File | What changed |
|---|---|
| `components/VideoLaunchScreen.js` | `<Video ref shouldPlay isMuted onPlaybackStatusUpdate onError>` → `VideoView` + `useVideoPlayer`. Event model: `playToEnd` replaces `didJustFinish`; `statusChange` replaces `onError`. Source hot-swap goes through `player.replace(videoSource)` when the remote URL resolves. |
| `app/product/[id].js` | Same API swap for `ProductVideo`. Also replaced `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` with `setAudioModeAsync({ playsInSilentMode: true })` from `expo-audio` — key renamed in the new module. Removed the `setTimeout(300ms)` hack that was previously needed because `<Video>` had to mount before `.playAsync()` would work; `useVideoPlayer` is created upfront so `player.play()` fires synchronously. |

### Docs updated

- `docs/README.md` — tech stack line now says `expo-video, expo-audio`
- `docs/build/ANDROID_BUILD_GUIDE.md` — feature table entry
- `docs/core/PRODUCT_DETAIL_UPDATES.md` — rewrote sections 3 & 5 to
  describe the current expo-video/expo-audio implementation and
  kept a pointer to the old expo-av behaviour for context.

---

## API mapping (expo-av → expo-video / expo-audio)

| expo-av | expo-video / expo-audio |
|---|---|
| `import { Video, ResizeMode } from 'expo-av'` | `import { VideoView, useVideoPlayer } from 'expo-video'` |
| `import { Audio } from 'expo-av'` | `import { setAudioModeAsync } from 'expo-audio'` |
| `<Video source={{uri}} ref={...} shouldPlay isMuted isLooping={false} resizeMode={ResizeMode.CONTAIN} useNativeControls onPlaybackStatusUpdate={({didJustFinish})=>...} onError={(e)=>...} />` | `const player = useVideoPlayer({uri}, p => { p.loop=false; p.muted=true; p.play() })` + `<VideoView player={player} contentFit="contain" nativeControls />` + event listeners on `player.addListener('playToEnd', …)` and `player.addListener('statusChange', ({status,error}) => ...)` |
| `videoRef.current.playAsync()` | `player.play()` |
| `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` | `setAudioModeAsync({ playsInSilentMode: true })` (key renamed) |

Notes on the event model:
- `statusChange` payload shape is `{ status: 'idle' \| 'loading' \| 'readyToPlay' \| 'error', error?: Error }`. We hide the video section on `status === 'error'`.
- `playToEnd` is a single-shot event that replaces reading `.didJustFinish` off the old polling-based `onPlaybackStatusUpdate` status object.
- `useVideoPlayer` hook must be called unconditionally (Rules of Hooks). If the source isn't known yet, pass `null` and call `player.replace(source)` later.

---

## Testing

- `npx tsc --noEmit` → **passed, 0 errors**
- `npx expo-doctor` → 16/17 checks pass (the one remaining warning is a
  pre-existing "CNG + app.json plugins" notice, unrelated to this work).
- `npx expo export --platform ios --output-dir /tmp/…` → **succeeds**,
  bundle size 4.44 MB.
- Static grep on the exported bundle:
  - `VideoView`: 5 matches present ✓
  - `useVideoPlayer`: 4 matches present ✓
  - `setAudioModeAsync`: 2 matches present ✓
  - `expo-av`: **0 matches** — fully removed from the bundle ✓

---

## Rebuild required

This is a **native dependency change**, so a JavaScript-only OTA will
**not** pick it up. The next EAS Build will:

1. Re-resolve Podfile.lock (iOS) / gradle deps (Android) through the
   expo-modules-autolinking scanner, which now finds `expo-video` and
   `expo-audio` in `node_modules`.
2. Compile and link the new native modules.
3. Ship as a new binary version.

No manual Podfile or gradle edits required — autolinking handles it.

### Suggested build commands

```bash
# Android (currently in internal testing)
npm run build:android:production

# iOS (currently live on App Store)
npm run build:ios:production
```

After TestFlight / Play Store approval, bump versionCode/build number
in `app.json` and submit.

---

## Why we did this now

1. `expo-av` was marked deprecated in SDK 54 release notes.
2. `expo-av` **will be removed** in SDK 55 (~summer 2026). Migrating
   now means a clean SDK 55 upgrade later, instead of a breaking one.
3. `expo-video` is a better API:
   - Imperative player instance → no flaky `setTimeout` dance.
   - First-class PiP, Picture-in-Picture, background audio (if ever
     needed — currently not configured, which is correct default).
   - Stronger TypeScript types.
4. `expo-audio` is SDK 52+ stable; it splits the `Audio.setAudioModeAsync`
   call cleanly away from the video module, so changes to one
   won't affect the other.

---

## Files touched

```
M  app.json
M  components/VideoLaunchScreen.js
M  app/product/[id].js
M  package.json
M  package-lock.json
M  docs/README.md
M  docs/build/ANDROID_BUILD_GUIDE.md
M  docs/core/PRODUCT_DETAIL_UPDATES.md
A  docs/core/SESSION_LOG_2026_04_18.md
```

# Session Log — March 19–20, 2026

## Summary

Migrated the splash screen from a bundled local video to a fully remote, API-driven system. Added a dismissible "update available" banner for gentle version notifications. Shipped as v1.7.0 (Build 71), now live on the App Store. On March 20, performed the first OTA splash swap — replaced the Ramadan video with a new branded splash, proving the system works end-to-end without any app rebuild.

---

## Changes Made

### 1. Remote Splash Screen (API-Driven Video)

**Problem:** The Ramadan splash video (`ramadan2.mp4`, 5.6MB) was bundled inside the app binary via `require()`. Changing the video required modifying code, rebuilding, and resubmitting to the App Store — a multi-day process.

**Solution:** Removed the bundled video entirely. The app now fetches splash configuration from `/api/mobile/splash-config` on every cold start and plays the video from a remote URL with local caching.

**Files Changed:**

| File | Change |
|------|--------|
| `app/_layout.js` | Removed `LOCAL_SPLASH_VIDEO = require(...)`. Added `AsyncStorage` caching of splash config. `checkSplash()` now always runs (was previously skipped). Two-phase loading: instant from cache, then background API refresh. |
| `images/video/ramadan2.mp4` | **Deleted** — saves 5.6MB per binary build |
| `app.json` | Version 1.6.0 → 1.7.0, build 68 → 69 (EAS auto-incremented to 70) |

**Files NOT changed (already worked correctly):**

| File | Why |
|------|-----|
| `components/VideoLaunchScreen.js` | Already supported `videoUrl` prop, remote streaming, `FileSystem` download/cache, cache TTL, poster fallback, and `onError` graceful dismiss |
| `cosmetics-website/app/api/mobile/splash-config/route.ts` | Already existed with correct response shape |

**How it works now:**

```
Cold Start
  │
  ├─ 1. Read cached splash config from AsyncStorage (~10ms)
  │     └─ If found → setSplashVideo(cachedConfig) immediately
  │
  ├─ 2. Fetch fresh config from GET /api/mobile/splash-config
  │     ├─ Save to AsyncStorage (for next cold start)
  │     └─ Apply to current session
  │
  └─ 3. VideoLaunchScreen renders
        ├─ Check FileSystem cache for video file
        ├─ If cached + fresh → play from local file (instant)
        └─ If not cached → stream from URL + download to cache in background
```

**Transition for existing users (v1.6.0 → v1.7.0):**

| Launch | Behavior |
|--------|----------|
| First after update | No AsyncStorage cache exists (old version never wrote it). API is called, video streams from remote URL. Config + video file cached for next time. |
| Second onwards | Cached config loads instantly. Video plays from local file cache. Zero delay. |
| If API down | Falls back to last cached config. If no cache at all, splash is skipped gracefully. |

**How to update the splash video (no app rebuild):**

1. Upload new video to `cosmetics-website/public/videos/` (e.g. `eid2026.mp4`)
2. Edit `videoUrl` in `cosmetics-website/app/api/mobile/splash-config/route.ts`
3. Deploy the website (Vercel auto-deploys)
4. All existing app installs pick up the new video on next launch

**How to disable splash entirely:**

1. Set `enabled: false` in the splash config endpoint
2. Deploy — all existing installs stop showing splash

---

### 2. Video Asset Migration

Moved `ramadan2.mp4` from the mobile app binary to the website's `public/videos/` directory.

| Before | After |
|--------|-------|
| `genosys-mobile-app/images/video/ramadan2.mp4` (bundled in IPA) | `cosmetics-website/public/videos/ramadan2.mp4` (served at `https://genosys.ae/videos/ramadan2.mp4`) |

Verified both the splash-config API and the video URL are live on production before submitting the build.

---

### 3. Soft Update Banner

**Problem:** The app only had a nuclear "force update" option (blocking screen) or nothing. No middle ground to gently notify users that a newer version exists.

**Solution:** Added a dismissible `UpdateBanner` component that slides in from the top when `currentVersion < latestVersion` (but still above `minimumVersion`).

**Files Changed:**

| File | Change |
|------|--------|
| `components/UpdateBanner.js` | **New** — Dark slide-in banner with "Update" button and close "X". Spring animation in, timing animation out. |
| `app/_layout.js` | Added `softUpdate` state. `checkVersion()` now checks `latestVersion` from API. Dismiss saves version to AsyncStorage so banner won't reappear for the same version. Banner waits for splash video to finish. |
| `cosmetics-website/app/api/mobile/app-version/route.ts` | `latestVersion` bumped to `1.7.0` |

**Three-tier update system:**

| Scenario | UX |
|----------|-----|
| `currentVersion < minimumVersion` | **Blocking** — ForceUpdateScreen, can't use app |
| `minimumVersion <= currentVersion < latestVersion` | **Dismissible** — UpdateBanner, app works normally |
| `currentVersion >= latestVersion` | Nothing shown |

**Dismiss behavior:** Per-version. If user dismisses banner for v1.7.0, it won't reappear until `latestVersion` is bumped to v1.8.0+ on the server.

---

### 4. First OTA Splash Swap (March 20, 2026)

Ramadan ended. Replaced the splash video over-the-air — zero code changes to the mobile app.

**What was done:**
1. New video `Splash.mp4` (4.4MB) placed in `cosmetics-website/public/videos/`
2. Updated `videoUrl` in `splash-config/route.ts` from `ramadan2.mp4` → `Splash.mp4`
3. Committed and pushed to `main` → Vercel auto-deployed
4. All existing app installs show the new video on next launch

**Commit:** `815b8c8` — "Replace Ramadan splash video with new branded splash"

This was the first real-world proof that the remote splash system works as designed: one config change, one push, new video everywhere. No app rebuild, no App Store submission, no review wait.

---

## Build & Submission

| Field | Value |
|-------|-------|
| Version | 1.7.0 |
| Build | 71 (EAS auto-incremented from 70) |
| Build ID | `8faaf570-32e3-4458-8f43-de01d6d81005` |
| Submission ID | `99ade01c-1142-4ddd-8bb1-38cf0d8bf0fd` |
| Platform | iOS (Store distribution) |
| Status | **Live on App Store** |
| Binary Size | Reduced by ~5.6MB (removed bundled video) |

---

## API Response Format

`GET /api/mobile/splash-config`

```json
{
  "enabled": true,
  "type": "video",
  "videoUrl": "https://genosys.ae/videos/Splash.mp4",
  "posterUrl": null,
  "duration": 5000,
  "cacheTTL": 86400
}
```

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Master kill-switch. `false` = no splash. |
| `type` | `"video"` \| `"image"` | Content type |
| `videoUrl` | string | Absolute URL to mp4 file |
| `posterUrl` | string \| null | Still image shown while video buffers |
| `duration` | number | Max playback time in ms (video auto-dismisses on finish or timeout) |
| `cacheTTL` | number | Seconds to keep the video file cached on device |

---

## Splash Video History

| Date | Video | Size | Reason |
|------|-------|------|--------|
| Mar 19, 2026 | `ramadan2.mp4` | 5.6MB | Initial remote splash (Ramadan campaign) |
| Mar 20, 2026 | `Splash.mp4` | 4.4MB | New branded splash (Ramadan ended) |

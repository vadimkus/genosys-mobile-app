# Remote Splash Screen

> Update the app's launch video over-the-air without rebuilding or resubmitting.

Introduced in **v1.7.0** (March 2026). Replaces the bundled video approach from v1.6.0.

---

## How It Works

The splash screen is controlled by a server-side configuration endpoint. On every cold start, the app reads the config, downloads/caches the video, and plays it as a full-screen overlay.

```
┌─────────────────────────────────────────────────────┐
│                    Cold Start                        │
│                                                      │
│  1. AsyncStorage → read @splash_config (~10ms)       │
│     └─ If found & enabled → show splash immediately  │
│                                                      │
│  2. GET /api/mobile/splash-config (background)       │
│     └─ Save response to AsyncStorage                 │
│     └─ Apply to current session                      │
│                                                      │
│  3. VideoLaunchScreen                                │
│     ├─ FileSystem cache hit → play from local file   │
│     └─ Cache miss → stream from URL, cache in bg     │
│                                                      │
│  4. Video finishes (or tap to skip) → fade out       │
└─────────────────────────────────────────────────────┘
```

### Two Layers of Caching

| Layer | Storage | What's Cached | TTL |
|-------|---------|---------------|-----|
| Config | `AsyncStorage` (`@splash_config`) | JSON splash config (URL, duration, etc.) | Refreshed every launch |
| Video file | `FileSystem.cacheDirectory/splash/splash.mp4` | The actual mp4 file | Controlled by `cacheTTL` (default 24h) |

Config cache ensures the splash renders instantly. Video file cache avoids re-downloading 5+ MB on every launch.

---

## Server-Side Configuration

### Endpoint

```
GET https://genosys.ae/api/mobile/splash-config
```

### Response

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | yes | Master switch. `false` = no splash at all. |
| `type` | string | yes | `"video"` or `"image"`. Only video triggers `VideoLaunchScreen`. |
| `videoUrl` | string | yes | Absolute URL to the mp4 file. |
| `posterUrl` | string \| null | no | Still image shown while video buffers. |
| `duration` | number | no | Max playback time in ms. Default: 5000. Video auto-dismisses on finish or timeout (whichever comes first). |
| `cacheTTL` | number | no | Seconds to keep the video file in local cache. Default: 86400 (24h). |

### Source File

```
cosmetics-website/app/api/mobile/splash-config/route.ts
```

Edit the `SPLASH_CONFIG` object and deploy. No database required.

---

## Updating the Splash Video

### Change the video

1. Upload new mp4 to `cosmetics-website/public/videos/` (e.g. `eid2026.mp4`)
2. Update `videoUrl` in `splash-config/route.ts`:
   ```typescript
   videoUrl: 'https://genosys.ae/videos/eid2026.mp4',
   ```
3. `git push` → Vercel auto-deploys
4. Existing app installs get the new video on next launch

### Disable splash entirely

1. Set `enabled: false` in `splash-config/route.ts`
2. Deploy → splash stops on all existing installs

### Change duration

1. Update `duration` (milliseconds) in `splash-config/route.ts`
2. Deploy

### Add a poster image (shown while video buffers)

1. Upload poster to `cosmetics-website/public/images/` (e.g. `splash-poster.jpg`)
2. Set `posterUrl: 'https://genosys.ae/images/splash-poster.jpg'` in config
3. Deploy

---

## Video Hosting

Videos are stored in `cosmetics-website/public/videos/` and served as static files by Vercel at `https://genosys.ae/videos/<filename>`.

Vercel serves these with `Cache-Control: public, max-age=31536000, immutable` by default, which means they're globally CDN-cached.

### Recommended Video Specs

| Property | Recommendation |
|----------|---------------|
| Format | MP4 (H.264 video, AAC audio) |
| Duration | 3–6 seconds |
| Resolution | 1080x1920 (portrait, 9:16) |
| File size | Under 8MB for fast first-load |
| Audio | Muted (app plays with `isMuted={true}`) |

---

## Mobile App Components

### `app/_layout.js`

- Reads splash config from `AsyncStorage` on mount (instant)
- Fetches fresh config from API in background
- Renders `VideoLaunchScreen` as overlay when config is active
- Sets `splashVideo` state to `false` when video finishes or config says disabled

### `components/VideoLaunchScreen.js`

- Accepts `videoUrl`, `posterUrl`, `duration`, `cacheTTL`, `onDone`
- Checks `FileSystem` cache before streaming
- Downloads video to cache in background for next launch
- Safety timeout: auto-dismisses even if video stalls
- Tap anywhere to skip
- `onError` → dismiss (graceful fallback, never blocks the app)
- Fade-out animation on dismiss (300ms)

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First launch ever (no cache) | API is called, video streams from URL. Slight delay (~300-500ms). Config + video cached for next time. |
| API returns 404/500 | No splash shown. App loads normally. |
| API unreachable (offline) | Last cached config is used. If no cache exists, no splash. |
| Video URL 404 | `VideoLaunchScreen.onError` fires → dismiss → app loads normally. |
| Video takes too long to buffer | Safety timeout (duration + 500ms) fires → dismiss. |
| User taps during video | Immediate dismiss with fade-out. |
| `enabled: false` from API | `splashVideo` set to `false`, no overlay rendered. |
| Config changes between launches | Fresh config is fetched on every launch. New video URL triggers re-download on next launch. |

---

## Migration from v1.6.0

v1.6.0 bundled `ramadan2.mp4` in the app binary (5.6MB). The video was hardcoded:

```javascript
// OLD (v1.6.0)
const LOCAL_SPLASH_VIDEO = require('../images/video/ramadan2.mp4');
```

v1.7.0 removed this entirely. Videos are now served remotely.

---

## Change History

| Date | Video | Size | Action |
|------|-------|------|--------|
| Mar 19, 2026 | `ramadan2.mp4` | 5.6MB | v1.7.0 released — splash migrated from bundled to remote |
| Mar 20, 2026 | `Splash.mp4` | 4.4MB | First OTA swap — Ramadan ended, new branded splash deployed. Zero app changes. |

This history proves the system works: the splash video was swapped entirely server-side with a single config change and `git push`.

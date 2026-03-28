# Release Notes — Version 1.7.0 (Build 71)

## App Store "What's New" Text

> Copy the text below into App Store Connect → "What's New in This Version"

```
Lighter & Faster
We removed 5.6MB of bundled video from the app binary — the app downloads faster and takes less storage.

Smart Splash Screen
The launch video is now delivered over-the-air. We can update seasonal splash videos (Ramadan, Eid, holidays) instantly without an app update.

Update Notifications
When a newer version is available, you'll see a gentle banner at the top of the screen. Tap "Update" to go to the App Store, or dismiss it to continue shopping.

Under the Hood
- Splash screen configuration is now cached locally for instant display on repeat launches
- Improved cold start performance
```

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.7.0 |
| Build | 71 |
| Copyright | © 2026 Genosys Middle East FZ-LLC |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |

## Review Notes for Apple

```
This update migrates the splash screen video from a bundled asset to a remotely-served video, and adds a non-blocking update notification banner.

Key areas to review:
1. App launch → Ramadan video splash plays for 5 seconds (tap anywhere to skip)
2. Kill the app and relaunch → Video plays again (from local cache, instant)
3. If a newer version exists on the server → A dark banner slides in at the top saying "A new version is available on the App Store" with an "Update" button and close "X"
4. Tap "X" to dismiss the banner → It won't reappear until a newer version is available
5. All existing functionality (shop, cart, checkout, orders) is unchanged

No new permissions. No new third-party SDKs. No data collection changes.

Test account credentials are unchanged from previous submissions.
```

## Promotional Text (optional)

```
A lighter, faster app with smart seasonal splash updates — no app update required.
```

## Technical Changes

### New Files
- `components/UpdateBanner.js` — Dismissible "new version available" banner with slide animation, "Update" button, and close "X"

### Modified Files
- `app/_layout.js` — Removed bundled `LOCAL_SPLASH_VIDEO`, added AsyncStorage-cached remote splash config, `checkSplash()` always runs, added `softUpdate` state for dismissible update banner
- `app.json` — Version bump 1.6.0 → 1.7.0, buildNumber 68 → 69 (EAS auto-incremented to 71)
- `cosmetics-website/app/api/mobile/app-version/route.ts` — `latestVersion` bumped to `1.7.0`

### Deleted Files
- `images/video/ramadan2.mp4` — Bundled Ramadan video removed (5.6MB savings). Initially served from `https://genosys.ae/videos/ramadan2.mp4`, then swapped OTA to `Splash.mp4` on Mar 20.

### Unchanged Files
- `components/VideoLaunchScreen.js` — Already handled remote video streaming, caching, and fallbacks
- `components/ForceUpdateScreen.js` — No changes
- `cosmetics-website/app/api/mobile/splash-config/route.ts` — Already existed with correct config

### Architecture Change

```
Before (v1.6.0):                    After (v1.7.0):
┌──────────────┐                    ┌──────────────┐
│  App Binary   │                    │  App Binary   │
│  ramadan2.mp4 │ ──▶ play          │  (no video)   │
│  (5.6MB)      │                    └──────┬───────┘
└──────────────┘                           │
                                    1. Read AsyncStorage cache
                                    2. GET /api/mobile/splash-config
                                    3. Stream or play from FileSystem cache
                                           │
                                    ┌──────▼───────┐
                                    │  genosys.ae   │
                                    │  /videos/*.mp4 │
                                    └──────────────┘
```

### Future Workflow (No App Rebuild)

To change the splash video:
1. Upload new mp4 to `cosmetics-website/public/videos/`
2. Update `videoUrl` in `app/api/mobile/splash-config/route.ts`
3. `git push` → Vercel auto-deploys
4. All existing installs get the new video on next launch

To disable splash:
1. Set `enabled: false` in splash-config
2. Deploy → splash disappears from all installs

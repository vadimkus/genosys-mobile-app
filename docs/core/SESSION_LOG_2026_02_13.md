# Session Log — February 13, 2026

## Product Video Sound Fix (Native App)

### Summary

Product videos in the native app played without sound, while web and mobile web had audio. Fixed by configuring `expo-av` to play audio even when the iOS silent switch is on.

---

### Problem

- **Symptom:** Product videos (e.g., SKIN BARRIER PROTECTING CREAM, product 27) played silently in the native app
- **Web/mobile web:** Sound worked correctly
- **User report:** "The videos on product cards do not give any sound in native app"

---

### Root Cause

On iOS, `expo-av`'s `<Video>` component defaults to respecting the device's **physical mute switch** (`playsInSilentModeIOS: false`). When the iPhone silent switch is on — which is very common — videos play muted. The web `<video>` element does not have this iOS-specific behavior.

---

### Fix Applied

**File:** `app/product/[id].js`

1. Import `Audio` from `expo-av` alongside `Video` and `ResizeMode`
2. In `ProductVideo`'s `handlePlay`, call `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` before starting playback
3. Wrapped in try/catch with logging; failure does not block video playback

```javascript
const handlePlay = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });
  } catch (e) {
    log.warn('Audio mode set failed', e?.message || e);
  }
  setIsPlaying(true);
  // ... rest of play logic
};
```

---

### Deployment

| Requirement | Answer |
|-------------|--------|
| **App rebuild?** | **Yes** — client-side change |
| **TestFlight submission?** | Yes — rebuild and submit for users to receive the fix |

---

### Related Documentation

- [PRODUCT_DETAIL_UPDATES.md](./PRODUCT_DETAIL_UPDATES.md) — Section 5: Video Sound Fix
- [DYNAMIC_CONTENT.md](./DYNAMIC_CONTENT.md) — How product videos are loaded

---

### Git Commit

`314f899` — fix(video): Enable audio playback when iOS silent switch is on

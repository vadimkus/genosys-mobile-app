import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, StatusBar, Animated, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// The iOS LaunchScreen storyboard rasterizes whatever PNG was committed to
// `ios/.../SplashScreenLegacy.imageset/image*.png` at build time — the binary
// can't be OTA'd. The shipped 1.10.0 binaries up to and including build 82
// were prebuilt with an older version of the brand asset (md5 8344b5ff…,
// RGBA), while `assets/splash.png` (md5 63204fba…, RGB) is the current
// source-of-truth and what the iOS imageset will hold from build 83 onwards
// (synced in commit 53a1df0).
//
// To make the native→JS handoff pixel-identical on whichever binary is
// running this OTA bundle, we ship BOTH images and pick the one matching
// the native LaunchScreen at runtime. When binary <= 82 fully rolls off,
// we can drop the legacy asset and revert this to a single require().
const SPLASH_IMAGE_CURRENT = require('../assets/splash.png');
const SPLASH_IMAGE_LEGACY_BINARY_82 = require('../assets/splash-launchscreen-binary82.png');

const NATIVE_BUILD_NUMBER = parseInt(
  Constants.nativeBuildVersion || Constants.expoConfig?.ios?.buildNumber || '0',
  10,
);
// Builds 0..82 ship the legacy asset; 83+ ship the current asset. If we
// somehow can't read the build number (parse failure → 0), fall back to
// "legacy" which is always-correct on the binary that's in the App Store
// today and the worst-case scenario on a future binary is one transient
// pixel mismatch on first launch (then the OTA after binary 83 ships will
// repoint to current).
const BUNDLED_SPLASH_IMAGE =
  NATIVE_BUILD_NUMBER >= 83 ? SPLASH_IMAGE_CURRENT : SPLASH_IMAGE_LEGACY_BINARY_82;

const CACHE_DIR = `${FileSystem.cacheDirectory}splash/`;
const CACHE_FILE = `${CACHE_DIR}splash.mp4`;
const META_FILE = `${CACHE_DIR}splash-meta.json`;

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
}

async function getCachedVideo(remoteUrl, cacheTTL) {
  try {
    await ensureCacheDir();
    const meta = await FileSystem.readAsStringAsync(META_FILE).catch(() => null);
    if (meta) {
      const { url, ts } = JSON.parse(meta);
      const fresh = url === remoteUrl && Date.now() - ts < cacheTTL * 1000;
      if (fresh) {
        const fileInfo = await FileSystem.getInfoAsync(CACHE_FILE);
        if (fileInfo.exists && fileInfo.size > 0) return CACHE_FILE;
      }
    }
  } catch {
    // cache miss
  }
  return null;
}

async function downloadAndCache(remoteUrl, cacheTTL) {
  try {
    await ensureCacheDir();
    await FileSystem.downloadAsync(remoteUrl, CACHE_FILE);
    await FileSystem.writeAsStringAsync(META_FILE, JSON.stringify({ url: remoteUrl, ts: Date.now(), ttl: cacheTTL }));
    return CACHE_FILE;
  } catch {
    return null;
  }
}

/**
 * Full-screen video launch screen with fade-out transition.
 *
 * Props:
 *   localSource — optional require() asset (skips download/cache when provided)
 *   videoUrl    — remote mp4 URL (used when localSource is not provided)
 *   posterUrl   — optional still image while video loads
 *   duration    — max time in ms before auto-dismissing
 *   cacheTTL    — seconds to keep cached video
 *   onDone      — called when the screen should be dismissed
 */
export default function VideoLaunchScreen({ localSource, videoUrl, posterUrl, duration = 3000, cacheTTL = 86400, onDone }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Splash cover starts fully opaque and only fades out once the WebView
  // reports its first playable frame. This keeps the iOS-LaunchScreen-matched
  // logo on screen during the entire WebView/video bootstrap so the user
  // never sees the underlying WebView blank/black paint.
  const splashCoverOpacity = useRef(new Animated.Value(1)).current;
  const [videoSource, setVideoSource] = useState(() => localSource || (videoUrl ? { uri: videoUrl } : null));
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const dismissed = useRef(false);
  const timeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const sourceUri = typeof videoSource === 'number' ? null : videoSource?.uri;

  // Use the API-provided poster when supplied, otherwise the bundled splash
  // asset (same image as the iOS LaunchScreen). useMemo so we don't mint a
  // new source object on every parent re-render.
  const coverImageSource = useMemo(
    () => (posterUrl ? { uri: posterUrl } : BUNDLED_SPLASH_IMAGE),
    [posterUrl],
  );

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    setVideoSource(localSource || (videoUrl ? { uri: videoUrl } : null));
  }, [localSource, videoUrl]);

  useEffect(() => {
    setPlaybackStarted(false);
  }, [sourceUri]);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);

    // Do not rely only on the native animation completion callback. On a cold
    // TestFlight launch the first video frame can stall until touch, so remove
    // the overlay from JS after the fade duration regardless.
    fallbackTimeoutRef.current = setTimeout(() => {
      onDoneRef.current?.();
    }, 350);

    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
        onDoneRef.current?.();
      }
    });
  }, [fadeAnim]);

  useEffect(() => {
    if (localSource || !videoUrl) return;

    let cancelled = false;

    async function warmVideoCache() {
      const cached = await getCachedVideo(videoUrl, cacheTTL);
      if (!cancelled && !cached) {
        downloadAndCache(videoUrl, cacheTTL);
      }
    }

    warmVideoCache();

    return () => { cancelled = true; };
  }, [localSource, videoUrl, cacheTTL]);

  useEffect(() => {
    if (!playbackStarted) return undefined;
    // Count the splash duration from the moment the video has produced its
    // first playable frame. This avoids cutting the animation short during
    // WebView's native document/video startup.
    timeoutRef.current = setTimeout(dismiss, duration + 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [duration, dismiss, playbackStarted]);

  // Hide the splash cover the instant the WebView reports actual playback
  // (NOT canplay/loadeddata — those fire when the first frame is decoded but
  // may not yet be on screen, which leaves a brief no-logo gap during the
  // hide animation). Use a very short 90ms fade so the cover→video hand-off
  // looks clean if the cover image and video first frame are near-but-not-
  // pixel-identical, but doesn't linger long enough to look like a flicker.
  useEffect(() => {
    if (!playbackStarted) return;
    Animated.timing(splashCoverOpacity, {
      toValue: 0,
      duration: 90,
      useNativeDriver: true,
    }).start();
  }, [playbackStarted, splashCoverOpacity]);

  useEffect(() => {
    if (playbackStarted) return undefined;
    // Separate fail-safe while resolving cached/remote source or waiting for
    // WebView's first playable frame. This prevents an indefinite overlay if
    // native media startup hangs before playback.
    loadingTimeoutRef.current = setTimeout(dismiss, Math.max(8000, duration + 3000));
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, [duration, dismiss, playbackStarted]);

  // Memoize the HTML payload so the WebView doesn't see a fresh `source`
  // object on every parent re-render and reload mid-playback.
  const splashHtml = useMemo(() => {
    if (!sourceUri) return null;
    return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #ffffff;
      }
      video {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <video id="splashVideo" autoplay muted playsinline webkit-playsinline preload="auto">
      <source src="${sourceUri}" type="video/mp4" />
    </video>
    <script>
      (function () {
        var video = document.getElementById('splashVideo');
        function post(type) {
          try { window.ReactNativeWebView.postMessage(type); } catch (e) {}
        }
        video.addEventListener('ended', function () { post('ended'); });
        video.addEventListener('error', function () { post('error'); });
        document.addEventListener('click', function () { post('skip'); });
        document.addEventListener('touchend', function () { post('skip'); });
        // Fire 'ready' ONLY when the video is actually playing, i.e. frames
        // are being painted to screen. 'loadeddata' / 'canplay' fire when
        // the first frame is decoded into memory but may precede the
        // actual paint — flipping the cover off then exposes a brief
        // logo-less white gap that reads as a flicker.
        video.addEventListener('playing', function () { post('ready'); });
        // Trigger playback. canplay's call is the primary path; the
        // immediate call below covers WebViews that already have buffered
        // frames before our listener attached.
        video.addEventListener('canplay', function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              setTimeout(function () { video.play().catch(function () {}); }, 250);
            });
          }
        });
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            setTimeout(function () { video.play().catch(function () {}); }, 250);
          });
        }
      })();
    </script>
  </body>
</html>
`;
  }, [sourceUri]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      {/* Layer 1 (bottom): WebView playing the remote splash video. Mounted
          immediately so it can begin downloading/decoding behind the cover. */}
      {splashHtml ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          <WebView
            source={{ html: splashHtml, baseUrl: 'https://genosys.ae' }}
            style={styles.webVideo}
            containerStyle={StyleSheet.absoluteFill}
            javaScriptEnabled
            domStorageEnabled={false}
            scrollEnabled={false}
            bounces={false}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            allowsFullscreenVideo={false}
            overScrollMode="never"
            // Make the WebView's underlying surface white so any momentary
            // blank paint is the same color as the iOS LaunchScreen and the
            // splash cover above — no perceptible color flash if the cover
            // is briefly transparent for any reason.
            backgroundColor="#ffffff"
            onMessage={(event) => {
              const type = event?.nativeEvent?.data;
              if (type === 'ready') {
                setPlaybackStarted(true);
                return;
              }
              if (type === 'ended' || type === 'error' || type === 'skip') dismiss();
            }}
          />
        </Pressable>
      ) : null}

      {/* Layer 2 (top): poster cover that mirrors the iOS native LaunchScreen
          (white background + bundled splash image, or API-provided posterUrl).
          Stays fully opaque until the WebView reports its first playable
          frame, then cross-fades out, revealing the video underneath. This is
          what eliminates the white→black→video double-blink: the cover keeps
          the screen on the same color as the native LaunchScreen during the
          entire WebView/video bootstrap. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.splashCover, { opacity: splashCoverOpacity }]}
      >
        <Image
          source={coverImageSource}
          style={styles.splashCoverImage}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // White to match ios/GenosysUAE/Images.xcassets/SplashScreenBackground.colorset
    // (the iOS LaunchScreen background). Keeps the entire splash sequence on a
    // single background color from app launch through video playback.
    backgroundColor: '#ffffff',
    zIndex: 999,
  },
  webVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  splashCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashCoverImage: {
    width: '100%',
    height: '100%',
  },
});

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, StatusBar, Animated, Pressable, Image, Platform } from 'react-native';
// SDK 54+ moved the classic FileSystem API (cacheDirectory, getInfoAsync,
// downloadAsync, ...) to the /legacy entry point; the main entry is the new
// File/Directory class API. This module uses the classic API.
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

const CACHE_DIR = `${FileSystem.cacheDirectory}splash/`;
const CACHE_FILE = `${CACHE_DIR}splash.mp4`;
const META_FILE = `${CACHE_DIR}splash-meta.json`;
const SPLASH_IMAGE_CURRENT = require('../assets/splash.png');
const SPLASH_IMAGE_BINARY_82 = require('../assets/splash-launchscreen-binary82.png');

function getNativeBuildNumber() {
  const configuredBuild = Constants.expoConfig?.[Platform.OS];
  const build = Number(Constants.nativeBuildVersion || configuredBuild?.buildNumber || configuredBuild?.versionCode || 0);
  return Number.isFinite(build) ? build : 0;
}

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
export default function VideoLaunchScreen({ localSource, videoUrl, posterUrl, duration = 3000, cacheTTL = 86400, onCoverReady, onDone }) {
  const launchConfigRef = useRef({
    localSource,
    videoUrl,
    posterUrl,
    duration,
    cacheTTL,
  });
  const launchConfig = launchConfigRef.current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Static cover starts fully opaque and hides WebView startup until video
  // playback is stable. Use the same asset as the native LaunchScreen for the
  // running binary so startup reads as one continuous white logo before video.
  const splashCoverOpacity = useRef(new Animated.Value(1)).current;
  const splashCoverImage = useMemo(() => (
    getNativeBuildNumber() >= 83 ? SPLASH_IMAGE_CURRENT : SPLASH_IMAGE_BINARY_82
  ), []);
  const [videoSource] = useState(() => (
    launchConfig.localSource || (launchConfig.videoUrl ? { uri: launchConfig.videoUrl } : null)
  ));
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const dismissed = useRef(false);
  const timeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const onCoverReadyRef = useRef(onCoverReady);
  const coverReadyFiredRef = useRef(false);
  const sourceUri = typeof videoSource === 'number' ? null : videoSource?.uri;
  const coverRevealDelayMs = Platform.OS === 'android' ? 250 : 650;

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    onCoverReadyRef.current = onCoverReady;
  }, [onCoverReady]);

  // Tell the parent the cover logo is on screen so it can hide the native
  // splash with no white gap. Fires on Image load, with a short fail-safe in
  // case onLoad is missed for the bundled asset.
  const signalCoverReady = useCallback(() => {
    if (coverReadyFiredRef.current) return;
    coverReadyFiredRef.current = true;
    onCoverReadyRef.current?.();
  }, []);

  useEffect(() => {
    const id = setTimeout(signalCoverReady, 350);
    return () => clearTimeout(id);
  }, [signalCoverReady]);

  useEffect(() => {
    setPlaybackStarted(false);
  }, [sourceUri]);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);

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
    if (launchConfig.localSource || !launchConfig.videoUrl) return;

    let cancelled = false;

    async function warmVideoCache() {
      const cached = await getCachedVideo(launchConfig.videoUrl, launchConfig.cacheTTL);
      if (!cancelled && !cached) {
        downloadAndCache(launchConfig.videoUrl, launchConfig.cacheTTL);
      }
    }

    warmVideoCache();

    return () => { cancelled = true; };
  }, [launchConfig.cacheTTL, launchConfig.localSource, launchConfig.videoUrl]);

  useEffect(() => {
    if (!playbackStarted) return undefined;
    // Count the splash duration from the moment the video has produced its
    // first playable frame. This avoids cutting the animation short during
    // WebView's native document/video startup.
    timeoutRef.current = setTimeout(dismiss, launchConfig.duration + 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dismiss, launchConfig.duration, playbackStarted]);

  // Do not reveal the WebView on the first `playing` tick. On iOS WKWebView
  // the first painted frames can still include the video element's own white
  // bootstrap/poster transition, and revealing those frames is what users are
  // perceiving as logo flicker / restart. Let playback run invisibly for a
  // short moment, then hard-cut from the static cover to already-moving video.
  useEffect(() => {
    if (!playbackStarted) return;
    revealTimeoutRef.current = setTimeout(() => {
      // Short crossfade from the static logo cover to the already-moving video
      // (instead of a hard cut), which removes the perceived logo "jump".
      Animated.timing(splashCoverOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }, coverRevealDelayMs);
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [coverRevealDelayMs, playbackStarted, splashCoverOpacity]);

  useEffect(() => {
    if (playbackStarted) return undefined;
    // Separate fail-safe while resolving cached/remote source or waiting for
    // WebView's first playable frame. This prevents an indefinite overlay if
    // native media startup hangs before playback.
    loadingTimeoutRef.current = setTimeout(dismiss, Math.max(8000, launchConfig.duration + 3000));
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [dismiss, launchConfig.duration, playbackStarted]);

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
  const webViewSource = useMemo(
    () => (splashHtml ? { html: splashHtml, baseUrl: 'https://genosys.ae' } : null),
    [splashHtml],
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      {/* Layer 1 (bottom): WebView playing the remote splash video. Mounted
          immediately so it can begin downloading/decoding behind the cover. */}
      {webViewSource ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          <WebView
            source={webViewSource}
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

      {/* Layer 2 (top): native-matched logo cover. It prevents the logo-less
          white gap while WebView buffers, then hard-cuts to already-moving
          video after playback is stable. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.splashCover, { opacity: splashCoverOpacity }]}
      >
        <Image
          source={splashCoverImage}
          style={styles.splashCoverImage}
          resizeMode="contain"
          fadeDuration={0}
          onLoad={signalCoverReady}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashCoverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

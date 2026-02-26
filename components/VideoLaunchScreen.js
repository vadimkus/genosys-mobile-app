import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Animated, Pressable } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';

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
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [videoSource, setVideoSource] = useState(localSource || null);
  const dismissed = useRef(false);
  const timeoutRef = useRef(null);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      onDone?.();
    });
  }, [fadeAnim, onDone]);

  useEffect(() => {
    // If a local bundled asset was provided, skip remote fetch entirely
    if (localSource) return;

    let cancelled = false;

    async function loadVideo() {
      const cached = await getCachedVideo(videoUrl, cacheTTL);
      if (cancelled) return;

      if (cached) {
        setVideoSource({ uri: cached });
      } else {
        setVideoSource({ uri: videoUrl });
        downloadAndCache(videoUrl, cacheTTL);
      }
    }

    loadVideo();

    return () => { cancelled = true; };
  }, [localSource, videoUrl, cacheTTL]);

  useEffect(() => {
    // Safety timeout — always dismiss after duration even if video stalls
    timeoutRef.current = setTimeout(dismiss, duration + 500);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [duration, dismiss]);

  const handlePlaybackStatusUpdate = useCallback((status) => {
    if (status.didJustFinish) dismiss();
  }, [dismiss]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      {posterUrl && !videoSource && (
        <Image source={{ uri: posterUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      )}

      {videoSource && (
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          <Video
            ref={videoRef}
            source={videoSource}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isMuted
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={dismiss}
          />
        </Pressable>
      )}

      {/* Fallback logo while video loads */}
      {!videoSource && !posterUrl && (
        <View style={styles.fallback}>
          <Image
            source={require('../assets/splash-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  fallback: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260,
    height: 90,
  },
});

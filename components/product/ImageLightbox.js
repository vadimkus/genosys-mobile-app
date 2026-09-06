/**
 * ImageLightbox - Full-screen gallery modal for product images.
 *
 * Opens when the user taps the PDP hero image. Horizontal paging matches
 * the inline gallery. Pinch / pan / double-tap zoom uses gesture-handler +
 * reanimated (already in the binary) so this stays OTA-shippable.
 *
 * Gesture wiring, learned the hard way: the pan is enabled only while zoomed
 * (a JS flag), never left to manual activation behind an Exclusive with the
 * double-tap. Inside a horizontal FlatList on iOS that arrangement left the
 * zoomed picture stuck: you could pinch into one spot and never drag to
 * another. Pinch zooms about the fingers and both gestures clamp to the
 * drawn picture so it cannot be pushed off screen.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const FRAME_WIDTH = SCREEN_WIDTH;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.78;

function ZoomableImage({ source, isActive, onZoomChange }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);
  // Where the two fingers were when the pinch began, relative to the frame's
  // centre, so the zoom grows out of the spot under them rather than the
  // middle of the screen.
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  // Drawn size of the image inside the frame (contentFit="contain"), so the
  // pan stops at the picture's own edge and not the letterbox around it.
  const drawnW = useSharedValue(FRAME_WIDTH);
  const drawnH = useSharedValue(FRAME_HEIGHT);
  // JS mirror of "scale > 1": gates the pan handler and, via the parent,
  // the FlatList's own scroll. A pan handler that is merely a no-op when not
  // zoomed still steals the horizontal swipe from the list, and one that
  // relies on manual activation inside the list never gets to activate.
  const [zoomed, setZoomed] = useState(false);

  const setZoomedFromUI = useCallback(
    (next) => {
      setZoomed(next);
      onZoomChange?.(next);
    },
    [onZoomChange],
  );

  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTX.value = 0;
    savedTY.value = 0;
  }, [scale, translateX, translateY, savedScale, savedTX, savedTY]);

  useEffect(() => {
    if (!isActive) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedScale.value = 1;
      savedTX.value = 0;
      savedTY.value = 0;
      setZoomed(false);
      onZoomChange?.(false);
    }
  }, [isActive, onZoomChange, scale, translateX, translateY, savedScale, savedTX, savedTY]);

  const onLoad = useCallback(
    (e) => {
      const w = e?.source?.width;
      const h = e?.source?.height;
      if (!w || !h) return;
      const fit = Math.min(FRAME_WIDTH / w, FRAME_HEIGHT / h);
      drawnW.value = w * fit;
      drawnH.value = h * fit;
    },
    [drawnW, drawnH],
  );

  // Clamp so the picture's edge never leaves the frame's edge once zoomed in.
  const clampTX = (tx, s) => {
    'worklet';
    const limit = Math.max(0, (drawnW.value * s - FRAME_WIDTH) / 2);
    return Math.min(Math.max(tx, -limit), limit);
  };
  const clampTY = (ty, s) => {
    'worklet';
    const limit = Math.max(0, (drawnH.value * s - FRAME_HEIGHT) / 2);
    return Math.min(Math.max(ty, -limit), limit);
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      focalX.value = e.focalX - FRAME_WIDTH / 2;
      focalY.value = e.focalY - FRAME_HEIGHT / 2;
      // Disable the list as soon as fingers land, not after the pinch ends,
      // so a pan that follows the pinch is ours from the first frame.
      runOnJS(setZoomedFromUI)(true);
    })
    .onUpdate((e) => {
      const next = Math.min(Math.max(savedScale.value * e.scale, MIN_SCALE), MAX_SCALE);
      // Keep the point under the fingers fixed while the scale changes.
      const ratio = next / savedScale.value;
      const tx = focalX.value - (focalX.value - savedTX.value) * ratio;
      const ty = focalY.value - (focalY.value - savedTY.value) * ratio;
      scale.value = next;
      translateX.value = clampTX(tx, next);
      translateY.value = clampTY(ty, next);
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        resetZoom();
        runOnJS(setZoomedFromUI)(false);
      } else {
        savedScale.value = scale.value;
        savedTX.value = translateX.value;
        savedTY.value = translateY.value;
      }
    });

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .averageTouches(true)
    .onUpdate((e) => {
      translateX.value = clampTX(savedTX.value + e.translationX, scale.value);
      translateY.value = clampTY(savedTY.value + e.translationY, scale.value);
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      if (scale.value > 1.05) {
        resetZoom();
        runOnJS(setZoomedFromUI)(false);
        return;
      }
      // Zoom into the tapped spot, clamped to the picture.
      const fx = e.x - FRAME_WIDTH / 2;
      const fy = e.y - FRAME_HEIGHT / 2;
      const tx = clampTX(fx - fx * DOUBLE_TAP_SCALE, DOUBLE_TAP_SCALE);
      const ty = clampTY(fy - fy * DOUBLE_TAP_SCALE, DOUBLE_TAP_SCALE);
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      translateX.value = withTiming(tx);
      translateY.value = withTiming(ty);
      savedScale.value = DOUBLE_TAP_SCALE;
      savedTX.value = tx;
      savedTY.value = ty;
      runOnJS(setZoomedFromUI)(true);
    });

  // A still double-tap wins the race; any movement fails the tap and hands
  // the touch to pinch/pan, which run together so a two-finger drag both
  // scales and moves.
  const composed = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.slide} collapsable={false}>
        <Animated.View style={[styles.zoomFrame, animatedStyle]}>
          <Image
            source={source}
            style={styles.image}
            contentFit="contain"
            transition={150}
            cachePolicy="memory-disk"
            onLoad={onLoad}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default function ImageLightbox({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
}) {
  const { t } = useLocalization();
  // Read insets from context (stable & correct on first open). SafeAreaView's
  // native measurement is unreliable inside a Modal, which caused the close
  // button to sit under the status bar the first time the viewer opened.
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      setZoomed(false);
      // Ensure the list jumps to the tapped image on open (after mount).
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        } catch {
          // no-op; initialScrollIndex on FlatList covers first paint.
        }
      });
    }
  }, [visible, initialIndex]);

  const onMomentumEnd = (e) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (next !== index) {
      setIndex(next);
      setZoomed(false);
    }
  };

  const handleZoomChange = useCallback((isZoomed) => {
    setZoomed(Boolean(isZoomed));
  }, []);

  if (!images.length) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View
          style={[
            styles.safeArea,
            { paddingTop: insets.top || 12, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.topBar}>
            <Text style={styles.counter}>
              {index + 1} / {images.length}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('product.a11y.closeImageViewer')}
              activeOpacity={0.8}
              hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
            >
              <Ionicons name="close" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={listRef}
            data={images}
            keyExtractor={(_, i) => `lightbox-${i}`}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            onMomentumScrollEnd={onMomentumEnd}
            getItemLayout={(_, i) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * i,
              index: i,
            })}
            renderItem={({ item, index: itemIndex }) => (
              <ZoomableImage
                source={item}
                isActive={itemIndex === index}
                onZoomChange={handleZoomChange}
              />
            )}
          />

          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={`ldot-${i}`}
                  style={[styles.dot, i === index && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  counter: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  zoomFrame: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.card,
  },
});

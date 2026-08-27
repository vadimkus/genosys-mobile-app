/**
 * ImageLightbox - Full-screen gallery modal for product images.
 *
 * Opens when the user taps the PDP hero image. Horizontal paging matches
 * the inline gallery. Pinch / pan / double-tap zoom uses gesture-handler +
 * reanimated (already in the binary) so this stays OTA-shippable.
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

function ZoomableImage({ source, isActive, onZoomChange }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

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
      onZoomChange?.(false);
    }
  }, [isActive, onZoomChange, scale, translateX, translateY, savedScale, savedTX, savedTY]);

  const reportZoom = useCallback(
    (zoomed) => {
      onZoomChange?.(zoomed);
    },
    [onZoomChange],
  );

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = Math.min(Math.max(savedScale.value * e.scale, MIN_SCALE), MAX_SCALE);
      scale.value = next;
      // While pinching back to 1×, clear pan offset so the frame doesn't stick.
      if (next <= 1.01) {
        translateX.value = 0;
        translateY.value = 0;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        resetZoom();
        runOnJS(reportZoom)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(reportZoom)(true);
      }
    });

  // Pan must FAIL when not zoomed - otherwise it steals the horizontal
  // swipe from FlatList even if onUpdate is a no-op (scroll stays stuck).
  const pan = Gesture.Pan()
    .averageTouches(true)
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      if (scale.value > 1.05) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((e) => {
      if (scale.value <= 1.05) return;
      translateX.value = savedTX.value + e.translationX;
      translateY.value = savedTY.value + e.translationY;
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        savedTX.value = 0;
        savedTY.value = 0;
        return;
      }
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.05) {
        resetZoom();
        runOnJS(reportZoom)(false);
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
        runOnJS(reportZoom)(true);
      }
    });

  const composed = Gesture.Simultaneous(
    pinch,
    Gesture.Exclusive(doubleTap, pan),
  );

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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.78,
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
    borderRadius: 3,
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

/**
 * ImageLightbox - Full-screen gallery modal for product images.
 *
 * Opens when the user taps the PDP hero image. Uses a horizontal paging
 * FlatList so swipe gestures match the inline gallery. Shows a close
 * button, image counter (e.g. "2 / 5") and pagination dots.
 *
 * Pure RN — no extra native dependencies. Pinch-zoom is intentionally
 * deferred to keep this OTA-shippable.
 */

import React, { useEffect, useRef, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageLightbox({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
}) {
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
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
    if (next !== index) setIndex(next);
  };

  if (!images.length) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.topBar}>
            <Text style={styles.counter}>
              {index + 1} / {images.length}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close image viewer"
              activeOpacity={0.8}
              hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
            >
              <Ionicons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={listRef}
            data={images}
            keyExtractor={(_, i) => `lightbox-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            onMomentumScrollEnd={onMomentumEnd}
            getItemLayout={(_, i) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * i,
              index: i,
            })}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Image
                  source={item}
                  style={styles.image}
                  contentFit="contain"
                  transition={150}
                  cachePolicy="memory-disk"
                />
              </View>
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
        </SafeAreaView>
      </View>
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
    color: '#ffffff',
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
  },
  image: {
    width: SCREEN_WIDTH,
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
    backgroundColor: '#ffffff',
  },
});

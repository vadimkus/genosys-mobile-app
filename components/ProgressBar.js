import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

export default function ProgressBar({
  progress = 0,
  met = false,
  style,
  trackStyle,
  fillStyle,
}) {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  return (
    <View style={[styles.track, trackStyle, style]}>
      <View
        style={[
          styles.fill,
          met && styles.fillMet,
          fillStyle,
          { width: `${safe * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.separator,
    overflow: 'hidden',
  },
  // Rose while there is still spending to do, green once the threshold is met -
  // the same two states the website's cart uses for this bar. It used to fill
  // grey, which read as disabled rather than as progress.
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  fillMet: {
    backgroundColor: colors.green,
  },
});







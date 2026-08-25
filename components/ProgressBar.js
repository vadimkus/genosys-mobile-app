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
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.separator,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.placeholder,
    borderRadius: 999,
  },
  fillMet: {
    backgroundColor: '#34C759',
  },
});







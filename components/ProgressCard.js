import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

/**
 * Generic progress card used for promo/free-shipping progress UIs.
 * Keep it flexible: callers can provide either simple text props or fully custom header elements.
 */
export default function ProgressCard({
  headerLeft,
  headerRight,
  leftText,
  rightText,
  rightTextMet = false,
  progress = 0,
  met = false,
  children,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        {headerLeft ? (
          <View style={styles.headerLeftWrap}>{headerLeft}</View>
        ) : (
          <Text style={styles.leftText}>{leftText}</Text>
        )}

        {headerRight ? (
          <View style={styles.headerRightWrap}>{headerRight}</View>
        ) : (
          <Text style={[styles.rightText, (met || rightTextMet) && styles.rightTextMet]}>
            {rightText}
          </Text>
        )}
      </View>

      <View style={styles.barWrap}>
        <ProgressBar progress={progress} met={met} />
      </View>

      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  headerLeftWrap: {
    flex: 1,
  },
  headerRightWrap: {
    alignItems: 'flex-end',
  },
  leftText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '700',
  },
  rightText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
  },
  rightTextMet: {
    color: '#34C759',
  },
  barWrap: {
    marginBottom: 12,
  },
  body: {
    // caller controls layout
  },
});




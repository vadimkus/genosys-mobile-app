import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
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
  const isRTL = !!I18nManager.isRTL;
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.topRow, isRTL && styles.topRowRTL]}>
        {headerLeft ? (
          <View style={[styles.headerLeftWrap, isRTL && styles.headerLeftWrapRTL]}>{headerLeft}</View>
        ) : (
          <Text style={[styles.leftText, isRTL && styles.textRTL]}>{leftText}</Text>
        )}

        {headerRight ? (
          <View style={[styles.headerRightWrap, isRTL && styles.headerRightWrapRTL]}>{headerRight}</View>
        ) : (
          <Text style={[styles.rightText, isRTL && styles.textRTL, (met || rightTextMet) && styles.rightTextMet]}>
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
  topRowRTL: {
    flexDirection: 'row-reverse',
  },
  headerLeftWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerLeftWrapRTL: {
    alignItems: 'flex-end',
  },
  headerRightWrap: {
    alignItems: 'flex-end',
  },
  headerRightWrapRTL: {
    alignItems: 'flex-start',
  },
  leftText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
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
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  barWrap: {
    marginBottom: 12,
  },
  body: {
    // caller controls layout
  },
});






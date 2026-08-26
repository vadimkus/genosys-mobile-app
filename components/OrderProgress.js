import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import T from '../utils/typography';
import { getOrderProgress } from '../utils/orderModel';

const DOT = 26;

/**
 * The three-step order tracker.
 *
 * Reads its state from `getOrderProgress`, which owns the one rule worth stating twice:
 * step one means the order was *accepted*, not paid. Cash on delivery settles at the
 * door, so a bar keyed on payment would sit empty for every COD customer until the
 * courier knocked. Only the first step's label changes with the payment method, and the
 * payment note moves to the last step when the money is taken there.
 *
 * The connecting line is drawn as two half-widths inside each column rather than as one
 * absolutely-positioned bar. A single bar has to be anchored with `left` or `right`, and
 * this app runs `I18nManager.forceRTL` *and* applies `row-reverse` on top of it, so those
 * are swapped twice and the fill grows from the wrong end in Arabic. Halves are laid out
 * by flex, so they follow whatever direction the row is using and there is nothing to get
 * backwards.
 */
export default function OrderProgress({ order, t, isRTL = false }) {
  const progress = getOrderProgress(order);
  const { steps, cancelled, paidOnDelivery, firstStepIsPayment, completed } = progress;

  const labels = [
    firstStepIsPayment ? t('ordersDetail.statusPaid') : t('ordersDetail.statusConfirmed'),
    t('ordersDetail.statusShipped'),
    t('ordersDetail.statusDelivered'),
  ];

  const last = steps.length - 1;

  return (
    <View>
      <View style={[styles.steps, isRTL && styles.rowReverse]}>
        {steps.map((step, i) => {
          const filled = step.done && !cancelled;
          // A segment is lit once the dot it leads to has been reached, so the line never
          // runs past the last thing that actually happened.
          const beforeLit = filled && i > 0;
          const afterLit = !cancelled && i < last && steps[i + 1].done;

          return (
            <View key={step.key} style={styles.step}>
              <View style={[styles.dotRow, isRTL && styles.rowReverse]}>
                <View
                  style={[
                    styles.half,
                    i === 0 && styles.halfHidden,
                    beforeLit && styles.halfLit,
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    filled && styles.dotDone,
                    step.current && styles.dotCurrent,
                  ]}
                >
                  {filled ? (
                    <Ionicons name="checkmark" size={15} color={colors.white} />
                  ) : (
                    <View style={[styles.pip, step.current && styles.pipCurrent]} />
                  )}
                </View>
                <View
                  style={[
                    styles.half,
                    i === last && styles.halfHidden,
                    afterLit && styles.halfLit,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  filled && styles.labelDone,
                  step.current && styles.labelCurrent,
                ]}
                numberOfLines={2}
              >
                {labels[i]}
              </Text>

              {/* The payment note lives on whichever step actually takes the money. */}
              {paidOnDelivery && i === last && !cancelled ? (
                <Text style={styles.note} numberOfLines={2}>
                  {t('ordersDetail.paidOnDelivery')}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {cancelled ? (
        <Text style={styles.footnote}>{t('ordersDetail.trackerCancelled')}</Text>
      ) : completed ? (
        <Text style={styles.footnote}>{t('ordersDetail.trackerComplete')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
  step: { flex: 1, alignItems: 'center' },

  dotRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  half: { flex: 1, height: 2, backgroundColor: colors.separator },
  // The outer halves of the first and last columns have nothing to connect to.
  halfHidden: { backgroundColor: 'transparent' },
  halfLit: { backgroundColor: colors.cta },

  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.separator,
  },
  dotDone: { backgroundColor: colors.cta, borderColor: colors.cta },
  dotCurrent: { borderColor: colors.cta },

  pip: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.separator },
  pipCurrent: { backgroundColor: colors.cta },

  label: { ...T.captionSmall, color: colors.secondaryLabel, textAlign: 'center', marginTop: 8 },
  labelDone: { color: colors.label, fontWeight: '600' },
  labelCurrent: { color: colors.label, fontWeight: '700' },

  note: { ...T.captionTiny, color: colors.secondaryLabel, textAlign: 'center', marginTop: 2 },

  footnote: { ...T.captionSmall, color: colors.secondaryLabel, textAlign: 'center', marginTop: 14 },
});

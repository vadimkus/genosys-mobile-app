import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors, shadow } from '../../utils/theme';

/**
 * GENOSYS Rewards card in checkout - always-visible redemption control
 * (the order-summary toggle only shows when the summary is expanded).
 *
 * States:
 * - balance >= 100 and quote available → toggle "Use N points (−AED X)"
 * - balance > 0 but nothing redeemable  → balance + hint to keep earning
 * - always: "you'll earn ~N pts with this order" preview
 */
export default function RewardsRedemptionCard({
  balance,
  quote, // { points, aed }
  enabled,
  onToggle,
  earnPreview,
  isRTL = false,
}) {
  const { t } = useLocalization();

  if (!(balance > 0) && !(earnPreview > 0)) return null;

  const canRedeem = quote && quote.points > 0;

  return (
    <View style={[styles.card, shadow.card]}>
      {/* Header */}
      <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
        <View style={[styles.titleWrap, isRTL && styles.rowReverse]}>
          <View style={styles.iconTile}>
            <Ionicons name="ribbon-outline" size={16} color={colors.white} />
          </View>
          <Text style={styles.title}>{t('rewards.title')}</Text>
        </View>
        <View style={styles.balanceChip}>
          <Text style={styles.balanceChipText}>
            {Number(balance || 0).toLocaleString()} {t('rewards.points')}
          </Text>
        </View>
      </View>

      {canRedeem ? (
        <>
          <TouchableOpacity
            style={[styles.redeemRow, enabled && styles.redeemRowActive, isRTL && styles.rowReverse]}
            onPress={onToggle}
            activeOpacity={0.75}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!enabled }}
            accessibilityLabel={t('rewards.useMyPoints')}
          >
            <Ionicons
              name={enabled ? 'checkbox' : 'square-outline'}
              size={20}
              color={enabled ? colors.blue : colors.tertiary}
            />
            <View style={[styles.redeemText, isRTL && styles.textAlignRight]}>
              <Text style={[styles.redeemTitle, isRTL && styles.textRTL]}>
                {t('rewards.applyPoints', { points: Number(quote.points).toLocaleString() })}
              </Text>
              <Text style={[styles.redeemSub, isRTL && styles.textRTL]}>
                {t('rewards.redeemHint', {
                  points: Number(quote.points).toLocaleString(),
                  balance: Number(balance).toLocaleString(),
                })}
              </Text>
            </View>
            <Text style={[styles.redeemValue, { color: enabled ? colors.blue : colors.secondaryLabel }]}>
              -AED {Number(quote.aed).toFixed(2)}
            </Text>
          </TouchableOpacity>
          {enabled ? (
            <View style={[styles.appliedRow, isRTL && styles.rowReverse]}>
              <Ionicons name="checkmark-circle" size={13} color={colors.greenDeep} />
              <Text style={styles.appliedText}>
                {t('rewards.applied', { aed: Number(quote.aed).toFixed(2) })}
              </Text>
            </View>
          ) : null}
        </>
      ) : balance > 0 ? (
        <Text style={[styles.hintText, isRTL && styles.textRTL]}>{t('rewards.notEnough')}</Text>
      ) : null}

      {earnPreview > 0 ? (
        <View style={[styles.earnRow, isRTL && styles.rowReverse]}>
          <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
          <Text style={[styles.earnText, isRTL && styles.textRTL]}>
            {t('rewards.earnPreview', { points: Number(earnPreview).toLocaleString() })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTile: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.label,
  },
  balanceChip: {
    backgroundColor: colors.fillSecondary,
    borderRadius: 980,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  balanceChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryLabel,
  },
  redeemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.separator,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  redeemRowActive: {
    backgroundColor: colors.blueBg,
    borderColor: colors.blueLine,
  },
  redeemText: {
    flex: 1,
  },
  redeemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.label,
  },
  redeemSub: {
    fontSize: 11,
    color: colors.secondaryLabel,
    marginTop: 1,
  },
  redeemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  appliedText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.greenDeep,
  },
  hintText: {
    fontSize: 12,
    color: colors.secondaryLabel,
    lineHeight: 17,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  earnText: {
    fontSize: 11.5,
    color: colors.secondaryLabel,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textAlignRight: {
    alignItems: 'flex-end',
  },
});

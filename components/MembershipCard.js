import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchMembership } from '../services/api';
import { colors, shadow } from '../utils/theme';
import { createLogger } from '../utils/logger';

const log = createLogger('MembershipCard');

const TIER_STYLES = {
  MEMBER: { bg: '#F2F2F7', fg: '#3A3A3C', bar: '#8E8E93' },
  SILVER: { bg: '#E8E8ED', fg: '#3A3A3C', bar: '#A0A0A8' },
  GOLD: { bg: '#FAF3E3', fg: '#8A6D1D', bar: '#D4AF37' },
  PLATINUM: { bg: '#1D1D1F', fg: '#F5F5F7', bar: '#1D1D1F' },
};

/**
 * GENOSYS Rewards membership card for the profile screen.
 * - REWARDS track: tier badge, points balance, progress toward the next tier.
 * - PARTNER track: Professional Partner recognition with contractual pricing.
 * Hides itself while loading fails (guest users, network errors).
 */
export default function MembershipCard({ isRTL = false }) {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.token) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      const result = await fetchMembership(user.token);
      setData(result);
    } catch (e) {
      log.warn('Membership load failed', e?.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) return null;

  // Professional Partner track
  if (data.track === 'PARTNER') {
    return (
      <View style={[styles.partnerCard, shadow.card]}>
        <View style={[styles.partnerRow, isRTL && styles.rowReverse]}>
          <View style={styles.partnerIcon}>
            <Ionicons name="business-outline" size={18} color={colors.white} />
          </View>
          <View style={[styles.partnerText, isRTL && styles.textAlignRight]}>
            <Text style={[styles.partnerTitle, isRTL && styles.textRTL]}>
              {t('rewards.professionalPartner')}
            </Text>
            <Text style={[styles.partnerSubtitle, isRTL && styles.textRTL]}>
              {Number(data.partner?.discountPercentage || 0)}% {t('rewards.partnerPricing')}
            </Text>
          </View>
          {data.memberNumber ? (
            <Text style={styles.partnerNumber}>{data.memberNumber}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  const tier = data.tier || 'MEMBER';
  const ts = TIER_STYLES[tier] || TIER_STYLES.MEMBER;
  const balance = Number(data.points?.balance || 0);
  const valueAed = Number(data.points?.valueAed || 0);
  const progress = data.tierProgress || {};
  const pct = Math.max(0, Math.min(100, Number(progress.progressPercent || 0)));

  return (
    <View style={[styles.card, shadow.card]}>
      {/* Header */}
      <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
        <View style={[styles.titleWrap, isRTL && styles.rowReverse]}>
          <Ionicons name="ribbon-outline" size={17} color={colors.brand} />
          <Text style={styles.title}>{t('rewards.title')}</Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: ts.bg }]}>
          <Text style={[styles.tierBadgeText, { color: ts.fg }]}>
            {t(`rewards.tier${tier.charAt(0)}${tier.slice(1).toLowerCase()}`)}
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View style={[styles.balanceRow, isRTL && styles.rowReverse]}>
        <View style={isRTL && styles.textAlignRight}>
          <Text style={[styles.balanceValue, isRTL && styles.textRTL]}>
            {balance.toLocaleString()}
            <Text style={styles.balanceUnit}> {t('rewards.points')}</Text>
          </Text>
          <Text style={[styles.balanceSub, isRTL && styles.textRTL]}>
            ≈ AED {valueAed.toLocaleString()} {t('rewards.inValue')}
          </Text>
        </View>
        <View style={styles.rateWrap}>
          <Text style={styles.rateText}>{Number(data.multiplier || 1)}x</Text>
          <Text style={styles.rateLabel}>{t('rewards.earnRate')}</Text>
        </View>
      </View>

      {/* Progress to next tier */}
      {progress.nextTier ? (
        <View>
          <View style={[styles.progressLabels, isRTL && styles.rowReverse]}>
            <Text style={styles.progressLabel}>
              AED {Number(progress.currentSpent || 0).toLocaleString()}
            </Text>
            <Text style={styles.progressLabel}>
              {t(`rewards.tier${progress.nextTier.charAt(0)}${progress.nextTier.slice(1).toLowerCase()}`)}
              {' · '}AED {Number(progress.nextTierAt || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: ts.bar }]} />
          </View>
        </View>
      ) : (
        <Text style={[styles.topTierText, isRTL && styles.textRTL]}>{t('rewards.topTier')}</Text>
      )}

      {data.memberNumber ? (
        <Text style={[styles.memberNumber, isRTL && styles.textRTL]}>{data.memberNumber}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.label,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 980,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: -0.5,
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryLabel,
    letterSpacing: 0,
  },
  balanceSub: {
    fontSize: 12,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
  rateWrap: {
    alignItems: 'center',
  },
  rateText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.greenDeep,
  },
  rateLabel: {
    fontSize: 10,
    color: colors.secondaryLabel,
    marginTop: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.secondaryLabel,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.fillSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topTierText: {
    fontSize: 12,
    color: colors.secondaryLabel,
  },
  memberNumber: {
    fontSize: 10,
    color: colors.tertiary,
    letterSpacing: 1.2,
    marginTop: 10,
  },
  partnerCard: {
    backgroundColor: '#1D1D1F',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerText: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  partnerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  partnerNumber: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
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

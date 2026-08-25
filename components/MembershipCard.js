import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchMembership } from '../services/api';
import { colors, shadow } from '../utils/theme';
import { createLogger } from '../utils/logger';
import * as haptics from '../utils/haptics';

const log = createLogger('MembershipCard');

// LayoutAnimation opt-in for old-architecture Android (no-op / deprecated on Fabric)
if (
  Platform.OS === 'android' &&
  !global?.nativeFabricUIManager &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIER_STYLES = {
  MEMBER: { bg: colors.groupedBg, fg: '#3A3A3C', bar: colors.secondaryLabel },
  SILVER: { bg: colors.groupedBg, fg: '#3A3A3C', bar: colors.placeholder },
  GOLD: { bg: '#FAF3E3', fg: '#8A6D1D', bar: '#D4AF37' },
  PLATINUM: { bg: colors.label, fg: colors.subtleBg, bar: colors.label },
};

const TIERS = ['MEMBER', 'SILVER', 'GOLD', 'PLATINUM'];

const tierKey = (tier) => `rewards.tier${tier.charAt(0)}${tier.slice(1).toLowerCase()}`;
const tierReqKey = (tier) => `rewards.tierReq${tier.charAt(0)}${tier.slice(1).toLowerCase()}`;
const tierPerkKey = (tier) => `rewards.tierPerk${tier.charAt(0)}${tier.slice(1).toLowerCase()}`;

/**
 * GENOSYS Rewards membership card for the profile screen.
 * Collapsed: tier badge, points balance, progress bar (or partner status).
 * Tap to expand: how-it-works + full tier benefits table (rewards track)
 * or partner status details (partner track).
 */
export default function MembershipCard({ isRTL = false }) {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

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

  const toggle = useCallback(() => {
    haptics.lightTap();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  if (loading || !data) return null;

  // ─── Professional Partner track ─────────────────────────────────────
  if (data.track === 'PARTNER') {
    const pct = Number(data.partner?.discountPercentage || 0);
    return (
      <TouchableOpacity
        style={[styles.partnerCard, shadow.card]}
        onPress={toggle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={t('rewards.professionalPartner')}
      >
        <View style={[styles.partnerRow, isRTL && styles.rowReverse]}>
          <View style={styles.partnerIcon}>
            <Ionicons name="business-outline" size={18} color={colors.white} />
          </View>
          <View style={[styles.partnerText, isRTL && styles.textAlignRight]}>
            <Text style={[styles.partnerTitle, isRTL && styles.textRTL]}>
              {t('rewards.professionalPartner')}
            </Text>
            <Text style={[styles.partnerSubtitle, isRTL && styles.textRTL]}>
              {pct}% {t('rewards.partnerPricing')}
            </Text>
          </View>
          {data.memberNumber ? (
            <Text style={styles.partnerNumber}>{data.memberNumber}</Text>
          ) : null}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="rgba(255,255,255,0.5)"
            style={{ marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }}
          />
        </View>

        {expanded ? (
          <View style={styles.partnerExpanded}>
            <Text style={[styles.partnerSectionTitle, isRTL && styles.textRTL]}>
              {t('rewards.partnerStatusTitle')}
            </Text>
            <View style={styles.partnerPriceBox}>
              <Text style={styles.partnerPriceLabel}>{t('rewards.partnerPricingLabel')}</Text>
              <Text style={styles.partnerPriceValue}>{pct}% {t('rewards.off')}</Text>
              <Text style={styles.partnerPriceLabel}>{t('rewards.partnerAppliedAuto')}</Text>
            </View>
            <Text style={[styles.partnerThanks, isRTL && styles.textRTL]}>
              {t('rewards.partnerThanks')}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  // ─── Rewards track ──────────────────────────────────────────────────
  const tier = data.tier || 'MEMBER';
  const ts = TIER_STYLES[tier] || TIER_STYLES.MEMBER;
  const balance = Number(data.points?.balance || 0);
  const valueAed = Number(data.points?.valueAed || 0);
  const progress = data.tierProgress || {};
  const pct = Math.max(0, Math.min(100, Number(progress.progressPercent || 0)));

  return (
    <TouchableOpacity
      style={[styles.card, shadow.card]}
      onPress={toggle}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={t('rewards.title')}
    >
      {/* Header */}
      <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
        <View style={[styles.titleWrap, isRTL && styles.rowReverse]}>
          <Ionicons name="ribbon-outline" size={17} color={colors.accent} />
          <Text style={styles.title}>{t('rewards.title')}</Text>
        </View>
        <View style={[styles.headerRight, isRTL && styles.rowReverse]}>
          <View style={[styles.tierBadge, { backgroundColor: ts.bg }]}>
            <Text style={[styles.tierBadgeText, { color: ts.fg }]}>{t(tierKey(tier))}</Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={colors.tertiary} />
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
              {t(tierKey(progress.nextTier))}
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

      {/* Expanded: how it works + tier table */}
      {expanded ? (
        <View style={styles.expandedWrap}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('rewards.howItWorksTitle')}
          </Text>
          <Text style={[styles.howItWorks, isRTL && styles.textRTL]}>
            {t('rewards.howItWorksBody')}
          </Text>

          <View style={styles.tierTable}>
            {TIERS.map((tr, i) => {
              const isCurrent = tr === tier;
              const trs = TIER_STYLES[tr];
              return (
                <View
                  key={tr}
                  style={[
                    styles.tierRow,
                    i > 0 && styles.tierRowBorder,
                    isCurrent && styles.tierRowCurrent,
                    isRTL && styles.rowReverse,
                  ]}
                >
                  <View style={[styles.tierRowBadge, { backgroundColor: trs.bg }]}>
                    <Text style={[styles.tierRowBadgeText, { color: trs.fg }]}>{t(tierKey(tr))}</Text>
                  </View>
                  <View style={[styles.tierRowText, isRTL && styles.textAlignRight]}>
                    <Text style={[styles.tierRowReq, isRTL && styles.textRTL]}>{t(tierReqKey(tr))}</Text>
                    <Text style={[styles.tierRowPerk, isRTL && styles.textRTL]}>
                      {t(tierPerkKey(tr))}
                      {isCurrent ? <Text style={styles.yourTier}>  • {t('rewards.yourTier')}</Text> : null}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
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
  headerRight: {
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
  expandedWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  howItWorks: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.label,
    marginBottom: 12,
  },
  tierTable: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: colors.card,
  },
  tierRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  tierRowCurrent: {
    backgroundColor: colors.accentBg,
  },
  tierRowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 980,
    marginTop: 1,
  },
  tierRowBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierRowText: {
    flex: 1,
  },
  tierRowReq: {
    fontSize: 11,
    color: colors.secondaryLabel,
  },
  tierRowPerk: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.label,
    marginTop: 1,
  },
  yourTier: {
    color: colors.accent,
    fontWeight: '700',
  },
  partnerCard: {
    backgroundColor: colors.label,
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
  partnerExpanded: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  partnerSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  partnerPriceBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerPriceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  partnerPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginVertical: 4,
  },
  partnerThanks: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
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

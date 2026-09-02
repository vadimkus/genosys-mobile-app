import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, ActivityIndicator, useWindowDimensions, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchPromo } from '../../services/api';
import RenderHTML from 'react-native-render-html';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

export default function PromoScreen() {
  const router = useRouter();
  const { locale, t, dir } = useLocalization();
  const isRTL = dir === 'rtl' || locale === 'ar';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [promo, setPromo] = useState(null);

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const loadPromo = async ({ showLoading, isCancelled } = { showLoading: true, isCancelled: undefined }) => {
    if (showLoading) setLoading(true);
    const data = await fetchPromo(locale).catch(() => null);
    if (typeof isCancelled === 'function' && isCancelled()) return;
    setPromo(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    loadPromo({ showLoading: true, isCancelled: () => cancelled });
    return () => { cancelled = true; };
  }, [locale]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPromo({ showLoading: false });
    } finally {
      setRefreshing(false);
    }
  };

  const dateLine = useMemo(() => {
    const raw = promo?.date;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    try {
      const loc = locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US';
      return d.toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return d.toISOString().slice(0, 10);
    }
  }, [promo?.date, locale]);

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('promo.title')} onBack={onBack} onRefresh={onRefresh} isRTL={isRTL} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: 16, paddingBottom: (insets?.bottom || 0) + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} progressViewOffset={headerHeight} />}
      >
        <Animated.View style={[styles.card, shadow.card, { opacity: fade, transform: [{ translateY: lift }] }]}>
          <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
            <View style={[surfaces.iconTile, styles.heroTile, { backgroundColor: colors.cta }]}>
              <Ionicons name="megaphone" size={18} color={colors.white} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={[styles.title, isRTL && styles.textRTL]}>{t('promo.infoTitle')}</Text>
              <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('promo.infoSubtitle')}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : promo?.text ? (
            <>
              <View style={styles.hairline} />
              {dateLine ? (
                <View style={[styles.datePill, isRTL && styles.datePillRTL]}>
                  <Ionicons name="time-outline" size={13} color={colors.secondaryLabel} />
                  <Text style={styles.dateText}>{t('promo.dateLabel')}: {dateLine}</Text>
                </View>
              ) : null}
              <RenderHTML
                contentWidth={width - 64}
                source={{ html: promo.text }}
                baseStyle={{
                  fontSize: 15,
                  lineHeight: 23,
                  color: colors.label,
                  textAlign: isRTL ? 'right' : 'left',
                }}
                tagsStyles={{
                  p: { marginBottom: 8, fontWeight: '400' },
                  h2: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
                  h3: { fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 6 },
                  strong: { fontWeight: '700' },
                  b: { fontWeight: '700' },
                  em: { fontStyle: 'italic' },
                  i: { fontStyle: 'italic' },
                  u: { textDecorationLine: 'underline' },
                  s: { textDecorationLine: 'line-through' },
                  strike: { textDecorationLine: 'line-through' },
                }}
                defaultTextProps={{
                  style: {
                    fontSize: 15,
                    lineHeight: 23,
                    color: colors.label,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                }}
              />
            </>
          ) : (
            <>
              <View style={styles.hairline} />
              <Text style={[styles.empty, isRTL && styles.textRTL]}>{t('promo.empty')}</Text>
            </>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  card: {
    ...surfaces.card,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  heroTile: { width: 36, height: 36, borderRadius: 10 },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { ...T.label, fontSize: 16, fontWeight: '800', color: colors.label },
  subtitle: { ...T.caption, marginTop: 2, color: colors.secondaryLabel },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginVertical: 14 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 16 },
  loadingText: { ...T.label, fontWeight: '400', color: colors.secondaryLabel },

  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.subtleBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  datePillRTL: { alignSelf: 'flex-end' },
  dateText: { ...T.captionSmall, color: colors.secondaryLabel, fontWeight: '500', writingDirection: 'ltr' },

  empty: { ...T.label, fontWeight: '400', color: colors.secondaryLabel },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

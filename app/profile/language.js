import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserSettings } from '../../services/databaseService';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

const LOCALES = ['en', 'ru', 'ar'];

export default function LanguageScreen() {
  const router = useRouter();
  const { locale, t, setLocale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight } = useCollapsibleHeader();

  const [saving, setSaving] = useState(false);

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const options = useMemo(() => {
    return [
      { code: 'en', label: t('profile.english') },
      { code: 'ru', label: t('profile.russian') },
      { code: 'ar', label: t('profile.arabic') },
    ];
  }, [t]);

  const apply = async (next) => {
    haptics.selectionTick();
    const nextLocale = String(next || '').toLowerCase();
    if (!LOCALES.includes(nextLocale)) return;

    const prev = locale;
    setSaving(true);
    try {
      await setLocale(nextLocale);
      // Optional: persist to backend user settings if logged in
      if (token) {
        await updateUserSettings(token, { language: nextLocale }).catch(() => null);
      }

      if ((prev === 'ar') !== (nextLocale === 'ar')) {
        Alert.alert(t('profile.restartRequiredTitle'), t('profile.restartRequiredMessage'));
      }
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('profile.language')} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('profile.selectLanguage')}</Text>

          <View style={[styles.card, shadow.card]}>
            {options.map((o, idx) => {
              const active = o.code === locale;
              return (
                <View key={o.code}>
                  {idx > 0 ? <View style={styles.hairline} /> : null}
                  <TouchableOpacity
                    style={[styles.row, isRTL && styles.rowRTL]}
                    onPress={() => apply(o.code)}
                    disabled={saving}
                    activeOpacity={0.6}
                  >
                    <View style={[surfaces.iconTile, { backgroundColor: colors.accent }]}>
                      <Ionicons name="globe" size={17} color={colors.white} />
                    </View>
                    <Text style={[styles.rowLabel, isRTL && styles.textRTL]}>{o.label}</Text>
                    {active ? (
                      <Ionicons name="checkmark" size={20} color={colors.blue} />
                    ) : (
                      <View style={styles.checkPlaceholder} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <Text style={[styles.note, isRTL && styles.textRTL]}>
            {Platform.OS === 'ios' ? t('profile.languageTipIOS') : t('profile.languageTipAndroid')}
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },
  groupHeader: {
    ...T.eyebrow,
    marginHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    paddingHorizontal: 14,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  rowLabel: { ...T.label, fontSize: 16, flex: 1, color: colors.label },
  checkPlaceholder: { width: 20 },
  note: {
    ...T.captionSmall,
    marginHorizontal: 32,
    marginTop: 10,
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchPromo } from '../../services/api';

export default function PromoScreen() {
  const router = useRouter();
  const { locale, t, dir } = useLocalization();
  const isRTL = dir === 'rtl' || locale === 'ar';

  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchPromo(locale).catch(() => null);
      if (!cancelled) {
        setPromo(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [locale]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.navHeader, isRTL && styles.navHeaderRTL]}>
        <TouchableOpacity
          style={[styles.backButton, isRTL && styles.backButtonRTL]}
          onPress={() => router.replace('/profile')}
          activeOpacity={0.7}
        >
          <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#dc2626" />
            <Text style={[styles.backText, isRTL && styles.backTextRTL]} numberOfLines={1}>
              {t('profile.accountTitle')}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.navTitle, isRTL && styles.navTitleRTL]}>{t('promo.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isRTL && styles.cardRTL]}>
          <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
            <View style={styles.iconWrap}>
              <Ionicons name="megaphone-outline" size={20} color="#dc2626" />
            </View>
            <View style={styles.titleWrap}>
              <Text style={[styles.title, isRTL && styles.textRTL]}>{t('promo.infoTitle')}</Text>
              <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('promo.infoSubtitle')}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : promo?.text ? (
            <>
              {dateLine ? (
                <Text style={[styles.date, isRTL && styles.dateRTL]}>
                  {t('promo.dateLabel')}: {dateLine}
                </Text>
              ) : null}
              <Text style={[styles.body, isRTL && styles.textRTL]}>{promo.text}</Text>
            </>
          ) : (
            <Text style={[styles.empty, isRTL && styles.textRTL]}>{t('promo.empty')}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  navHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  navHeaderRTL: { flexDirection: 'row-reverse' },
  backButton: { width: 130 },
  backButtonRTL: { alignItems: 'flex-end' },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  backTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#000' },
  navTitleRTL: { writingDirection: 'rtl' },
  headerSpacer: { width: 130 },

  content: { padding: 16, paddingBottom: 40 },
  card: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardRTL: {},
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 2, fontSize: 13, color: '#6B7280' },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  date: { fontSize: 12, color: '#6B7280', marginBottom: 10, writingDirection: 'ltr', textAlign: 'left' },
  dateRTL: { textAlign: 'right' },
  body: { fontSize: 15, lineHeight: 22, color: '#111827' },
  empty: { fontSize: 14, color: '#6B7280' },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});



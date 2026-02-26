import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserSettings } from '../../services/databaseService';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';

const LOCALES = ['en', 'ru', 'ar'];

export default function LanguageScreen() {
  const router = useRouter();
  const { locale, t, setLocale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';

  const [saving, setSaving] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/profile')} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('profile.language')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('profile.selectLanguage')}</Text>

        {options.map((o) => {
          const active = o.code === locale;
          return (
            <TouchableOpacity
              key={o.code}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => apply(o.code)}
              disabled={saving}
              activeOpacity={0.85}
            >
              <View style={[styles.rowInner, isRTL && styles.rowInnerRTL]}>
                <Text style={[styles.rowText, isRTL && styles.textRTL, active && styles.rowTextActive]}>{o.label}</Text>
                {active ? <Ionicons name="checkmark" size={18} color="#27AE60" /> : <View style={{ width: 18 }} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.note, isRTL && styles.textRTL]}>
          {Platform.OS === 'ios' ? t('profile.languageTipIOS') : t('profile.languageTipAndroid')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backButton: { padding: 4, width: 130 },
  backButtonRTL: { alignItems: 'flex-end' },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { ...T.link, color: '#dc2626' },
  backTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
  headerTitle: { ...T.body, fontWeight: '700', color: '#1D1D1F' },
  headerSpacer: { width: 130 },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  subtitle: { ...T.label, fontWeight: '700', color: '#1D1D1F', marginBottom: 12 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInnerRTL: {
    flexDirection: 'row-reverse',
  },
  rowActive: {
    borderColor: '#27AE60',
    backgroundColor: '#F0FFF4',
  },
  rowText: { ...T.bodySmall, fontWeight: '600', color: '#1D1D1F' },
  rowTextActive: { color: '#14532D' },
  note: { ...T.captionSmall, marginTop: 8, color: '#8E8E93', lineHeight: 18 },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});






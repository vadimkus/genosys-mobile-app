import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserSettings } from '../../services/databaseService';

const LOCALES = ['en', 'ru', 'ar'];

export default function LanguageScreen() {
  const router = useRouter();
  const { locale, t, setLocale } = useLocalization();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.language')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>{t('profile.selectLanguage')}</Text>

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
              <Text style={[styles.rowText, active && styles.rowTextActive]}>{o.label}</Text>
              {active ? <Ionicons name="checkmark" size={18} color="#27AE60" /> : <View style={{ width: 18 }} />}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.note}>
          {Platform.OS === 'ios' ? 'Tip: iOS may require a restart for full RTL layout.' : 'Tip: Android may require a restart for full RTL layout.'}
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1F' },
  headerSpacer: { width: 28 },
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  subtitle: { fontSize: 14, fontWeight: '700', color: '#1D1D1F', marginBottom: 12 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  rowActive: {
    borderColor: '#27AE60',
    backgroundColor: '#F0FFF4',
  },
  rowText: { fontSize: 15, fontWeight: '600', color: '#1D1D1F' },
  rowTextActive: { color: '#14532D' },
  note: { marginTop: 8, fontSize: 12, color: '#8E8E93', lineHeight: 18 },
});





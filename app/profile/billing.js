import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBilling, updateUserBilling } from '../../services/databaseService';
import T from '../../utils/typography';

export default function BillingScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const token = user?.token || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getUserBilling(token);
        const data = res?.data?.data || res?.data || {};
        if (!cancelled) {
          setBillingAddress(String(data?.billingAddress || '').trim());
          setVatNumber(String(data?.vatNumber || '').trim());
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    if (saving) return;
    setSaving(true);
    try {
      const res = await updateUserBilling(token, {
        billingAddress: billingAddress.trim() || null,
        vatNumber: vatNumber.trim() || null,
      });
      if (!res?.success) {
        Alert.alert(t('common.error'), res?.error || t('billing.saveFailed'));
        return;
      }
      Alert.alert(t('common.done'), t('billing.saved'), [{ text: t('common.ok'), onPress: () => router.back() }]);
    } catch {
      Alert.alert(t('common.error'), t('billing.saveFailed'));
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
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('billing.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#dc2626" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: (insets?.bottom || 0) + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('billing.addressLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textarea, isRTL && styles.inputRTL]}
            value={billingAddress}
            onChangeText={setBillingAddress}
            placeholder={t('billing.addressPlaceholder')}
            multiline
          />

          <Text style={[styles.label, { marginTop: 16 }, isRTL && styles.textRTL]}>{t('billing.vatLabel')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL, isRTL && styles.inputValueLTR]}
            value={vatNumber}
            onChangeText={setVatNumber}
            placeholder={t('billing.vatPlaceholder')}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{t('common.save')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backButton: { padding: 4 },
  headerTitle: { ...T.sectionTitleSmall, flex: 1, textAlign: 'center', color: '#000' },
  headerSpacer: { width: 32 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  label: { ...T.label, fontWeight: '700', color: '#111827', marginBottom: 8 },
  input: {
    ...T.input,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    color: '#111827',
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  inputRTL: { writingDirection: 'rtl', textAlign: 'right' },
  inputValueLTR: { writingDirection: 'ltr' },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { ...T.button, fontWeight: '700' },
});



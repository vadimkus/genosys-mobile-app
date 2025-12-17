import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBilling, updateUserBilling } from '../../services/databaseService';

export default function BillingScreen() {
  const router = useRouter();
  const { t } = useLocalization();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('billing.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#E74C3C" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: (insets?.bottom || 0) + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>{t('billing.addressLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={billingAddress}
            onChangeText={setBillingAddress}
            placeholder={t('billing.addressPlaceholder')}
            multiline
          />

          <Text style={[styles.label, { marginTop: 16 }]}>{t('billing.vatLabel')}</Text>
          <TextInput
            style={styles.input}
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
  backButton: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#000' },
  headerSpacer: { width: 32 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#E74C3C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});



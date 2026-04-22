import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import PrivacyPolicyContent from '../../components/PrivacyPolicyContent';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); }} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('privacy.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <PrivacyPolicyContent showLastUpdated />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header matches the standard profile-stack convention
  // (addresses.js, edit.js, terms.js, contact.js, etc.).
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backButton: { padding: 4 },
  headerTitle: {
    ...T.sectionTitleSmall,
    color: '#000000',
  },
  headerSpacer: { width: 32 },
  textRTL: { writingDirection: 'rtl', textAlign: 'center' },
  // Body styles moved to `components/PrivacyPolicyContent`
});
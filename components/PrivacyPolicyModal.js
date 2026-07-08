import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import T from '../utils/typography';

export default function PrivacyPolicyModal({ visible, onClose, showCloseButton = true }) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  // Insets from context, not SafeAreaView: native measurement inside a Modal
  // is unreliable on first open (same race as the image lightbox close button).
  // iOS pageSheet already sits below the status bar → no top inset needed;
  // Android renders modals full-screen/edge-to-edge → pad by the real inset.
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'ios' ? 0 : insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('privacy.title')}</Text>
          {showCloseButton && (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, isRTL && styles.closeButtonRTL]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={24} color="#86868B" />
            </TouchableOpacity>
          )}
        </View>
        <PrivacyPolicyContent showLastUpdated={false} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  headerTitle: {
    ...T.sectionTitleSmall,
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    end: 16,
    zIndex: 1,
  },
  closeButtonRTL: {
    // `end` already mirrors; keep for clarity/override if needed later
  },
  textRTL: { writingDirection: 'rtl', textAlign: 'center' },
  // Body styles moved to `components/PrivacyPolicyContent`
});


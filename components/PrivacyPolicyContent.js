import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';

export default function PrivacyPolicyContent({ showLastUpdated = true }) {
  const { t } = useLocalization();

  const lastUpdated = useMemo(() => 'December 13, 2025', []);

  const handleEmailPress = () => {
    Linking.openURL('mailto:sales@genosys.ae');
  };

  const handleGooglePrivacyPress = () => {
    Linking.openURL('https://policies.google.com/privacy');
  };

  const handlePrivacyPolicyPress = () => {
    const url = AUTH_CONFIG?.PRIVACY_POLICY_URL || 'https://genosys.ae/privacy-policy';
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {showLastUpdated && (
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>{t('privacy.lastUpdated', { date: lastUpdated })}</Text>
        </View>
      )}

      {/* Privacy Rights Section */}
      <View style={styles.highlightSection}>
        <Text style={styles.highlightTitle}>Your Privacy Rights</Text>
        <Text style={styles.highlightText}>
          As a registered user, you have the right to access, update, or delete your personal information.
          This section outlines how we handle your data and your rights under our privacy policy.
        </Text>
      </View>

      {/* Personal Information We Collect */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Personal Information We Collect</Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>Account Information:</Text>
            <Text style={styles.listItemText}>Name, email, phone number, address</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>Profile Data:</Text>
            <Text style={styles.listItemText}>Birthday, profile picture, customer preferences</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>Order Information:</Text>
            <Text style={styles.listItemText}>Purchase history, shipping addresses, payment details</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>Usage Data:</Text>
            <Text style={styles.listItemText}>Website interactions, page views, session data</Text>
          </View>
        </View>
      </View>

      {/* Google Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Google Authentication (OAuth)</Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>Google Sign-In:</Text>
          <Text style={styles.subSectionText}>
            When you sign in with Google, we receive your basic profile information (name, email, profile picture)
            from Google according to your Google account privacy settings.
          </Text>
        </View>
        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>Data Shared:</Text>
          <Text style={styles.subSectionText}>
            We only receive information that you have made publicly available in your Google profile or that you
            explicitly consent to share during the authentication process.
          </Text>
        </View>
        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>Google Privacy:</Text>
          <Text style={styles.subSectionText}>
            Google's use of your information is governed by their privacy policy. You can review it at:{' '}
            <Text style={styles.link} onPress={handleGooglePrivacyPress}>
              https://policies.google.com/privacy
            </Text>
          </Text>
        </View>
      </View>

      {/* Genosys Privacy Policy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genosys Privacy Policy</Text>
        <Text style={styles.paragraph}>
          You can review the Genosys Privacy Policy here:{' '}
          <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
            {AUTH_CONFIG?.PRIVACY_POLICY_URL || 'https://genosys.ae/privacy-policy'}
          </Text>
        </Text>
      </View>

      {/* Contact Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </Text>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#E74C3C" />
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactLink}>sales@genosys.ae</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color="#E74C3C" />
            <Text style={styles.contactText}>+971 58 548 76 65</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color="#E74C3C" />
            <Text style={styles.contactText}>
              Boulevard Plaza Tower 2, Floor 22{'\n'}
              Mohammed Bin Rashid Boulevard{'\n'}
              Downtown, Dubai, UAE
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Space */}
      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  updateInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  updateText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  highlightSection: {
    backgroundColor: '#FFF3F3',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  highlightTitle: { fontSize: 18, fontWeight: '700', color: '#E74C3C', marginBottom: 8 },
  highlightText: { fontSize: 16, lineHeight: 24, color: '#333' },
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F', marginBottom: 12 },
  paragraph: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
  listContainer: { marginVertical: 8 },
  listItem: { marginBottom: 12, paddingLeft: 16 },
  listItemLabel: { fontSize: 16, fontWeight: '600', color: '#1D1D1F', marginBottom: 4 },
  listItemText: { fontSize: 16, lineHeight: 22, color: '#333' },
  subSection: { marginBottom: 16, paddingLeft: 16 },
  subSectionLabel: { fontSize: 16, fontWeight: '600', color: '#1D1D1F', marginBottom: 4 },
  subSectionText: { fontSize: 16, lineHeight: 22, color: '#333' },
  contactInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingLeft: 4 },
  contactLink: {
    fontSize: 16,
    color: '#E74C3C',
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  contactText: { fontSize: 16, color: '#333', marginLeft: 8, flex: 1, lineHeight: 22 },
  link: { color: '#E74C3C', textDecorationLine: 'underline' },
  footerSpace: { height: 40 },
});



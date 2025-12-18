import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';

export default function PrivacyPolicyContent({ showLastUpdated = true }) {
  const { t } = useLocalization();

  const lastUpdated = t('privacy.lastUpdatedDate');
  const email = t('contact.emailValue') || 'sales@genosys.ae';
  const phoneDisplay = t('contact.phoneDisplay') || '+971 58 548 76 65';
  const location = t('contact.locationValue') || 'Dubai, UAE';
  const genosysPrivacyUrl = AUTH_CONFIG?.PRIVACY_POLICY_URL || 'https://genosys.ae/privacy-policy';
  const googlePrivacyUrl = 'https://policies.google.com/privacy';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleGooglePrivacyPress = () => {
    Linking.openURL(googlePrivacyUrl);
  };

  const handlePrivacyPolicyPress = () => {
    Linking.openURL(genosysPrivacyUrl);
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
        <Text style={styles.highlightTitle}>{t('privacy.rightsTitle')}</Text>
        <Text style={styles.highlightText}>{t('privacy.rightsText')}</Text>
      </View>

      {/* Personal Information We Collect */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.sections.personalInfo.title')}</Text>
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>{t('privacy.sections.personalInfo.accountLabel')}</Text>
            <Text style={styles.listItemText}>{t('privacy.sections.personalInfo.accountText')}</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>{t('privacy.sections.personalInfo.profileLabel')}</Text>
            <Text style={styles.listItemText}>{t('privacy.sections.personalInfo.profileText')}</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>{t('privacy.sections.personalInfo.orderLabel')}</Text>
            <Text style={styles.listItemText}>{t('privacy.sections.personalInfo.orderText')}</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listItemLabel}>{t('privacy.sections.personalInfo.usageLabel')}</Text>
            <Text style={styles.listItemText}>{t('privacy.sections.personalInfo.usageText')}</Text>
          </View>
        </View>
      </View>

      {/* Google Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.sections.google.title')}</Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>{t('privacy.sections.google.signInLabel')}</Text>
          <Text style={styles.subSectionText}>{t('privacy.sections.google.signInText')}</Text>
        </View>
        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>{t('privacy.sections.google.sharedLabel')}</Text>
          <Text style={styles.subSectionText}>{t('privacy.sections.google.sharedText')}</Text>
        </View>
        <View style={styles.subSection}>
          <Text style={styles.subSectionLabel}>{t('privacy.sections.google.privacyLabel')}</Text>
          <Text style={styles.subSectionText}>
            {t('privacy.sections.google.privacyPrefix')}{' '}
            <Text style={styles.link} onPress={handleGooglePrivacyPress}>
              {googlePrivacyUrl}
            </Text>
          </Text>
        </View>
      </View>

      {/* Genosys Privacy Policy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.sections.genosys.title')}</Text>
        <Text style={styles.paragraph}>
          {t('privacy.sections.genosys.prefix')}{' '}
          <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
            {genosysPrivacyUrl}
          </Text>
        </Text>
      </View>

      {/* Contact Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('privacy.sections.contact.title')}</Text>
        <Text style={styles.paragraph}>{t('privacy.sections.contact.text')}</Text>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#E74C3C" />
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactLink}>{email}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color="#E74C3C" />
            <Text style={styles.contactText}>{phoneDisplay}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color="#E74C3C" />
            <Text style={styles.contactText}>{location}</Text>
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



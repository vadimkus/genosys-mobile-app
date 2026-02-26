import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';
import T from '../utils/typography';

export default function PrivacyPolicyContent({ showLastUpdated = true }) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const lastUpdated = t('privacy.lastUpdatedDate');
  const email = t('contact.emailValue') || 'sales@genosys.ae';
  const phoneDisplay = t('contact.phoneDisplay') || '+971 58 548 76 65';
  const location = t('contact.locationValue') || 'Dubai, UAE';
  const genosysPrivacyUrl = AUTH_CONFIG?.PRIVACY_POLICY_URL || 'https://genosys.ae/privacy-policy';
  const googlePrivacyUrl = 'https://policies.google.com/privacy';
  const applePrivacyUrl = 'https://www.apple.com/legal/privacy/';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleGooglePrivacyPress = () => {
    Linking.openURL(googlePrivacyUrl);
  };

  const handleApplePrivacyPress = () => {
    Linking.openURL(applePrivacyUrl);
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
          <Text style={[styles.updateText, isRTL && styles.textRTL]}>{t('privacy.lastUpdated', { date: lastUpdated })}</Text>
        </View>
      )}

      {/* Privacy Rights Section */}
      <View style={[styles.highlightSection, isRTL && styles.highlightSectionRTL]}>
        <Text style={[styles.highlightTitle, isRTL && styles.textRTL]}>{t('privacy.rightsTitle')}</Text>
        <Text style={[styles.highlightText, isRTL && styles.textRTL]}>{t('privacy.rightsText')}</Text>
      </View>

      {/* Personal Information We Collect */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.title')}</Text>
        <View style={styles.listContainer}>
          <View style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listItemLabel, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.accountLabel')}</Text>
            <Text style={[styles.listItemText, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.accountText')}</Text>
          </View>
          <View style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listItemLabel, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.profileLabel')}</Text>
            <Text style={[styles.listItemText, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.profileText')}</Text>
          </View>
          <View style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listItemLabel, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.orderLabel')}</Text>
            <Text style={[styles.listItemText, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.orderText')}</Text>
          </View>
          <View style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listItemLabel, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.usageLabel')}</Text>
            <Text style={[styles.listItemText, isRTL && styles.textRTL]}>{t('privacy.sections.personalInfo.usageText')}</Text>
          </View>
        </View>
      </View>

      {/* Google Authentication */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('privacy.sections.google.title')}</Text>

        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.google.signInLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>{t('privacy.sections.google.signInText')}</Text>
        </View>
        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.google.sharedLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>{t('privacy.sections.google.sharedText')}</Text>
        </View>
        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.google.privacyLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>
            {t('privacy.sections.google.privacyPrefix')}{' '}
            <Text style={styles.link} onPress={handleGooglePrivacyPress}>
              {googlePrivacyUrl}
            </Text>
          </Text>
        </View>
      </View>

      {/* Apple Authentication */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('privacy.sections.apple.title')}</Text>

        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.apple.signInLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>{t('privacy.sections.apple.signInText')}</Text>
        </View>
        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.apple.sharedLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>{t('privacy.sections.apple.sharedText')}</Text>
        </View>
        <View style={[styles.subSection, isRTL && styles.subSectionRTL]}>
          <Text style={[styles.subSectionLabel, isRTL && styles.textRTL]}>{t('privacy.sections.apple.privacyLabel')}</Text>
          <Text style={[styles.subSectionText, isRTL && styles.textRTL]}>
            {t('privacy.sections.apple.privacyPrefix')}{' '}
            <Text style={styles.link} onPress={handleApplePrivacyPress}>
              {applePrivacyUrl}
            </Text>
          </Text>
        </View>
      </View>

      {/* Genosys Privacy Policy */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('privacy.sections.genosys.title')}</Text>
        <Text style={[styles.paragraph, isRTL && styles.textRTL]}>
          {t('privacy.sections.genosys.prefix')}{' '}
          <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
            {genosysPrivacyUrl}
          </Text>
        </Text>
      </View>

      {/* Contact Us */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('privacy.sections.contact.title')}</Text>
        <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{t('privacy.sections.contact.text')}</Text>

        <View style={styles.contactInfo}>
          <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
            <Ionicons name="mail-outline" size={16} color="#dc2626" />
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={[styles.contactLink, isRTL && styles.valueLTR]}>{email}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
            <Ionicons name="call-outline" size={16} color="#dc2626" />
            <Text style={[styles.contactText, isRTL && styles.valueLTR]}>{phoneDisplay}</Text>
          </View>
          <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
            <Ionicons name="location-outline" size={16} color="#dc2626" />
            <Text style={[styles.contactText, isRTL && styles.textRTL]}>{location}</Text>
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
  updateText: { ...T.label, fontWeight: '400', color: '#666', fontStyle: 'italic' },
  highlightSection: {
    backgroundColor: '#FFF3F3',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  highlightSectionRTL: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#dc2626',
  },
  highlightTitle: { ...T.sectionTitleSmall, color: '#dc2626', marginBottom: 8 },
  highlightText: { ...T.body, color: '#333' },
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { ...T.sectionTitleSmall, fontWeight: '600', marginBottom: 12 },
  paragraph: { ...T.body, color: '#333', marginBottom: 16 },
  listContainer: { marginVertical: 8 },
  listItem: { marginBottom: 12, paddingStart: 16 },
  listItemRTL: { paddingStart: 16 },
  listItemLabel: { ...T.button, color: '#1D1D1F', marginBottom: 4 },
  listItemText: { ...T.body, color: '#333', lineHeight: 22 },
  subSection: { marginBottom: 16, paddingStart: 16 },
  subSectionRTL: { paddingStart: 16 },
  subSectionLabel: { ...T.button, color: '#1D1D1F', marginBottom: 4 },
  subSectionText: { ...T.body, color: '#333', lineHeight: 22 },
  contactInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingStart: 4 },
  contactLink: {
    ...T.body,
    color: '#dc2626',
    lineHeight: undefined,
    textDecorationLine: 'underline',
    marginStart: 8,
  },
  contactText: { ...T.body, color: '#333', lineHeight: 22, marginStart: 8, flex: 1 },
  link: { ...T.link, color: '#dc2626', textDecorationLine: 'underline' },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
  footerSpace: { height: 40 },
});



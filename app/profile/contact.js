import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';
import * as haptics from '../../utils/haptics';

export default function ContactScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const WHATSAPP_NUMBER = String(AUTH_CONFIG.WHATSAPP_NUMBER || '971585487665').replace(/[^\d]/g, '');
  const PHONE_DISPLAY = t('contact.phoneDisplay');
  const EMAIL = 'sales@genosys.ae';
  const WEBSITE = 'https://genosys.ae';
  const INSTAGRAM = 'https://instagram.com/genosys.uae';
  const FACEBOOK = 'https://facebook.com/genosys.ae';
  const MAP_URL = 'https://maps.google.com/?q=' + encodeURIComponent('Cordoba Residence, E02, Dubai, UAE');



  const contactMethods = [
    {
      id: 'whatsapp',
      title: t('contact.methodWhatsappTitle'),
      value: PHONE_DISPLAY,
      icon: 'logo-whatsapp',
      description: t('contact.methodWhatsappDesc'),
      action: () => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`),
    },
    {
      id: 'phone',
      title: t('contact.methodPhoneTitle'),
      value: PHONE_DISPLAY,
      icon: 'call',
      description: t('contact.methodPhoneDesc'),
      action: () => Linking.openURL(`tel:+${WHATSAPP_NUMBER}`),
    },
    {
      id: 'email',
      title: t('contact.methodEmailTitle'),
      value: EMAIL,
      icon: 'mail',
      description: t('contact.methodEmailDesc'),
      action: () => Linking.openURL(`mailto:${EMAIL}`),
    },
    {
      id: 'website',
      title: t('contact.methodWebsiteTitle'),
      value: 'genosys.ae',
      icon: 'globe',
      description: t('contact.methodWebsiteDesc'),
      action: () => Linking.openURL(WEBSITE),
    },
    {
      id: 'instagram',
      title: t('contact.methodInstagramTitle'),
      value: '@genosys.uae',
      icon: 'logo-instagram',
      description: t('contact.methodInstagramDesc'),
      action: () => Linking.openURL(INSTAGRAM),
    },
    {
      id: 'facebook',
      title: t('contact.methodFacebookTitle'),
      value: 'genosys.ae',
      icon: 'logo-facebook',
      description: t('contact.methodFacebookDesc'),
      action: () => Linking.openURL(FACEBOOK),
    },
    {
      id: 'location',
      title: t('contact.methodVisitTitle'),
      value: t('contact.locationValue'),
      icon: 'location',
      description: t('contact.methodVisitDesc'),
      action: () => Linking.openURL(MAP_URL),
    },
  ];

  const ContactMethodCard = ({ method }) => (
    <TouchableOpacity style={[styles.contactCard, isRTL && styles.contactCardRTL]} onPress={() => { haptics.lightTap(); method.action(); }}>
      <View style={styles.contactIcon}>
        <Ionicons name={method.icon} size={24} color={method.icon === 'logo-whatsapp' ? '#25D366' : '#dc2626'} />
      </View>
      <View style={[styles.contactDetails, isRTL && styles.contactDetailsRTL]}>
        <Text style={[styles.contactTitle, isRTL && styles.textRTL]}>{method.title}</Text>
        <Text style={[styles.contactValue, isRTL && styles.valueLTR]}>{method.value}</Text>
        <Text style={[styles.contactDescription, isRTL && styles.textRTL]}>{method.description}</Text>
      </View>
      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.replace('/profile')} style={[styles.backButton, isRTL && styles.backButtonRTL]}>
          <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
            <Text style={[styles.backText, isRTL && styles.backTextRTL]} numberOfLines={1}>
              {t('profile.accountTitle')}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('contact.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t('contact.companyName')}</Text>
          <View style={[styles.countryRow, I18nManager.isRTL && styles.countryRowRtl]}>
            <Text style={styles.flagText}>🇦🇪</Text>
            <Text style={[styles.countryText, isRTL && styles.textRTL]}>{t('contact.country')}</Text>
            <View>
              <Ionicons name="heart" size={14} color="#dc2626" />
            </View>
          </View>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('contact.contactMethods')}</Text>
          {contactMethods.map((method, index) => (
            <ContactMethodCard key={`${method.id}-${index}`} method={method} />
          ))}
        </View>

        {/* Official Distributor in the UAE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('contact.officialDistributorTitle')}</Text>
          <View style={styles.distributorCard}>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>{t('contact.officialDistributorLine1')}</Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>{t('contact.officialDistributorLine2')}</Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL, { marginTop: 6 }]}>
              <Ionicons name="document-text" size={18} color="#8E8E93" />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.licenseLabel')} {t('contact.licenseValue')}
              </Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="document-text" size={18} color="#8E8E93" />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.companyLicenseLabel')} {t('contact.companyLicenseValue')}
              </Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="document-text" size={18} color="#8E8E93" />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.trnLabel')} {t('contact.trnValue')}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    padding: 4,
    width: 130,
  },
  backButtonRTL: { alignItems: 'flex-end' },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  backTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: { width: 130 },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  logo: {
    width: 240,
    height: 72,
    marginBottom: 14,
  },
  countryRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countryRowRtl: {
    flexDirection: 'row-reverse',
  },
  flagText: {
    fontSize: 14,
  },
  countryText: {
    fontSize: 16,
    color: '#8E8E93',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  // Contact Cards
  contactCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactCardRTL: {
    flexDirection: 'row-reverse',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactDetailsRTL: {
    alignItems: 'flex-end',
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },

  distributorCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  distributorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  distributorText: {
    fontSize: 15,
    color: '#000000',
    marginStart: 10,
    flex: 1,
    lineHeight: 20,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  valueLTR: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },

  // Form
  formContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Office Section
  officeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  officeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  officeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  officeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  mapButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  officeDetails: {
    gap: 12,
  },
  officeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  officeText: {
    fontSize: 15,
    color: '#8E8E93',
    marginStart: 8,
    flex: 1,
    lineHeight: 20,
  },

  // FAQ Section
  faqSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  faqCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  faqDetails: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  faqSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },

  // Response Notice
  responseNotice: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  responseText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

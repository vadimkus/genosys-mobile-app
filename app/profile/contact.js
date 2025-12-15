import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';

export default function ContactScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: 'sales@genosys.ae',
  });

  const handleSendMessage = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert(t('contact.missingInfoTitle'), t('contact.missingInfoMessage'));
      return;
    }

    Alert.alert(
      t('contact.messageSentTitle'),
      t('contact.messageSentText'),
      [
        { text: t('contact.ok'), onPress: () => router.back() }
      ]
    );
  };

  const contactMethods = [
    {
      id: 'phone',
      title: t('contact.methodPhoneTitle'),
      value: '+971 58 548 76 65',
      icon: 'call',
      description: t('contact.methodPhoneDesc'),
      action: () => Linking.openURL('tel:+971585487665'),
    },
    {
      id: 'email',
      title: t('contact.methodEmailTitle'),
      value: 'sales@genosys.ae',
      icon: 'mail',
      description: t('contact.methodEmailDesc'),
      action: () => Linking.openURL('mailto:sales@genosys.ae'),
    },
    {
      id: 'whatsapp',
      title: t('contact.methodWhatsappTitle'),
      value: '+971 58 548 76 65',
      icon: 'logo-whatsapp',
      description: t('contact.methodWhatsappDesc'),
      action: () => Linking.openURL('https://wa.me/971585487665'),
    },
    {
      id: 'address',
      title: t('contact.methodVisitTitle'),
      value: t('contact.methodVisitValue'),
      icon: 'location',
      description: t('contact.methodVisitDesc'),
      action: () => Linking.openURL('https://maps.google.com/?q=Dubai+Marina,UAE'),
    },
  ];

  const ContactMethodCard = ({ method }) => (
    <TouchableOpacity style={styles.contactCard} onPress={method.action}>
      <View style={styles.contactIcon}>
        <Ionicons name={method.icon} size={24} color="#E74C3C" />
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactValue}>{method.value}</Text>
        <Text style={styles.contactDescription}>{method.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('contact.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="chatbubbles" size={48} color="#E74C3C" />
          </View>
          <Text style={styles.heroTitle}>{t('contact.hero')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('contact.heroSubtitle')}
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contact.contactMethods')}</Text>
          {contactMethods.map((method) => (
            <ContactMethodCard key={method.id} method={method} />
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contact.sendMessage')}</Text>
          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('contact.yourEmail')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder={t('contact.emailPlaceholder')}
                keyboardType="email-address"
                editable={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('contact.subjectRequired')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.subject}
                onChangeText={(text) => setFormData({...formData, subject: text})}
                placeholder={t('contact.subjectPlaceholder')}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{t('contact.messageRequired')}</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={formData.message}
                onChangeText={(text) => setFormData({...formData, message: text})}
                placeholder={t('contact.messagePlaceholder')}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>{t('contact.send')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Office Information */}
        <View style={styles.officeSection}>
          <Text style={styles.sectionTitle}>{t('contact.office')}</Text>
          <View style={styles.officeCard}>
            <View style={styles.officeHeader}>
              <Text style={styles.officeTitle}>{t('contact.hq')}</Text>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => Linking.openURL('https://maps.google.com/?q=Dubai+Marina,UAE')}
              >
                <Text style={styles.mapButtonText}>{t('contact.viewMap')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.officeDetails}>
              <View style={styles.officeItem}>
                <Ionicons name="location" size={16} color="#8E8E93" />
                <Text style={styles.officeText}>{t('contact.officeLocation')}</Text>
              </View>
              <View style={styles.officeItem}>
                <Ionicons name="time" size={16} color="#8E8E93" />
                <Text style={styles.officeText}>{t('contact.officeHours')}</Text>
              </View>
              <View style={styles.officeItem}>
                <Ionicons name="car" size={16} color="#8E8E93" />
                <Text style={styles.officeText}>{t('contact.parking')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQ Link */}
        <View style={styles.faqSection}>
          <TouchableOpacity 
            style={styles.faqCard}
            onPress={() => router.push('/profile/help')}
          >
            <View style={styles.faqIcon}>
              <Ionicons name="help-circle" size={24} color="#27AE60" />
            </View>
            <View style={styles.faqDetails}>
              <Text style={styles.faqTitle}>{t('contact.checkFaq')}</Text>
              <Text style={styles.faqSubtitle}>{t('contact.faqSubtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Response Time Notice */}
        <View style={styles.responseNotice}>
          <Text style={styles.responseText}>
            {t('contact.responseTimeNote')}
          </Text>
        </View>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#8E8E93',
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
    backgroundColor: '#E74C3C',
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
    backgroundColor: '#E74C3C',
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
    marginLeft: 8,
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

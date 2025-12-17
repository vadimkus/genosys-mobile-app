import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [returnExpanded, setReturnExpanded] = useState(false);

  // Local palette (Help screen previously referenced an undefined `colors` object, causing a crash).
  const colors = {
    primary: '#E74C3C',
    text: '#000000',
    textSecondary: '#8E8E93',
    textMuted: '#C7C7CC',
    card: '#F2F2F7',
    card2: '#ffffff',
    borderSubtle: '#E5E5EA',
  };

  const handleReturnItem = async () => {
    const name = String(user?.name || '').trim();
    const phone = String(user?.phone || '').trim();
    const subject = t('help.returnEmailSubject');
    const body = t('help.returnEmailBody', { name, phone });

    const url = `mailto:sales@genosys.ae?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('common.error'), t('help.couldNotOpenEmail'));
      return;
    }
    await Linking.openURL(url);
  };

  const faqData = [
    { id: 1, question: t('help.faqItems.q1'), answer: t('help.faqItems.a1') },
    { id: 2, question: t('help.faqItems.q2'), answer: t('help.faqItems.a2') },
    { id: 3, question: t('help.faqItems.q3'), answer: t('help.faqItems.a3') },
    { id: 4, question: t('help.faqItems.q4'), answer: t('help.faqItems.a4') },
    { id: 5, question: t('help.faqItems.q5'), answer: t('help.faqItems.a5') },
    { id: 6, question: t('help.faqItems.q6'), answer: t('help.faqItems.a6') },
    { id: 7, question: t('help.faqItems.q7'), answer: t('help.faqItems.a7') },
    { id: 8, question: t('help.faqItems.q8'), answer: t('help.faqItems.a8') },
    { id: 9, question: t('help.faqItems.q9'), answer: t('help.faqItems.a9') },
    { id: 10, question: t('help.faqItems.q10'), answer: t('help.faqItems.a10') },
    { id: 11, question: t('help.faqItems.q11'), answer: t('help.faqItems.a11') },
    { id: 12, question: t('help.faqItems.q12'), answer: t('help.faqItems.a12') },
    { id: 13, question: t('help.faqItems.q13'), answer: t('help.faqItems.a13') },
    { id: 14, question: t('help.faqItems.q14'), answer: t('help.faqItems.a14') },
    { id: 15, question: t('help.faqItems.q15'), answer: t('help.faqItems.a15') },
    { id: 16, question: t('help.faqItems.q16'), answer: t('help.faqItems.a16') },
    { id: 17, question: t('help.faqItems.q17'), answer: t('help.faqItems.a17') },
  ];

  const supportOptions = [
    {
      id: 'email',
      title: t('help.support.emailTitle'),
      subtitle: t('help.support.emailSubtitle'),
      description: 'sales@genosys.ae',
      icon: 'mail',
      action: () => Linking.openURL('mailto:sales@genosys.ae'),
    },
    {
      id: 'phone',
      title: t('help.support.phoneTitle'),
      subtitle: t('help.support.phoneSubtitle'),
      description: '+971 58 548 76 65',
      icon: 'call',
      action: () => Linking.openURL('tel:+971585487665'),
    },
    {
      id: 'whatsapp',
      title: t('help.support.whatsappTitle'),
      subtitle: t('help.support.whatsappSubtitle'),
      description: '+971 58 548 76 65',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/971585487665'),
    },
  ];

  const handleFaqPress = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const SupportOptionCard = ({ option }) => (
    <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]} onPress={option.action}>
      <View style={[styles.supportIcon, { backgroundColor: colors.card2 }]}>
        <Ionicons name={option.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.supportDetails}>
        <Text style={[styles.supportTitle, { color: colors.text }]}>{option.title}</Text>
        <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
        <Text style={[styles.supportDescription, { color: colors.primary }]}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const FaqItem = ({ faq }) => (
    <View style={[styles.faqItem, { borderBottomColor: colors.borderSubtle }]}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => handleFaqPress(faq.id)}
      >
        <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.question}</Text>
        <Ionicons 
          name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      
      {expandedFaq === faq.id && (
        <View style={[styles.faqAnswer, { backgroundColor: colors.card }]}>
          <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('help.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t('help.hero')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('help.heroSubtitle')}
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.contactUs')}</Text>
          {supportOptions.map((option) => (
            <SupportOptionCard key={option.id} option={option} />
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.faqTitle')}</Text>
          <View style={styles.faqContainer}>
            {faqData.map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/profile/orders')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={24} color="#27AE60" />
              </View>
              <Text style={styles.quickActionTitle}>{t('help.trackOrder')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.quickActionCard,
                returnExpanded && styles.quickActionCardExpanded,
              ]}
              onPress={() => setReturnExpanded((v) => !v)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.returnChevronWrap,
                  I18nManager.isRTL ? { left: 10, right: undefined } : { right: 10, left: undefined },
                ]}
              >
                <Ionicons
                  name={returnExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#8E8E93"
                />
              </View>
              <View style={styles.quickActionIcon}>
                <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionTitle}>{t('help.returnItem')}</Text>

              {returnExpanded ? (
                <View style={styles.returnChecklistWrap}>
                  <Text style={styles.returnChecklistTitle}>{t('help.returnChecklistTitle')}</Text>
                  <View style={styles.returnChecklistList}>
                    <View style={styles.returnChecklistItem}>
                      <Text style={styles.returnBullet}>•</Text>
                      <Text style={styles.returnChecklistText}>{t('help.returnChecklist1')}</Text>
                    </View>
                    <View style={styles.returnChecklistItem}>
                      <Text style={styles.returnBullet}>•</Text>
                      <Text style={styles.returnChecklistText}>{t('help.returnChecklist2')}</Text>
                    </View>
                    <View style={styles.returnChecklistItem}>
                      <Text style={styles.returnBullet}>•</Text>
                      <Text style={styles.returnChecklistText}>{t('help.returnChecklist3')}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.returnEmailButton}
                    onPress={handleReturnItem}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail-outline" size={16} color="#ffffff" />
                    <Text style={styles.returnEmailButtonText}>{t('help.emailSales')}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Linking.openURL('https://wa.me/971585487665')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="logo-whatsapp" size={24} color="#27AE60" />
              </View>
              <Text style={styles.quickActionTitle}>{t('help.whatsappSupport')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert(t('help.alerts.productGuideTitle'), t('help.alerts.productGuideSoon'))}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="book-outline" size={24} color="#AF52DE" />
              </View>
              <Text style={styles.quickActionTitle}>{t('help.productGuide')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.businessHoursSection}>
          <Text style={styles.businessHoursTitle}>{t('help.serviceHours')}</Text>
          <View style={styles.businessHoursCard}>
            <View style={styles.businessHoursItem}>
              <Text style={styles.dayText}>{t('help.everyDay')}</Text>
              <Text style={styles.hoursText}>{t('help.everyDayHours')}</Text>
            </View>
          </View>
          <Text style={styles.timezoneText}>{t('help.timezone')}</Text>
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

  // Support Cards
  supportCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: '#F2F2F7',
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportDetails: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '500',
  },

  // FAQ
  faqContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 0.5,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  quickActionCardExpanded: {
    width: '100%',
    alignItems: 'stretch',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  returnChevronWrap: {
    position: 'absolute',
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  returnChecklistWrap: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
  },
  returnChecklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  returnChecklistList: {
    gap: 6,
  },
  returnChecklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  returnBullet: {
    fontSize: 16,
    lineHeight: 20,
    color: '#007AFF',
  },
  returnChecklistText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#1D1D1F',
  },
  returnEmailButton: {
    marginTop: 12,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  returnEmailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Business Hours
  businessHoursSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  businessHoursTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  businessHoursCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  businessHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  hoursText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  timezoneText: {
    fontSize: 13,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 12,
  },
});

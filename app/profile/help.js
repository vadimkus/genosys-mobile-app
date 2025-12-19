import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);

  // Local palette (Help screen previously referenced an undefined `colors` object, causing a crash).
  const colors = {
    primary: '#dc2626',
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

  const renderFormattedAnswer = (answer) => {
    const raw = String(answer || '');
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const rows = [];

    for (let i = 0; i < lines.length; i++) {
      const lineRaw = lines[i] ?? '';
      const line = String(lineRaw).trim();
      if (!line) {
        // Paragraph break
        if (rows.length && rows[rows.length - 1]?.type !== 'spacer') rows.push({ type: 'spacer', key: `sp-${i}` });
        continue;
      }

      const bullet = line.match(/^[-•]\s+(.*)$/);
      if (bullet) {
        rows.push({ type: 'bullet', key: `b-${i}`, text: bullet[1] });
        continue;
      }

      const numbered = line.match(/^(\d+)\.\s+(.*)$/);
      if (numbered) {
        rows.push({ type: 'number', key: `n-${i}`, num: numbered[1], text: numbered[2] });
        continue;
      }

      rows.push({ type: 'p', key: `p-${i}`, text: line });
    }

    return (
      <View style={styles.faqAnswerBody}>
        {rows.map((r) => {
          if (r.type === 'spacer') return <View key={r.key} style={{ height: 8 }} />;
          if (r.type === 'bullet') {
            return (
              <View key={r.key} style={styles.answerRow}>
                <Text style={styles.answerBullet}>•</Text>
                <Text style={styles.answerText}>{r.text}</Text>
              </View>
            );
          }
          if (r.type === 'number') {
            return (
              <View key={r.key} style={styles.answerRow}>
                <Text style={styles.answerNumber}>{r.num}.</Text>
                <Text style={styles.answerText}>{r.text}</Text>
              </View>
            );
          }
          return (
            <Text key={r.key} style={styles.answerParagraph}>
              {r.text}
            </Text>
          );
        })}
      </View>
    );
  };

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
          {renderFormattedAnswer(faq.answer)}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
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
              style={styles.quickActionCard}
              onPress={() => setReturnModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionTitle}>{t('help.returnItem')}</Text>
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
          </View>
        </View>

        {/* Return item modal (keeps Quick Actions compact) */}
        <Modal
          visible={returnModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setReturnModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.returnModalCard}>
              <View style={styles.returnModalHeader}>
                <View style={styles.returnModalHeaderLeft}>
                  <View style={[styles.quickActionIcon, { marginBottom: 0 }]}>
                    <Ionicons name="refresh-outline" size={22} color="#007AFF" />
                  </View>
                  <Text style={styles.returnModalTitle}>{t('help.returnItem')}</Text>
                </View>
                <TouchableOpacity onPress={() => setReturnModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

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
                onPress={async () => {
                  setReturnModalVisible(false);
                  await handleReturnItem();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="mail-outline" size={16} color="#ffffff" />
                <Text style={styles.returnEmailButtonText}>{t('help.emailSales')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setReturnModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSecondaryBtnText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#dc2626',
    fontWeight: '500',
  },

  // FAQ
  faqContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  faqItem: {
    borderBottomWidth: 0.5,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingEnd: 16,
  },
  faqAnswer: {
    padding: 14,
  },

  // FAQ answer formatting
  faqAnswerBody: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  answerBullet: {
    fontSize: 16,
    lineHeight: 22,
    color: '#dc2626',
    color: '#dc2626',
    fontWeight: '800',
  },
  answerNumber: {
    fontSize: 14,
    lineHeight: 22,
    color: '#dc2626',
    fontWeight: '800',
    minWidth: 22,
    textAlign: 'right',
  },
  answerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#3C3C43',
    fontWeight: '500',
  },
  answerParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3C3C43',
    fontWeight: '500',
    marginBottom: 8,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
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
    fontSize: 14,
    lineHeight: 20,
    color: '#3C3C43',
    fontWeight: '500',
  },
  returnEmailButton: {
    marginTop: 12,
    backgroundColor: '#dc2626',
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

  // Modal (Return item)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'center',
  },
  returnModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  returnModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  returnModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  returnModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtn: {
    marginTop: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
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

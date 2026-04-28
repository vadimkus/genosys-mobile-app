import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import AUTH_CONFIG from '../../config/auth';
import { getJson } from '../../services/httpClient';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { createLogger } from '../../utils/logger';

const log = createLogger('Help');

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t, dir, locale: localeFromHook } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);

  const colors = {
    primary: '#dc2626',
    text: '#000000',
    textSecondary: '#8E8E93',
    textMuted: '#C7C7CC',
    card: '#F2F2F7',
    card2: '#ffffff',
    borderSubtle: '#E5E5EA',
  };

  const locale = localeFromHook;

  const fetchFAQ = useCallback(async () => {
    try {
      setFaqLoading(true);
      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await getJson(`${baseUrl}/api/mobile/faq`, {
        headers: {
          locale: locale || 'en',
        },
      });
      setFaqData((data.items || []).map((item, i) => ({
        id: item.id ?? i + 1,
        question: item.question,
        answer: item.answer,
      })));
    } catch (err) {
      log.warn('Help: failed to fetch FAQ:', err.message);
      setFaqData([]);
    } finally {
      setFaqLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

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
    const raw = String(answer || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
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
              <View key={r.key} style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                <Text style={styles.answerBullet}>•</Text>
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>{r.text}</Text>
              </View>
            );
          }
          if (r.type === 'number') {
            return (
              <View key={r.key} style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                <Text style={[styles.answerNumber, isRTL && styles.answerNumberRTL]}>{r.num}.</Text>
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>{r.text}</Text>
              </View>
            );
          }
          return (
            <Text key={r.key} style={[styles.answerParagraph, isRTL && styles.textRTL]}>
              {r.text}
            </Text>
          );
        })}
      </View>
    );
  };

  const handleFaqPress = (faqId) => {
    haptics.lightTap();
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const SupportOptionCard = ({ option }) => (
    <TouchableOpacity style={[styles.supportCard, isRTL && styles.supportCardRTL, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]} onPress={() => { haptics.lightTap(); option.action(); }}>
      <View style={[styles.supportIcon, isRTL && styles.supportIconRTL, { backgroundColor: colors.card2 }]}>
        <Ionicons name={option.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.supportDetails}>
        <Text style={[styles.supportTitle, isRTL && styles.textRTL, { color: colors.text }]}>{option.title}</Text>
        <Text style={[styles.supportSubtitle, isRTL && styles.textRTL, { color: colors.textSecondary }]}>{option.subtitle}</Text>
        <Text
          style={[
            styles.supportDescription,
            isRTL
              ? (option.id === 'phone' || option.id === 'whatsapp' || option.id === 'email'
                  ? styles.valueLTRRight
                  : styles.textRTL)
              : null,
            { color: colors.primary },
          ]}
        >
          {option.description}
        </Text>
      </View>
      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const FaqItem = ({ faq }) => (
    <View style={[styles.faqItem, { borderBottomColor: colors.borderSubtle }]}>
      <TouchableOpacity 
        style={[styles.faqQuestion, isRTL && styles.faqQuestionRTL]}
        onPress={() => handleFaqPress(faq.id)}
      >
        <Text style={[styles.faqQuestionText, isRTL && styles.textRTL, { color: colors.text }]}>{faq.question}</Text>
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
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/profile')} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('help.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t('help.hero')}</Text>
          <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
            {t('help.heroSubtitle')}
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('help.contactUs')}</Text>
          {supportOptions.map((option, index) => (
            <SupportOptionCard key={`${option.id}-${index}`} option={option} />
          ))}
        </View>

        {/* FAQ Section (API-driven) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('help.faqTitle')}</Text>
          {faqLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#dc2626" />
            </View>
          ) : faqData.length > 0 ? (
            <View style={styles.faqContainer}>
              {faqData.map((faq, index) => (
                <FaqItem key={`${faq.id}-${index}`} faq={faq} />
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={{ paddingVertical: 16, alignItems: 'center' }}
              onPress={fetchFAQ}
              activeOpacity={0.7}
            >
              <Text style={[styles.faqQuestionText, { color: colors.textSecondary, textAlign: 'center' }]}>
                {t('common.tryAgain') || 'Tap to retry'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('help.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/profile/orders')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={24} color="#27AE60" />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTL]}>{t('help.trackOrder')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setReturnModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTL]}>{t('help.returnItem')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Linking.openURL('https://wa.me/971585487665')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="logo-whatsapp" size={24} color="#27AE60" />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTL]}>{t('help.whatsappSupport')}</Text>
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
              <View style={[styles.returnModalHeader, isRTL && styles.returnModalHeaderRTL]}>
                <View style={[styles.returnModalHeaderLeft, isRTL && styles.returnModalHeaderLeftRTL]}>
                  <View style={[styles.quickActionIcon, { marginBottom: 0 }]}>
                    <Ionicons name="refresh-outline" size={22} color="#007AFF" />
                  </View>
                  <Text style={[styles.returnModalTitle, isRTL && styles.textRTL]}>{t('help.returnItem')}</Text>
                </View>
                <TouchableOpacity onPress={() => setReturnModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.returnChecklistTitle, isRTL && styles.textRTL]}>{t('help.returnChecklistTitle')}</Text>
              <View style={styles.returnChecklistList}>
                <View style={[styles.returnChecklistItem, isRTL && styles.returnChecklistItemRTL]}>
                  <Text style={styles.returnBullet}>•</Text>
                  <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist1')}</Text>
                </View>
                <View style={[styles.returnChecklistItem, isRTL && styles.returnChecklistItemRTL]}>
                  <Text style={styles.returnBullet}>•</Text>
                  <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist2')}</Text>
                </View>
                <View style={[styles.returnChecklistItem, isRTL && styles.returnChecklistItemRTL]}>
                  <Text style={styles.returnBullet}>•</Text>
                  <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist3')}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.returnEmailButton, isRTL && styles.returnEmailButtonRTL]}
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
                <Text style={[styles.modalSecondaryBtnText, isRTL && styles.textRTL]}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Business Hours */}
        <View style={styles.businessHoursSection}>
          <Text style={[styles.businessHoursTitle, isRTL && styles.textRTL]}>{t('help.serviceHours')}</Text>
          <View style={styles.businessHoursCard}>
            <View style={[styles.businessHoursItem, isRTL && styles.businessHoursItemRTL]}>
              <Text style={[styles.dayText, isRTL && styles.textRTL]}>{t('help.everyDay')}</Text>
              <Text style={[styles.hoursText, isRTL && styles.textRTL]}>{t('help.everyDayHours')}</Text>
            </View>
          </View>
          <Text style={[styles.timezoneText, isRTL && styles.textRTL]}>{t('help.timezone')}</Text>
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
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 4,
    width: 130,
  },
  backButtonRTL: { alignItems: 'flex-end' },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { ...T.link, color: '#dc2626' },
  backTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
  headerTitle: {
    ...T.sectionTitleSmall,
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
    backgroundColor: '#F8F9FA',
  },
  heroTitle: {
    ...T.pageTitle,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...T.body,
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
    ...T.sectionTitle,
    color: '#000000',
    marginBottom: 16,
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
  supportCardRTL: {
    flexDirection: 'row-reverse',
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
  supportIconRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  supportDetails: {
    flex: 1,
  },
  supportTitle: {
    ...T.navTitle,
    color: '#000000',
    marginBottom: 2,
  },
  supportSubtitle: {
    ...T.bodySmall,
    color: '#8E8E93',
    marginBottom: 4,
  },
  valueLTRRight: {
    writingDirection: 'ltr',
    textAlign: 'right',
  },
  supportDescription: {
    ...T.bodySmall,
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
  faqQuestionRTL: {
    flexDirection: 'row-reverse',
  },
  faqQuestionText: {
    ...T.faqQuestion,
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
  answerRowRTL: {
    flexDirection: 'row-reverse',
  },
  answerBullet: {
    fontSize: 16,
    lineHeight: 22,
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
  answerNumberRTL: {
    textAlign: 'left',
  },
  answerText: {
    ...T.faqAnswer,
    flex: 1,
    color: '#3C3C43',
    fontWeight: '500',
  },
  answerParagraph: {
    ...T.faqAnswer,
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
    ...T.label,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  returnChecklistTitle: {
    ...T.label,
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
  returnChecklistItemRTL: {
    flexDirection: 'row-reverse',
  },
  returnBullet: {
    fontSize: 16,
    lineHeight: 20,
    color: '#007AFF',
  },
  returnChecklistText: {
    ...T.faqAnswer,
    flex: 1,
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
  returnEmailButtonRTL: {
    flexDirection: 'row-reverse',
  },
  returnEmailButtonText: {
    ...T.buttonSmall,
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
  returnModalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  returnModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  returnModalHeaderLeftRTL: {
    flexDirection: 'row-reverse',
  },
  returnModalTitle: {
    ...T.body,
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
    ...T.label,
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
    ...T.sectionTitle,
    color: '#000000',
    marginBottom: 16,
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
  businessHoursItemRTL: {
    flexDirection: 'row-reverse',
  },
  dayText: {
    ...T.body,
    fontWeight: '500',
    color: '#000000',
  },
  hoursText: {
    ...T.body,
    color: '#8E8E93',
  },
  timezoneText: {
    ...T.caption,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 12,
  },

  // RTL Support Styles
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});

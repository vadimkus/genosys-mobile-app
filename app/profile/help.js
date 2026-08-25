import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import AUTH_CONFIG from '../../config/auth';
import { getJson } from '../../services/httpClient';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { createLogger } from '../../utils/logger';
import { colors, shadow, surfaces } from '../../utils/theme';

const log = createLogger('Help');

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t, dir, locale: localeFromHook } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);

  const locale = localeFromHook;

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

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
    await Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('help.couldNotOpenEmail'));
    });
  };

  const supportOptions = [
    {
      id: 'email',
      title: t('help.support.emailTitle'),
      subtitle: t('help.support.emailSubtitle'),
      description: 'sales@genosys.ae',
      icon: 'mail',
      tileColor: colors.accent,
      action: () => Linking.openURL('mailto:sales@genosys.ae').catch(() => {}),
    },
    {
      id: 'phone',
      title: t('help.support.phoneTitle'),
      subtitle: t('help.support.phoneSubtitle'),
      description: '+971 58 548 76 65',
      icon: 'call',
      tileColor: colors.accent,
      action: () => Linking.openURL('tel:+971585487665').catch(() => {}),
    },
    {
      id: 'whatsapp',
      title: t('help.support.whatsappTitle'),
      subtitle: t('help.support.whatsappSubtitle'),
      description: '+971 58 548 76 65',
      icon: 'logo-whatsapp',
      tileColor: colors.whatsapp,
      action: () => Linking.openURL('https://wa.me/971585487665').catch(() => {}),
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

  const SupportOptionRow = ({ option, showDivider }) => (
    <View>
      {showDivider ? <View style={styles.hairline} /> : null}
      <TouchableOpacity
        style={[styles.row, isRTL && styles.rowRTL]}
        onPress={() => { haptics.lightTap(); option.action(); }}
        activeOpacity={0.6}
      >
        <View style={[surfaces.iconTile, { backgroundColor: option.tileColor }]}>
          <Ionicons name={option.icon} size={17} color={colors.white} />
        </View>
        <View style={styles.rowMiddle}>
          <Text style={[styles.rowTitle, isRTL && styles.textRTL]}>{option.title}</Text>
          <Text style={[styles.rowSubtitle, isRTL && styles.textRTL]} numberOfLines={1}>{option.subtitle}</Text>
          <Text style={[styles.rowValue, isRTL ? styles.valueLTRRight : styles.valueLTR]} numberOfLines={1}>{option.description}</Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.tertiary} />
      </TouchableOpacity>
    </View>
  );

  const FaqItem = ({ faq, showDivider }) => (
    <View>
      {showDivider ? <View style={styles.hairline} /> : null}
      <TouchableOpacity
        style={[styles.faqQuestion, isRTL && styles.faqQuestionRTL]}
        onPress={() => handleFaqPress(faq.id)}
        activeOpacity={0.6}
      >
        <Text style={[styles.faqQuestionText, isRTL && styles.textRTL]}>{faq.question}</Text>
        <Ionicons
          name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.secondaryLabel}
        />
      </TouchableOpacity>
      {expandedFaq === faq.id ? (
        <View style={styles.faqAnswer}>
          {renderFormattedAnswer(faq.answer)}
        </View>
      ) : null}
    </View>
  );

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('help.title')} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>{t('help.hero')}</Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTLCenter]}>{t('help.heroSubtitle')}</Text>
          </View>

          {/* Contact Options */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('help.contactUs')}</Text>
          <View style={[styles.card, shadow.card]}>
            {supportOptions.map((option, index) => (
              <SupportOptionRow key={`${option.id}-${index}`} option={option} showDivider={index > 0} />
            ))}
          </View>

          {/* FAQ */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('help.faqTitle')}</Text>
          {faqLoading ? (
            <View style={[styles.card, styles.cardCenter, shadow.card]}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : faqData.length > 0 ? (
            <View style={[styles.card, shadow.card]}>
              {faqData.map((faq, index) => (
                <FaqItem key={`${faq.id}-${index}`} faq={faq} showDivider={index > 0} />
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.card, styles.cardCenter, shadow.card]}
              onPress={fetchFAQ}
              activeOpacity={0.7}
            >
              <Text style={[styles.retryText, isRTL && styles.textRTLCenter]}>
                {t('common.tryAgain') || 'Tap to retry'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('help.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, shadow.card]}
              onPress={() => { haptics.lightTap(); router.push('/profile/orders'); }}
              activeOpacity={0.7}
            >
              <View style={[surfaces.iconTile, styles.quickTile, { backgroundColor: colors.accent }]}>
                <Ionicons name="receipt" size={20} color={colors.white} />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTLCenter]}>{t('help.trackOrder')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, shadow.card]}
              onPress={() => { haptics.lightTap(); setReturnModalVisible(true); }}
              activeOpacity={0.7}
            >
              <View style={[surfaces.iconTile, styles.quickTile, { backgroundColor: colors.accent }]}>
                <Ionicons name="refresh" size={20} color={colors.white} />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTLCenter]}>{t('help.returnItem')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, shadow.card]}
              onPress={() => { haptics.lightTap(); Linking.openURL('https://wa.me/971585487665').catch(() => {}); }}
              activeOpacity={0.7}
            >
              <View style={[surfaces.iconTile, styles.quickTile, { backgroundColor: colors.whatsapp }]}>
                <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
              </View>
              <Text style={[styles.quickActionTitle, isRTL && styles.textRTLCenter]}>{t('help.whatsappSupport')}</Text>
            </TouchableOpacity>
          </View>

          {/* Business Hours */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('help.serviceHours')}</Text>
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <View style={[styles.businessHoursItem, isRTL && styles.rowRTL]}>
              <Text style={[styles.dayText, isRTL && styles.textRTL]}>{t('help.everyDay')}</Text>
              <Text style={[styles.hoursText, isRTL && styles.textRTL]}>{t('help.everyDayHours')}</Text>
            </View>
            <Text style={[styles.timezoneText, isRTL && styles.textRTLCenter]}>{t('help.timezone')}</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Return item modal (keeps Quick Actions compact) */}
      <Modal
        visible={returnModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReturnModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.returnModalCard, shadow.card]}>
            <View style={[styles.returnModalHeader, isRTL && styles.returnModalHeaderRTL]}>
              <View style={[styles.returnModalHeaderLeft, isRTL && styles.returnModalHeaderLeftRTL]}>
                <View style={[surfaces.iconTile, { backgroundColor: colors.accent }]}>
                  <Ionicons name="refresh" size={17} color={colors.white} />
                </View>
                <Text style={[styles.returnModalTitle, isRTL && styles.textRTL]}>{t('help.returnItem')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setReturnModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={20} color={colors.secondaryLabel} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.returnChecklistTitle, isRTL && styles.textRTL]}>{t('help.returnChecklistTitle')}</Text>
            <View style={styles.returnChecklistList}>
              <View style={[styles.returnChecklistItem, isRTL && styles.rowRTL]}>
                <View style={styles.returnBulletDot} />
                <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist1')}</Text>
              </View>
              <View style={[styles.returnChecklistItem, isRTL && styles.rowRTL]}>
                <View style={styles.returnBulletDot} />
                <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist2')}</Text>
              </View>
              <View style={[styles.returnChecklistItem, isRTL && styles.rowRTL]}>
                <View style={styles.returnBulletDot} />
                <Text style={[styles.returnChecklistText, isRTL && styles.textRTL]}>{t('help.returnChecklist3')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.returnEmailButton, shadow.cta(colors.cta), isRTL && styles.rowRTL]}
              onPress={async () => {
                haptics.lightTap();
                setReturnModalVisible(false);
                await handleReturnItem();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="mail" size={17} color={colors.white} />
              <Text style={styles.returnEmailButtonText}>{t('help.emailSales')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => setReturnModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalSecondaryBtnText, isRTL && styles.textRTLCenter]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Hero
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  heroTitle: { ...T.pageTitle, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.body, color: colors.secondaryLabel, textAlign: 'center', lineHeight: 22 },

  // Group header
  groupHeader: {
    ...T.eyebrow,
    marginHorizontal: 32,
    marginTop: 14,
    marginBottom: 8,
  },

  // Cards / rows
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    paddingHorizontal: 14,
  },
  cardPad: { paddingVertical: 6 },
  cardCenter: { paddingVertical: 22, alignItems: 'center' },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  rowMiddle: { flex: 1, minWidth: 0 },
  rowTitle: { ...T.label, fontSize: 15, color: colors.label },
  rowSubtitle: { ...T.captionSmall, color: colors.secondaryLabel, marginTop: 2 },
  rowValue: { ...T.captionSmall, color: colors.accent, fontWeight: '600', marginTop: 2 },
  retryText: { ...T.bodySmall, color: colors.secondaryLabel, textAlign: 'center' },

  // FAQ
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  faqQuestionRTL: { flexDirection: 'row-reverse' },
  faqQuestionText: { ...T.faqQuestion, flex: 1, color: colors.label },
  faqAnswer: { paddingBottom: 14 },
  faqAnswerBody: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 14,
  },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  answerRowRTL: { flexDirection: 'row-reverse' },
  answerBullet: { fontSize: 16, lineHeight: 22, color: colors.accent, fontWeight: '800' },
  answerNumber: { fontSize: 14, lineHeight: 22, color: colors.accent, fontWeight: '800', minWidth: 22, textAlign: 'right' },
  answerNumberRTL: { textAlign: 'left' },
  answerText: { ...T.faqAnswer, flex: 1, color: colors.bodyText, fontWeight: '500' },
  answerParagraph: { ...T.faqAnswer, color: colors.bodyText, fontWeight: '500', marginBottom: 8 },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    ...surfaces.card,
    width: '31%',
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  quickTile: { width: 40, height: 40, borderRadius: 11, marginBottom: 10 },
  quickActionTitle: { ...T.captionSmall, fontWeight: '700', color: colors.label, textAlign: 'center' },

  // Business Hours
  businessHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: { ...T.body, fontWeight: '500', color: colors.label },
  hoursText: { ...T.body, color: colors.secondaryLabel },
  timezoneText: { ...T.caption, color: colors.secondaryLabel, textAlign: 'center', marginTop: 8 },

  // Return modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'center',
  },
  returnModalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
  },
  returnModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  returnModalHeaderRTL: { flexDirection: 'row-reverse' },
  returnModalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  returnModalHeaderLeftRTL: { flexDirection: 'row-reverse' },
  returnModalTitle: { ...T.body, fontWeight: '800', color: colors.label },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.subtleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnChecklistTitle: { ...T.label, fontWeight: '700', color: colors.label, marginBottom: 10 },
  returnChecklistList: { gap: 8 },
  returnChecklistItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  returnBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blue,
    marginTop: 7,
  },
  returnChecklistText: { ...T.faqAnswer, flex: 1, lineHeight: 20, color: colors.bodyText, fontWeight: '500' },
  returnEmailButton: {
    marginTop: 16,
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  returnEmailButtonText: { ...T.button, fontWeight: '700' },
  modalSecondaryBtn: {
    marginTop: 10,
    backgroundColor: colors.fillSecondary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  modalSecondaryBtnText: { ...T.label, fontWeight: '700', color: colors.label },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
  valueLTRRight: { writingDirection: 'ltr', textAlign: 'right' },
});

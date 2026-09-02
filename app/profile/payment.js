import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../../services/paymentPreferences';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBilling } from '../../services/databaseService';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, surfaces } from '../../utils/theme';
import SectionCard from '../../components/SectionCard';

export default function PaymentScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });
  const { user } = useAuth();
  const token = user?.token || '';
  const [defaultMethod, setDefaultMethodState] = useState(PAYMENT_METHODS.COD);
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  // Subtle entrance motion (matches order details feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  const loadBilling = useCallback(async () => {
    if (!token) return;
    const res = await getUserBilling(token).catch(() => null);
    const data = res?.data?.data || res?.data || {};
    setBillingAddress(String(data?.billingAddress || '').trim());
    setVatNumber(String(data?.vatNumber || '').trim());
  }, [token]);

  useEffect(() => {
    (async () => {
      const method = await getDefaultPaymentMethod();
      setDefaultMethodState(method);
    })();
  }, []);

  // Initial load + refresh whenever user returns from the Billing edit screen.
  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  useFocusEffect(
    useCallback(() => {
      loadBilling();
    }, [loadBilling])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const selectDefault = async (method) => {
    haptics.mediumTap();
    try {
      const saved = await setDefaultPaymentMethod(method);
      setDefaultMethodState(saved);
    } catch (e) {
      Alert.alert(t('common.error'), t('paymentSettings.saveError'));
    }
  };

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/profile');
  };

  const goBilling = () => {
    haptics.lightTap();
    router.push('/profile/billing');
  };

  const MethodRow = ({ method, icon, tileColor, title, subtitle }) => {
    const selected = defaultMethod === method;
    return (
      <TouchableOpacity
        style={[styles.methodRow, isRTL && styles.rowRTL]}
        onPress={() => selectDefault(method)}
        activeOpacity={0.7}
      >
        <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
          <Ionicons name={icon} size={17} color={colors.white} />
        </View>
        <View style={styles.methodText}>
          <Text style={[styles.methodTitle, isRTL && styles.textRTL]}>{title}</Text>
          <Text style={[styles.methodSubtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
        </View>
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={selected ? colors.accent : colors.tertiary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('paymentSettings.title')} onBack={onBack} isRTL={isRTL} />

      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
        >
          {/* Payment Methods */}
          <SectionCard style={styles.sectionSpacing} icon="wallet" title={t('paymentSettings.defaultMethod')} isRTL={isRTL}>
            <MethodRow
              method={PAYMENT_METHODS.COD}
              icon="cash"
              tileColor={colors.accent}
              title={t('paymentSettings.cod')}
              subtitle={t('paymentSettings.codSubtitle')}
            />
            <View style={styles.hairline} />
            <MethodRow
              method={PAYMENT_METHODS.CARD}
              icon="card"
              tileColor={colors.accent}
              title={t('paymentSettings.card')}
              subtitle={t('paymentSettings.cardSubtitle')}
            />
          </SectionCard>

          {/* Secure note */}
          <View style={[styles.noteBox, isRTL && styles.rowRTL]}>
            <Ionicons name="lock-closed" size={18} color={colors.ok} />
            <Text style={[styles.noteText, isRTL && styles.textRTL]}>{t('paymentSettings.note')}</Text>
          </View>

          {/* Billing Information */}
          <SectionCard style={styles.sectionSpacing} icon="document-text" title={t('paymentSettings.billingInfo')} isRTL={isRTL}>
            <View style={[styles.billingRow, isRTL && styles.rowRTL]}>
              <Text style={[styles.billingLabel, isRTL && styles.textRTL]}>{t('paymentSettings.billingAddress')}</Text>
              <TouchableOpacity onPress={goBilling} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.billingLink}>{t('paymentSettings.update')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.billingValue, isRTL && styles.textRTL]}>
              {billingAddress ? billingAddress : t('paymentSettings.sameAsShipping')}
            </Text>

            <View style={styles.hairline} />

            <View style={[styles.billingRow, isRTL && styles.rowRTL]}>
              <Text style={[styles.billingLabel, isRTL && styles.textRTL]}>{t('paymentSettings.taxInfo')}</Text>
            </View>
            <Text style={[styles.billingValue, isRTL && styles.textRTL]}>
              {vatNumber ? t('paymentSettings.vatTrn', { vatNumber }) : t('paymentSettings.vatNumberMissing')}
            </Text>
          </SectionCard>

          {/* Security Information */}
          <SectionCard style={styles.sectionSpacing} icon="shield-checkmark" title={t('paymentSettings.securityPrivacy')} isRTL={isRTL}>
            <View style={[styles.securityItem, isRTL && styles.rowRTL]}>
              <View style={surfaces.iconWell}>
                <Ionicons name="shield-checkmark" size={17} color={colors.accent} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={[styles.securityItemTitle, isRTL && styles.textRTL]}>{t('paymentSettings.securePayments')}</Text>
                <Text style={[styles.securityItemText, isRTL && styles.textRTL]}>{t('paymentSettings.securePaymentsText')}</Text>
              </View>
            </View>

            <View style={styles.hairline} />

            <View style={[styles.securityItem, isRTL && styles.rowRTL]}>
              <View style={surfaces.iconWell}>
                <Ionicons name="lock-closed" size={17} color={colors.accent} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={[styles.securityItemTitle, isRTL && styles.textRTL]}>{t('paymentSettings.dataProtection')}</Text>
                <Text style={[styles.securityItemText, isRTL && styles.textRTL]}>{t('paymentSettings.dataProtectionText')}</Text>
              </View>
            </View>

            <View style={styles.hairline} />

            <View style={[styles.securityItem, isRTL && styles.rowRTL]}>
              <View style={surfaces.iconWell}>
                <Ionicons name="card" size={17} color={colors.accent} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={[styles.securityItemTitle, isRTL && styles.textRTL]}>{t('paymentSettings.pci')}</Text>
                <Text style={[styles.securityItemText, isRTL && styles.textRTL]}>{t('paymentSettings.pciText')}</Text>
              </View>
            </View>
          </SectionCard>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionSpacing: { marginTop: 14, marginBottom: 0 },
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  scrollView: {
    flex: 1,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Sections
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: 12,
  },

  // Method rows
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    flex: 1,
    minWidth: 0,
  },
  methodTitle: {
    ...T.label,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 2,
  },
  methodSubtitle: {
    ...T.caption,
    color: colors.secondaryLabel,
  },

  // Secure note
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  noteText: {
    ...T.caption,
    flex: 1,
    color: colors.secondaryLabel,
    lineHeight: 18,
  },

  // Billing
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  billingLabel: {
    ...T.label,
    color: colors.label,
  },
  billingLink: {
    ...T.label,
    color: colors.accent,
    fontWeight: '600',
  },
  billingValue: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
  },

  // Security
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  securityInfo: {
    flex: 1,
    minWidth: 0,
  },
  securityItemTitle: {
    ...T.label,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 4,
  },
  securityItemText: {
    ...T.caption,
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
});

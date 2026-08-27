import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBilling, updateUserBilling } from '../../services/databaseService';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow } from '../../utils/theme';
import SectionCard from '../../components/SectionCard';

export default function BillingScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });
  const { user } = useAuth();
  const token = user?.token || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  // Subtle entrance motion (matches order details feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getUserBilling(token);
        const data = res?.data?.data || res?.data || {};
        if (!cancelled) {
          setBillingAddress(String(data?.billingAddress || '').trim());
          setVatNumber(String(data?.vatNumber || '').trim());
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!loading) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, fade, lift]);

  const handleSave = async () => {
    haptics.mediumTap();
    if (!token) return;
    if (saving) return;
    setSaving(true);
    try {
      const res = await updateUserBilling(token, {
        billingAddress: billingAddress.trim() || null,
        vatNumber: vatNumber.trim() || null,
      });
      if (!res?.success) {
        Alert.alert(t('common.error'), res?.error || t('billing.saveFailed'));
        return;
      }
      Alert.alert(t('common.done'), t('billing.saved'), [{ text: t('common.ok'), onPress: () => router.back() }]);
    } catch {
      Alert.alert(t('common.error'), t('billing.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/profile');
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY}
        title={t('billing.title')}
        onBack={onBack}
        isRTL={isRTL}
      />

      {loading ? (
        <View style={[styles.loading, { paddingTop: headerHeight }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
        >
          <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
            <Animated.ScrollView
              style={styles.scroll}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <SectionCard icon="document-text" title={t('billing.title')} isRTL={isRTL}>
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, isRTL && styles.textRTL]}>{t('billing.addressLabel')}</Text>
                  <TextInput
                    style={[styles.input, styles.textarea, isRTL && styles.inputRTL]}
                    value={billingAddress}
                    onChangeText={setBillingAddress}
                    placeholder={t('billing.addressPlaceholder')}
                    placeholderTextColor={colors.tertiary}
                    multiline
                  />
                </View>

                <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                  <Text style={[styles.label, isRTL && styles.textRTL]}>{t('billing.vatLabel')}</Text>
                  <TextInput
                    style={[styles.input, isRTL && styles.inputRTL, isRTL && styles.inputValueLTR]}
                    value={vatNumber}
                    onChangeText={setVatNumber}
                    placeholder={t('billing.vatPlaceholder')}
                    placeholderTextColor={colors.tertiary}
                    autoCapitalize="characters"
                  />
                </View>
              </SectionCard>

              <TouchableOpacity
                style={[styles.saveBtn, shadow.cta(colors.cta), saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>{t('common.save')}</Text>}
              </TouchableOpacity>
            </Animated.ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },

  // Fields
  fieldContainer: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  fieldContainerLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  label: {
    ...T.label,
    color: colors.label,
    marginBottom: 8,
  },
  input: {
    ...T.input,
    backgroundColor: colors.subtleBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    color: colors.label,
    minHeight: 44,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  inputValueLTR: {
    writingDirection: 'ltr',
  },

  // Save - primary
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    ...T.button,
    fontWeight: '700',
  },
});

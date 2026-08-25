import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

const log = createLogger('AddAddress');

/** iOS Settings–style filled glyph tile + bold section title. */
function SectionHeader({ icon, tileColor, title, isRTL }) {
  return (
    <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
      <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
    </View>
  );
}

export default function AddEditAddressScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const { user, addAddress, editAddress } = useAuth();
  const params = useLocalSearchParams();

  // Determine if we're editing or adding
  const isEditing = !!params.addressId;
  const addressData = params.addressData ? JSON.parse(params.addressData) : null;

  const [formData, setFormData] = useState({
    type: addressData?.type || t('addAddress.typeHome'),
    name: addressData?.name || user?.name || '',
    phone: addressData?.phone || user?.phone || '',
    address: addressData?.address || '',
    // Store canonical values so they can be used reliably across locales.
    city: addressData?.city || 'Dubai',
    emirate: addressData?.emirate || 'Dubai',
    country: addressData?.country || 'United Arab Emirates',
    isDefault: addressData?.isDefault || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const initialFormRef = useRef(null);

  // Subtle entrance motion (matches order details feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  // Track the "last saved" snapshot so Cancel/Back doesn't prompt after a successful save.
  useEffect(() => {
    if (!initialFormRef.current) {
      initialFormRef.current = formData;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const emirates = [
    { value: 'Abu Dhabi', key: 'abuDhabi' },
    { value: 'Dubai', key: 'dubai' },
    { value: 'Sharjah', key: 'sharjah' },
    { value: 'Ajman', key: 'ajman' },
    { value: 'Umm Al Quwain', key: 'ummAlQuwain' },
    { value: 'Ras Al Khaimah', key: 'rasAlKhaimah' },
    { value: 'Fujairah', key: 'fujairah' },
  ];

  const addressTypes = [t('addAddress.typeHome'), t('addAddress.typeWork'), t('addAddress.typeOther')];

  const updateField = useCallback((field, value) => {
    setFormData(prevData => ({...prevData, [field]: value}));
  }, []);

  const handleSave = async () => {
    haptics.mediumTap();
    // Validate form
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      Alert.alert(t('common.error'), t('addAddress.validationMissingFields'));
      return;
    }

    // Phone validation (UAE format)
    const phoneRegex = /^(\+971|0)[0-9]{8,9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert(t('common.error'), t('addAddress.validationInvalidUaePhone'));
      return;
    }

    try {
      setIsSaving(true);

      // Normalize type to a stable backend value (home/work/other), regardless of UI language.
      const typeKeyRaw = String(formData.type || '').trim();
      const typeHome = t('addAddress.typeHome');
      const typeWork = t('addAddress.typeWork');
      const typeOther = t('addAddress.typeOther');
      const typeKey =
        typeKeyRaw === typeWork ? 'work' :
        typeKeyRaw === typeOther ? 'other' :
        typeKeyRaw === typeHome ? 'home' :
        // Best-effort fallback based on text
        String(typeKeyRaw).toLowerCase().includes('work') ? 'work' :
        String(typeKeyRaw).toLowerCase().includes('other') ? 'other' :
        'home';

      const payload = { ...formData, type: typeKey };

      let result;
      if (isEditing) {
        result = await editAddress(params.addressId, payload);
      } else {
        result = await addAddress(payload);
      }

      if (result.success) {
        haptics.success();
        // Mark current state as saved, so Cancel/Back won't ask to discard.
        initialFormRef.current = payload;

        Alert.alert(
          t('addAddress.successTitle'),
          isEditing ? t('addAddress.updated') : t('addAddress.added'),
          [
            {
              text: t('contact.ok'),
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('addAddress.saveFailed'));
      }
    } catch (error) {
      log.error('Address save error', error?.message || error);
      Alert.alert(t('common.error'), t('addAddress.genericError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    haptics.lightTap();
    const baseline = initialFormRef.current ?? addressData;
    if (JSON.stringify(formData) !== JSON.stringify(baseline)) {
      Alert.alert(
        t('addAddress.discardTitle'),
        t('addAddress.discardMessage'),
        [
          { text: t('addAddress.keepEditing'), style: 'cancel' },
          { text: t('addAddress.discard'), style: 'destructive', onPress: () => (router.canGoBack() ? router.back() : router.replace('/profile/addresses')) }
        ]
      );
    } else {
      router.canGoBack() ? router.back() : router.replace('/profile/addresses');
    }
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={isEditing ? t('addAddress.editTitle') : t('addAddress.addTitle')}
        scrollY={scrollY}
        onBack={handleCancel}
        isRTL={isRTL}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
          <Animated.ScrollView
            style={styles.scrollView}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Address Type */}
            <View style={[styles.section, shadow.card]}>
              <SectionHeader icon="home" tileColor={colors.teal} title={t('addAddress.addressType')} isRTL={isRTL} />
              <View style={[styles.typeContainer, isRTL && styles.typeContainerRTL]}>
                {addressTypes.map((type) => {
                  const active = formData.type === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, active && styles.activeTypeButton]}
                      onPress={() => { haptics.selectionTick(); updateField('type', type); }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={type === t('addAddress.typeHome') ? 'home' : type === t('addAddress.typeWork') ? 'business' : 'location'}
                        size={18}
                        color={active ? colors.white : colors.brand}
                      />
                      <Text style={[styles.typeButtonText, isRTL && styles.textRTL, active && styles.activeTypeButtonText]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Contact Information */}
            <View style={[styles.section, shadow.card]}>
              <SectionHeader icon="person" tileColor={colors.blue} title={t('addAddress.contactInfo')} isRTL={isRTL} />
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                  {t('addAddress.fullName')}
                  <Text style={styles.requiredMark}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.inputRTL]}
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  placeholder={t('addAddress.enterFullName')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  placeholderTextColor={colors.tertiary}
                />
              </View>

              <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                  {t('addAddress.phoneNumber')}
                  <Text style={styles.requiredMark}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.inputValueLTR]}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  placeholder={t('addAddress.phonePlaceholder')}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  placeholderTextColor={colors.tertiary}
                />
              </View>
            </View>

            {/* Address Details */}
            <View style={[styles.section, shadow.card]}>
              <SectionHeader icon="location" tileColor={colors.teal} title={t('addAddress.addressDetails')} isRTL={isRTL} />
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                  {t('addAddress.streetAddress')}
                  <Text style={styles.requiredMark}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput, isRTL && styles.inputRTL]}
                  value={formData.address}
                  onChangeText={(text) => updateField('address', text)}
                  placeholder={t('addAddress.enterAddressLine')}
                  multiline={true}
                  numberOfLines={3}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  placeholderTextColor={colors.tertiary}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('addAddress.city')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.inputRTL]}
                  value={formData.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholder={t('addAddress.defaultCity')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  placeholderTextColor={colors.tertiary}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('addAddress.emirate')}</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={isRTL ? styles.pickerRowRTL : null}
                    keyboardShouldPersistTaps="handled"
                  >
                    {emirates.map((emirate) => {
                      const active = formData.emirate === emirate.value;
                      return (
                        <TouchableOpacity
                          key={emirate.value}
                          style={[styles.emirateButton, isRTL && styles.emirateButtonRTL, active && styles.activeEmirateButton]}
                          onPress={() => { haptics.selectionTick(); updateField('emirate', emirate.value); }}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.emirateButtonText, isRTL && styles.textRTL, active && styles.activeEmirateButtonText]}>
                            {t(`addAddress.emirates.${emirate.key}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('addAddress.country')}</Text>
                <TextInput
                  style={[styles.textInput, isRTL && styles.inputRTL]}
                  value={formData.country}
                  onChangeText={(text) => updateField('country', text)}
                  placeholder={t('addAddress.defaultCountry')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  placeholderTextColor={colors.tertiary}
                />
              </View>
            </View>

            {/* Preferences */}
            <View style={[styles.section, shadow.card]}>
              <SectionHeader icon="star" tileColor={colors.indigo} title={t('addAddress.preferences')} isRTL={isRTL} />
              <View style={[styles.switchContainer, isRTL && styles.switchContainerRTL]}>
                <View style={[styles.switchLabel, isRTL && styles.switchLabelRTL]}>
                  <Text style={[styles.fieldLabel, styles.switchTitle, isRTL && styles.textRTL]}>{t('addAddress.setAsDefault')}</Text>
                  <Text style={[styles.switchSubtext, isRTL && styles.textRTL]}>{t('addAddress.setAsDefaultHint')}</Text>
                </View>
                <Switch
                  value={formData.isDefault}
                  onValueChange={(value) => { haptics.selectionTick(); updateField('isDefault', value); }}
                  trackColor={{ false: colors.separator, true: colors.brand }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.separator}
                />
              </View>
            </View>

            {/* Delivery Note */}
            <View style={[styles.deliveryNote, isRTL && styles.rowRTL]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.secondaryLabel} />
              <Text style={[styles.deliveryNoteText, isRTL && styles.textRTL]}>
                {t('addAddress.deliveryNote')}
              </Text>
            </View>

            {/* Save — primary action */}
            <TouchableOpacity
              style={[styles.saveButton, shadow.cta(colors.brand), isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>{isSaving ? t('addAddress.saving') : t('addAddress.save')}</Text>
            </TouchableOpacity>
          </Animated.ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
  section: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
  },

  // Address Type
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeContainerRTL: {
    flexDirection: 'row-reverse',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    backgroundColor: colors.subtleBg,
    gap: 6,
  },
  activeTypeButton: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  typeButtonText: {
    ...T.labelSmall,
    fontWeight: '600',
    color: colors.brand,
  },
  activeTypeButtonText: {
    color: colors.white,
  },

  // Form Fields
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
  fieldLabel: {
    ...T.label,
    color: colors.label,
    marginBottom: 8,
  },
  requiredMark: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    ...T.input,
    color: colors.label,
    backgroundColor: colors.subtleBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    minHeight: 44,
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputValueLTR: {
    writingDirection: 'ltr',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Emirate Selection
  pickerContainer: {
    marginTop: 2,
  },
  emirateButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.subtleBg,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    marginEnd: 8,
  },
  emirateButtonRTL: {
    marginEnd: 0,
    marginStart: 8,
  },
  pickerRowRTL: {
    flexDirection: 'row-reverse',
  },
  activeEmirateButton: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  emirateButtonText: {
    ...T.labelSmall,
    color: colors.label,
    fontWeight: '600',
  },
  activeEmirateButtonText: {
    color: colors.white,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainerRTL: {
    flexDirection: 'row-reverse',
  },
  switchLabel: {
    flex: 1,
    marginEnd: 16,
  },
  switchLabelRTL: {
    marginEnd: 0,
    marginStart: 16,
    alignItems: 'flex-end',
  },
  switchTitle: {
    marginBottom: 2,
  },
  switchSubtext: {
    ...T.caption,
    color: colors.secondaryLabel,
  },

  // Delivery Note
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
  },
  deliveryNoteText: {
    ...T.caption,
    color: colors.secondaryLabel,
    lineHeight: 18,
    flex: 1,
  },

  // Save — primary
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 18,
  },
  saveButtonText: {
    ...T.button,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

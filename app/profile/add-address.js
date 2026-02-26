import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';

const log = createLogger('AddAddress');

export default function AddEditAddressScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
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

  // Track the "last saved" snapshot so Cancel/Back doesn't prompt after a successful save.
  useEffect(() => {
    if (!initialFormRef.current) {
      initialFormRef.current = formData;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const baseline = initialFormRef.current ?? addressData;
    if (JSON.stringify(formData) !== JSON.stringify(baseline)) {
      Alert.alert(
        t('addAddress.discardTitle'),
        t('addAddress.discardMessage'),
        [
          { text: t('addAddress.keepEditing'), style: 'cancel' },
          { text: t('addAddress.discard'), style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Enough offset to keep multiline address visible below the header on iOS.
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, isRTL && styles.textRTL]}>{t('addAddress.cancel')}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
            {isEditing ? t('addAddress.editTitle') : t('addAddress.addTitle')}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
            disabled={isSaving}
          >
            <Text style={[styles.saveText, isRTL && styles.textRTL, isSaving && styles.saveTextDisabled]}>
              {isSaving ? t('addAddress.saving') : t('addAddress.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* Address Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('addAddress.addressType')}</Text>
          <View style={styles.formContent}>
            <View style={[styles.typeContainer, isRTL && styles.typeContainerRTL]}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.activeTypeButton
                  ]}
                  onPress={() => { haptics.selectionTick(); updateField('type', type); }}
                >
                  <Ionicons 
                    name={type === t('addAddress.typeHome') ? 'home' : type === t('addAddress.typeWork') ? 'business' : 'location'} 
                    size={20} 
                    color={formData.type === type ? '#ffffff' : '#dc2626'} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    isRTL && styles.textRTL,
                    formData.type === type && styles.activeTypeButtonText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('addAddress.contactInfo')}</Text>
          <View style={styles.formContent}>
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
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.fieldContainer}>
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
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('addAddress.addressDetails')}</Text>
          <View style={styles.formContent}>
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
                placeholderTextColor="#C7C7CC"
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
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('addAddress.emirate')}</Text>
              <View style={styles.pickerContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={isRTL ? styles.pickerRowRTL : null}
                >
                  {emirates.map((emirate) => (
                    <TouchableOpacity
                      key={emirate.value}
                      style={[
                        styles.emirateButton,
                        isRTL && styles.emirateButtonRTL,
                        formData.emirate === emirate.value && styles.activeEmirateButton
                      ]}
                      onPress={() => { haptics.selectionTick(); updateField('emirate', emirate.value); }}
                    >
                      <Text style={[
                        styles.emirateButtonText,
                        isRTL && styles.textRTL,
                        formData.emirate === emirate.value && styles.activeEmirateButtonText
                      ]}>
                        {t(`addAddress.emirates.${emirate.key}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.fieldContainer}>
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
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>
        </View>

        {/* Default Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('addAddress.preferences')}</Text>
          <View style={styles.formContent}>
            <View style={[styles.switchContainer, isRTL && styles.switchContainerRTL]}>
              <View style={[styles.switchLabel, isRTL && styles.switchLabelRTL]}>
                <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('addAddress.setAsDefault')}</Text>
                <Text style={[styles.switchSubtext, isRTL && styles.textRTL]}>{t('addAddress.setAsDefaultHint')}</Text>
              </View>
              <Switch
                value={formData.isDefault}
                onValueChange={(value) => { haptics.selectionTick(); updateField('isDefault', value); }}
                trackColor={{ false: '#E5E5EA', true: '#dc2626' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Delivery Note */}
        <View style={[styles.deliveryNote, isRTL && styles.deliveryNoteRTL]}>
          <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
          <Text style={[styles.deliveryNoteText, isRTL && styles.textRTL]}>
            {t('addAddress.deliveryNote')}
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
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
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerTitle: {
    ...T.sectionTitleSmall,
    color: '#000000',
  },
  cancelText: {
    ...T.navTitle,
    color: '#dc2626',
    fontWeight: '400',
  },
  saveText: {
    ...T.navTitle,
    color: '#dc2626',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  saveTextDisabled: {
    color: '#999999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Sections
  section: {
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  sectionTitle: {
    ...T.sectionTitle,
    color: '#000000',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  formContent: {
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Address Type
  typeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  activeTypeButton: {
    backgroundColor: '#dc2626',
  },
  typeButtonText: {
    ...T.button,
    fontWeight: '500',
    color: '#dc2626',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },

  // Form Fields
  fieldContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  fieldLabel: {
    ...T.body,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  requiredMark: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    ...T.body,
    color: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    minHeight: 40,
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
    marginTop: 8,
  },
  emirateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
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
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  emirateButtonText: {
    ...T.label,
    color: '#3C3C43',
    fontWeight: '500',
  },
  activeEmirateButtonText: {
    color: '#ffffff',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  switchSubtext: {
    ...T.label,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 2,
  },

  // Delivery Note
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  deliveryNoteRTL: {
    flexDirection: 'row-reverse',
  },
  deliveryNoteText: {
    ...T.label,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 18,
    flex: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});


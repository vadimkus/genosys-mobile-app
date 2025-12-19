import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';

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
    city: addressData?.city || t('addAddress.defaultCity'),
    emirate: addressData?.emirate || t('addAddress.defaultEmirate'),
    country: addressData?.country || t('addAddress.defaultCountry'),
    isDefault: addressData?.isDefault || false,
  });
  const [isSaving, setIsSaving] = useState(false);

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
      
      let result;
      if (isEditing) {
        result = await editAddress(params.addressId, formData);
      } else {
        result = await addAddress(formData);
      }
      
      if (result.success) {
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
    if (JSON.stringify(formData) !== JSON.stringify(addressData)) {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>{t('addAddress.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? t('addAddress.editTitle') : t('addAddress.addTitle')}
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
            {isSaving ? t('addAddress.saving') : t('addAddress.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Address Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('addAddress.addressType')}</Text>
          <View style={styles.formContent}>
            <View style={styles.typeContainer}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.activeTypeButton
                  ]}
                  onPress={() => updateField('type', type)}
                >
                  <Ionicons 
                    name={type === t('addAddress.typeHome') ? 'home' : type === t('addAddress.typeWork') ? 'business' : 'location'} 
                    size={20} 
                    color={formData.type === type ? '#ffffff' : '#dc2626'} 
                  />
                  <Text style={[
                    styles.typeButtonText,
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
          <Text style={styles.sectionTitle}>{t('addAddress.contactInfo')}</Text>
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {t('addAddress.fullName')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
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
              <Text style={styles.fieldLabel}>
                {t('addAddress.phoneNumber')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
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
          <Text style={styles.sectionTitle}>{t('addAddress.addressDetails')}</Text>
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {t('addAddress.streetAddress')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
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
              <Text style={styles.fieldLabel}>{t('addAddress.city')}</Text>
              <TextInput
                style={styles.textInput}
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
              <Text style={styles.fieldLabel}>{t('addAddress.emirate')}</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {emirates.map((emirate) => (
                    <TouchableOpacity
                      key={emirate.value}
                      style={[
                        styles.emirateButton,
                        formData.emirate === emirate.value && styles.activeEmirateButton
                      ]}
                      onPress={() => updateField('emirate', emirate.value)}
                    >
                      <Text style={[
                        styles.emirateButtonText,
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
              <Text style={styles.fieldLabel}>{t('addAddress.country')}</Text>
              <TextInput
                style={styles.textInput}
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
          <Text style={styles.sectionTitle}>{t('addAddress.preferences')}</Text>
          <View style={styles.formContent}>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>{t('addAddress.setAsDefault')}</Text>
                <Text style={styles.switchSubtext}>{t('addAddress.setAsDefaultHint')}</Text>
              </View>
              <Switch
                value={formData.isDefault}
                onValueChange={(value) => updateField('isDefault', value)}
                trackColor={{ false: '#E5E5EA', true: '#dc2626' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Delivery Note */}
        <View style={styles.deliveryNote}>
          <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
          <Text style={styles.deliveryNoteText}>
            {t('addAddress.deliveryNote')}
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
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    fontSize: 17,
    color: '#dc2626',
  },
  saveText: {
    fontSize: 17,
    color: '#dc2626',
    fontWeight: '600',
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

  // Sections
  section: {
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: -0.4,
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
    fontSize: 16,
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
    fontSize: 16,
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
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    minHeight: 40,
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
    marginRight: 8,
  },
  activeEmirateButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  emirateButtonText: {
    fontSize: 14,
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
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchSubtext: {
    fontSize: 14,
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
  deliveryNoteText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    flex: 1,
  },
});


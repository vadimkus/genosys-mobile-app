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

export default function AddEditAddressScreen() {
  const router = useRouter();
  const { user, addAddress, editAddress } = useAuth();
  const params = useLocalSearchParams();
  
  // Determine if we're editing or adding
  const isEditing = !!params.addressId;
  const addressData = params.addressData ? JSON.parse(params.addressData) : null;
  
  const [formData, setFormData] = useState({
    type: addressData?.type || 'Home',
    name: addressData?.name || user?.name || '',
    phone: addressData?.phone || user?.phone || '',
    address: addressData?.address || '',
    city: addressData?.city || 'Dubai',
    emirate: addressData?.emirate || 'Dubai',
    country: addressData?.country || 'United Arab Emirates',
    isDefault: addressData?.isDefault || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 
    'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
  ];

  const addressTypes = ['Home', 'Work', 'Other'];

  const updateField = useCallback((field, value) => {
    setFormData(prevData => ({...prevData, [field]: value}));
  }, []);

  const handleSave = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Phone validation (UAE format)
    const phoneRegex = /^(\+971|0)[0-9]{8,9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid UAE phone number.');
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
          'Success', 
          isEditing ? 'Address updated successfully!' : 'Address added successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save address. Please try again.');
      }
    } catch (error) {
      console.error('Address save error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(formData) !== JSON.stringify(addressData)) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
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
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Address' : 'Add Address'}
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
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
          <Text style={styles.sectionTitle}>Address Type</Text>
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
                    name={type === 'Home' ? 'home' : type === 'Work' ? 'business' : 'location'} 
                    size={20} 
                    color={formData.type === type ? '#ffffff' : '#E74C3C'} 
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
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Full Name
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter full name"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Phone Number
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+971 50 123 4567"
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
          <Text style={styles.sectionTitle}>Address Details</Text>
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Street Address
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                placeholder="Building name, street name, apartment/villa number"
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
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(text) => updateField('city', text)}
                placeholder="Dubai"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Emirate</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {emirates.map((emirate) => (
                    <TouchableOpacity
                      key={emirate}
                      style={[
                        styles.emirateButton,
                        formData.emirate === emirate && styles.activeEmirateButton
                      ]}
                      onPress={() => updateField('emirate', emirate)}
                    >
                      <Text style={[
                        styles.emirateButtonText,
                        formData.emirate === emirate && styles.activeEmirateButtonText
                      ]}>
                        {emirate}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                style={styles.textInput}
                value={formData.country}
                onChangeText={(text) => updateField('country', text)}
                placeholder="United Arab Emirates"
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
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.formContent}>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>Set as Default Address</Text>
                <Text style={styles.switchSubtext}>Use this address for all future orders by default</Text>
              </View>
              <Switch
                value={formData.isDefault}
                onValueChange={(value) => updateField('isDefault', value)}
                trackColor={{ false: '#E5E5EA', true: '#E74C3C' }}
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
            Please provide accurate address details including building/villa number and any landmarks to ensure smooth delivery.
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
    color: '#E74C3C',
  },
  saveText: {
    fontSize: 17,
    color: '#E74C3C',
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
    borderColor: '#E74C3C',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  activeTypeButton: {
    backgroundColor: '#E74C3C',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E74C3C',
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
    color: '#E74C3C',
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
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
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


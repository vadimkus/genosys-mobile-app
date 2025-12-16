import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  Modal,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getAddressLine, parseGenosysAddress } from '../../utils/addressUtils';
import { createLogger } from '../../utils/logger';

const log = createLogger('EditProfile');

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const { user, updateProfile, deleteAccount, isAuthenticated } = useAuth();
  
  // Check authentication immediately
  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        t('editProfile.authRequiredTitle'),
        t('editProfile.pleaseLoginToEdit'),
        [
          {
            text: t('contact.ok'),
            onPress: () => router.back()
          }
        ]
      );
      return;
    }
  }, [user, isAuthenticated]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: t('editProfile.preferNotToSay'),
    address: '',
    profilePicture: null,
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Populate form with user data when component loads
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const parsedAddr = parseGenosysAddress(user.address || '');
      const birthday = user.birthday || user.dateOfBirth || '';
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        // Backend uses `birthday` (YYYY-MM-DD). Keep local field name for UI.
        dateOfBirth: birthday,
        gender: user.gender || t('editProfile.preferNotToSay'),
        // Don't show GENOSYS_ADDR_V1 payload in the input
        address: getAddressLine(parsedAddr || (user.address || '')),
        profilePicture: user.profilePicture || null,
      });
      
      // Set initial date if available
      if (birthday) {
        setSelectedDate(new Date(birthday));
      }
    }
  }, [user]);

  const updateField = useCallback((field, text) => {
    setFormData(prevData => ({...prevData, [field]: text}));
  }, []);

  const handleEmailNotificationToggle = useCallback((value) => {
    setEmailNotifications(value);
  }, []);

  const handleSmsNotificationToggle = useCallback((value) => {
    setSmsNotifications(value);
  }, []);

  // Profile Picture Functions
  const handleProfilePicturePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
        Alert.alert(t('editProfile.selectProfilePictureTitle'), t('editProfile.chooseOption'), [
        { text: t('editProfile.cancel'), style: 'cancel' },
        { text: t('editProfile.takePhoto'), onPress: takePhoto },
        { text: t('editProfile.chooseFromLibrary'), onPress: pickImage },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateField('profilePicture', result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.libraryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateField('profilePicture', result.assets[0].uri);
    }
  };

  // Date Picker Functions
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setSelectedDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    updateField('dateOfBirth', formattedDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Gender Selection Functions
  const genderOptions = [
    t('editProfile.genderMale'),
    t('editProfile.genderFemale'),
    t('editProfile.genderOther'),
    t('editProfile.preferNotToSay'),
  ];

  const handleGenderSelect = (selectedGender) => {
    updateField('gender', selectedGender);
    setShowGenderModal(false);
  };

  const showGenderSelector = () => {
    setShowGenderModal(true);
  };

  const handleSave = async () => {
    log.debug('Profile save started');
    
    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.address.trim()) {
      Alert.alert(t('common.error'), t('editProfile.validationMissingFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(t('common.error'), t('editProfile.validationInvalidEmail'));
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare profile data for API
      const profileData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        // Backend contract expects `birthday` (YYYY-MM-DD).
        birthday: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),
        profilePicture: formData.profilePicture,
        emailNotifications,
        smsNotifications,
      };

      const result = await updateProfile(profileData);
      log.debug('Profile update result', { success: !!result?.success });
      
      if (result.success) {
        Alert.alert(
          t('editProfile.successTitle'),
          t('editProfile.successMessage'),
          [
            {
              text: t('contact.ok'),
              // Stay on the same page after saving.
              onPress: () => {}
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('editProfile.updateFailed'));
      }
    } catch (error) {
      log.error('Profile save error', error?.message || error);
      Alert.alert(t('common.error'), t('editProfile.genericError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('editProfile.discardTitle'),
      t('editProfile.discardMessage'),
      [
        { text: t('editProfile.keepEditing'), style: 'cancel' },
        { text: t('editProfile.discard'), style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('editProfile.deleteAccountTitle'),
      t('editProfile.deleteAccountMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('editProfile.deleteAccountConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              const result = await deleteAccount();
              if (result?.success) {
                Alert.alert(
                  t('editProfile.deleteAccountSuccessTitle'),
                  t('editProfile.deleteAccountSuccessMessage'),
                  [{ text: t('common.ok'), onPress: () => router.replace('/auth/login') }]
                );
              } else {
                Alert.alert(t('common.error'), result?.error || t('editProfile.deleteAccountFailed'));
              }
            } catch (e) {
              Alert.alert(t('common.error'), t('editProfile.deleteAccountFailed'));
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const FormSection = memo(({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  ));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>{t('editProfile.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile.headerTitle')}</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
            {isSaving ? t('editProfile.saving') : t('editProfile.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Profile Picture Section */}
        <FormSection title={t('editProfile.profilePicture')}>
          <View style={styles.formContent}>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={handleProfilePicturePress}>
              <View style={styles.profilePictureWrapper}>
                {formData.profilePicture ? (
                  <Image source={{ uri: formData.profilePicture }} style={styles.profilePicture} />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Ionicons name="person" size={40} color="#C7C7CC" />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </View>
              <Text style={styles.profilePictureText}>{t('editProfile.tapToChangePhoto')}</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        {/* Personal Information */}
        <FormSection title={t('editProfile.personalInfo')}>
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {t('editProfile.firstName')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder={t('editProfile.enterFirstName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-given"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {t('editProfile.lastName')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder={t('editProfile.enterLastName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-family"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {t('editProfile.emailAddress')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder={t('editProfile.enterEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t('editProfile.phoneNumber')}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder={t('editProfile.enterPhone')}
                keyboardType="phone-pad"
                autoCorrect={false}
                autoComplete="tel"
                returnKeyType="done"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>
        </FormSection>

        {/* Additional Information */}
        <FormSection title="Additional Information">
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t('editProfile.dateOfBirth')}</Text>
              <TouchableOpacity style={styles.selectField} onPress={showDatePickerModal}>
                <Text style={[styles.selectFieldText, !formData.dateOfBirth && styles.placeholderText]}>
                  {formatDisplayDate(formData.dateOfBirth) || 'Select date of birth'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t('editProfile.gender')}</Text>
              <TouchableOpacity style={styles.selectField} onPress={showGenderSelector}>
                <Text style={styles.selectFieldText}>{formData.gender}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Address
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                placeholder={t('editProfile.enterAddress')}
                multiline={true}
                numberOfLines={3}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="default"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>
        </FormSection>

        {/* Notification Preferences */}
        <FormSection title="Notification Preferences">
          <View style={styles.formContent}>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>{t('editProfile.emailNotifications')}</Text>
                <Text style={styles.switchSubtext}>{t('editProfile.emailNotificationsHint')}</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={handleEmailNotificationToggle}
                trackColor={{ false: '#E5E5EA', true: '#E74C3C' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>{t('editProfile.smsNotifications')}</Text>
                <Text style={styles.switchSubtext}>{t('editProfile.smsNotificationsHint')}</Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={handleSmsNotificationToggle}
                trackColor={{ false: '#E5E5EA', true: '#27AE60' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </FormSection>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>{t('editProfile.dangerZoneTitle')}</Text>
          <TouchableOpacity
            style={[styles.deleteAccountButton, isSaving && styles.deleteAccountButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.deleteAccountText}>{t('editProfile.deleteAccountButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            Your personal information is protected and will not be shared with third parties. 
            By updating your profile, you agree to our Privacy Policy.
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
        />
      )}

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('editProfile.selectGender')}</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    formData.gender === option && styles.selectedGenderOption
                  ]}
                  onPress={() => handleGenderSelect(option)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    formData.gender === option && styles.selectedGenderOptionText
                  ]}>
                    {option}
                  </Text>
                  {formData.gender === option && (
                    <Ionicons name="checkmark" size={20} color="#E74C3C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    minWidth: 60,
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
    color: '#E74C3C',
    fontSize: 17,
    fontWeight: '600',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  saveTextDisabled: {
    color: '#999999',
  },
  saveText: {
    fontSize: 17,
    color: '#E74C3C',
    fontWeight: '600',
    textAlign: 'right',
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
  
  // Profile Picture
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 17,
    color: '#E74C3C',
    fontWeight: '400',
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

  // Form Fields
  fieldContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#E74C3C',
    fontSize: 17,
  },
  textInput: {
    fontSize: 17,
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectFieldText: {
    fontSize: 17,
    color: '#000000',
  },

  // Switch Components
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  switchLabel: {
    flex: 1,
  },
  switchSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Privacy Note
  privacyNote: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  privacyText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },

  dangerZone: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 12,
  },
  deleteAccountButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountButtonDisabled: {
    opacity: 0.6,
  },
  deleteAccountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Profile Picture Styles
  profilePictureContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePictureWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profilePictureText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '500',
  },

  // Additional Field Styles
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  placeholderText: {
    color: '#C7C7CC',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '70%',
    minWidth: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    paddingVertical: 10,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedGenderOption: {
    backgroundColor: '#FFF5F5',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedGenderOptionText: {
    color: '#E74C3C',
    fontWeight: '500',
  },

  // Required field indicator
  requiredMark: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
});

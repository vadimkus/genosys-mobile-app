import React, { useState, useCallback, useEffect } from 'react';
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
  Keyboard,
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
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';

const log = createLogger('EditProfile');

const GENDER_VALUES = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  NA: 'na',
};

const normalizeGenderValue = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return GENDER_VALUES.NA;
  const key = v.toLowerCase();
  if ([GENDER_VALUES.MALE, GENDER_VALUES.FEMALE, GENDER_VALUES.OTHER, GENDER_VALUES.NA].includes(key)) {
    return key;
  }

  // Back-compat: previously we stored localized labels; map common variants.
  // English
  if (key === 'male') return GENDER_VALUES.MALE;
  if (key === 'female') return GENDER_VALUES.FEMALE;
  if (key === 'other') return GENDER_VALUES.OTHER;
  if (key.includes('prefer') || key.includes('not to say')) return GENDER_VALUES.NA;

  // Russian
  if (key.includes('муж')) return GENDER_VALUES.MALE;
  if (key.includes('жен')) return GENDER_VALUES.FEMALE;
  if (key.includes('дру')) return GENDER_VALUES.OTHER;
  if (key.includes('предпоч')) return GENDER_VALUES.NA;

  // Arabic (basic)
  if (key.includes('ذكر')) return GENDER_VALUES.MALE;
  if (key.includes('أنث') || key.includes('انث')) return GENDER_VALUES.FEMALE;
  if (key.includes('آخر') || key.includes('اخر')) return GENDER_VALUES.OTHER;
  if (key.includes('عدم') || key.includes('أفضل') || key.includes('افضل')) return GENDER_VALUES.NA;

  return GENDER_VALUES.NA;
};

const getGenderLabel = (t, genderValue) => {
  switch (genderValue) {
    case GENDER_VALUES.MALE: return t('editProfile.genderMale');
    case GENDER_VALUES.FEMALE: return t('editProfile.genderFemale');
    case GENDER_VALUES.OTHER: return t('editProfile.genderOther');
    case GENDER_VALUES.NA:
    default:
      return t('editProfile.preferNotToSay');
  }
};

function FormSection({ title, children, isRTL, icon }) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeaderRow, isRTL && styles.sectionHeaderRowRTL]}>
        {icon ? (
          <View style={styles.sectionIconWrap}>
            <Ionicons name={icon} size={18} color="#dc2626" />
          </View>
        ) : null}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user, updateProfile, deleteAccount, isAuthenticated } = useAuth();
  
  // Check authentication immediately
  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        t('editProfile.authRequiredTitle'),
        t('editProfile.pleaseLoginToEdit'),
        [
          {
            text: t('common.ok'),
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
    contactEmail: '',
    phone: '',
    dateOfBirth: '',
    // Store stable gender value (male/female/other/na). Display uses translation.
    gender: GENDER_VALUES.NA,
    address: '',
    profilePicture: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  // Populate form with user data when component loads
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const parsedAddr = parseGenosysAddress(user.address || '');
      const birthday = user.birthday || user.dateOfBirth || '';
      const authEmail = String(user.email || '').trim();
      const isAppleRelay = authEmail.includes('@privaterelay.appleid.com');
      const derivedContactEmail =
        String(user.contactEmail || '').trim() ||
        (!isAppleRelay ? authEmail : '');
      const nextForm = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authEmail,
        // "Real email" used for notifications/checkout. Mandatory for all login methods.
        // For non-Apple-relay accounts, default to the auth email if contactEmail is empty.
        contactEmail: derivedContactEmail,
        phone: user.phone || '',
        // Backend uses `birthday` (YYYY-MM-DD). Keep local field name for UI.
        dateOfBirth: birthday,
        gender: normalizeGenderValue(user.gender),
        // Don't show GENOSYS_ADDR_V1 payload in the input
        address: getAddressLine(parsedAddr || (user.address || '')),
        profilePicture: user.profilePicture || null,
      };
      setFormData(nextForm);

      // Establish "clean" baseline for dirty tracking.
      setInitialSnapshot({
        ...nextForm,
      });

      // Start in edit mode on first open. After a save we flip to view-mode.
      setIsEditing(true);
      
      // Set initial date if available
      if (birthday) {
        setSelectedDate(new Date(birthday));
      }
    }
  }, [user]);

  const getCurrentSnapshot = useCallback(() => ({ ...formData }), [formData]);

  const isDirty = (() => {
    if (!initialSnapshot) return false;
    try {
      return JSON.stringify(getCurrentSnapshot()) !== JSON.stringify(initialSnapshot);
    } catch {
      return true;
    }
  })();

  const updateField = useCallback((field, text) => {
    if (!isEditing) setIsEditing(true);
    setFormData(prevData => ({...prevData, [field]: text}));
  }, [isEditing]);

  // Notification preferences were moved to Profile → Privacy & Security.

  // Profile Picture Functions
  const handleProfilePicturePress = () => {
    haptics.lightTap();
    if (!isEditing) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('editProfile.takePhoto'), t('editProfile.chooseFromLibrary')],
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
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0 && result.assets[0]?.uri) {
        updateField('profilePicture', result.assets[0].uri);
      }
    } catch (err) {
      log.error('takePhoto failed:', err);
      Alert.alert(t('common.error'), t('editProfile.photoError') || 'Could not take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.libraryPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0 && result.assets[0]?.uri) {
        updateField('profilePicture', result.assets[0].uri);
      }
    } catch (err) {
      log.error('pickImage failed:', err);
      Alert.alert(t('common.error'), t('editProfile.photoError') || 'Could not select photo. Please try again.');
    }
  };

  // Date Picker Functions
  const handleDateChange = (event, selectedDate) => {
    haptics.selectionTick();
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
    // On iOS we use a modal with explicit Done/Cancel, so keep a temp value.
    setTempDate(selectedDate || new Date());
    setShowDatePicker(true);
  };

  const closeDatePicker = () => setShowDatePicker(false);

  const confirmDatePicker = () => {
    haptics.selectionTick();
    setSelectedDate(tempDate);
    const formattedDate = tempDate.toISOString().split('T')[0];
    updateField('dateOfBirth', formattedDate);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const displayLocale = locale === 'ru' ? 'ru-RU' : locale === 'ar' ? 'ar-AE' : 'en-GB';
    return date.toLocaleDateString(displayLocale, {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Gender Selection Functions
  const genderOptions = [
    { value: GENDER_VALUES.MALE, label: t('editProfile.genderMale') },
    { value: GENDER_VALUES.FEMALE, label: t('editProfile.genderFemale') },
    { value: GENDER_VALUES.OTHER, label: t('editProfile.genderOther') },
    { value: GENDER_VALUES.NA, label: t('editProfile.preferNotToSay') },
  ];

  const handleGenderSelect = (selectedGenderValue) => {
    haptics.selectionTick();
    updateField('gender', selectedGenderValue);
    setShowGenderModal(false);
  };

  const showGenderSelector = () => {
    if (!isEditing) return;
    setShowGenderModal(true);
  };

  const resetToSnapshot = useCallback(() => {
    if (!initialSnapshot) return;
    setFormData({
      firstName: initialSnapshot.firstName || '',
      lastName: initialSnapshot.lastName || '',
      email: initialSnapshot.email || '',
      contactEmail: initialSnapshot.contactEmail || '',
      phone: initialSnapshot.phone || '',
      dateOfBirth: initialSnapshot.dateOfBirth || '',
      gender: initialSnapshot.gender || GENDER_VALUES.NA,
      address: initialSnapshot.address || '',
      profilePicture: initialSnapshot.profilePicture || null,
    });
    if (initialSnapshot.dateOfBirth) {
      setSelectedDate(new Date(initialSnapshot.dateOfBirth));
    }
  }, [initialSnapshot]);

  const handleSave = async () => {
    haptics.mediumTap();
    log.debug('Profile save started');
    
    // Validate form
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !String(formData.contactEmail || '').trim() ||
      !String(formData.phone || '').trim()
    ) {
      Alert.alert(t('common.error'), t('editProfile.validationMissingFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(t('common.error'), t('editProfile.validationInvalidEmail'));
      return;
    }

    // Contact Email validation (mandatory)
    const contactEmail = String(formData.contactEmail || '').trim();
    if (!emailRegex.test(contactEmail)) {
      Alert.alert(t('common.error'), t('editProfile.validationInvalidContactEmail'));
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare profile data for API
      const profileData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone.trim(),
        // Backend contract expects `birthday` (YYYY-MM-DD).
        birthday: formData.dateOfBirth,
        // Stable value (male/female/other/na)
        gender: formData.gender,
        profilePicture: formData.profilePicture,
        contactEmail,
      };

      const result = await updateProfile(profileData);
      log.debug('Profile update result', { success: !!result?.success });
      
      if (result.success) {
        haptics.success();
        // Mark form as "clean" so it no longer feels like you're mid-edit.
        setInitialSnapshot(getCurrentSnapshot());
        Keyboard.dismiss();
        setIsEditing(false); // Exit edit mode after a successful save
        Alert.alert(
          t('editProfile.successTitle'),
          t('editProfile.successMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => router.back()
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
    // In view-mode: cancel acts as Back.
    if (!isEditing) {
      router.back();
      return;
    }

    // In edit-mode: Cancel discards changes and returns to view-mode.
    if (!isDirty) {
      setIsEditing(false);
      Keyboard.dismiss();
      return;
    }
    Alert.alert(
      t('editProfile.discardTitle'),
      t('editProfile.discardMessage'),
      [
        { text: t('editProfile.keepEditing'), style: 'cancel' },
        { text: t('editProfile.discard'), style: 'destructive', onPress: () => { resetToSnapshot(); setIsEditing(false); Keyboard.dismiss(); } }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeleteAccount = () => {
    haptics.heavyTap();
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        {isEditing ? (
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={[styles.cancelText, isRTL && styles.textRTL]}>{t('editProfile.cancel')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.headerButton, styles.headerBackButton]}
          >
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('editProfile.headerTitle')}</Text>
        {isEditing ? (
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, (isSaving || !isDirty) && styles.headerButtonDisabled]}
            disabled={isSaving || !isDirty}
          >
            <Text style={[styles.saveText, isRTL && styles.textRTL, (isSaving || !isDirty) && styles.saveTextDisabled]}>
              {isSaving ? t('editProfile.saving') : t('editProfile.save')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
            <Text style={[styles.saveText, isRTL && styles.textRTL]}>{t('common.edit')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Profile Picture Section */}
        <FormSection title={t('editProfile.profilePicture')} isRTL={isRTL} icon="camera-outline">
          <View style={styles.formContent}>
            <TouchableOpacity
              style={[styles.profilePictureContainer, !isEditing && styles.readOnlyBlock]}
              onPress={handleProfilePicturePress}
              disabled={!isEditing}
            >
              <View style={styles.profilePictureWrapper}>
                {formData.profilePicture ? (
                  <Image source={{ uri: formData.profilePicture }} style={styles.profilePicture} />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Ionicons name="person" size={40} color="#C7C7CC" />
                  </View>
                )}
                <View style={[styles.editIconContainer, !isEditing && styles.editIconDisabled]}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </View>
              </View>
              <Text style={[styles.profilePictureText, isRTL && styles.textRTL]}>
                {isEditing ? t('editProfile.tapToChangePhoto') : t('common.edit')}
              </Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        {/* Personal Information */}
        <FormSection title={t('editProfile.personalInfo')} isRTL={isRTL} icon="person-outline">
          <View style={styles.formContent}>
            {/* Required asterisks dropped: at 5/7 fields, they carried no
                information (redundant noise). Optional fields are marked
                "(optional)" below — same pattern as the web app. */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.firstName')}
              </Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.inputRTL]}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder={t('editProfile.enterFirstName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-given"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
                editable={isEditing}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.lastName')}
              </Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.inputRTL]}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder={t('editProfile.enterLastName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-family"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
                editable={isEditing}
              />
            </View>

            {/* Email (read-only) — lock icon in label + universal "Used to
                sign in" hint below clarifies the two-email UX. Apple Relay
                users also get the relay-specific info box beneath. */}
            <View style={styles.fieldContainer}>
              <View style={[styles.labelRow, isRTL && styles.rowRTL]}>
                <Ionicons name="lock-closed-outline" size={12} color="#6B7280" />
                <Text style={[styles.fieldLabel, styles.fieldLabelMuted, isRTL && styles.textRTL, { marginBottom: 0 }]}>
                  {t('editProfile.emailAddress')}
                </Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textInputReadOnly, isRTL && styles.inputValueLTR]}
                value={formData.email}
                placeholder={t('editProfile.enterEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
                editable={false}
              />
              <Text style={[styles.hintText, isRTL && styles.textRTL]}>
                {t('editProfile.emailHint')}
              </Text>
              {String(formData.email || '').includes('@privaterelay.appleid.com') ? (
                <View style={[styles.infoBox, isRTL && styles.rowRTL]}>
                  <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
                  <Text style={[styles.infoBoxText, isRTL && styles.textRTL]}>{t('editProfile.appleRelayInfo')}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.contactEmail')}
              </Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.inputValueLTR]}
                value={formData.contactEmail}
                onChangeText={(text) => updateField('contactEmail', text)}
                placeholder={t('editProfile.contactEmailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
                editable={isEditing}
              />
              {/* Softened from amber warning banner to neutral gray hint —
                  this is helpful info, not a warning. */}
              <View style={[styles.hintRow, isRTL && styles.rowRTL]}>
                <Ionicons name="mail-outline" size={12} color="#6B7280" />
                <Text style={[styles.hintText, styles.hintTextInline, isRTL && styles.textRTL]}>
                  {t('editProfile.contactEmailHint')}
                </Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.phoneNumber')}
              </Text>
              <TextInput
                style={[styles.textInput, isRTL && styles.inputValueLTR]}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder={t('editProfile.enterPhone')}
                keyboardType="phone-pad"
                autoCorrect={false}
                autoComplete="tel"
                returnKeyType="done"
                blurOnSubmit={false}
                placeholderTextColor="#C7C7CC"
                editable={isEditing}
              />
            </View>
          </View>
        </FormSection>

        {/* Additional Information */}
        <FormSection title={t('editProfile.additionalInformation')} isRTL={isRTL} icon="information-circle-outline">
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.dateOfBirth')} <Text style={styles.optionalMark}>{t('editProfile.optional')}</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, isRTL && styles.selectFieldRTL, !isEditing && styles.readOnlyBlock]}
                onPress={showDatePickerModal}
                disabled={!isEditing}
              >
                <Text style={[styles.selectFieldText, isRTL && styles.textRTL, !formData.dateOfBirth && styles.placeholderText]}>
                  {formatDisplayDate(formData.dateOfBirth) || t('editProfile.selectDateOfBirthPlaceholder')}
                </Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.gender')} <Text style={styles.optionalMark}>{t('editProfile.optional')}</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, isRTL && styles.selectFieldRTL, !isEditing && styles.readOnlyBlock]}
                onPress={showGenderSelector}
                disabled={!isEditing}
              >
                <Text style={[styles.selectFieldText, isRTL && styles.textRTL]}>{getGenderLabel(t, formData.gender)}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>
        </FormSection>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <View style={[styles.sectionHeaderRow, isRTL && styles.sectionHeaderRowRTL, { marginHorizontal: 0, marginBottom: 12 }]}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning-outline" size={18} color="#dc2626" />
            </View>
            <Text style={[styles.dangerTitle, isRTL && styles.textRTL]}>{t('editProfile.dangerZoneTitle')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteAccountButton, isSaving && styles.deleteAccountButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color="#ffffff" style={{ marginEnd: 8 }} />
            <Text style={[styles.deleteAccountText, isRTL && styles.textRTL]}>{t('editProfile.deleteAccountButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <View style={[styles.privacyRow, isRTL && styles.rowRTL]}>
            <Ionicons name="lock-closed-outline" size={16} color="#8E8E93" />
            <Text style={[styles.privacyText, isRTL && styles.textRTL]}>{t('editProfile.privacyNote')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={closeDatePicker}
        >
          <View style={styles.iosDateOverlay}>
            <View style={styles.iosDateModal}>
              <View style={styles.iosDateHeader}>
                <TouchableOpacity onPress={closeDatePicker} style={styles.iosDateHeaderBtn}>
                  <Text style={styles.iosDateHeaderText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDatePicker} style={styles.iosDateHeaderBtn}>
                  <Text style={[styles.iosDateHeaderText, styles.iosDateHeaderDone]}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                themeVariant="light"
                textColor="#000000"
                onChange={(event, d) => setTempDate(d || tempDate)}
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
              />
            </View>
          </View>
        </Modal>
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
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>{t('editProfile.selectGender')}</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    isRTL && styles.rowRTL,
                    formData.gender === option.value && styles.selectedGenderOption
                  ]}
                  onPress={() => handleGenderSelect(option.value)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    isRTL && styles.textRTL,
                    formData.gender === option.value && styles.selectedGenderOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {formData.gender === option.value && (
                    <Ionicons name="checkmark" size={20} color="#dc2626" />
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
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerButton: {
    minWidth: 60,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...T.sectionTitleSmall,
    color: '#000000',
  },
  backText: {
    ...T.navTitle,
    color: '#dc2626',
    fontWeight: '400',
  },
  cancelText: {
    ...T.navTitle,
    color: '#dc2626',
    fontWeight: '400',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  saveTextDisabled: {
    color: '#999999',
  },
  saveText: {
    ...T.navTitle,
    color: '#dc2626',
  },
  readOnlyBlock: {
    opacity: 0.75,
  },
  editIconDisabled: {
    opacity: 0.55,
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
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...T.pageTitleLarge,
    fontSize: 36,
    color: '#ffffff',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    ...T.navTitle,
    color: '#dc2626',
    fontWeight: '400',
  },

  // Sections
  section: {
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  sectionHeaderRowRTL: {
    flexDirection: 'row-reverse',
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...T.sectionTitle,
    color: '#000000',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // For values that should remain LTR even in Arabic UI (emails, phone numbers)
  inputValueLTR: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
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
    ...T.navTitle,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 6,
  },
  fieldLabelMuted: {
    color: '#6B7280',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  requiredMark: {
    color: '#dc2626',
    fontSize: 17,
  },
  optionalMark: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  textInput: {
    ...T.navTitle,
    fontWeight: '400',
    color: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  textInputReadOnly: {
    color: '#6B7280',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 4,
  },
  hintTextInline: {
    marginTop: 0,
    flex: 1,
  },
  infoBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBoxText: {
    ...T.captionSmall,
    flex: 1,
    color: '#1D4ED8',
    lineHeight: 16,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningBoxText: {
    ...T.captionSmall,
    flex: 1,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '600',
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectFieldRTL: {
    flexDirection: 'row-reverse',
  },
  selectFieldText: {
    ...T.navTitle,
    fontWeight: '400',
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
    ...T.bodySmall,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Privacy Note
  privacyNote: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  privacyText: {
    ...T.bodySmall,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
    flex: 1,
  },

  dangerZone: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
  dangerTitle: {
    ...T.label,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 12,
  },
  deleteAccountButton: {
    backgroundColor: '#dc2626',
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
    ...T.bodySmall,
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
    end: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profilePictureText: {
    ...T.body,
    color: '#dc2626',
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
  iosDateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosDateModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  iosDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  iosDateHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  iosDateHeaderText: {
    ...T.button,
    color: '#007AFF',
    fontWeight: '500',
  },
  iosDateHeaderDone: {
    fontWeight: '700',
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
    ...T.sectionTitleSmall,
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
    ...T.body,
    color: '#000000',
  },
  selectedGenderOptionText: {
    color: '#dc2626',
    fontWeight: '500',
  },

  // Required field indicator
  requiredMark: {
    ...T.button,
    color: '#dc2626',
  },
});

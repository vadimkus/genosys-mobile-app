import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  ActionSheetIOS,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalization } from '../../contexts/LocalizationContext';
import { isValidEmailValue, normalizeUserProfile } from '../../utils/userProfile';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces, tint } from '../../utils/theme';
import SectionCard from '../../components/SectionCard';
import SectionHeader from '../../components/SectionHeader';

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

export default function EditProfileScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight } = useCollapsibleHeader();
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
  const [showCatModal, setShowCatModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  // Populate form with user data when component loads
  useEffect(() => {
    if (user) {
      const profile = normalizeUserProfile(user);
      const nextForm = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        // "Real email" used for notifications/checkout. Mandatory for all login methods.
        // For non-Apple-relay accounts, default to the auth email if contactEmail is empty.
        contactEmail: profile.contactEmail || (!profile.hasAppleRelayEmail ? profile.email : ''),
        phone: profile.phone,
        // Backend uses `birthday` (YYYY-MM-DD). Keep local field name for UI.
        dateOfBirth: profile.birthday,
        gender: normalizeGenderValue(profile.gender),
        // Don't show GENOSYS_ADDR_V1 payload in the input
        address: profile.addressLine,
        profilePicture: profile.profilePicture,
      };
      setFormData(nextForm);

      // Establish "clean" baseline for dirty tracking.
      setInitialSnapshot({
        ...nextForm,
      });

      // Start in edit mode on first open. After a save we flip to view-mode.
      setIsEditing(true);

      // Set initial date if available
      if (profile.birthday) {
        setSelectedDate(new Date(profile.birthday));
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
          options: [
            t('common.cancel'),
            t('editProfile.takePhoto'),
            t('editProfile.chooseFromLibrary'),
            t('editProfile.useCatAvatar'),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          } else if (buttonIndex === 3) {
            useCatAvatar();
          }
        }
      );
    } else {
        Alert.alert(t('editProfile.selectProfilePictureTitle'), t('editProfile.chooseOption'), [
        { text: t('editProfile.cancel'), style: 'cancel' },
        { text: t('editProfile.takePhoto'), onPress: takePhoto },
        { text: t('editProfile.chooseFromLibrary'), onPress: pickImage },
        { text: t('editProfile.useCatAvatar'), onPress: useCatAvatar },
      ]);
    }
  };

  // Bundled she-cat avatars — resolve to a local file:// URI so they ride the
  // same upload pipeline as camera/library photos (AuthContext.updateProfile).
  const useCatAvatar = () => setShowCatModal(true);

  const selectCatAvatar = async (source) => {
    try {
      const asset = Asset.fromModule(source);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      if (uri) {
        haptics.selectionTick();
        updateField('profilePicture', uri);
      }
      setShowCatModal(false);
    } catch (err) {
      log.error('selectCatAvatar failed:', err);
      setShowCatModal(false);
      Alert.alert(t('common.error'), t('editProfile.avatarError'));
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
      Alert.alert(t('common.error'), t('editProfile.photoError'));
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'android') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.libraryPermission'));
          return;
        }
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
      Alert.alert(t('common.error'), t('editProfile.photoSelectError'));
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
    if (!isValidEmailValue(formData.email)) {
      Alert.alert(t('common.error'), t('editProfile.validationInvalidEmail'));
      return;
    }

    // Contact Email validation (mandatory)
    const contactEmail = String(formData.contactEmail || '').trim();
    if (!isValidEmailValue(contactEmail)) {
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

  const onHeaderBack = () => {
    haptics.lightTap();
    if (isEditing) handleCancel();
    else handleBack();
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

  // Header trailing action: Save while editing, Edit when in view-mode.
  const headerRight = isEditing ? (
    <TouchableOpacity
      onPress={handleSave}
      style={styles.headerAction}
      disabled={isSaving || !isDirty}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.headerActionText, (isSaving || !isDirty) && styles.headerActionDisabled, isRTL && styles.textRTL]}>
        {isSaving ? t('editProfile.saving') : t('editProfile.save')}
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={() => setIsEditing(true)}
      style={styles.headerAction}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.headerActionText, isRTL && styles.textRTL]}>{t('common.edit')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('editProfile.headerTitle')}
        onBack={onHeaderBack}
        right={headerRight}
        isRTL={isRTL}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        {/* Profile Picture Section */}
        <SectionCard title={t('editProfile.profilePicture')} isRTL={isRTL} icon="camera-outline">
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
                    <Ionicons name="person" size={40} color={colors.tertiary} />
                  </View>
                )}
                <View style={[styles.editIconContainer, !isEditing && styles.editIconDisabled]}>
                  <Ionicons name="camera" size={16} color={colors.white} />
                </View>
              </View>
              <Text style={[styles.profilePictureText, isRTL && styles.textRTL]}>
                {isEditing ? t('editProfile.tapToChangePhoto') : t('common.edit')}
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Personal Information */}
        <SectionCard title={t('editProfile.personalInfo')} isRTL={isRTL} icon="person-outline">
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
                placeholderTextColor={colors.tertiary}
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
                placeholderTextColor={colors.tertiary}
                editable={isEditing}
              />
            </View>

            {/* Email (read-only) — lock icon in label + universal "Used to
                sign in" hint below clarifies the two-email UX. Apple Relay
                users also get the relay-specific info box beneath. */}
            <View style={styles.fieldContainer}>
              <View style={[styles.labelRow, isRTL && styles.rowRTL]}>
                <Ionicons name="lock-closed-outline" size={12} color={colors.secondaryLabel} />
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
                placeholderTextColor={colors.tertiary}
                editable={false}
              />
              <Text style={[styles.hintText, isRTL && styles.textRTL]}>
                {t('editProfile.emailHint')}
              </Text>
              {String(formData.email || '').includes('@privaterelay.appleid.com') ? (
                <View style={[styles.infoBox, isRTL && styles.rowRTL]}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.blue} />
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
                placeholderTextColor={colors.tertiary}
                editable={isEditing}
              />
              {/* Softened from amber warning banner to neutral gray hint —
                  this is helpful info, not a warning. */}
              <View style={[styles.hintRow, isRTL && styles.rowRTL]}>
                <Ionicons name="mail-outline" size={12} color={colors.secondaryLabel} />
                <Text style={[styles.hintText, styles.hintTextInline, isRTL && styles.textRTL]}>
                  {t('editProfile.contactEmailHint')}
                </Text>
              </View>
            </View>

            <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
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
                placeholderTextColor={colors.tertiary}
                editable={isEditing}
              />
            </View>
          </View>
        </SectionCard>

        {/* Additional Information */}
        <SectionCard title={t('editProfile.additionalInformation')} isRTL={isRTL} icon="information-circle-outline">
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
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.tertiary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.fieldContainer, styles.fieldContainerLast]}>
              <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
                {t('editProfile.gender')} <Text style={styles.optionalMark}>{t('editProfile.optional')}</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectField, isRTL && styles.selectFieldRTL, !isEditing && styles.readOnlyBlock]}
                onPress={showGenderSelector}
                disabled={!isEditing}
              >
                <Text style={[styles.selectFieldText, isRTL && styles.textRTL]}>{getGenderLabel(t, formData.gender)}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* Danger Zone */}
        <View style={[styles.dangerZone, shadow.card]}>
          <SectionHeader
            icon="warning-outline"
            title={t('editProfile.dangerZoneTitle')}
            tileColor={colors.red}
            isRTL={isRTL}
            style={styles.dangerHeader}
          />
          <TouchableOpacity
            style={[styles.deleteAccountButton, shadow.cta(colors.cta), isSaving && styles.deleteAccountButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color={colors.white} style={{ marginEnd: 8 }} />
            <Text style={[styles.deleteAccountText, isRTL && styles.textRTL]}>{t('editProfile.deleteAccountButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <View style={[styles.privacyRow, isRTL && styles.rowRTL]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.secondaryLabel} />
            <Text style={[styles.privacyText, isRTL && styles.textRTL]}>{t('editProfile.privacyNote')}</Text>
          </View>
        </View>
      </Animated.ScrollView>

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
                textColor={colors.label}
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
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={24} color={colors.label} />
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
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Cat Avatar Picker Modal */}
      <Modal
        visible={showCatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>{t('editProfile.chooseCatTitle')}</Text>
              <TouchableOpacity
                onPress={() => setShowCatModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={24} color={colors.label} />
              </TouchableOpacity>
            </View>
            <View style={styles.catGrid}>
              {CAT_AVATARS.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.catOption}
                  onPress={() => selectCatAvatar(cat.source)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t(`editProfile.cat_${cat.key}`)}
                >
                  <Image source={cat.source} style={styles.catImage} />
                  <Text style={styles.catLabel}>{t(`editProfile.cat_${cat.key}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Bundled she-cat avatar set — different fur colors and moods.
const CAT_AVATARS = [
  { key: 'rose', source: require('../../assets/avatar-cat.png') },
  { key: 'grey', source: require('../../assets/avatar-cat-grey.png') },
  { key: 'ginger', source: require('../../assets/avatar-cat-ginger.png') },
  { key: 'white', source: require('../../assets/avatar-cat-white.png') },
];

const styles = StyleSheet.create({
  dangerHeader: { marginBottom: 12 },
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  // Cat avatar picker
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  catOption: {
    width: '46%',
    alignItems: 'center',
    backgroundColor: colors.subtleBg,
    borderRadius: 16,
    paddingVertical: 14,
  },
  catImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  catLabel: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.label,
  },
  scrollView: {
    flex: 1,
  },

  // Header trailing action (Save / Edit)
  headerAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    ...T.navTitle,
    color: colors.accent,
  },
  headerActionDisabled: {
    color: colors.secondaryLabel,
  },

  // Sections (soft cards)
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
    overflow: 'hidden',
  },

  // Form Fields (inset rows with hairline separators)
  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  fieldContainerLast: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryLabel,
    marginBottom: 6,
  },
  fieldLabelMuted: {
    color: colors.secondaryLabel,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  optionalMark: {
    color: colors.secondaryLabel,
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    ...T.input,
    fontSize: 16,
    color: colors.label,
    paddingVertical: 6,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 36,
  },
  textInputReadOnly: {
    color: colors.secondaryLabel,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: colors.secondaryLabel,
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
    backgroundColor: tint(colors.blue, '14'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tint(colors.blue, '40'),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBoxText: {
    ...T.captionSmall,
    flex: 1,
    color: colors.blue,
    lineHeight: 16,
    fontWeight: '600',
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectFieldRTL: {
    flexDirection: 'row-reverse',
  },
  selectFieldText: {
    ...T.input,
    fontSize: 16,
    color: colors.label,
  },

  // Privacy Note
  privacyNote: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    justifyContent: 'center',
  },
  privacyText: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    lineHeight: 20,
    textAlign: 'center',
    flex: 1,
  },

  // Danger Zone
  dangerZone: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 16,
  },
  deleteAccountButton: {
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountButtonDisabled: {
    opacity: 0.6,
  },
  deleteAccountText: {
    ...T.button,
    fontWeight: '700',
    color: colors.white,
  },

  // Profile Picture Styles
  readOnlyBlock: {
    opacity: 0.75,
  },
  editIconDisabled: {
    opacity: 0.55,
  },
  profilePictureContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  profilePictureWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.subtleBg,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.subtleBg,
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
    backgroundColor: colors.cta,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  profilePictureText: {
    ...T.bodySmall,
    lineHeight: undefined,
    color: colors.accent,
    fontWeight: '600',
  },

  // Additional Field Styles
  placeholderText: {
    color: colors.secondaryLabel,
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
    backgroundColor: colors.card,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  iosDateHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  iosDateHeaderText: {
    ...T.button,
    color: colors.blue,
    fontWeight: '500',
  },
  iosDateHeaderDone: {
    fontWeight: '700',
  },
  modalContainer: {
    backgroundColor: colors.card,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  modalTitle: {
    ...T.sectionTitleSmall,
    color: colors.label,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  selectedGenderOption: {
    backgroundColor: colors.accentBg,
  },
  genderOptionText: {
    ...T.body,
    color: colors.label,
  },
  selectedGenderOptionText: {
    color: colors.accent,
    fontWeight: '500',
  },
});

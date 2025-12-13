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

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  // Check authentication immediately
  useEffect(() => {
    console.log('🔍 Edit Profile Screen - Auth Check:', {
      isAuthenticated,
      userExists: !!user,
      userToken: !!user?.token,
      userEmail: user?.email
    });
    
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to edit your profile.',
        [
          {
            text: 'OK',
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
    gender: 'Prefer not to say',
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
      console.log('📝 Populating profile form with user data:', user);
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'Prefer not to say',
        address: user.address || '',
        profilePicture: user.profilePicture || null,
      });
      
      // Set initial date if available
      if (user.dateOfBirth) {
        setSelectedDate(new Date(user.dateOfBirth));
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
      Alert.alert('Select Profile Picture', 'Choose an option:', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
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
      Alert.alert('Permission needed', 'Photo library permission is required to select images');
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
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleGenderSelect = (selectedGender) => {
    updateField('gender', selectedGender);
    setShowGenderModal(false);
  };

  const showGenderSelector = () => {
    setShowGenderModal(true);
  };

  const handleSave = async () => {
    console.log('💾 Profile save started');
    console.log('👤 Current user:', user);
    console.log('🔑 User token exists:', !!user?.token);
    
    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields including address for delivery.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare profile data for API
      const profileData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),
        profilePicture: formData.profilePicture,
        emailNotifications,
        smsNotifications,
      };

      console.log('💾 Saving profile data:', profileData);
      console.log('🔑 User token before update:', !!user?.token);
      
      const result = await updateProfile(profileData);
      
      console.log('📊 Profile update result:', {
        success: result.success,
        error: result.error,
        hasUserData: !!result.user
      });
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
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
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
        {/* Profile Picture Section */}
        <FormSection title="Profile Picture">
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
              <Text style={styles.profilePictureText}>Tap to change photo</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        {/* Personal Information */}
        <FormSection title="Personal Information">
          <View style={styles.formContent}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                First Name
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder="Enter your first name"
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
                Last Name
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder="Enter your last name"
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
                Email Address
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="Enter your email"
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
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="Enter your phone number"
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
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TouchableOpacity style={styles.selectField} onPress={showDatePickerModal}>
                <Text style={[styles.selectFieldText, !formData.dateOfBirth && styles.placeholderText]}>
                  {formatDisplayDate(formData.dateOfBirth) || 'Select date of birth'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
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
                placeholder="Enter your delivery address"
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
                <Text style={styles.fieldLabel}>Email Notifications</Text>
                <Text style={styles.switchSubtext}>Receive updates via email</Text>
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
                <Text style={styles.fieldLabel}>SMS Notifications</Text>
                <Text style={styles.switchSubtext}>Receive updates via SMS</Text>
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
              <Text style={styles.modalTitle}>Select Gender</Text>
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

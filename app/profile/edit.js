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
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: 'Genosys',
    lastName: 'User',
    email: 'user@genosys.ae',
    phone: '+971 50 123 4567',
    dateOfBirth: '1990-01-01',
    gender: 'Prefer not to say',
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const updateFirstName = useCallback((text) => {
    setFormData(prevData => ({...prevData, firstName: text}));
  }, []);

  const updateLastName = useCallback((text) => {
    setFormData(prevData => ({...prevData, lastName: text}));
  }, []);

  const updateEmail = useCallback((text) => {
    setFormData(prevData => ({...prevData, email: text}));
  }, []);

  const updatePhone = useCallback((text) => {
    setFormData(prevData => ({...prevData, phone: text}));
  }, []);

  const handleSave = () => {
    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Simulate API call
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

  const FormSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

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
                onChangeText={updateFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
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
                onChangeText={updateLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
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
                onChangeText={updateEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#C7C7CC"
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={updatePhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
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
              <TouchableOpacity style={styles.selectField} onPress={() => Alert.alert('Date Picker', 'Date picker coming soon!')}>
                <Text style={styles.selectFieldText}>{formData.dateOfBirth}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <TouchableOpacity style={styles.selectField} onPress={() => Alert.alert('Gender Selection', 'Gender selection coming soon!')}>
                <Text style={styles.selectFieldText}>{formData.gender}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
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
                onValueChange={setEmailNotifications}
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
                onValueChange={setSmsNotifications}
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
    fontSize: 17,
    color: '#E74C3C',
    fontWeight: '600',
    textAlign: 'right',
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
});

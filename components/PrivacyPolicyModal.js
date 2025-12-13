import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyModal({ visible, onClose, showCloseButton = true }) {
  const handleEmailPress = () => {
    Linking.openURL('mailto:sales@genosys.ae');
  };

  const handleGooglePrivacyPress = () => {
    Linking.openURL('https://policies.google.com/privacy');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#86868B" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Privacy Rights Section */}
          <View style={styles.highlightSection}>
            <Text style={styles.highlightTitle}>Your Privacy Rights</Text>
            <Text style={styles.highlightText}>
              As a registered user, you have the right to access, update, or delete your personal information. 
              This section outlines how we handle your data and your rights under our privacy policy.
            </Text>
          </View>

          {/* Personal Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Personal Information We Collect</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Account Information:</Text>
                <Text style={styles.listItemText}>Name, email, phone number, address</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Profile Data:</Text>
                <Text style={styles.listItemText}>Birthday, profile picture, customer preferences</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Order Information:</Text>
                <Text style={styles.listItemText}>Purchase history, shipping addresses, payment details</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Usage Data:</Text>
                <Text style={styles.listItemText}>Website interactions, page views, session data</Text>
              </View>
            </View>
          </View>

          {/* Google Authentication */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1.1. Google Authentication (OAuth)</Text>
            
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Google Sign-In:</Text>
              <Text style={styles.subSectionText}>
                You may choose to sign in using your Google account. When you use Google Sign-In, Google shares certain information with us to create and manage your account.
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Data Shared:</Text>
              <Text style={styles.subSectionText}>
                Google provides us with your email address, full name, and profile picture (if available). We do not receive or store your Google password. Your Google account password remains secure with Google and is never shared with us.
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Google Privacy:</Text>
              <Text style={styles.subSectionText}>
                By using Google Sign-In, you also agree to Google's Privacy Policy and Terms of Service. Google's authentication is subject to Google's privacy practices, which you can review at{' '}
                <Text style={styles.link} onPress={handleGooglePrivacyPress}>
                  https://policies.google.com/privacy
                </Text>
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Data Usage:</Text>
              <Text style={styles.subSectionText}>
                We use the information provided by Google solely for account creation, authentication, and service provision. This data is treated with the same level of security and privacy protection as information provided through traditional registration methods.
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Account Linking:</Text>
              <Text style={styles.subSectionText}>
                If you already have an account registered with the same email address, signing in with Google will link your Google account to your existing account. You can continue to use either authentication method (email/password or Google Sign-In) to access your account.
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Control:</Text>
              <Text style={styles.subSectionText}>
                You maintain full control over your Google account data. You can revoke our access to your Google account at any time through your Google Account settings. However, revoking access will prevent you from using Google Sign-In until you re-authorize.
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Alternative:</Text>
              <Text style={styles.subSectionText}>
                You are not required to use Google Sign-In. You may always choose to create an account using email and password instead. Both authentication methods provide the same level of service and data protection.
              </Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>• Process and fulfill your orders</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>• Provide customer support and respond to inquiries</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>• Send order updates and promotional communications (with your consent)</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>• Improve our website and services</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>• Comply with legal obligations</Text>
              </View>
            </View>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your personal information for as long as your account is active or as needed to provide services. 
              Order information is retained for accounting and legal compliance purposes. You can request deletion of your 
              account and associated data at any time.
            </Text>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Your Rights</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Access:</Text>
                <Text style={styles.listItemText}>View all personal information we have about you</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Correction:</Text>
                <Text style={styles.listItemText}>Update or correct inaccurate information</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Deletion:</Text>
                <Text style={styles.listItemText}>Request deletion of your personal information</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Portability:</Text>
                <Text style={styles.listItemText}>Export your data in a machine-readable format</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>Opt-out:</Text>
                <Text style={styles.listItemText}>Unsubscribe from marketing communications</Text>
              </View>
            </View>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
              secure servers, and regular security assessments.
            </Text>
          </View>

          {/* Contact Us */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              For any privacy-related questions or to exercise your rights, please contact us at{' '}
              <Text style={styles.link} onPress={handleEmailPress}>
                sales@genosys.ae
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Highlight Section
  highlightSection: {
    backgroundColor: '#E7F3FF',
    borderWidth: 1,
    borderColor: '#B3D9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },

  // Sub-sections
  subSection: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subSectionText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 18,
  },

  // Lists
  listContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  listItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 4,
  },
  listItemText: {
    fontSize: 14,
    color: '#3C3C43',
    flex: 1,
    lineHeight: 18,
  },

  // Contact Section
  contactSection: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#C8E6C8',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
  },

  // Links
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});


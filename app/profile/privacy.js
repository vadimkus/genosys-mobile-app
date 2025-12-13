import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:sales@genosys.ae');
  };

  const handleGooglePrivacyPress = () => {
    Linking.openURL('https://policies.google.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>Last updated: December 13, 2025</Text>
        </View>

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
          <Text style={styles.sectionTitle}>2. Google Authentication</Text>
          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Google Sign-In:</Text>
            <Text style={styles.subSectionText}>
              When you sign in with Google, we receive your basic profile information (name, email, profile picture) 
              from Google according to your Google account privacy settings.
            </Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Data Shared:</Text>
            <Text style={styles.subSectionText}>
              We only receive information that you have made publicly available in your Google profile or that 
              you explicitly consent to share during the authentication process.
            </Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Google Privacy:</Text>
            <Text style={styles.subSectionText}>
              Google's use of your information is governed by their privacy policy. You can review it at: {' '}
              <Text style={styles.link} onPress={handleGooglePrivacyPress}>
                https://policies.google.com/privacy
              </Text>
            </Text>
          </View>
        </View>

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color="#E74C3C" />
              <TouchableOpacity onPress={handleEmailPress}>
                <Text style={styles.contactLink}>sales@genosys.ae</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color="#E74C3C" />
              <Text style={styles.contactText}>+971 58 548 76 65</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color="#E74C3C" />
              <Text style={styles.contactText}>
                Boulevard Plaza Tower 2, Floor 22{'\n'}
                Mohammed Bin Rashid Boulevard{'\n'}
                Downtown, Dubai, UAE
              </Text>
            </View>
          </View>
        </View>

        {/* Information Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect information you provide directly to us, such as when you:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Create an account or profile</Text>
            <Text style={styles.bulletPoint}>• Make a purchase or transaction</Text>
            <Text style={styles.bulletPoint}>• Contact our customer support</Text>
            <Text style={styles.bulletPoint}>• Subscribe to our newsletters</Text>
            <Text style={styles.bulletPoint}>• Participate in surveys or promotions</Text>
          </View>
          
          <Text style={styles.sectionText}>
            This information may include your name, email address, phone number, shipping address, 
            payment information, and preferences.
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Process and fulfill your orders</Text>
            <Text style={styles.bulletPoint}>• Provide customer service and support</Text>
            <Text style={styles.bulletPoint}>• Send you updates about your orders</Text>
            <Text style={styles.bulletPoint}>• Improve our products and services</Text>
            <Text style={styles.bulletPoint}>• Personalize your shopping experience</Text>
            <Text style={styles.bulletPoint}>• Send promotional materials (with your consent)</Text>
            <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          </View>
        </View>

        {/* Information Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing and Disclosure</Text>
          <Text style={styles.sectionText}>
            We do not sell, trade, or rent your personal information to third parties. We may share 
            your information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• With your explicit consent</Text>
            <Text style={styles.bulletPoint}>• To comply with legal requirements</Text>
            <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. This includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Encryption of sensitive data</Text>
            <Text style={styles.bulletPoint}>• Secure server environments</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments</Text>
            <Text style={styles.bulletPoint}>• Limited access to personal information</Text>
          </View>
        </View>

        {/* Privacy Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
          <Text style={styles.sectionText}>
            You have the following rights regarding your personal information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access and review your personal data</Text>
            <Text style={styles.bulletPoint}>• Update or correct your information</Text>
            <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Request data portability</Text>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  updateInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  updateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  highlightSection: {
    backgroundColor: '#FFF3F3',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E74C3C',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  listContainer: {
    marginVertical: 8,
  },
  listItem: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  listItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  subSection: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  subSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  subSectionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  bulletList: {
    marginVertical: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  contactLink: {
    fontSize: 16,
    color: '#E74C3C',
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  link: {
    color: '#E74C3C',
    textDecorationLine: 'underline',
  },
  footerSpace: {
    height: 40,
  },
});
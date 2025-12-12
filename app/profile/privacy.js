import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>Last updated: December 11, 2025</Text>
        </View>

        {/* Introduction */}
        <Section title="Introduction">
          <Paragraph>
            At Genosys, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            mobile application and services.
          </Paragraph>
        </Section>

        {/* Information We Collect */}
        <Section title="Information We Collect">
          <Paragraph>
            We collect information you provide directly to us, such as when you:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Create an account or profile</Text>
            <Text style={styles.bulletPoint}>• Make a purchase or transaction</Text>
            <Text style={styles.bulletPoint}>• Contact our customer support</Text>
            <Text style={styles.bulletPoint}>• Subscribe to our newsletters</Text>
            <Text style={styles.bulletPoint}>• Participate in surveys or promotions</Text>
          </View>
          
          <Paragraph>
            This information may include your name, email address, phone number, shipping address, 
            payment information, and preferences.
          </Paragraph>
        </Section>

        {/* How We Use Information */}
        <Section title="How We Use Your Information">
          <Paragraph>
            We use the information we collect to:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Process and fulfill your orders</Text>
            <Text style={styles.bulletPoint}>• Provide customer service and support</Text>
            <Text style={styles.bulletPoint}>• Send you updates about your orders</Text>
            <Text style={styles.bulletPoint}>• Improve our products and services</Text>
            <Text style={styles.bulletPoint}>• Personalize your shopping experience</Text>
            <Text style={styles.bulletPoint}>• Send promotional materials (with your consent)</Text>
            <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          </View>
        </Section>

        {/* Information Sharing */}
        <Section title="Information Sharing and Disclosure">
          <Paragraph>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
            except in the following circumstances:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Service providers who assist us in operating our business</Text>
            <Text style={styles.bulletPoint}>• Payment processors for transaction processing</Text>
            <Text style={styles.bulletPoint}>• Shipping companies for order delivery</Text>
            <Text style={styles.bulletPoint}>• Legal authorities when required by law</Text>
          </View>
        </Section>

        {/* Data Security */}
        <Section title="Data Security">
          <Paragraph>
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. This includes:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Encryption of sensitive data</Text>
            <Text style={styles.bulletPoint}>• Secure server environments</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments</Text>
            <Text style={styles.bulletPoint}>• Limited access to personal information</Text>
          </View>
        </Section>

        {/* Your Rights */}
        <Section title="Your Privacy Rights">
          <Paragraph>
            Depending on your location, you may have the following rights:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access to your personal information</Text>
            <Text style={styles.bulletPoint}>• Correction of inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Deletion of your personal information</Text>
            <Text style={styles.bulletPoint}>• Restriction of processing</Text>
            <Text style={styles.bulletPoint}>• Data portability</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
          </View>
        </Section>

        {/* Cookies and Tracking */}
        <Section title="Cookies and Tracking Technologies">
          <Paragraph>
            We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
            and personalize content. You can control cookie preferences through your device settings.
          </Paragraph>
        </Section>

        {/* Children's Privacy */}
        <Section title="Children's Privacy">
          <Paragraph>
            Our services are not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us.
          </Paragraph>
        </Section>

        {/* International Transfers */}
        <Section title="International Data Transfers">
          <Paragraph>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your information during such transfers.
          </Paragraph>
        </Section>

        {/* Changes to Policy */}
        <Section title="Changes to This Privacy Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any material changes 
            by posting the new Privacy Policy in our app and updating the "Last updated" date above.
          </Paragraph>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Paragraph>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>Email: privacy@genosys.ae</Text>
            <Text style={styles.contactItem}>Phone: +971 4 123 4567</Text>
            <Text style={styles.contactItem}>Address: Dubai Marina, UAE</Text>
          </View>
        </Section>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },

  // Update Info
  updateInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  updateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  paragraph: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 12,
  },

  // Lists
  bulletList: {
    marginVertical: 8,
    marginLeft: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 4,
  },

  // Contact Info
  contactInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 4,
  },

  // Footer
  footerSpace: {
    height: 40,
  },
});

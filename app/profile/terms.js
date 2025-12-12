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

export default function TermsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>Last updated: December 11, 2025</Text>
        </View>

        {/* Introduction */}
        <Section title="Agreement to Terms">
          <Paragraph>
            By accessing and using the Genosys mobile application, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Paragraph>
        </Section>

        {/* Use License */}
        <Section title="Use License">
          <Paragraph>
            Permission is granted to temporarily use the Genosys mobile application for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
            <Text style={styles.bulletPoint}>• Use the materials for commercial purposes or public display</Text>
            <Text style={styles.bulletPoint}>• Attempt to decompile or reverse engineer any software</Text>
            <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>
          </View>
        </Section>

        {/* Account Terms */}
        <Section title="Account Terms">
          <Paragraph>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times.
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You are responsible for safeguarding your password</Text>
            <Text style={styles.bulletPoint}>• You must not share your account with others</Text>
            <Text style={styles.bulletPoint}>• You must notify us immediately of any unauthorized use</Text>
            <Text style={styles.bulletPoint}>• We reserve the right to terminate accounts that violate these terms</Text>
          </View>
        </Section>

        {/* Products and Services */}
        <Section title="Products and Services">
          <Paragraph>
            All products are subject to availability. We reserve the right to discontinue any product at any time.
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Product descriptions and prices are subject to change without notice</Text>
            <Text style={styles.bulletPoint}>• We make every effort to display accurate colors and images</Text>
            <Text style={styles.bulletPoint}>• Results from skincare products may vary by individual</Text>
            <Text style={styles.bulletPoint}>• Professional consultation is recommended for sensitive skin conditions</Text>
          </View>
        </Section>

        {/* Orders and Payment */}
        <Section title="Orders and Payment">
          <Paragraph>
            By placing an order, you agree to provide current, complete, and accurate purchase information.
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• All prices are in UAE Dirhams (AED)</Text>
            <Text style={styles.bulletPoint}>• Payment is required at the time of order</Text>
            <Text style={styles.bulletPoint}>• We accept major credit cards and approved payment methods</Text>
            <Text style={styles.bulletPoint}>• Orders are subject to product availability</Text>
            <Text style={styles.bulletPoint}>• We reserve the right to refuse or cancel any order</Text>
          </View>
        </Section>

        {/* Shipping and Delivery */}
        <Section title="Shipping and Delivery">
          <Paragraph>
            We currently ship within the United Arab Emirates only.
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Delivery times are estimates and not guaranteed</Text>
            <Text style={styles.bulletPoint}>• Risk of loss transfers to you upon delivery</Text>
            <Text style={styles.bulletPoint}>• Additional charges may apply for remote areas</Text>
            <Text style={styles.bulletPoint}>• Someone must be available to receive the package</Text>
          </View>
        </Section>

        {/* Returns and Refunds */}
        <Section title="Returns and Refunds">
          <Paragraph>
            We accept returns of unopened products in original condition within 30 days of purchase.
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Opened skincare products can be returned within 14 days</Text>
            <Text style={styles.bulletPoint}>• Products must be in original packaging with all labels</Text>
            <Text style={styles.bulletPoint}>• Return shipping costs are customer's responsibility</Text>
            <Text style={styles.bulletPoint}>• Refunds will be processed to original payment method</Text>
            <Text style={styles.bulletPoint}>• Custom or personalized products cannot be returned</Text>
          </View>
        </Section>

        {/* Privacy Policy */}
        <Section title="Privacy Policy">
          <Paragraph>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information 
            when you use our service. By using our service, you agree to the collection and use of information in accordance 
            with our Privacy Policy.
          </Paragraph>
        </Section>

        {/* Prohibited Uses */}
        <Section title="Prohibited Uses">
          <Paragraph>
            You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts:
          </Paragraph>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Violate any international, federal, provincial, or state regulations or laws</Text>
            <Text style={styles.bulletPoint}>• Transmit or procure the sending of any advertising or promotional material</Text>
            <Text style={styles.bulletPoint}>• Impersonate or attempt to impersonate the company or another user</Text>
            <Text style={styles.bulletPoint}>• Use the service in any way that could damage or overburden the service</Text>
          </View>
        </Section>

        {/* Disclaimers */}
        <Section title="Disclaimers">
          <Paragraph>
            The information on this mobile application is provided on an "as is" basis. To the fullest extent permitted by law, 
            this company excludes all representations, warranties, and conditions relating to our app and the use of this app.
          </Paragraph>
          <Paragraph>
            Individual results from skincare products may vary. Consult with a healthcare professional before use if you have 
            any medical conditions or skin sensitivities.
          </Paragraph>
        </Section>

        {/* Limitations */}
        <Section title="Limitations">
          <Paragraph>
            In no event shall Genosys or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
            or due to business interruption) arising out of the use or inability to use the materials on the app, 
            even if Genosys or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </Paragraph>
        </Section>

        {/* Governing Law */}
        <Section title="Governing Law">
          <Paragraph>
            These terms and conditions are governed by and construed in accordance with the laws of the United Arab Emirates, 
            and you irrevocably submit to the exclusive jurisdiction of the courts in Dubai, UAE.
          </Paragraph>
        </Section>

        {/* Changes to Terms */}
        <Section title="Changes to Terms">
          <Paragraph>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </Paragraph>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about these Terms & Conditions, please contact us:
          </Paragraph>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>Email: legal@genosys.ae</Text>
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

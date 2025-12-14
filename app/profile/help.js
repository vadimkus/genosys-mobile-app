import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order by going to the Orders section in your profile. Click on any order to see detailed tracking information and delivery status.'
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unopened products in original condition. Opened skincare products can be returned within 14 days for hygiene reasons.'
    },
    {
      id: 3,
      question: 'How long does shipping take?',
      answer: 'Standard shipping within UAE takes 1-3 business days. Express shipping is available for next-day delivery in Dubai and Abu Dhabi.'
    },
    {
      id: 4,
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within the United Arab Emirates. We are working on expanding our shipping coverage to other GCC countries.'
    },
    {
      id: 5,
      question: 'How do I change or cancel my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement. Contact our customer service team immediately for assistance.'
    },
    {
      id: 6,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and cash on delivery for select areas.'
    },
  ];

  const supportOptions = [
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'Get help via email',
      description: 'support@genosys.ae',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@genosys.ae'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      subtitle: 'Speak with our team',
      description: '+971 4 123 4567',
      icon: 'call',
      action: () => Linking.openURL('tel:+97141234567'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat on WhatsApp',
      description: '+971 58 548 76 65',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/971585487665'),
    },
    {
      id: 'live-chat',
      title: 'Live Chat',
      subtitle: 'Instant messaging',
      description: 'Available 9 AM - 6 PM',
      icon: 'chatbubbles',
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
    },
  ];

  const handleFaqPress = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const SupportOptionCard = ({ option }) => (
    <TouchableOpacity style={styles.supportCard} onPress={option.action}>
      <View style={styles.supportIcon}>
        <Ionicons name={option.icon} size={24} color="#E74C3C" />
      </View>
      <View style={styles.supportDetails}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
        <Text style={styles.supportDescription}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const FaqItem = ({ faq }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => handleFaqPress(faq.id)}
      >
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        <Ionicons 
          name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#8E8E93" 
        />
      </TouchableOpacity>
      
      {expandedFaq === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions or get in touch with our support team
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {supportOptions.map((option) => (
            <SupportOptionCard key={option.id} option={option} />
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqData.map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Order Status', 'Redirecting to orders...')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={24} color="#27AE60" />
              </View>
              <Text style={styles.quickActionTitle}>Track Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Returns', 'Returns process coming soon!')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionTitle}>Return Item</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Report Issue', 'Issue reporting coming soon!')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="alert-circle-outline" size={24} color="#FF9500" />
              </View>
              <Text style={styles.quickActionTitle}>Report Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Product Guide', 'Product guides coming soon!')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="book-outline" size={24} color="#AF52DE" />
              </View>
              <Text style={styles.quickActionTitle}>Product Guide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.businessHoursSection}>
          <Text style={styles.businessHoursTitle}>Customer Service Hours</Text>
          <View style={styles.businessHoursCard}>
            <View style={styles.businessHoursItem}>
              <Text style={styles.dayText}>Monday - Friday</Text>
              <Text style={styles.hoursText}>9:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.businessHoursItem}>
              <Text style={styles.dayText}>Saturday</Text>
              <Text style={styles.hoursText}>10:00 AM - 4:00 PM</Text>
            </View>
            <View style={styles.businessHoursItem}>
              <Text style={styles.dayText}>Sunday</Text>
              <Text style={styles.hoursText}>Closed</Text>
            </View>
          </View>
          <Text style={styles.timezoneText}>All times are in UAE Standard Time (UTC+4)</Text>
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

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  // Support Cards
  supportCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportDetails: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '500',
  },

  // FAQ
  faqContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },

  // Business Hours
  businessHoursSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  businessHoursTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  businessHoursCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  businessHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  hoursText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  timezoneText: {
    fontSize: 13,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 12,
  },
});

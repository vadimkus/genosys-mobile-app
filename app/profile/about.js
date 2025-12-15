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
import Constants from 'expo-constants';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const appVersion = String(Constants?.expoConfig?.version || Constants?.manifest?.version || '1.0.0');

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const FeatureCard = ({ icon, title, description, color }) => (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  const TeamMember = ({ role, description }) => (
    <View style={styles.teamMember}>
      <Text style={styles.teamRole}>{role}</Text>
      <Text style={styles.teamDescription}>{description}</Text>
    </View>
  );

  const SocialLink = ({ icon, name, url }) => (
    <TouchableOpacity style={styles.socialLink} onPress={() => handleLinkPress(url)}>
      <Ionicons name={icon} size={24} color="#E74C3C" />
      <Text style={styles.socialText}>{name}</Text>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.heroTitle}>Genosys</Text>
          <Text style={styles.heroSubtitle}>{t('about.premiumSubtitle')}</Text>
          <Text style={styles.versionText}>{t('about.versionLabel', { version: appVersion })}</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            At Genosys, we believe that healthy, radiant skin is achievable for everyone. 
            Our mission is to provide premium, clinically-proven skincare solutions that deliver 
            visible results while respecting the unique needs of each individual's skin.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Makes Us Different</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="flask"
              title="Science-Based"
              description="All products backed by clinical research and dermatological testing"
              color="#E74C3C"
            />
            <FeatureCard
              icon="leaf"
              title="Natural Ingredients"
              description="Premium natural ingredients sourced from sustainable suppliers"
              color="#27AE60"
            />
            <FeatureCard
              icon="star"
              title="Proven Results"
              description="Visible improvements in skin texture, tone, and overall health"
              color="#007AFF"
            />
            <FeatureCard
              icon="shield-checkmark"
              title="Dermatologist Approved"
              description="Recommended by skin care professionals worldwide"
              color="#AF52DE"
            />
          </View>
        </View>

        {/* Story Section */}
        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.storyText}>
            Founded in 2020 in Dubai, Genosys emerged from a passion for combining cutting-edge 
            skincare science with the luxury beauty traditions of the Middle East. Our founders, 
            experienced dermatologists and beauty experts, recognized the need for premium skincare 
            solutions tailored to the unique climate and lifestyle of the region.
          </Text>
          <Text style={styles.storyText}>
            Today, we serve thousands of satisfied customers across the UAE, helping them achieve 
            their skincare goals with our carefully curated collection of products and personalized 
            beauty consultations.
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesList}>
            <View style={styles.valueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Quality First</Text>
                <Text style={styles.valueDescription}>Never compromising on product quality or safety standards</Text>
              </View>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Customer-Centric</Text>
                <Text style={styles.valueDescription}>Every decision we make puts our customers' needs first</Text>
              </View>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Innovation</Text>
                <Text style={styles.valueDescription}>Continuously researching and developing new solutions</Text>
              </View>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <View style={styles.valueContent}>
                <Text style={styles.valueTitle}>Sustainability</Text>
                <Text style={styles.valueDescription}>Committed to eco-friendly practices and packaging</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet Our Team</Text>
          <TeamMember
            role="Dermatology Experts"
            description="Board-certified dermatologists who oversee product development and safety"
          />
          <TeamMember
            role="Beauty Consultants"
            description="Licensed aestheticians providing personalized skincare recommendations"
          />
          <TeamMember
            role="Customer Success"
            description="Dedicated support team ensuring exceptional customer experiences"
          />
          <TeamMember
            role="Research & Development"
            description="Scientists and chemists developing innovative skincare formulations"
          />
        </View>

        {/* Recognition */}
        <View style={styles.recognitionSection}>
          <Text style={styles.sectionTitle}>Recognition & Certifications</Text>
          <View style={styles.certificationsList}>
            <View style={styles.certificationItem}>
              <Ionicons name="ribbon" size={20} color="#FFD700" />
              <Text style={styles.certificationText}>UAE Beauty Awards 2023 - Best Skincare Brand</Text>
            </View>
            <View style={styles.certificationItem}>
              <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              <Text style={styles.certificationText}>ISO 9001:2015 Quality Management Certified</Text>
            </View>
            <View style={styles.certificationItem}>
              <Ionicons name="leaf" size={20} color="#27AE60" />
              <Text style={styles.certificationText}>Cruelty-Free International Certified</Text>
            </View>
            <View style={styles.certificationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={styles.certificationText}>FDA Registered Manufacturing Partner</Text>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <SocialLink
            icon="logo-instagram"
            name="@genosys_uae"
            url="https://instagram.com/genosys_uae"
          />
          <SocialLink
            icon="logo-facebook"
            name="Genosys UAE"
            url="https://facebook.com/genosysuae"
          />
          <SocialLink
            icon="globe"
            name="www.genosys.ae"
            url={AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae'}
          />
        </View>

        {/* App Information */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Last Updated</Text>
              <Text style={styles.appInfoValue}>December 2025</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Size</Text>
              <Text style={styles.appInfoValue}>25.6 MB</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Compatibility</Text>
              <Text style={styles.appInfoValue}>iOS 14.0+ / Android 8.0+</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Genosys LLC. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ in Dubai, UAE</Text>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#C7C7CC',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  // Mission
  missionText: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Story
  storySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
  },
  storyText: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 16,
  },

  // Values
  valuesList: {
    gap: 16,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  valueContent: {
    flex: 1,
    marginLeft: 12,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Team
  teamMember: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamRole: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  teamDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },

  // Recognition
  recognitionSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
  },
  certificationsList: {
    gap: 12,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  certificationText: {
    fontSize: 15,
    color: '#1D1D1F',
    marginLeft: 12,
    flex: 1,
  },

  // Social Links
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  socialText: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
    marginLeft: 16,
  },

  // App Info
  appInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  appInfoCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  appInfoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 4,
  },
});

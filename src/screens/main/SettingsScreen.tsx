import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  
  const handleEmailPress = () => {
    const email = 'sales@genosys.ae';
    const subject = 'Inquiry from Genosys Mobile App';
    const body = 'Hello,\n\nI would like to get in touch regarding...';
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert(
        'Email Not Available',
        'Please contact us at sales@genosys.ae',
        [{ text: 'OK' }]
      );
    });
  };

  const handlePhonePress = () => {
    Alert.alert(
      'Contact Information',
      'For phone support, please email us at sales@genosys.ae',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We collect and use your information in accordance with our privacy policy.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Terms of Service',
      'By using this app, you agree to our terms of service.',
      [{ text: 'OK' }]
    );
  };

  const handleAboutPress = () => {
    Alert.alert(
      'About Genosys',
      'Genosys Mobile App v1.0.0\n\nPremium dermacosmetics and beauty products.',
      [{ text: 'OK' }]
    );
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic here
          console.log('User logged out');
        }}
      ]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Customize your experience</Text>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
        
        <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={24} color="#dc2626" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Get updates about orders and promotions</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#e5e7eb', true: '#fecaca' }}
            thumbColor={notificationsEnabled ? '#dc2626' : '#9ca3af'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon" size={24} color="#dc2626" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Switch between light and dark themes</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#e5e7eb', true: '#fecaca' }}
            thumbColor={isDark ? '#dc2626' : '#9ca3af'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="location" size={24} color="#dc2626" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Location Services</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Enable location for delivery tracking</Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#e5e7eb', true: '#fecaca' }}
            thumbColor={locationEnabled ? '#dc2626' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Privacy & Data Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacy & Data</Text>
        
        <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="analytics" size={24} color="#dc2626" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Analytics</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Help improve the app experience</Text>
            </View>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: '#e5e7eb', true: '#fecaca' }}
            thumbColor={analyticsEnabled ? '#dc2626' : '#9ca3af'}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="megaphone" size={24} color="#dc2626" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Marketing</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>Receive promotional offers and updates</Text>
            </View>
          </View>
          <Switch
            value={marketingEnabled}
            onValueChange={setMarketingEnabled}
            trackColor={{ false: '#e5e7eb', true: '#fecaca' }}
            thumbColor={marketingEnabled ? '#dc2626' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handleEmailPress}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="mail" size={24} color="#dc2626" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Contact Support</Text>
            <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>sales@genosys.ae</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handleAboutPress}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="information-circle" size={24} color="#dc2626" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>About</Text>
            <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>App version and information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Legal</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handlePrivacyPress}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#dc2626" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>How we protect your data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handleTermsPress}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="document-text" size={24} color="#dc2626" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Terms of Service</Text>
            <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>App usage terms and conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#dc2626' }]}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out" size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Genosys Mobile App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

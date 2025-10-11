import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  
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
    // You can add a phone number here if available
    Alert.alert(
      'Contact Information',
      'For phone support, please email us at sales@genosys.ae',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>App preferences and support</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Us</Text>
        
        <TouchableOpacity 
          style={[styles.contactItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handleEmailPress}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={24} color="#dc2626" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.colors.text }]}>Email Support</Text>
            <Text style={[styles.contactValue, { color: theme.colors.textSecondary }]}>sales@genosys.ae</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.contactItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={handlePhonePress}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={24} color="#dc2626" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: theme.colors.text }]}>Phone Support</Text>
            <Text style={[styles.contactValue, { color: theme.colors.textSecondary }]}>Contact via email</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Information</Text>
        
        <View style={[styles.infoItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Version</Text>
          <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>1.0.0</Text>
        </View>

        <View style={[styles.infoItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Company</Text>
          <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>Genosys</Text>
        </View>
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
});

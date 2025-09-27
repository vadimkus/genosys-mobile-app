import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer: React.FC = () => {
  const handlePhoneCall = () => {
    Linking.openURL('tel:+971585487665');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:sales@genosys.ae');
  };

  const handleWebsite = () => {
    Linking.openURL('https://genosys.ae');
  };

  return (
    <View style={styles.footer}>
      {/* Logo and Company Info */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../../images/Full.avif')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.companyName}>Genosys Middle East FZ-LLC</Text>
        <Text style={styles.distributorText}>Official Distributor in the UAE</Text>
      </View>

      {/* Contact Information */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactItem} onPress={handlePhoneCall}>
          <Ionicons name="call" size={20} color="#ef4444" />
          <Text style={styles.contactText}>+971 58 548 76 65</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
          <Ionicons name="mail" size={20} color="#ef4444" />
          <Text style={styles.contactText}>sales@genosys.ae</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Links */}
      <View style={styles.linksSection}>
        <TouchableOpacity style={styles.linkItem} onPress={handleWebsite}>
          <Text style={styles.linkText}>Visit Website</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>
          © 2025 Genosys Middle East FZ-LLC. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1f2937', // Dark gray background
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Pretendard-Bold',
  },
  distributorText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
  },
  contactSection: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '500',
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  linkItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  copyrightText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default Footer;

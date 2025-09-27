import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SimpleFooter: React.FC = () => {

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
    backgroundColor: '#ffffff', // White background
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 88,
    height: 44,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Pretendard',
  },
  distributorText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  copyrightText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default SimpleFooter;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleWhatsAppContact = async () => {
    const phoneNumber = '971585487665';
    const message = 'Hello! I\'m interested in Genosys products. Can you help me?';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to regular phone call
        await Linking.openURL(`tel:+${phoneNumber}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot open WhatsApp. Please call us directly.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to Genosys</Text>
        <Text style={styles.heroSubtitle}>Premium Korean Dermacosmetics</Text>
        <Text style={styles.heroLocation}>United Arab Emirates 🇦🇪</Text>
      </View>

      <View style={styles.features}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigation.navigate('Products' as never)}
        >
          <Text style={styles.featureTitle}>Browse Products</Text>
          <Text style={styles.featureDesc}>Discover our premium skincare range</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Text style={styles.featureTitle}>Shopping Cart</Text>
          <Text style={styles.featureDesc}>View your selected items</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Text style={styles.featureTitle}>My Profile</Text>
          <Text style={styles.featureDesc}>Manage your account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigation.navigate('Training' as never)}
        >
          <Text style={styles.featureTitle}>Training Videos</Text>
          <Text style={styles.featureDesc}>Professional training materials</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <Text style={styles.featureTitle}>My Orders</Text>
          <Text style={styles.featureDesc}>Track your orders and history</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandInfo}>
        <Text style={styles.brandTitle}>About Genosys</Text>
        <Text style={styles.brandDesc}>
          Leading Korean dermacosmetics brand specializing in professional-grade skincare solutions.
        </Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleWhatsAppContact}
        >
          <Text style={styles.contactButtonText}>📱 WhatsApp: +971 58 548 76 65</Text>
        </TouchableOpacity>
        <Text style={styles.contactText}>✉️ sales@genosys.ae</Text>
        <Text style={styles.contactSubtext}>Official Distributor in the UAE</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    backgroundColor: '#ef4444', // Primary red from website
    padding: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 8,
  },
  heroLocation: {
    fontSize: 14,
    color: '#f0f0f0',
    fontWeight: '500',
  },
  features: {
    padding: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // Primary red from website
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
  brandInfo: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444', // Primary red from website
    marginBottom: 10,
  },
  brandDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactInfo: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  contactSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  contactButton: {
    backgroundColor: '#25d366',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

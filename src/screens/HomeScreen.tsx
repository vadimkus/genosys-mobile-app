import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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
        await Linking.openURL(`tel:+${phoneNumber}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot open WhatsApp. Please call us directly.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Image 
            source={require('../../assets/genosys-logo.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroSubtitle}>Premium Korean Dermacosmetics</Text>
          <Text style={styles.heroLocation}>United Arab Emirates</Text>
        </View>
        <View style={styles.heroDecoration}>
          <View style={styles.decorationCircle} />
          <View style={[styles.decorationCircle, styles.decorationCircle2]} />
        </View>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.primaryAction]}
          onPress={() => navigation.navigate('Products' as never)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>✨</Text>
          </View>
          <Text style={[styles.actionTitle, { color: '#ffffff' }]}>Browse Products</Text>
          <Text style={[styles.actionSubtitle, { color: '#e0e0e0' }]}>Discover our premium range</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>🛍️</Text>
          </View>
          <Text style={styles.actionTitle}>Shopping Cart</Text>
          <Text style={styles.actionSubtitle}>View your items</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Training' as never)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📚</Text>
          </View>
          <Text style={styles.actionTitle}>Training</Text>
          <Text style={styles.actionSubtitle}>Professional materials</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📦</Text>
          </View>
          <Text style={styles.actionTitle}>My Orders</Text>
          <Text style={styles.actionSubtitle}>Track your orders</Text>
        </TouchableOpacity>
      </View>

      {/* Brand Story */}
      <View style={styles.brandSection}>
        <Text style={styles.sectionTitle}>About Genosys</Text>
        <Text style={styles.brandDescription}>
          Leading Korean dermacosmetics brand specializing in professional-grade skincare solutions. 
          Our products are trusted by beauty professionals worldwide.
        </Text>
        <View style={styles.brandStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Professionals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5★</Text>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <TouchableOpacity 
          style={styles.whatsappButton}
          onPress={handleWhatsAppContact}
        >
          <View style={styles.whatsappContent}>
            <Text style={styles.whatsappIcon}>💬</Text>
            <View style={styles.whatsappText}>
              <Text style={styles.whatsappTitle}>WhatsApp Support</Text>
              <Text style={styles.whatsappSubtitle}>+971 58 548 76 65</Text>
            </View>
            <Text style={styles.whatsappArrow}>→</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactEmail}>sales@genosys.ae</Text>
          <Text style={styles.contactNote}>Official Distributor in the UAE</Text>
        </View>
      </View>

      {/* Profile Quick Access */}
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile' as never)}
      >
        <View style={styles.profileContent}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileTitle}>My Profile</Text>
            <Text style={styles.profileSubtitle}>Manage your account</Text>
          </View>
          <Text style={styles.profileArrow}>›</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  heroSection: {
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroLogo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: '400',
    marginBottom: 4,
  },
  heroLocation: {
    fontSize: 14,
    color: '#b0b0b0',
    fontWeight: '500',
  },
  heroDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
  },
  decorationCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: 20,
    right: 20,
  },
  decorationCircle2: {
    width: 80,
    height: 80,
    top: 60,
    right: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  primaryAction: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  brandSection: {
    padding: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  brandDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
  },
  brandStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  contactSection: {
    padding: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  whatsappContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  whatsappText: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  whatsappSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  whatsappArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactEmail: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactNote: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  profileButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
  },
  profileText: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  profileArrow: {
    fontSize: 20,
    color: '#999999',
    fontWeight: '300',
  },
});
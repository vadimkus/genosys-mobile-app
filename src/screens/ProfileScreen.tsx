import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

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

  // Default user profile for demo
  const defaultUser = {
    name: 'Vadim Kus',
    email: 'vadim@genosys.ae',
    phone: '+971 58 548 76 65',
    role: 'Professional Account',
    company: 'Genosys Middle East FZ-LLC',
    location: 'Dubai, UAE',
    joinDate: '2024-01-15',
    trainingCompleted: 8,
    certifications: 3
  };

  const currentUser = user || defaultUser;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
              <Text style={styles.userRole}>{currentUser.role}</Text>
              <Text style={styles.userCompany}>{currentUser.company}</Text>
              <Text style={styles.userLocation}>{currentUser.location}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>📦</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>📚</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{currentUser.trainingCompleted}</Text>
            <Text style={styles.statLabel}>Training</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>🏆</Text>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{currentUser.certifications}</Text>
            <Text style={styles.statLabel}>Certifications</Text>
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Personal Information</Text>
            <Text style={styles.menuSubtitle}>Update your details</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>📦</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Order History</Text>
            <Text style={styles.menuSubtitle}>View your orders</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>⚙️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Account Settings</Text>
            <Text style={styles.menuSubtitle}>Preferences & privacy</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🔔</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuSubtitle}>Manage alerts</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🛡️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Privacy & Security</Text>
            <Text style={styles.menuSubtitle}>Data protection</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>❓</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help & Support</Text>
            <Text style={styles.menuSubtitle}>Get assistance</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

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
            <Text style={styles.whatsappArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🏠</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Back to Home</Text>
            <Text style={styles.menuSubtitle}>Return to main screen</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Genosys Mobile App v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Genosys Middle East FZ-LLC</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  menuArrow: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '300',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#cccccc',
  },
  bottomSpacing: {
    height: 30,
  },
});
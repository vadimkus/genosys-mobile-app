import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

export default function ProfileScreen() {
  const { clearCart, cartCount } = useCart();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          clearCart();
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }}
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Email: support@genosys.ae\nPhone: +971 4 XXX XXXX');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Genosys', 
      'Genosys is a premium skincare brand offering innovative beauty solutions with clinically proven results.\n\nVersion 1.0.0'
    );
  };

  const ProfileSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ProfileItem = ({ icon, title, subtitle, onPress, rightComponent, hasArrow = true }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#E74C3C" />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.profileItemRight}>
        {rightComponent || (hasArrow && <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Genosys User</Text>
            <Text style={styles.userEmail}>user@genosys.ae</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <ProfileSection title="Account">
          <ProfileItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your details"
            onPress={handleEditProfile}
          />
          <ProfileItem
            icon="location-outline"
            title="Addresses"
            subtitle="Manage shipping addresses"
            onPress={() => Alert.alert('Addresses', 'Address management coming soon!')}
          />
          <ProfileItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage cards and payment"
            onPress={() => Alert.alert('Payment', 'Payment methods coming soon!')}
          />
          <ProfileItem
            icon="receipt-outline"
            title="Order History"
            subtitle="View past orders"
            onPress={() => Alert.alert('Orders', 'Order history coming soon!')}
          />
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="Preferences">
          <ProfileItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get updates about orders and offers"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D1D6', true: '#E74C3C' }}
                thumbColor="#ffffff"
              />
            }
            hasArrow={false}
          />
          <ProfileItem
            icon="finger-print-outline"
            title="Biometric Login"
            subtitle="Use Face ID or Touch ID"
            rightComponent={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#D1D1D6', true: '#E74C3C' }}
                thumbColor="#ffffff"
              />
            }
            hasArrow={false}
          />
          <ProfileItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Language', 'Language selection coming soon!')}
          />
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="Support & Legal">
          <ProfileItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="FAQs and support"
            onPress={handleContactSupport}
          />
          <ProfileItem
            icon="mail-outline"
            title="Contact Us"
            subtitle="Get in touch with support"
            onPress={handleContactSupport}
          />
          <ProfileItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => Alert.alert('Terms', 'Terms & Conditions coming soon!')}
          />
          <ProfileItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy Policy coming soon!')}
          />
          <ProfileItem
            icon="information-circle-outline"
            title="About"
            onPress={handleAbout}
          />
        </ProfileSection>

        {/* Cart Info */}
        {cartCount > 0 && (
          <ProfileSection title="Shopping">
            <ProfileItem
              icon="bag-outline"
              title="Items in Bag"
              subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} ready for checkout`}
              onPress={() => {}} // Navigation will be handled by tab
              hasArrow={false}
            />
          </ProfileSection>
        )}

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Genosys Mobile v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with love for premium skincare</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#86868B',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#86868B',
  },
  profileItemRight: {
    marginLeft: 12,
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 100, // Extra space for tab bar
  },
  versionText: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
    marginTop: 4,
  },
});

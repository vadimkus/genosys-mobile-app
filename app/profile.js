import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { clearCart, getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { 
    user, 
    logout,
    biometricAvailable,
    biometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric
  } = useAuth();
  const { locale, t } = useLocalization();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const profileImageUri =
    (typeof user?.profilePicture === 'string' && user.profilePicture.trim()) ? user.profilePicture.trim()
    : (typeof user?.profile_picture === 'string' && user.profile_picture.trim()) ? user.profile_picture.trim()
    : (typeof user?.picture === 'string' && user.picture.trim()) ? user.picture.trim()
    : '';

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOutTitle'),
      t('profile.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.signOut'), 
          style: 'destructive', 
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              clearCart();
              const result = await logout();
              if (result.success) {
                // Navigation will be handled automatically by AuthWrapper
                Alert.alert(t('profile.signedOutTitle'), t('profile.signedOutMessage'));
              } else {
                Alert.alert(t('common.error'), result.error || t('profile.signOutFailed'));
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.signOutGenericError'));
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleContactSupport = () => {
    router.push('/profile/contact');
  };

  const handleAbout = () => {
    router.push('/profile/about');
  };

  const handleBiometricToggle = async (value) => {
    if (biometricLoading) return;
    
    setBiometricLoading(true);
    
    try {
      if (value) {
        // Enable biometric authentication
        if (!user?.email) {
          Alert.alert(t('common.error'), t('profile.noUserEmailFound'));
          return;
        }
        
        // We need the password to enable biometric auth
        // For now, we'll show an alert asking user to re-login
        Alert.alert(
          t('profile.enableBiometricTitle', { biometricType }),
          t('profile.enableBiometricMessage', { biometricType }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('profile.logOutAndEnable'), 
              style: 'default',
              onPress: () => {
                Alert.alert(
                  t('profile.instructionsTitle'),
                  t('profile.instructionsMessage', { biometricType }),
                  [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.continue'), onPress: handleSignOut }
                  ]
                );
              }
            }
          ]
        );
      } else {
        // Disable biometric authentication
        const result = await disableBiometric();
        if (result.success) {
          Alert.alert(t('profile.successTitle'), t('profile.biometricDisabled', { biometricType }));
        } else {
          Alert.alert(t('common.error'), result.error || t('profile.disableBiometricFailed'));
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.genericError'));
    } finally {
      setBiometricLoading(false);
    }
  };

  // Quick Action Card Component (Genosys brand style)
  const QuickActionCard = ({ icon, title, subtitle, onPress, color = "#E74C3C" }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  // Section List Item Component
  const ProfileSection = ({ title, children, style }) => (
    <View style={[styles.section, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );

  const ProfileItem = ({ icon, title, subtitle, onPress, rightComponent, hasArrow = true, style, isLast = false }) => (
    <TouchableOpacity 
      style={[
        styles.profileItem, 
        isLast && styles.profileItemLast,
        style
      ]} 
      onPress={onPress} 
      disabled={!onPress}
      activeOpacity={0.6}
    >
      <View style={styles.profileItemLeft}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={22} color="#E74C3C" />
          </View>
        )}
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
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>{t('profile.accountTitle')}</Text>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Apple Store Style Header */}
        <View style={styles.profileHeader}>
          
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {profileImageUri ? (
                <Image 
                  source={{ uri: profileImageUri }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'G'}
                </Text>
              )}
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name || t('common.loading')}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || t('profile.loadingUserData')}
              </Text>
              {user?.phone && (
                <Text style={styles.userPhone}>
                  {user.phone}
                </Text>
              )}
              <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                <Text style={styles.editButtonText}>{t('profile.viewAndEdit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions - Genosys brand style cards */}
        <ProfileSection style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="receipt-outline"
              title={t('profile.orders')}
              subtitle={t('profile.trackPurchases')}
              color="#E74C3C"
              onPress={() => router.push('/profile/orders')}
            />
            <QuickActionCard
              icon="bag-outline"
              title={t('profile.bag')}
              subtitle={cartCount > 0 ? t('profile.itemsCount', { count: cartCount }) : t('profile.empty')}
              color="#27AE60"
              onPress={() => router.push('/(tabs)/bag')}
            />
          </View>
        </ProfileSection>

        {/* Account & Settings */}
        <ProfileSection title={t('profile.accountSection')}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="person-outline"
              title={t('profile.personalInformation')}
              onPress={handleEditProfile}
            />
            <ProfileItem
              icon="location-outline"
              title={t('profile.addresses')}
              onPress={() => router.push('/profile/addresses')}
            />
            <ProfileItem
              icon="card-outline"
              title={t('profile.paymentAndBilling')}
              onPress={() => router.push('/profile/payment')}
            />
            <ProfileItem
              icon="notifications-outline"
              title={t('profile.notifications')}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E5E5EA', true: '#E74C3C' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="#E5E5EA"
                />
              }
              hasArrow={false}
              isLast={true}
            />
          </View>
        </ProfileSection>

        {/* Privacy & Security */}
        <ProfileSection title={t('profile.privacyAndSecurity')}>
          <View style={styles.sectionContent}>
            {biometricAvailable ? (
              <ProfileItem
                icon={biometricType.includes('Face') ? 'scan-outline' : 'finger-print-outline'}
                title={biometricType}
                rightComponent={
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: '#E5E5EA', true: '#27AE60' }}
                    thumbColor="#ffffff"
                    ios_backgroundColor="#E5E5EA"
                    disabled={biometricLoading}
                  />
                }
                hasArrow={false}
              />
            ) : (
              <ProfileItem
                icon="scan-outline"
                title={t('profile.biometricAuthentication')}
                rightComponent={
                  <Text style={styles.unavailableText}>{t('profile.notAvailable')}</Text>
                }
                hasArrow={false}
              />
            )}
            <ProfileItem
              icon="location-outline"
              title={t('profile.myAddresses')}
              subtitle={t('profile.manageDeliveryAddresses')}
              onPress={() => router.push('/profile/addresses')}
            />
            <ProfileItem
              icon="shield-outline"
              title={t('profile.privacyPolicy')}
              onPress={() => router.push('/profile/privacy')}
            />
            <ProfileItem
              icon="document-text-outline"
              title={t('profile.termsAndConditions')}
              onPress={() => router.push('/profile/terms')}
              isLast={true}
            />
          </View>
        </ProfileSection>

        {/* General */}
        <ProfileSection title={t('profile.general')}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="language-outline"
              title={t('profile.language')}
              subtitle={locale === 'ru' ? t('profile.russian') : locale === 'ar' ? t('profile.arabic') : t('profile.english')}
              onPress={() => router.push('/profile/language')}
            />
            <ProfileItem
              icon="help-circle-outline"
              title={t('profile.helpAndSupport')}
              onPress={() => router.push('/profile/help')}
            />
            <ProfileItem
              icon="mail-outline"
              title={t('profile.contactUs')}
              onPress={handleContactSupport}
            />
            <ProfileItem
              icon="information-circle-outline"
              title={t('profile.aboutGenosys')}
              onPress={handleAbout}
              isLast={true}
            />
          </View>
        </ProfileSection>

        {/* Sign Out */}
        <ProfileSection>
          <TouchableOpacity 
            style={[styles.signOutButton, isLoggingOut && styles.signOutButtonDisabled]} 
            onPress={handleSignOut}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#E74C3C" size="small" />
            ) : (
              <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
            )}
          </TouchableOpacity>
        </ProfileSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('profile.appName')}</Text>
          <Text style={styles.footerVersion}>{t('profile.version', { version: '1.0.0' })}</Text>
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
  scrollView: {
    flex: 1,
  },
  
  // Navigation Header
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  
  // Apple Store Style Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },

  // Quick Actions
  quickActionsSection: {
    marginTop: 0,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    marginHorizontal: 20,
    letterSpacing: -0.4,
  },
  sectionContent: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Profile Items
  profileItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 1,
  },
  profileItemSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  profileItemRight: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Sign Out
  signOutButton: {
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#E74C3C',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  unavailableText: {
    fontSize: 14,
    color: '#86868B',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 100, // Space for tab bar
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  footerVersion: {
    fontSize: 13,
    color: '#C7C7CC',
    marginTop: 4,
  },
});

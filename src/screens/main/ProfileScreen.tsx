import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { WishlistService } from '../../services/wishlistService';

const { width, height } = Dimensions.get('window');

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreenNew() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, isLoading } = useStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadWishlistCount = async () => {
    if (!user?.id) return;
    
    try {
      const wishlistItems = await WishlistService.getWishlistItems(user.id);
      setWishlistCount(wishlistItems.length);
    } catch (error) {
      console.error('Error loading wishlist count:', error);
      setWishlistCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('ProfileScreen focused, current user:', user?.name);
      if (user?.id) {
        loadWishlistCount();
      }
    }, [user])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlistCount();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  const handleViewWishlist = () => {
    navigation.navigate('Wishlist');
  };

  const handleViewAddresses = () => {
    navigation.navigate('Addresses');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleAdvancedFeatures = () => {
    navigation.navigate('AdvancedFeatures');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Contact us at support@genosys.ae');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Genosys',
      'Genosys Mobile App v1.0.0\nPremium Korean Dermacosmetics'
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color='#dc2626' />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor='transparent'
        translucent
      />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <View style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name='create-outline' size={20} color='#ffffff' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.firstName?.charAt(0) || user.name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.avatarRing} />
              <TouchableOpacity style={styles.avatarEditButton}>
                <Ionicons name='camera' size={16} color='#ffffff' />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user.name}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user.email}
              </Text>
              <View style={styles.roleContainer}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        user.role === 'admin' 
                          ? '#dc2626' 
                          : user.role === 'distributor' 
                          ? '#f59e0b' 
                          : '#10b981',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      user.role === 'admin' 
                        ? 'shield-checkmark' 
                        : user.role === 'distributor'
                        ? 'business'
                        : 'person'
                    }
                    size={12}
                    color='#ffffff'
                  />
                  <Text style={styles.roleText}>
                    {user.role === 'admin' 
                      ? 'ADMIN' 
                      : user.role === 'distributor' 
                      ? 'DISTRIBUTOR' 
                      : 'CUSTOMER'}
                  </Text>
                </View>
                {user.emailVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name='checkmark-circle'
                      size={16}
                      color='#10b981'
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name='receipt-outline' size={24} color='#dc2626' />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              0
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Orders
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name='heart-outline' size={24} color='#ef4444' />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {wishlistCount}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Wishlist
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name='wallet-outline' size={24} color='#10b981' />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              AED 0
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Spent
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {/* Account Section */}
          <View
            style={[styles.menuSection, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Account
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewOrders}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#dc2626' + '20' },
                  ]}
                >
                  <Ionicons name='receipt-outline' size={20} color='#dc2626' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    My Orders
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    View your order history
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleViewWishlist}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#ef4444' + '20' },
                  ]}
                >
                  <Ionicons name='heart-outline' size={20} color='#ef4444' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Wishlist
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Your saved products
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleViewAddresses}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#3b82f6' + '20' },
                  ]}
                >
                  <Ionicons name='location-outline' size={20} color='#3b82f6' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Addresses
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Manage delivery addresses
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View
            style={[styles.menuSection, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Preferences
            </Text>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#f59e0b' + '20' },
                  ]}
                >
                  <Ionicons
                    name='notifications-outline'
                    size={20}
                    color='#f59e0b'
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Push Notifications
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Get updates about your orders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#6366f1' + '20' },
                  ]}
                >
                  <Ionicons name='moon-outline' size={20} color='#6366f1' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Switch between light and dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
                thumbColor={isDark ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>

          {/* Support Section */}
          <View
            style={[styles.menuSection, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Support
            </Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#6b7280' + '20' },
                  ]}
                >
                  <Ionicons name='settings-outline' size={20} color='#6b7280' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Settings
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    App preferences and configuration
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAdvancedFeatures}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#3b82f6' + '20' },
                  ]}
                >
                  <Ionicons name='rocket-outline' size={20} color='#3b82f6' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Advanced Features
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Analytics, notifications, and offline support
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#10b981' + '20' },
                  ]}
                >
                  <Ionicons
                    name='help-circle-outline'
                    size={20}
                    color='#10b981'
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    Help & Support
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Get help and contact support
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: '#8b5cf6' + '20' },
                  ]}
                >
                  <Ionicons
                    name='information-circle-outline'
                    size={20}
                    color='#8b5cf6'
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuItemText, { color: theme.colors.text }]}
                  >
                    About
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    App version and information
                  </Text>
                </View>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name='log-out-outline' size={20} color='#dc2626' />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollContainer: {
    flex: 1,
  },
  headerGradient: {
    backgroundColor: '#dc2626',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  editButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#dc2626',
    opacity: 0.2,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 8,
    right: width / 2 - 70,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    padding: 20,
    paddingBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

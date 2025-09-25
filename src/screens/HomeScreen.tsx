import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Default user profile for demo
  const defaultUser = {
    name: 'Vadim Kus',
    email: 'vadim@genosys.ae',
    role: 'Professional Account',
    company: 'Genosys Middle East FZ-LLC',
    trainingCompleted: 8,
    certifications: 3
  };

  const currentUser = user || defaultUser;

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {currentUser.name}</Text>
          <Text style={styles.subtitle}>Your premium skincare journey starts here!</Text>
          <Text style={styles.userRole}>{currentUser.role}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuIcon}>
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Health Report Card */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={styles.healthTitle}>Skin Health Report</Text>
          <View style={styles.healthIcon}>
            <View style={styles.scanIcon}>
              <Text style={styles.scanEmoji}>📱</Text>
            </View>
          </View>
        </View>
        <View style={styles.healthContent}>
          <View style={styles.healthMetric}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Your Skin Health</Text>
              <Text style={styles.metricValue}>85%</Text>
            </View>
          </View>
          <View style={styles.healthInfo}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Last Analysis</Text>
              <Text style={styles.infoValue}>2 days ago</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Summary Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
          <View style={styles.profileContent}>
            <Text style={styles.profileTitle}>Your Profile</Text>
            <Text style={styles.profileSubtitle}>{currentUser.company}</Text>
          </View>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{currentUser.trainingCompleted}</Text>
            <Text style={styles.profileStatLabel}>Training</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{currentUser.certifications}</Text>
            <Text style={styles.profileStatLabel}>Certifications</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Routine Card */}
      <View style={styles.routineCard}>
        <View style={styles.routineHeader}>
          <View style={styles.routineIcon}>
            <Text style={styles.routineEmoji}>⏰</Text>
          </View>
          <View style={styles.routineContent}>
            <Text style={styles.routineDate}>25 Sep</Text>
            <Text style={styles.routineTitle}>Daily Routine</Text>
          </View>
        </View>
        <View style={styles.routineFooter}>
          <Text style={styles.routineAction}>Today</Text>
          <Text style={styles.routineArrow}>›</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {['All', 'Face', 'Body', 'Lip', 'Eye'].map((category, index) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                index === 0 && styles.categoryTabActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                index === 0 && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* For You Section */}
      <View style={styles.forYouSection}>
        <View style={styles.forYouHeader}>
          <Text style={styles.forYouTitle}>For You</Text>
          <TouchableOpacity>
            <Text style={styles.forYouSeeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Product Card */}
        <TouchableOpacity 
          style={styles.productCard}
          onPress={() => navigation.navigate('Products' as never)}
        >
          <View style={styles.productHeader}>
            <Text style={styles.productName}>Genosys Microneedle Roller</Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>♡</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productPricing}>
            <Text style={styles.originalPrice}>AED 280</Text>
            <Text style={styles.currentPrice}>AED 230</Text>
          </View>
          <View style={styles.productImageContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>GENOSYS</Text>
              <Text style={styles.logoSubtext}>Professional Skincare</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Products' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>✨</Text>
            </View>
            <Text style={styles.actionTitle}>Browse Products</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cart' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>🛍️</Text>
            </View>
            <Text style={styles.actionTitle}>Shopping Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Training' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>📚</Text>
            </View>
            <Text style={styles.actionTitle}>Training</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Orders' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>📦</Text>
            </View>
            <Text style={styles.actionTitle}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>👤</Text>
            </View>
            <Text style={styles.actionTitle}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
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
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666666',
    margin: 1,
  },
  healthCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanEmoji: {
    fontSize: 12,
  },
  healthContent: {
    flexDirection: 'row',
    gap: 12,
  },
  healthMetric: {
    flex: 1,
  },
  metricBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  healthInfo: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileEmoji: {
    fontSize: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileStat: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  profileStatLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 16,
  },
  profileButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  routineCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routineEmoji: {
    fontSize: 16,
  },
  routineContent: {
    flex: 1,
  },
  routineDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineAction: {
    fontSize: 14,
    color: '#666666',
  },
  routineArrow: {
    fontSize: 18,
    color: '#666666',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#1a1a1a',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  forYouSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  forYouTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  forYouSeeAll: {
    fontSize: 14,
    color: '#666666',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
    color: '#666666',
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 2,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    borderRadius: 16,
    padding: 20,
  },
  whatsappContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappIcon: {
    fontSize: 24,
    marginRight: 16,
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
  bottomSpacing: {
    height: 30,
  },
});
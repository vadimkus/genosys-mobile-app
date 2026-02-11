import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { fetchUserOrders } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, savePushTokenToBackend, clearPushTokenOnBackend } from '../services/pushNotificationsService';
import { buildAuthenticatedWebViewUrl } from '../utils/webViewAuth';
import { createLogger } from '../utils/logger';

const log = createLogger('Profile');

const { width } = Dimensions.get('window');

// Keep Switch color props stable across renders (prevents iOS visual flicker on nearby switches).
const SWITCH_TRACK_PUSH = { false: '#E5E5EA', true: '#dc2626' };
const SWITCH_TRACK_BIOMETRIC = { false: '#E5E5EA', true: '#27AE60' };
const SWITCH_TRACK_EMAIL = { false: '#E5E5EA', true: '#dc2626' };
const SWITCH_THUMB = '#ffffff';
const SWITCH_IOS_BG = '#E5E5EA';

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
  const { locale, t, dir } = useLocalization();
  // Be defensive: some screens rely on `dir`, but if it's ever out of sync,
  // Arabic locale should still force RTL layout for key typography (like the name).
  const isRTL = dir === 'rtl' || locale === 'ar';
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToggleLoading, setPushToggleLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const PUSH_PREF_KEY = '@genosys_push_enabled';
  const EMAIL_NOTIF_PREF_KEY = '@genosys_email_notif_enabled';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(PUSH_PREF_KEY);
        const enabled = v === '1';
        if (!cancelled) setNotificationsEnabled(enabled);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);


  // Local-only notification preferences (email/sms). Backend does not currently persist these.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const e = await AsyncStorage.getItem(EMAIL_NOTIF_PREF_KEY);
        if (!cancelled) {
          if (e === '0' || e === '1') setEmailNotifications(e === '1');
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = user?.token;
      if (!token) {
        setOrdersCount(0);
        return;
      }
      try {
        // Count only Pending + Completed, excluding deleted/cancelled orders.
        // Backend currently returns list (no totalCount field), so we fetch a reasonable page size.
        const list = await fetchUserOrders(token, { page: 1, limit: 100 }).catch(() => []);
        const arr = Array.isArray(list) ? list : [];

        const allowed = new Set(['pending', 'completed', 'delivered']);
        const deleted = new Set(['deleted', 'cancelled', 'canceled']);
        const seen = new Set();

        const count = arr.filter((o) => {
          const key = String(o?.id || o?.orderId || o?.orderNumber || o?.order_number || o?.number || '');
          if (key) {
            if (seen.has(key)) return false;
            seen.add(key);
          }
          const s = String(o?.status || '').toLowerCase();
          const ps = String(o?.paymentStatus || o?.payment_status || '').toLowerCase();
          if (deleted.has(s) || deleted.has(ps)) return false;
          // Treat "paid/confirmed" as completed even if status field is different.
          if (ps === 'paid' || ps === 'confirmed') return true;
          return allowed.has(s);
        }).length;

        if (!cancelled) setOrdersCount(count);
      } catch {
        if (!cancelled) setOrdersCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const profileImageUri =
    (typeof user?.profilePicture === 'string' && user.profilePicture.trim()) ? user.profilePicture.trim()
    : (typeof user?.profile_picture === 'string' && user.profile_picture.trim()) ? user.profile_picture.trim()
    : (typeof user?.picture === 'string' && user.picture.trim()) ? user.picture.trim()
    : '';

  const displayEmail = String(user?.contactEmail || user?.email || '').trim();

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

  const handleBiometricToggle = useCallback(async (value) => {
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
  }, [biometricLoading, biometricType, disableBiometric, enableBiometric, t, user?.email]);

  const handlePushToggle = async (value) => {
    if (pushToggleLoading) return;
    // Only meaningful when logged in (we need user token to store token server-side)
    if (!user?.token) {
      Alert.alert(t('common.error'), t('auth.loginRequired') || t('checkout.loginRequiredMessage'));
      return;
    }

    // Optimistic UI: switch updates immediately, then we do async work.
    const prev = notificationsEnabled;
    setNotificationsEnabled(!!value);
    setPushToggleLoading(true);
    await AsyncStorage.setItem(PUSH_PREF_KEY, value ? '1' : '0').catch((e) => log.warn('Failed to save push pref', e?.message));

    try {
      if (value) {
        const reg = await registerForPushNotificationsAsync();
        if (!reg?.success || !reg?.token) {
          const msg =
            (reg?.errorKey && t(reg.errorKey)) ||
            reg?.error ||
            t('profile.pushEnableFailed');
          throw new Error(msg);
        }
        const saved = await savePushTokenToBackend(user.token, reg.token);
        if (!saved?.success) {
          throw new Error(saved?.error || t('profile.pushEnableFailed'));
        }
        // Success: keep optimistic state; no extra alert (feels instant).
      } else {
        const cleared = await clearPushTokenOnBackend(user.token);
        if (cleared && cleared.success === false) {
          throw new Error(cleared?.error || t('profile.pushEnableFailed'));
        }
        // Success: keep optimistic state; no extra alert (feels instant).
      }
    } catch {
      // Revert UI + local pref on failure
      setNotificationsEnabled(prev);
      await AsyncStorage.setItem(PUSH_PREF_KEY, prev ? '1' : '0').catch((e) => log.warn('Failed to revert push pref', e?.message));
      Alert.alert(t('common.error'), t('profile.pushEnableFailed'));
    } finally {
      setPushToggleLoading(false);
    }
  };

  const handleEmailNotifToggle = useCallback(async (value) => {
    setEmailNotifications(!!value);
    await AsyncStorage.setItem(EMAIL_NOTIF_PREF_KEY, value ? '1' : '0').catch((e) => log.warn('Failed to save email notif pref', e?.message));
  }, []);

  // Memoized switch row to prevent unrelated switches from re-rendering and flickering on iOS.
  const ProfileSwitchItem = useMemo(() => {
    return React.memo(function ProfileSwitchItemInner({
      icon,
      title,
      subtitle,
      value,
      onValueChange,
      trackColor,
      disabled,
      isLast,
    }) {
      return (
        <View style={[styles.profileItem, isLast && styles.profileItemLast]}>
          <View style={styles.profileItemLeft}>
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={22} color="#dc2626" />
              </View>
            )}
            <View style={styles.profileItemText}>
              <Text style={styles.profileItemTitle}>{title}</Text>
              {subtitle ? <Text style={styles.profileItemSubtitle}>{subtitle}</Text> : null}
            </View>
          </View>
          <View style={styles.profileItemRight}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={trackColor}
              thumbColor={SWITCH_THUMB}
              ios_backgroundColor={SWITCH_IOS_BG}
              disabled={!!disabled}
            />
          </View>
        </View>
      );
    });
  }, []);

  // Quick Action Card Component (Genosys brand style)
  const QuickActionCard = ({
    icon,
    title,
    subtitle,
    onPress,
    color = "#dc2626",
  }) => (
    <TouchableOpacity style={[styles.quickActionCard, isRTL && styles.quickActionCardRTL]} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={[styles.quickActionTitle, isRTL && styles.quickActionTitleRTL]}>{title}</Text>
      <Text style={[styles.quickActionSubtitle, isRTL && styles.quickActionSubtitleRTL]}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const ordersSubtitle = useMemo(() => {
    return t('profile.purchasesCount', { count: ordersCount });
  }, [ordersCount, t]);

  // Section List Item Component
  const ProfileSection = ({ title, children, style }) => (
    <View style={[styles.section, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );

  const ProfileItem = ({ icon, title, subtitle, onPress, rightComponent, hasArrow = true, style, isLast = false }) => {
    const content = (
      <>
        <View style={[styles.profileItemLeft, isRTL && styles.profileItemLeftRTL]}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={22} color="#dc2626" />
            </View>
          )}
          <View style={[styles.profileItemText, isRTL && styles.profileItemTextRTL]}>
            <Text style={[styles.profileItemTitle, isRTL && styles.profileItemTitleRTL]}>{title}</Text>
            {subtitle && <Text style={[styles.profileItemSubtitle, isRTL && styles.profileItemSubtitleRTL]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={[styles.profileItemRight, isRTL && styles.profileItemRightRTL]}>
          {rightComponent || (hasArrow && <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color="#C7C7CC" />)}
        </View>
      </>
    );

    const itemStyle = [
      styles.profileItem,
      isLast && styles.profileItemLast,
      style,
    ];

    // IMPORTANT: When there's no row onPress (e.g., rows with Switch controls),
    // don't wrap in a touchable. Touch responders can interfere with Switch gestures
    // and make other switches "react" on tap.
    if (!onPress) {
      return <View style={itemStyle}>{content}</View>;
    }

    return (
      <TouchableOpacity style={itemStyle} onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={[styles.navHeader, isRTL && styles.navHeaderRTL]}>
        <TouchableOpacity 
          style={[styles.backButton, isRTL && styles.backButtonRTL]}
          onPress={() => router.replace('/(tabs)/shop')}
          activeOpacity={0.7}
        >
          <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#dc2626" />
            <Text
              style={[styles.backText, isRTL && styles.backTextRTL]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t('tabs.home')}
            </Text>
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.navTitle, isRTL && styles.navTitleRTL]}>{t('profile.accountTitle')}</Text>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Apple Store Style Header */}
        <View style={styles.profileHeader}>
          
          <View style={[styles.profileCard, isRTL && styles.profileCardRTL]}>
            <TouchableOpacity
              style={[styles.promoAvatarButton, isRTL ? styles.promoAvatarButtonRTL : styles.promoAvatarButtonLTR]}
              onPress={() => router.push('/profile/promo')}
              activeOpacity={0.9}
            >
              <Ionicons name="megaphone-outline" size={16} color="#dc2626" />
            </TouchableOpacity>
            <View style={[styles.avatarWrap, isRTL && styles.avatarWrapRTL]}>
              <View style={[styles.avatarContainer, isRTL && styles.avatarContainerRTL]}>
                {profileImageUri ? (
                  <Image 
                    source={{ uri: profileImageUri }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || displayEmail?.charAt(0)?.toUpperCase() || 'G'}
                  </Text>
                )}
                <View style={styles.onlineDot} />
              </View>

              {Number.isFinite(Number(user?.discountPercentage)) && Number(user?.discountPercentage) > 0 && (
                <View style={[styles.discountBadge, isRTL && styles.memberBadgeRTL, { marginTop: 8 }]}>
                  <Ionicons name="pricetag-outline" size={12} color="#ffffff" />
                  <Text
                    style={[styles.discountBadgeText, isRTL && styles.memberBadgeTextRTL]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t('profile.discountLabel')}: {Number(user.discountPercentage)}%
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.userInfo, isRTL && styles.userInfoRTL]}>
              <Text style={[styles.userName, isRTL && styles.userNameRTL]}>
                {user?.name || t('common.loading')}
              </Text>
              <Text style={[styles.userEmail, isRTL && styles.userEmailRTL]}>
                {displayEmail || t('profile.loadingUserData')}
              </Text>
              {user?.phone && (
                <Text style={[styles.userPhone, isRTL && styles.userPhoneRTL]}>
                  {user.phone}
                </Text>
              )}
              <TouchableOpacity onPress={handleEditProfile} style={[styles.editButton, isRTL && styles.editButtonRTL]}>
                <Text style={[styles.editButtonText, isRTL && styles.editButtonTextRTL]}>{t('profile.viewAndEdit')}</Text>
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
              subtitle={ordersSubtitle}
              color="#dc2626"
              onPress={async () => {
                // Ensure Orders header can route back to Account when opened from here.
                await AsyncStorage.setItem('@genosys_nav_orders_source', 'profile').catch((e) => log.warn('Failed to save nav source', e?.message));
                router.push('/profile/orders');
              }}
            />
            <QuickActionCard
              icon="bag-outline"
              title={t('profile.bag')}
              subtitle={cartCount > 0 ? t('profile.itemsCount', { count: cartCount }) : t('profile.empty')}
              color="#27AE60"
              onPress={async () => {
                // Ensure Bag header can route back to Account when opened from here.
                await AsyncStorage.setItem('@genosys_nav_bag_source', 'profile').catch((e) => log.warn('Failed to save nav source', e?.message));
                router.push('/(tabs)/bag');
              }}
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
          </View>
        </ProfileSection>

        {/* Privacy & Security */}
        <ProfileSection title={t('profile.privacyAndSecurity')}>
          <View style={styles.sectionContent}>
            {biometricAvailable ? (
              <ProfileSwitchItem
                icon={biometricType.includes('Face') ? 'scan-outline' : 'finger-print-outline'}
                title={biometricType}
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={SWITCH_TRACK_BIOMETRIC}
                disabled={biometricLoading}
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

            {/* Moved here from Edit Profile */}
            <ProfileSwitchItem
              icon="mail-outline"
              title={t('editProfile.emailNotifications')}
              subtitle={t('editProfile.emailNotificationsHint')}
              value={emailNotifications}
              onValueChange={handleEmailNotifToggle}
              trackColor={SWITCH_TRACK_EMAIL}
              disabled={!user?.token}
            />
            <ProfileSwitchItem
              icon="notifications-outline"
              title={t('profile.pushNotifications')}
              value={notificationsEnabled}
              onValueChange={handlePushToggle}
              trackColor={SWITCH_TRACK_PUSH}
              disabled={pushToggleLoading}
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
              icon="download-outline"
              title={t('profile.trainingMaterials') || 'Training Materials'}
              onPress={() => {
                const url = buildAuthenticatedWebViewUrl('/training', locale, user);
                router.push({
                  pathname: '/webview',
                  params: {
                    url,
                    title: t('profile.trainingMaterials') || 'Training Materials',
                  },
                });
              }}
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
              <ActivityIndicator color="#dc2626" size="small" />
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
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: 130,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  backButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  backText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    flexShrink: 1,
  },
  backTextRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 130,
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
  avatarWrap: {
    alignItems: 'center',
    marginEnd: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
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
    end: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 1,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#27AE60',
    borderRadius: 999,
    maxWidth: '100%',
  },
  discountBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    minWidth: 0,
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  userPhone: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
    flexShrink: 1,
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
  promoAvatarButton: {
    position: 'absolute',
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  promoAvatarButtonLTR: {
    right: 12,
  },
  promoAvatarButtonRTL: {
    left: 12,
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
    color: '#dc2626',
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

  // RTL Support Styles
  navHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  backButtonRTL: {
    marginLeft: 0,
    marginRight: 16,
  },
  navTitleRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  profileCardRTL: {
    flexDirection: 'row-reverse',
  },
  avatarContainerRTL: {
    // Avatar spacing handled by avatarWrapRTL
  },
  avatarWrapRTL: {
    marginEnd: 0,
    marginStart: 16,
  },
  userInfoRTL: {
    alignItems: 'flex-end',
    marginEnd: 0,
    marginStart: 16,
  },
  userNameRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  userEmailRTL: {
    textAlign: 'right',
  },
  memberBadgeRTL: {
    flexDirection: 'row-reverse',
  },
  memberBadgeTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  userPhoneRTL: {
    textAlign: 'right',
  },
  editButtonTextRTL: {
    textAlign: 'center',
  },
  editButtonRTL: {
    alignSelf: 'flex-end',
  },
  quickActionCardRTL: {
    alignItems: 'flex-end',
  },
  quickActionTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  quickActionSubtitleRTL: {
    textAlign: 'right',
  },
  profileItemLeftRTL: {
    flexDirection: 'row-reverse',
  },
  profileItemTextRTL: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginRight: 12,
  },
  profileItemTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  profileItemSubtitleRTL: {
    textAlign: 'right',
  },
  profileItemRightRTL: {
    flexDirection: 'row-reverse',
  },
});

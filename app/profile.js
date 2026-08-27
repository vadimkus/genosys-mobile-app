import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import AppFooter from '../components/AppFooter';
import MembershipCard from '../components/MembershipCard';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchUserOrders } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, savePushTokenToBackend, clearPushTokenOnBackend } from '../services/pushNotificationsService';
import { createLogger } from '../utils/logger';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces } from '../utils/theme';

const log = createLogger('Profile');

const { width } = Dimensions.get('window');

// Keep Switch color props stable across renders (prevents iOS visual flicker on nearby switches).
const SWITCH_TRACK_PUSH = { false: colors.separator, true: colors.accent };
const SWITCH_TRACK_BIOMETRIC = { false: colors.separator, true: colors.green };
const SWITCH_TRACK_EMAIL = { false: colors.separator, true: colors.accent };
const SWITCH_THUMB = colors.white;
const SWITCH_IOS_BG = colors.separator;
const PUSH_PREF_KEY = '@genosys_push_enabled';
const EMAIL_NOTIF_PREF_KEY = '@genosys_email_notif_enabled';

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
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushToggleLoading, setPushToggleLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(PUSH_PREF_KEY);
        // ON by default: only an explicit opt-out ('0') turns the toggle off.
        // AuthContext auto-registers the push token on launch when not opted out.
        const enabled = v !== '0';
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

  const handleSignOut = useCallback(() => {
    haptics.heavyTap();
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
  }, [t, clearCart, logout]);

  const handleEditProfile = () => {
    haptics.lightTap();
    router.push('/profile/edit');
  };

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/(tabs)/shop');
  };

  const handleBiometricToggle = useCallback(async (value) => {
    haptics.selectionTick();
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
  }, [biometricLoading, biometricType, disableBiometric, enableBiometric, handleSignOut, t, user?.email]);

  const handlePushToggle = async (value) => {
    haptics.selectionTick();
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
    haptics.selectionTick();
    setEmailNotifications(!!value);
    await AsyncStorage.setItem(EMAIL_NOTIF_PREF_KEY, value ? '1' : '0').catch((e) => log.warn('Failed to save email notif pref', e?.message));
  }, []);

  // Memoized switch row to prevent unrelated switches from re-rendering and flickering on iOS.
  const ProfileSwitchItem = useMemo(() => {
    return React.memo(function ProfileSwitchItemInner({
      icon,
      tint,
      title,
      subtitle,
      value,
      onValueChange,
      trackColor,
      disabled,
      isLast,
      rtl,
    }) {
      return (
        <View>
          <View style={[styles.row, rtl && styles.rowReverse]}>
            <View style={[styles.rowLeft, rtl && styles.rowReverse]}>
              {icon ? (
                <View style={surfaces.iconWell}>
                  <Ionicons name={icon} size={17} color={tint || colors.accent} />
                </View>
              ) : null}
              <View style={[styles.rowText, rtl && styles.rowTextRTL]}>
                <Text style={[styles.rowTitle, rtl && styles.textRTL]}>{title}</Text>
                {subtitle ? <Text style={[styles.rowSubtitle, rtl && styles.textRTL]}>{subtitle}</Text> : null}
              </View>
            </View>
            <View style={styles.switchRight}>
              {/* The title sits in a sibling View, so VoiceOver would otherwise
                  read this as an unnamed switch. Naming it here tells the user
                  which setting they are toggling. */}
              <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={trackColor}
                thumbColor={SWITCH_THUMB}
                ios_backgroundColor={SWITCH_IOS_BG}
                disabled={!!disabled}
                accessibilityLabel={title}
                accessibilityHint={subtitle || undefined}
                accessibilityState={{ checked: !!value, disabled: !!disabled }}
              />
            </View>
          </View>
          {!isLast ? <View style={[styles.separator, rtl && styles.separatorRTL]} /> : null}
        </View>
      );
    });
  }, []);

  // Quick Action Card Component (soft Apple-native card)
  const QuickActionCard = ({
    icon,
    title,
    subtitle,
    onPress,
    color = colors.accent,
  }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, shadow.card, isRTL && styles.quickActionCardRTL]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={22} color={color} />
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
      {title ? <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{title}</Text> : null}
      {children}
    </View>
  );

  const ProfileItem = ({ icon, tint = colors.accent, title, subtitle, value, onPress, rightComponent, hasArrow = true, isLast = false }) => {
    const content = (
      <>
        <View style={[styles.rowLeft, isRTL && styles.rowReverse]}>
          {icon ? (
            <View style={surfaces.iconWell}>
              <Ionicons name={icon} size={17} color={tint} />
            </View>
          ) : null}
          <View style={[styles.rowText, isRTL && styles.rowTextRTL]}>
            <Text style={[styles.rowTitle, isRTL && styles.textRTL]}>{title}</Text>
            {subtitle ? <Text style={[styles.rowSubtitle, isRTL && styles.textRTL]}>{subtitle}</Text> : null}
          </View>
        </View>
        <View style={[styles.rowRight, isRTL && styles.rowReverse]}>
          {value ? <Text style={[styles.rowValue, isRTL && styles.textRTL]} numberOfLines={1}>{value}</Text> : null}
          {rightComponent || (hasArrow ? <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.tertiary} /> : null)}
        </View>
      </>
    );

    // IMPORTANT: When there's no row onPress (e.g., rows with Switch controls),
    // don't wrap in a touchable. Touch responders can interfere with Switch gestures
    // and make other switches "react" on tap.
    return (
      <View>
        {onPress ? (
          <TouchableOpacity style={[styles.row, isRTL && styles.rowReverse]} onPress={onPress} activeOpacity={0.6}>
            {content}
          </TouchableOpacity>
        ) : (
          <View style={[styles.row, isRTL && styles.rowReverse]}>{content}</View>
        )}
        {!isLast ? <View style={[styles.separator, isRTL && styles.separatorRTL]} /> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('profile.accountTitle')} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight + 8 }}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, shadow.card, isRTL && styles.profileCardRTL]}>
          <TouchableOpacity
            style={[styles.promoAvatarButton, isRTL ? styles.promoAvatarButtonRTL : styles.promoAvatarButtonLTR]}
            onPress={() => router.push('/profile/promo')}
            activeOpacity={0.9}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t('promo.infoTitle')}
          >
            <Ionicons name="megaphone-outline" size={16} color={colors.accent} />
          </TouchableOpacity>
          <View style={[styles.avatarWrap, isRTL && styles.avatarWrapRTL]}>
            <View style={styles.avatarContainer}>
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

            {!!user?.discountType && Number.isFinite(Number(user?.discountPercentage)) && Number(user?.discountPercentage) > 0 && (
              <View style={[styles.discountBadge, isRTL && styles.memberBadgeRTL, { marginTop: 8 }]}>
                <Ionicons name="pricetag-outline" size={12} color={colors.white} />
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

        {/* GENOSYS Rewards membership card */}
        <MembershipCard isRTL={isRTL} />

        {/* Partner Portal - prominent, right under the membership card (partner accounts only) */}
        {(user?.partnerPortalAccess === true || ['CLINIC', 'VIP'].includes(String(user?.discountType || '').toUpperCase())) && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => { haptics.lightTap(); router.push('/partner-portal'); }}
            style={[styles.portalCard, shadow.card, isRTL && styles.rowReverse]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
              <View style={[surfaces.iconWell, styles.portalIcon]}>
                <Ionicons name="cube-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.portalTitle, isRTL && styles.textRTL]}>
                  {locale === 'ru' ? 'Портал партнёра' : locale === 'ar' ? 'بوابة الشركاء' : 'Partner Portal'}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[styles.portalSubtitle, isRTL && styles.textRTL]}
                >
                  {(() => {
                    // Trade terms instead of the −50% (already shown on the
                    // Discount pill above): consignment agreement + credit.
                    const parts = [];
                    if (user?.consignmentActive) {
                      parts.push(locale === 'ru' ? 'Договор консигнации' : locale === 'ar' ? 'اتفاقية الأمانة' : 'Consignment agreement');
                    }
                    if (user?.creditActive && Number(user?.creditDays) > 0) {
                      const d = Number(user.creditDays);
                      parts.push(locale === 'ru' ? `Кредит ${d} дней` : locale === 'ar' ? `أجل ${d} يومًا` : `Credit ${d} days`);
                    }
                    if (parts.length > 0) return parts.join(' · ');
                    return locale === 'ru' ? 'Приоритетные заказы · доставка в тот же день' : locale === 'ar' ? 'طلبات ذات أولوية · توصيل بنفس اليوم' : 'Priority ordering · same-day delivery';
                  })()}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.tertiary} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            icon="receipt-outline"
            title={t('profile.orders')}
            subtitle={ordersSubtitle}
            onPress={async () => {
              haptics.lightTap();
              // Ensure Orders header can route back to Account when opened from here.
              await AsyncStorage.setItem('@genosys_nav_orders_source', 'profile').catch((e) => log.warn('Failed to save nav source', e?.message));
              router.push('/profile/orders');
            }}
          />
          <QuickActionCard
            icon="bag-outline"
            title={t('profile.bag')}
            subtitle={cartCount > 0 ? t('profile.itemsCount', { count: cartCount }) : t('profile.empty')}
            onPress={async () => {
              haptics.lightTap();
              // Ensure Bag header can route back to Account when opened from here.
              await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/profile' })).catch((e) => log.warn('Failed to save nav source', e?.message));
              router.push('/(tabs)/bag');
            }}
          />
        </View>

        {/* Explore */}
        <ProfileSection title={t('navigation.explore')}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="gift-outline"
              title={t('navigation.bundleBuilder')}
              subtitle={t('profile.buildYourSet')}
              onPress={() => { haptics.lightTap(); router.push('/bundle-builder'); }}
            />
            <ProfileItem
              icon="sparkles-outline"
              title={t('navigation.aiSkinAnalysis')}
              subtitle={t('profile.aiSkinSubtitle')}
              onPress={() => { haptics.lightTap(); router.push('/skin-analysis'); }}
            />
            <ProfileItem
              icon="leaf-outline"
              title={t('categories.skinConcern')}
              subtitle={t('profile.skinConcernSubtitle')}
              onPress={() => { haptics.lightTap(); router.push('/skin-concerns'); }}
            />
            <ProfileItem
              icon="newspaper-outline"
              title={t('navigation.blog')}
              onPress={() => { haptics.lightTap(); router.push('/blog'); }}
              isLast={true}
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
              onPress={() => { haptics.lightTap(); router.push('/profile/addresses'); }}
            />
            <ProfileItem
              icon="card-outline"
              title={t('profile.paymentAndBilling')}
              onPress={() => { haptics.lightTap(); router.push('/profile/payment'); }}
              isLast={true}
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
                rtl={isRTL}
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
              rtl={isRTL}
            />
            <ProfileSwitchItem
              icon="notifications-outline"
              title={t('profile.pushNotifications')}
              value={notificationsEnabled}
              onValueChange={handlePushToggle}
              rtl={isRTL}
              trackColor={SWITCH_TRACK_PUSH}
              disabled={pushToggleLoading}
            />
            <ProfileItem
              icon="shield-outline"
              title={t('profile.privacyPolicy')}
              onPress={() => { haptics.lightTap(); router.push('/profile/privacy'); }}
            />
            <ProfileItem
              icon="document-text-outline"
              title={t('profile.termsAndConditions')}
              onPress={() => { haptics.lightTap(); router.push('/profile/terms'); }}
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
              value={locale === 'ru' ? t('profile.russian') : locale === 'ar' ? t('profile.arabic') : t('profile.english')}
              onPress={() => { haptics.lightTap(); router.push('/profile/language'); }}
            />
            <ProfileItem
              icon="help-circle-outline"
              title={t('profile.helpAndSupport')}
              onPress={() => { haptics.lightTap(); router.push('/profile/help'); }}
              isLast={true}
            />
          </View>
        </ProfileSection>

        {/* Information */}
        <ProfileSection title={t('navigation.information')}>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="information-circle-outline"
              title={t('profile.aboutGenosys')}
              onPress={() => { haptics.lightTap(); router.push('/about'); }}
            />
            <ProfileItem
              icon="business-outline"
              title={t('navigation.brand')}
              onPress={() => { haptics.lightTap(); router.push('/brand'); }}
            />
            <ProfileItem
              icon="people-outline"
              title={t('navigation.partners')}
              onPress={() => { haptics.lightTap(); router.push('/partners'); }}
            />
            <ProfileItem
              icon="download-outline"
              title={t('profile.trainingMaterials')}
              onPress={() => { haptics.lightTap(); router.push('/training'); }}
            />
            <ProfileItem
              icon="car-outline"
              title={t('navigation.delivery')}
              onPress={() => { haptics.lightTap(); router.push('/delivery'); }}
            />
            <ProfileItem
              icon="navigate-outline"
              title={t('navigation.locations')}
              onPress={() => { haptics.lightTap(); router.push('/locations'); }}
            />
            <ProfileItem
              icon="help-buoy-outline"
              title={t('navigation.faq')}
              onPress={() => { haptics.lightTap(); router.push('/faq'); }}
            />
            <ProfileItem
              icon="chatbubble-ellipses-outline"
              title={t('navigation.contact')}
              onPress={() => { haptics.lightTap(); router.push('/contact'); }}
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
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
            )}
          </TouchableOpacity>
        </ProfileSection>

        {/* Footer - shared brand block */}
        <AppFooter style={{ paddingBottom: (insets?.bottom || 0) + 24 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  scrollView: {
    flex: 1,
  },

  // Profile card
  profileCard: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCardRTL: {
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    alignItems: 'center',
    marginEnd: 16,
  },
  avatarWrapRTL: {
    marginEnd: 0,
    marginStart: 16,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.cta,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.white,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    end: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.green,
    borderWidth: 3,
    borderColor: colors.card,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userInfoRTL: {
    alignItems: 'flex-end',
    marginEnd: 0,
    marginStart: 16,
  },
  userName: {
    ...T.serifTitle,
    fontSize: 24,
    lineHeight: 28,
    color: colors.label,
    marginBottom: 2,
  },
  userNameRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
    // Cormorant Garamond ships Latin and Cyrillic only. Clearing the family
    // hands Arabic back to the system face rather than relying on per-glyph
    // fallback, which mixes metrics.
    fontFamily: undefined,
  },
  userEmail: {
    ...T.body,
    lineHeight: undefined,
    color: colors.secondaryLabel,
    marginBottom: 4,
    flexShrink: 1,
  },
  userEmailRTL: {
    textAlign: 'right',
  },
  userPhone: {
    ...T.caption,
    color: colors.secondaryLabel,
    marginBottom: 12,
    flexShrink: 1,
  },
  userPhoneRTL: {
    textAlign: 'right',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.green,
    borderRadius: 999,
    maxWidth: '100%',
  },
  discountBadgeText: {
    ...T.badgeMedium,
    flexShrink: 1,
    minWidth: 0,
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  memberBadgeRTL: {
    flexDirection: 'row-reverse',
  },
  memberBadgeTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonRTL: {
    alignSelf: 'flex-end',
  },
  editButtonText: {
    ...T.navTitle,
    fontWeight: '400',
    color: colors.blue,
  },
  editButtonTextRTL: {
    textAlign: 'center',
  },
  promoAvatarButton: {
    position: 'absolute',
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: colors.redLine,
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

  // Quick Actions
  // The partner blocks used to be inverted - white on ink - which on a cream
  // page read as two dark slabs rather than as the most important rows. They
  // are cards like everything else now; their weight comes from sitting first.
  portalCard: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    marginEnd: 12,
  },
  portalTitle: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
  },
  portalSubtitle: {
    ...T.caption,
    color: colors.mutedText,
    lineHeight: 17,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  quickActionCard: {
    ...surfaces.card,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
  },
  quickActionCardRTL: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    ...T.navTitle,
    color: colors.label,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionTitleRTL: {
    writingDirection: 'rtl',
  },
  quickActionSubtitle: {
    ...T.bodySmall,
    lineHeight: undefined,
    color: colors.secondaryLabel,
    textAlign: 'center',
  },
  quickActionSubtitleRTL: {
    writingDirection: 'rtl',
  },

  // Sections
  section: {
    marginBottom: 18,
  },
  // Tracked uppercase, the eyebrow the website sets above every section.
  sectionTitle: {
    ...T.eyebrow,
    marginBottom: 10,
    marginHorizontal: 28,
  },
  sectionTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // The website carries cards on a hairline rather than a shadow. On cream a
  // drop shadow muddies rather than lifts.
  sectionContent: {
    ...surfaces.card,
    marginHorizontal: 16,
    overflow: 'hidden',
  },

  // Settings-style rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTextRTL: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    ...T.label,
    fontSize: 15,
    fontWeight: '500',
    color: colors.label,
  },
  rowSubtitle: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginStart: 8,
  },
  rowValue: {
    ...T.bodySmall,
    lineHeight: undefined,
    color: colors.secondaryLabel,
    maxWidth: 160,
  },
  switchRight: {
    marginStart: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginStart: 56,
  },
  separatorRTL: {
    marginStart: 0,
    marginEnd: 56,
  },

  // Sign Out
  signOutButton: {
    backgroundColor: colors.fillSecondary,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  signOutText: {
    ...T.navTitle,
    fontWeight: '600',
    color: colors.accent,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  unavailableText: {
    ...T.caption,
    fontStyle: 'italic',
    color: colors.secondaryLabel,
  },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, tint, shadow, surfaces } from '../../utils/theme';

const log = createLogger('Addresses');

export default function AddressesScreen() {
  const router = useRouter();
  const { user, getAddresses, removeAddress, setAddressAsDefault } = useAuth();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Subtle entrance motion (matches order details feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  const normalizeKey = (s) => String(s || '').trim().toLowerCase();
  const getTypeMeta = (rawType) => {
    const val = String(rawType || '').trim();
    const home = t('addAddress.typeHome');
    const work = t('addAddress.typeWork');
    const other = t('addAddress.typeOther');
    const k = normalizeKey(val);
    const isHome = k === 'home' || val === home;
    const isWork = k === 'work' || k === 'office' || val === work;
    const isOther = !isHome && !isWork;
    return {
      icon: isHome ? 'home' : isWork ? 'business' : 'location',
      label: isHome ? home : isWork ? work : other,
    };
  };

  const formatEmirate = (raw) => formatEmirateLabel(t, raw);

  const formatCountry = (raw) => {
    const v = String(raw || '').trim();
    if (!v) return '';
    const k = normalizeKey(v);
    if (k === 'united arab emirates' || k === 'uae') return t('addAddress.defaultCountry');
    return v;
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Refresh list whenever user returns from Add/Edit Address screen.
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  useEffect(() => {
    if (!loading) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, fade, lift]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await getAddresses();
      if (result.success) {
        // Defensive: ensure the UI always gets an array
        setAddresses(Array.isArray(result.data) ? result.data : []);
      } else {
        log.warn('Failed to load addresses', result?.error);
        // Keep existing list if API fails
      }
    } catch (error) {
      log.error('Load addresses error', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = () => {
    haptics.lightTap();
    router.push('/profile/add-address');
  };

  const handleEditAddress = (address) => {
    haptics.lightTap();
    router.push({
      pathname: '/profile/add-address',
      params: {
        addressId: address.id,
        addressData: JSON.stringify(address),
      },
    });
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      t('addresses.deleteTitle'),
      t('addresses.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            haptics.heavyTap();
            const result = await removeAddress(addressId);
            if (result.success) {
              // Remove only the deleted address — the backend stores multiple
              // addresses (the old "single address" comment was outdated and
              // emptied the whole list on any delete).
              setAddresses(prev => prev.filter(addr => addr.id !== addressId));
            } else {
              Alert.alert(t('common.error'), result.error || t('addresses.deleteFailed'));
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    const result = await setAddressAsDefault(addressId);
    if (result.success) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
    } else {
      Alert.alert(t('common.error'), result.error || t('addresses.setDefaultFailed'));
    }
  };

  const openOptions = (address) => {
    haptics.lightTap();
    Alert.alert(
      t('addresses.optionsTitle'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.edit'), onPress: () => handleEditAddress(address) },
        !address.isDefault && { text: t('addresses.setAsDefault'), onPress: () => handleSetDefault(address.id) },
        { text: t('common.delete'), style: 'destructive', onPress: () => handleDeleteAddress(address.id) },
      ].filter(Boolean)
    );
  };

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/profile');
  };

  const AddressCard = ({ address }) => {
    const typeMeta = getTypeMeta(address?.type);
    return (
      <View style={[styles.card, shadow.card]}>
        <View style={[styles.cardHead, isRTL && styles.rowRTL]}>
          <View style={surfaces.iconWell}>
            <Ionicons name={typeMeta.icon} size={17} color={colors.accent} />
          </View>
          <View style={styles.headMiddle}>
            <View style={[styles.typeRow, isRTL && styles.rowRTL]}>
              <Text style={[styles.addressType, isRTL && styles.textRTL]} numberOfLines={1}>{typeMeta.label}</Text>
              {address.isDefault ? (
                <View style={[styles.defaultBadge, isRTL && styles.rowRTL]}>
                  <View style={styles.defaultDot} />
                  <Text style={styles.defaultText}>{t('addresses.default')}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => openOptions(address)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`${t('addresses.optionsTitle')} — ${address.name || typeMeta.label}`}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryLabel} />
          </TouchableOpacity>
        </View>

        <View style={styles.hairline} />

        <View style={[styles.addressDetails, isRTL && styles.alignEndRTL]}>
          <Text style={[styles.addressName, isRTL && styles.textRTL]}>{address.name}</Text>
          <Text style={[styles.addressText, isRTL && styles.textRTL]}>{address.address}</Text>
          <Text style={[styles.addressText, isRTL && styles.textRTL]}>{address.city}, {formatEmirate(address.emirate)}</Text>
          <Text style={[styles.addressText, isRTL && styles.textRTL]}>{formatCountry(address.country)}</Text>
          <Text style={[styles.addressPhone, isRTL && styles.valueLTR]}>{address.phone}</Text>
        </View>
      </View>
    );
  };

  const addButton = (
    <TouchableOpacity
      onPress={handleAddAddress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={t('addresses.addNew')}
    >
      <Ionicons name="add" size={26} color={colors.accent} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader translateY={headerTranslateY} title={t('addresses.title')} onBack={onBack} right={addButton} isRTL={isRTL} />
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>{t('addresses.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('addresses.title')} onBack={onBack} right={addButton} isRTL={isRTL} />

      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              progressViewOffset={headerHeight}
            />
          }
        >
          {/* Manage hint */}
          <Text style={[styles.infoText, isRTL && styles.textRTL]}>{t('addresses.manageHint')}</Text>

          {/* Addresses List */}
          <View style={styles.addressesList}>
            {Array.isArray(addresses) && addresses.length > 0 ? (
              addresses.map((address, index) => (
                <AddressCard key={`${address.id}-${index}`} address={address} />
              ))
            ) : (
              <View style={[styles.emptyState, shadow.card]}>
                <View style={[surfaces.iconWell, styles.emptyTile]}>
                  <Ionicons name="location" size={22} color={colors.accent} />
                </View>
                <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t('addresses.emptyTitle')}</Text>
                <Text style={[styles.emptySubtitle, isRTL && styles.textRTL]}>{t('addresses.emptySubtitle')}</Text>
              </View>
            )}
          </View>

          {/* Add New Address — primary action */}
          <TouchableOpacity
            style={[styles.addButton, shadow.cta(colors.cta), isRTL && styles.rowRTL]}
            onPress={handleAddAddress}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText} numberOfLines={1} ellipsizeMode="tail">{t('addresses.addNew')}</Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={[styles.tipsCard, shadow.card]}>
            <Text style={[styles.tipsTitle, isRTL && styles.textRTL]}>{t('addresses.deliveryTips')}</Text>
            <View style={[styles.tipItem, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('addresses.tipDefault')}</Text>
            </View>
            <View style={[styles.tipItem, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('addresses.tipApt')}</Text>
            </View>
            <View style={[styles.tipItem, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('addresses.tipPhone')}</Text>
            </View>
          </View>
        </Animated.ScrollView>
      </Animated.View>
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
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  valueLTR: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  alignEndRTL: {
    alignItems: 'flex-end',
  },

  // Manage hint
  infoText: {
    ...T.caption,
    color: colors.secondaryLabel,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },

  // Addresses List
  addressesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  card: {
    ...surfaces.card,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headMiddle: {
    flex: 1,
    minWidth: 0,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  addressType: {
    ...T.label,
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: tint(colors.greenDeep, '1A'),
  },
  defaultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.greenDeep,
  },
  defaultText: {
    ...T.captionTiny,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.greenDeep,
  },
  moreButton: {
    padding: 4,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginTop: 12,
    marginBottom: 12,
  },
  addressDetails: {},
  addressName: {
    ...T.label,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 4,
  },
  addressText: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    marginBottom: 2,
  },
  addressPhone: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    ...surfaces.card,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  emptyTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 14,
  },
  emptyTitle: {
    ...T.sectionTitleSmall,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Add New — primary
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 18,
  },
  addButtonText: {
    ...T.button,
    fontWeight: '700',
    flexShrink: 1,
    minWidth: 0,
  },

  // Tips
  tipsCard: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    ...T.label,
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    ...T.bodySmall,
    color: colors.secondaryLabel,
    flex: 1,
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...T.body,
    color: colors.secondaryLabel,
    marginTop: 12,
  },
});

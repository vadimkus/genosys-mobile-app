import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';
import { formatEmirateLabel } from '../../utils/emirateUtils';

const log = createLogger('Addresses');

export default function AddressesScreen() {
  const router = useRouter();
  const { user, getAddresses, removeAddress, setAddressAsDefault } = useAuth();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    router.push('/profile/add-address');
  };

  const handleEditAddress = (address) => {
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
            const result = await removeAddress(addressId);
            if (result.success) {
              // Backend currently supports a single primary address; deleting clears it.
              setAddresses([]);
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

  const AddressCard = ({ address }) => {
    const typeMeta = getTypeMeta(address?.type);
    return (
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            <Ionicons
              name={typeMeta.icon}
              size={20}
              color="#dc2626"
            />
            <Text style={styles.addressType}>{typeMeta.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>{t('addresses.default')}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
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
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.addressDetails}>
          <Text style={styles.addressName}>{address.name}</Text>
          <Text style={styles.addressText}>{address.address}</Text>
          <Text style={styles.addressText}>{address.city}, {formatEmirate(address.emirate)}</Text>
          <Text style={styles.addressText}>{formatCountry(address.country)}</Text>
          <Text style={styles.addressPhone}>{address.phone}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addresses.title')}</Text>
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#dc2626"
          />
        }
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            {t('addresses.manageHint')}
          </Text>
        </View>

        {/* Addresses List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>{t('addresses.loading')}</Text>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {Array.isArray(addresses) && addresses.length > 0 ? (
              addresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{t('addresses.emptyTitle')}</Text>
                <Text style={styles.emptySubtitle}>{t('addresses.emptySubtitle')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Add New Address Button */}
        <TouchableOpacity style={styles.addNewButton} onPress={handleAddAddress}>
          <View style={styles.addNewContent}>
            <View style={styles.addIconContainer}>
              <Ionicons name="add" size={24} color="#dc2626" />
            </View>
            <Text style={styles.addNewText}>{t('addresses.addNew')}</Text>
          </View>
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>{t('addresses.deliveryTips')}</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.tipText}>{t('addresses.tipDefault')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.tipText}>{t('addresses.tipApt')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.tipText}>{t('addresses.tipPhone')}</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  infoText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Addresses List
  addressesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginStart: 8,
  },
  defaultBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginStart: 8,
  },
  defaultText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  addressDetails: {
    paddingStart: 28,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },

  // Add New Button
  addNewButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  addNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  addNewText: {
    fontSize: 17,
    color: '#dc2626',
    fontWeight: '500',
  },

  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 15,
    color: '#8E8E93',
    marginStart: 8,
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
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
});

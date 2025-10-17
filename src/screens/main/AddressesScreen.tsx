import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { AddressService, Address, CreateAddressData } from '../../services/addressService';
import { useStore } from '../../store/useStore';

type AddressesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AddressesScreen() {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const { theme } = useTheme();
  const { user } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United Arab Emirates',
  });

  // Load addresses from database
  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadAddresses = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await AddressService.getAddresses(user.id);
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United Arab Emirates',
    });
    setIsModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state || '',
      zip_code: address.zip_code || '',
      country: address.country,
    });
    setIsModalVisible(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to manage your addresses.');
      return;
    }

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AddressService.deleteAddress(addressId, user.id);
              await loadAddresses(); // Reload addresses
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to manage your addresses.');
      return;
    }

    try {
      await AddressService.setDefaultAddress(addressId, user.id);
      await loadAddresses(); // Reload addresses
      Alert.alert('Success', 'Default address updated successfully');
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to update default address. Please try again.');
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to manage your addresses.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      if (editingAddress) {
        // Update existing address
        await AddressService.updateAddress(editingAddress.id, formData, user.id);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Add new address
        const addressData: CreateAddressData = {
          ...formData,
          is_default: addresses.length === 0, // First address is default
        };
        await AddressService.createAddress(addressData, user.id);
        Alert.alert('Success', 'Address added successfully');
      }

      setIsModalVisible(false);
      await loadAddresses(); // Reload addresses
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderAddressCard = (address: Address) => (
    <View
      key={address.id}
      style={[styles.addressCard, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={[styles.addressName, { color: theme.colors.text }]}>
            {address.name}
          </Text>
          {address.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Ionicons name="pencil" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address.id)}
          >
            <Ionicons name="trash" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
        {address.phone}
      </Text>
      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
        {address.address}
      </Text>
      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
        {address.city}{address.state ? `, ${address.state}` : ''} {address.zip_code || ''}
      </Text>
      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
        {address.country}
      </Text>

      {!address.is_default && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Addresses
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading addresses...
            </Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Addresses
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add your first delivery address
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map(renderAddressCard)}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveAddress}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Full Name *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Phone Number *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+971 50 123 4567"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Address *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Street address, building, apartment"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  City *
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Dubai"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  State
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder="Dubai"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  ZIP Code
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={formData.zip_code}
                  onChangeText={(text) => setFormData({ ...formData, zip_code: text })}
                  placeholder="12345"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Country
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="United Arab Emirates"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesList: {
    gap: 16,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});

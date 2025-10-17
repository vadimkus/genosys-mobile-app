import { supabase } from './supabase';

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}

export class AddressService {
  static async getAddresses(userId: string): Promise<Address[]> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('AddressService.getAddresses error:', error);
      throw error;
    }
  }

  static async createAddress(addressData: CreateAddressData, userId: string): Promise<Address> {
    try {
      const addressDataWithUser = {
        ...addressData,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert([addressDataWithUser])
        .select()
        .single();

      if (error) {
        console.error('Error creating address:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AddressService.createAddress error:', error);
      throw error;
    }
  }

  static async updateAddress(id: string, addressData: Partial<CreateAddressData>, userId: string): Promise<Address> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating address:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AddressService.updateAddress error:', error);
      throw error;
    }
  }

  static async deleteAddress(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    } catch (error) {
      console.error('AddressService.deleteAddress error:', error);
      throw error;
    }
  }

  static async setDefaultAddress(id: string, userId: string): Promise<void> {
    try {
      // Set all addresses for this user to not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error setting default address:', error);
        throw error;
      }
    } catch (error) {
      console.error('AddressService.setDefaultAddress error:', error);
      throw error;
    }
  }
}

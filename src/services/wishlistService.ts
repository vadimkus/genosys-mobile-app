import { supabase } from './supabase';
import { Product } from '../types';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_original_price?: number;
  product_image?: string;
  product_category?: string;
  product_brand?: string;
  product_size?: string;
  created_at: string;
  updated_at: string;
}

export class WishlistService {
  static async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('WishlistService.getWishlistItems error:', error);
      throw error;
    }
  }

  static async addToWishlist(product: Product, userId: string): Promise<WishlistItem> {
    try {
      console.log('🔍 Adding to wishlist - Product image URL:', product.imageUrl);
      const wishlistData = {
        user_id: userId,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_original_price: product.originalPrice,
        product_image: product.imageUrl,
        product_category: product.category,
        product_brand: product.brand,
        product_size: product.defaultSize,
      };
      console.log('🔍 Wishlist data being saved:', wishlistData);

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert([wishlistData])
        .select()
        .single();

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('WishlistService.addToWishlist error:', error);
      throw error;
    }
  }

  static async removeFromWishlist(productId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }
    } catch (error) {
      console.error('WishlistService.removeFromWishlist error:', error);
      throw error;
    }
  }

  static async isInWishlist(productId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking wishlist status:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('WishlistService.isInWishlist error:', error);
      return false;
    }
  }

  static async toggleWishlist(product: Product, userId: string): Promise<{ isInWishlist: boolean; item?: WishlistItem }> {
    try {
      const isInWishlist = await this.isInWishlist(product.id, userId);
      
      if (isInWishlist) {
        await this.removeFromWishlist(product.id, userId);
        return { isInWishlist: false };
      } else {
        const item = await this.addToWishlist(product, userId);
        return { isInWishlist: true, item };
      }
    } catch (error) {
      console.error('WishlistService.toggleWishlist error:', error);
      throw error;
    }
  }

  static async convertWishlistItemsToProducts(wishlistItems: WishlistItem[]): Promise<Product[]> {
    return wishlistItems.map(item => ({
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      originalPrice: item.product_original_price,
      image: item.product_image || '',
      category: item.product_category || '',
      brand: item.product_brand || 'Genosys',
      inStock: true,
      rating: 4.5, // Default rating
      reviewCount: 0, // Default review count
      defaultSize: item.product_size || 'Standard',
      sizes: item.product_size ? [item.product_size] : ['Standard'],
      colors: ['White'], // Default color
      isNew: false,
      isFeatured: false,
      tags: [],
      benefits: [],
      directions: [],
      keyIngredients: [],
      note: '',
    }));
  }
}

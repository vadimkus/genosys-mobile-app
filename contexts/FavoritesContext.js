/**
 * Favorites Context for Mobile App
 * Manages wishlist/favorites with database persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getUserWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from '../services/databaseService';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext({});

const FAVORITES_STORAGE_KEY = '@genosys_favorites';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const extractWishlistArray = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    // common shapes
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.wishlist)) return payload.wishlist;
    if (Array.isArray(payload.items)) return payload.items;
    // nested shapes
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    if (payload.data && Array.isArray(payload.data.wishlist)) return payload.data.wishlist;
    if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
    return [];
  };

  // Load favorites from storage and database on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Sync favorites with database when user changes (optional - app works offline)
  useEffect(() => {
    if (user?.token) {
      // Delay sync to avoid overwhelming the server on app start
      const timer = setTimeout(() => {
        syncWithDatabase();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  /**
   * Load favorites from local storage
   */
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        setFavorites(parsed);
        console.log('💖 Loaded favorites from storage:', parsed.length);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  /**
   * Save favorites to local storage
   */
  const saveFavorites = async (favoritesToSave) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesToSave));
      console.log('💾 Saved favorites to storage:', favoritesToSave.length);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  /**
   * Sync favorites with database
   */
  const syncWithDatabase = async () => {
    if (!user?.token) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Syncing favorites with database...');
      
      const result = await getUserWishlist(user.token);
      
      if (result.success) {
        // databaseService returns `{ success: true, data: <json> }`
        // where `<json>` could be:
        // - `[{...}]`
        // - `{ success: true, data: [{...}] }`
        // - `{ data: [{...}] }`
        const dbFavorites = extractWishlistArray(result.data);
        
        // Convert database format to local format
        const convertedFavorites = dbFavorites
          .map((item) => {
            const id =
              item?.product_id ??
              item?.productId ??
              item?.id ??
              item?.product?.id ??
              null;
            if (id == null) return null;
            return {
              id,
              name:
                item?.current_product_name ??
                item?.product_name ??
                item?.productName ??
                item?.name ??
                item?.product?.name ??
                '',
              image:
                item?.current_image ??
                item?.product_image ??
                item?.productImage ??
                item?.image ??
                item?.product?.image ??
                item?.product?.image_url ??
                '',
              price:
                item?.current_price ??
                item?.product_price ??
                item?.productPrice ??
                item?.price ??
                item?.product?.price ??
                item?.product?.displayPrice ??
                0,
              addedAt: item?.added_at ?? item?.addedAt ?? item?.createdAt ?? item?.created_at ?? null,
            };
          })
          .filter(Boolean);
        
        setFavorites(convertedFavorites);
        await saveFavorites(convertedFavorites);
        
        console.log('✅ Favorites synced with database:', convertedFavorites.length);
      } else {
        // Handle specific error cases
        if (result.error?.includes('404') || result.error?.includes('not found')) {
          console.log('📱 Wishlist API not available yet - using offline mode');
        } else {
          console.warn('⚠️ Failed to sync favorites with server:', result.error);
        }
        console.log('📱 Using local favorites only');
      }
    } catch (error) {
      console.warn('⚠️ Network error syncing favorites:', error.message);
      console.log('📱 App will work offline with local favorites');
      // Don't throw error - let app continue with local favorites
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add product to favorites
   */
  const addToFavorites = async (product) => {
    try {
      console.log('💖 Adding to favorites:', product.name);
      
      // Check if already in favorites
      if (favorites.some(fav => fav.id === product.id)) {
        console.log('Product already in favorites');
        return { success: false, error: 'Product already in favorites' };
      }
      
      const newFavorite = {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        addedAt: new Date().toISOString(),
      };
      
      // Update local state
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      await saveFavorites(updatedFavorites);
      
      // Sync with database if user is logged in
      if (user?.token) {
        try {
          const dbResult = await addToWishlist(user.token, {
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price,
          });
          
          if (!dbResult.success) {
            if (dbResult.error?.includes('404') || dbResult.error?.includes('not found')) {
              console.log('📱 Wishlist API not available - favorite saved locally only');
            } else {
              console.warn('⚠️ Failed to sync favorite to server:', dbResult.error);
            }
          } else {
            console.log('✅ Favorite synced to server successfully');
          }
        } catch (error) {
          console.warn('⚠️ Network error adding to favorites (saved locally):', error.message);
        }
      }
      
      console.log('✅ Added to favorites successfully');
      return { success: true, favorites: updatedFavorites };
      
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { success: false, error: 'Failed to add to favorites' };
    }
  };

  /**
   * Remove product from favorites
   */
  const removeFromFavorites = async (productId) => {
    try {
      console.log('💔 Removing from favorites:', productId);
      
      // Update local state
      const updatedFavorites = favorites.filter(fav => fav.id !== productId);
      setFavorites(updatedFavorites);
      await saveFavorites(updatedFavorites);
      
      // Sync with database if user is logged in
      if (user?.token) {
        try {
          const dbResult = await removeFromWishlist(user.token, productId);
          
          if (!dbResult.success) {
            if (dbResult.error?.includes('404') || dbResult.error?.includes('not found')) {
              console.log('📱 Wishlist API not available - favorite removed locally only');
            } else {
              console.warn('⚠️ Failed to sync favorite removal to server:', dbResult.error);
            }
          } else {
            console.log('✅ Favorite removal synced to server successfully');
          }
        } catch (error) {
          console.warn('⚠️ Network error removing favorite (removed locally):', error.message);
        }
      }
      
      console.log('✅ Removed from favorites successfully');
      return { success: true, favorites: updatedFavorites };
      
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { success: false, error: 'Failed to remove from favorites' };
    }
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (product) => {
    const isCurrentlyFavorite = favorites.some(fav => fav.id === product.id);
    
    if (isCurrentlyFavorite) {
      return await removeFromFavorites(product.id);
    } else {
      return await addToFavorites(product);
    }
  };

  /**
   * Check if product is in favorites
   */
  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  /**
   * Clear all favorites
   */
  const clearFavorites = async () => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      console.log('🗑️ Favorites cleared');
      
      // Note: We don't clear from database to preserve user data across devices
      
      return { success: true };
    } catch (error) {
      console.error('Clear favorites error:', error);
      return { success: false, error: 'Failed to clear favorites' };
    }
  };

  /**
   * Get favorites count
   */
  const getFavoritesCount = () => {
    return favorites.length;
  };

  const value = {
    // State
    favorites,
    isLoading,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    syncWithDatabase,
    
    // Getters
    isFavorite,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;


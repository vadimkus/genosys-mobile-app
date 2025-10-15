/**
 * Offline Support Service
 * Handles offline data storage, synchronization, and network state management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system';
import { ENV } from '../config/environment';
import { analyticsService } from './analyticsService';

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
  maxRetries: number;
}

interface SyncQueue {
  [key: string]: OfflineData;
}

interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

class OfflineService {
  private syncQueue: SyncQueue = {};
  private isOnline: boolean = true;
  private networkState: NetworkState | null = null;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'offline_sync_queue';
  private readonly CACHE_DIR = this.getCacheDirectory();
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly RETRY_INTERVAL = 60000; // 1 minute

  constructor() {
    this.initialize();
  }

  /**
   * Get cache directory path safely
   */
  private getCacheDirectory(): string {
    try {
      const documentDir = (FileSystem as any).documentDirectory;
      const cacheDir = (FileSystem as any).cacheDirectory;
      
      // Use documentDirectory if available, otherwise fallback to cacheDirectory
      const baseDir = documentDir || cacheDir;
      
      if (!baseDir) {
        console.warn('⚠️ No cache directory available, using fallback');
        return '/tmp/offline_cache/';
      }
      
      return `${baseDir}offline_cache/`;
    } catch (error) {
      console.error('❌ Error getting cache directory:', error);
      return '/tmp/offline_cache/';
    }
  }

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    try {
      // Create cache directory
      await this.createCacheDirectory();

      // Load sync queue from storage
      await this.loadSyncQueue();

      // Check network state
      await this.checkNetworkState();

      // Set up network listeners
      this.setupNetworkListeners();

      // Start sync processes
      this.startSyncProcesses();

      console.log('📱 Offline service initialized');
    } catch (error) {
      console.error('❌ Offline service initialization error:', error);
      analyticsService.trackError(error as Error, { service: 'offline' });
    }
  }

  /**
   * Create cache directory
   */
  private async createCacheDirectory(): Promise<void> {
    try {
      // Skip cache directory creation if using fallback path
      if (this.CACHE_DIR === '/tmp/offline_cache/') {
        console.log('📁 Using fallback cache directory, skipping creation');
        return;
      }

      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, {
          intermediates: true,
        });
        console.log('📁 Cache directory created:', this.CACHE_DIR);
      } else {
        console.log('📁 Cache directory already exists:', this.CACHE_DIR);
      }
    } catch (error) {
      console.error('❌ Cache directory creation error:', error);
      console.log('📁 Falling back to in-memory cache only');
    }
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const storedQueue = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
        console.log(
          `📦 Loaded ${Object.keys(this.syncQueue).length} items from sync queue`
        );
      }
    } catch (error) {
      console.error('❌ Load sync queue error:', error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error('❌ Save sync queue error:', error);
    }
  }

  /**
   * Check network state
   */
  private async checkNetworkState(): Promise<void> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.networkState = {
        isConnected: networkState.isConnected ?? false,
        type: networkState.type || null,
        isInternetReachable: networkState.isInternetReachable || null,
      };
      this.isOnline =
        this.networkState.isConnected &&
        (this.networkState.isInternetReachable ?? false);

      analyticsService.track('network_state_changed', {
        isConnected: this.isOnline,
        type: this.networkState.type,
      });

      console.log('🌐 Network state:', this.networkState);
    } catch (error) {
      console.error('❌ Network state check error:', error);
    }
  }

  /**
   * Set up network listeners
   */
  private setupNetworkListeners(): void {
    // Note: In a real app, you would use a network state listener
    // For now, we'll check periodically
    setInterval(() => {
      this.checkNetworkState();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Start sync processes
   */
  private startSyncProcesses(): void {
    // Start periodic sync
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingData();
      }
    }, this.SYNC_INTERVAL);

    // Start retry process
    this.retryInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.retryFailedSyncs();
      }
    }, this.RETRY_INTERVAL);
  }

  /**
   * Store data offline
   */
  async storeOffline(
    key: string,
    data: any,
    syncAction?: string
  ): Promise<void> {
    try {
      const offlineData: OfflineData = {
        key,
        data,
        timestamp: Date.now(),
        syncStatus: 'pending',
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
      };

      // Add sync action if provided
      if (syncAction) {
        offlineData.data = { ...data, _syncAction: syncAction };
      }

      this.syncQueue[key] = offlineData;
      await this.saveSyncQueue();

      analyticsService.track('data_stored_offline', {
        key,
        hasSyncAction: !!syncAction,
      });

      console.log('💾 Data stored offline:', key);

      // Try to sync immediately if online
      if (this.isOnline) {
        this.syncPendingData();
      }
    } catch (error) {
      console.error('❌ Store offline error:', error);
      analyticsService.trackError(error as Error, {
        service: 'offline_storage',
      });
    }
  }

  /**
   * Get offline data
   */
  async getOfflineData(key: string): Promise<any | null> {
    try {
      // Check sync queue first
      if (this.syncQueue[key]) {
        return this.syncQueue[key].data;
      }

      // Check cache directory
      const cacheFile = `${this.CACHE_DIR}${key}.json`;
      const fileInfo = await FileSystem.getInfoAsync(cacheFile);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(cacheFile);
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('❌ Get offline data error:', error);
      return null;
    }
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any): Promise<void> {
    try {
      const cacheFile = `${this.CACHE_DIR}${key}.json`;
      await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(data));

      console.log('💾 Data cached:', key);
    } catch (error) {
      console.error('❌ Cache data error:', error);
    }
  }

  /**
   * Clear cached data
   */
  async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        const cacheFile = `${this.CACHE_DIR}${key}.json`;
        const fileInfo = await FileSystem.getInfoAsync(cacheFile);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(cacheFile);
        }
        console.log('🗑️ Cache cleared for key:', key);
      } else {
        await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
        await this.createCacheDirectory();
        console.log('🗑️ All cache cleared');
      }
    } catch (error) {
      console.error('❌ Clear cache error:', error);
    }
  }

  /**
   * Sync pending data
   */
  private async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log('🔄 Starting data sync...');

    try {
      const pendingItems = Object.entries(this.syncQueue).filter(
        ([_, item]) => item.syncStatus === 'pending'
      );

      for (const [key, item] of pendingItems) {
        try {
          await this.syncItem(key, item);
        } catch (error) {
          console.error(`❌ Sync failed for ${key}:`, error);
          item.syncStatus = 'failed';
          item.retryCount++;
        }
      }

      await this.saveSyncQueue();
      console.log('✅ Data sync completed');
    } catch (error) {
      console.error('❌ Data sync error:', error);
      analyticsService.trackError(error as Error, { service: 'data_sync' });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(key: string, item: OfflineData): Promise<void> {
    try {
      const syncAction = item.data._syncAction;
      const data = { ...item.data };
      delete data._syncAction;

      // In a real app, you would make API calls based on syncAction
      // For now, we'll simulate successful sync
      await this.simulateApiCall(syncAction, data);

      // Mark as synced
      item.syncStatus = 'synced';
      delete this.syncQueue[key];

      analyticsService.track('data_synced', {
        key,
        syncAction,
        retryCount: item.retryCount,
      });

      console.log('✅ Item synced:', key);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Simulate API call (replace with real API calls)
   */
  private async simulateApiCall(action: string, data: any): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated API failure');
    }

    console.log(`🌐 API call simulated: ${action}`, data);
  }

  /**
   * Retry failed syncs
   */
  private async retryFailedSyncs(): Promise<void> {
    try {
      const failedItems = Object.entries(this.syncQueue).filter(
        ([_, item]) =>
          item.syncStatus === 'failed' && item.retryCount < item.maxRetries
      );

      for (const [key, item] of failedItems) {
        item.syncStatus = 'pending';
        console.log(
          `🔄 Retrying sync for: ${key} (attempt ${item.retryCount + 1})`
        );
      }

      if (failedItems.length > 0) {
        await this.saveSyncQueue();
        this.syncPendingData();
      }
    } catch (error) {
      console.error('❌ Retry failed syncs error:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    pendingCount: number;
    failedCount: number;
    syncedCount: number;
    networkState: NetworkState | null;
  } {
    const pendingCount = Object.values(this.syncQueue).filter(
      item => item.syncStatus === 'pending'
    ).length;
    const failedCount = Object.values(this.syncQueue).filter(
      item => item.syncStatus === 'failed'
    ).length;
    const syncedCount = Object.values(this.syncQueue).filter(
      item => item.syncStatus === 'synced'
    ).length;

    return {
      isOnline: this.isOnline,
      pendingCount,
      failedCount,
      syncedCount,
      networkState: this.networkState,
    };
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingData();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      this.syncQueue = {};
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Sync queue cleared');
    } catch (error) {
      console.error('❌ Clear sync queue error:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(this.CACHE_DIR);
        let totalSize = 0;

        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(
            `${this.CACHE_DIR}${file}`
          );
          if (fileInfo.exists) {
            totalSize += fileInfo.size || 0;
          }
        }

        return totalSize;
      }
      return 0;
    } catch (error) {
      console.error('❌ Get cache size error:', error);
      return 0;
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }

    console.log('🧹 Offline service cleaned up');
  }
}

// Singleton instance
export const offlineService = new OfflineService();

// Convenience functions
export const storeOffline = (key: string, data: any, syncAction?: string) =>
  offlineService.storeOffline(key, data, syncAction);

export const getOfflineData = (key: string) =>
  offlineService.getOfflineData(key);

export const cacheData = (key: string, data: any) =>
  offlineService.cacheData(key, data);

export const clearCache = (key?: string) => offlineService.clearCache(key);

export const forceSync = () => offlineService.forceSync();

export const getSyncStatus = () => offlineService.getSyncStatus();

export default offlineService;

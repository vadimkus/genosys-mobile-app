import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchUserOrders } from '../services/api';
import { useAuth } from './AuthContext';
import { createLogger } from '../utils/logger';

const log = createLogger('OrdersContext');
const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user, refreshSession } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const retryRef = useRef(false);

  const loadOrdersCount = useCallback(async () => {
    if (!token) {
      setOrdersCount(0);
      return;
    }

    try {
      setLoading(true);
      // Fetch recent orders (limit to 100 to get accurate count)
      let result;
      try {
        result = await fetchUserOrders(token, { page: 1, limit: 100 });
      } catch (fetchError) {
        const msg = String(fetchError?.message || '');

        // If 401 and we haven't retried yet, attempt a token refresh and retry
        if (msg.includes('401') && !retryRef.current && refreshSession) {
          retryRef.current = true;
          log.info('Got 401 on orders fetch - attempting token refresh...');
          const newToken = await refreshSession();
          if (newToken) {
            log.info('Token refreshed, retrying orders fetch...');
            result = await fetchUserOrders(newToken, { page: 1, limit: 100 }).catch(() => []);
          } else {
            // refreshSession already logged the user out
            log.warn('Token refresh failed - user logged out');
            setOrdersCount(0);
            return;
          }
        } else {
          // Not a 401 or already retried - just fail silently
          result = [];
        }
      } finally {
        retryRef.current = false;
      }
      
      // Ensure we have an array and filter out DELETED and CANCELLED orders
      const allOrders = Array.isArray(result) ? result : [];
      const activeOrders = allOrders.filter(order => {
        const status = String(order?.status || '').toUpperCase();
        // Exclude DELETED and CANCELLED orders
        return status !== 'DELETED' && status !== 'CANCELLED' && status !== 'CANCELED';
      });
      
      const count = activeOrders.length;
      
      log.debug('Active orders (excluding DELETED/CANCELLED):', count);
      setOrdersCount(count);
    } catch (error) {
      log.error('Failed to load orders count:', error?.message || error);
      setOrdersCount(0);
    } finally {
      setLoading(false);
    }
  }, [token, refreshSession]);

  // Load orders count when user logs in or token changes
  useEffect(() => {
    loadOrdersCount();
  }, [loadOrdersCount]);

  // Refresh function that can be called from anywhere
  const refreshOrdersCount = useCallback(() => {
    loadOrdersCount();
  }, [loadOrdersCount]);

  return (
    <OrdersContext.Provider
      value={{
        ordersCount,
        loading,
        refreshOrdersCount,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}


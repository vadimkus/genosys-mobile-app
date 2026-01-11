import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchUserOrders } from '../services/api';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadOrdersCount = useCallback(async () => {
    if (!token) {
      setOrdersCount(0);
      return;
    }

    try {
      setLoading(true);
      // Fetch recent orders (limit to 100 to get accurate count)
      const result = await fetchUserOrders(token, { page: 1, limit: 100 }).catch(() => []);
      
      // Log for debugging
      console.log('[OrdersContext] Fetched orders:', result);
      
      // Ensure we have an array and filter out DELETED and CANCELLED orders
      const allOrders = Array.isArray(result) ? result : [];
      const activeOrders = allOrders.filter(order => {
        const status = String(order?.status || '').toUpperCase();
        // Exclude DELETED and CANCELLED orders
        return status !== 'DELETED' && status !== 'CANCELLED' && status !== 'CANCELED';
      });
      
      const count = activeOrders.length;
      
      console.log('[OrdersContext] Total orders:', allOrders.length);
      console.log('[OrdersContext] Active orders (excluding DELETED/CANCELLED):', count);
      setOrdersCount(count);
    } catch (error) {
      console.error('[OrdersContext] Failed to load orders count:', error);
      setOrdersCount(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

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



import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { createLogger } from '../utils/logger';
import useOrdersData from '../services/useOrdersData';

const log = createLogger('OrdersContext');
const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const [ordersCount, setOrdersCount] = useState(0);
  const { orders, loading, loadBadgeOrders, setOrders } = useOrdersData(token);

  const loadOrdersCount = useCallback(async () => {
    if (!token) {
      setOrdersCount(0);
      setOrders([]);
      return;
    }

    try {
      const activeOrders = await loadBadgeOrders();
      const count = activeOrders.length;
      
      log.debug('Active orders (excluding DELETED/CANCELLED):', count);
      setOrdersCount(count);
    } catch (error) {
      log.error('Failed to load orders count:', error?.message || error);
      setOrders([]);
      setOrdersCount(0);
    }
  }, [loadBadgeOrders, setOrders, token]);

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
        orders,
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


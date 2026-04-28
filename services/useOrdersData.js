import { useCallback, useEffect, useState } from 'react';
import { createLogger } from '../utils/logger';
import { fetchActiveOrdersForBadge, fetchOrdersOverview, findOrder } from './ordersRepository';

const log = createLogger('useOrdersData');

export default function useOrdersData(token) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    if (!token) {
      setOrders([]);
      setError('');
      return [];
    }

    setLoading(true);
    setError('');
    try {
      const nextOrders = await fetchOrdersOverview(token);
      setOrders(nextOrders);
      return nextOrders;
    } catch (e) {
      log.warn('Failed to load orders overview', e?.message || e);
      setOrders([]);
      setError('orders-load-failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadBadgeOrders = useCallback(async () => {
    if (!token) return [];
    try {
      const nextOrders = await fetchActiveOrdersForBadge(token);
      setOrders(nextOrders);
      setError('');
      return nextOrders;
    } catch (e) {
      log.warn('Failed to load badge orders', e?.message || e);
      setOrders([]);
      setError('orders-load-failed');
      return [];
    }
  }, [token]);

  const loadOrder = useCallback((idOrNumber) => findOrder(token, idOrNumber), [token]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return {
    orders,
    loading,
    error,
    setOrders,
    loadOverview,
    loadBadgeOrders,
    loadOrder,
  };
}

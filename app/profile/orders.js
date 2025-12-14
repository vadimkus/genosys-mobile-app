import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserOrders, fetchUserOrderById, deleteUserOrder } from '../../services/api';
import { getPaymentUrlForExistingOrder } from '../../services/orderService';
import { useLocalization } from '../../contexts/LocalizationContext';

const formatAED = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const statusLabel = (status) => {
  const s = String(status || '').toLowerCase();
  if (!s) return 'Pending';
  if (s === 'paid') return 'Paid';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'processing') return 'Processing';
  if (s === 'shipped') return 'Shipped';
  if (s === 'delivered') return 'Delivered';
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
  return status;
};

const statusColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid' || s === 'confirmed' || s === 'delivered') return '#27AE60';
  if (s === 'cancelled' || s === 'canceled') return '#E74C3C';
  if (s === 'shipped') return '#007AFF';
  return '#8E8E93';
};

const isPaidLike = (order) => {
  const s = String(order?.status || '').toLowerCase();
  const ps = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return s === 'paid' || s === 'confirmed' || ps === 'paid' || ps === 'confirmed';
};

const isCodLike = (order) => {
  const pm = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  return pm === 'cod' || pm === 'cash' || pm === 'cash_on_delivery' || pm === 'cash on delivery';
};

const isCardLike = (order) => {
  const pm = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  if (!pm) return false;
  return pm.includes('card') || pm.includes('stripe') || pm.includes('apple') || pm.includes('online');
};

const isDeletableByUser = (order) => {
  const s = String(order?.status || '').toLowerCase();
  const ps = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  // Align with backend: only allow deletion for PENDING orders that are NOT paid.
  if (s !== 'pending') return false;
  if (ps === 'paid' || ps === 'confirmed') return false;
  return true;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const { t } = useLocalization();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [payingOrderId, setPayingOrderId] = useState('');
  const [expandedOrderKey, setExpandedOrderKey] = useState('');

  const load = async () => {
    if (!token) return;
    setError('');
    try {
      // Prefer pending orders first if backend supports status filter.
      const pending = await fetchUserOrders(token, { status: 'pending', page: 1, limit: 20 }).catch(() => []);
      const recent = await fetchUserOrders(token, { page: 1, limit: 30 }).catch(() => []);
      const merged = [
        ...(Array.isArray(pending) ? pending : []),
        ...(Array.isArray(recent) ? recent : []),
      ];
      // De-dupe by id/orderNumber
      const seen = new Set();
      const deduped = merged.filter((o) => {
        const key = String(o?.id || o?.orderId || o?.orderNumber || o?.order_number || o?.number || '');
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const data = deduped;
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load orders');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const sortedOrders = useMemo(() => {
    return [...orders]
      .filter((o) => {
        const s = String(o.status || '').toLowerCase();
        const ps = String(o.paymentStatus || o.payment_status || '').toLowerCase();
        return (
          s !== 'cancelled' &&
          s !== 'canceled' &&
          s !== 'deleted' &&
          ps !== 'cancelled' &&
          ps !== 'canceled' &&
          ps !== 'deleted'
        );
      })
      .sort((a, b) => {
      const da = new Date(a.createdAt || a.created_at || a.date || 0).getTime() || 0;
      const db = new Date(b.createdAt || b.created_at || b.date || 0).getTime() || 0;
      return db - da;
    });
  }, [orders]);

  const handlePay = async (order) => {
    if (!token) return;
    const orderId = String(order?.id || order?.orderId || '');
    const orderNumber = String(order?.orderNumber || order?.order_number || order?.number || '');
    const key = String(order?.id || orderNumber);
    setPayingOrderId(key);
    try {
      // First, re-fetch this order (many backends only include paymentUrl on the detail payload).
      let hydratedOrder = order;
      try {
        if (orderId) {
          hydratedOrder = (await fetchUserOrderById(token, orderId)) || hydratedOrder;
        } else {
          const list = await fetchUserOrders(token, { page: 1, limit: 50 });
          const arr = Array.isArray(list) ? list : [];
          hydratedOrder =
            arr.find((o) => String(o?.orderNumber || o?.order_number || o?.number || '') === orderNumber) || hydratedOrder;
        }
      } catch {
        // ignore hydration errors and fall back to resume helper
      }

      const existingUrl =
        hydratedOrder?.paymentUrl ||
        hydratedOrder?.paymentLink ||
        hydratedOrder?.payment_url ||
        hydratedOrder?.payment_link ||
        '';
      if (existingUrl) {
        router.push({
          pathname: '/payment/stripe',
          params: {
            orderId: orderId || '',
            orderNumber: orderNumber || '',
            paymentUrl: String(existingUrl),
            fromOrders: '1',
          },
        });
        return;
      }

      const res = await getPaymentUrlForExistingOrder({ token, orderId, orderNumber, order });
      if (!res?.success || !res?.paymentUrl) {
        throw new Error(
          res?.error ||
            'Could not start payment. This usually means the backend does not yet support resuming Stripe payments for pending orders.'
        );
      }

      router.push({
        pathname: '/payment/stripe',
        params: {
          orderId: orderId || '',
          orderNumber: orderNumber || '',
          paymentUrl: String(res.paymentUrl),
          fromOrders: '1',
        },
      });
    } catch (e) {
      Alert.alert(t('orders.couldNotStartPayment'), e?.message || 'Please try again.');
    } finally {
      setPayingOrderId('');
    }
  };

  const contactSupportWhatsApp = (order) => {
    const orderNumber = order?.orderNumber || order?.order_number || order?.number || order?.id || '';
    const phoneNumber = '971585487665';
    const message = `Hi! I need help with order ${String(orderNumber)}. Can you assist me?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
    });
  };

  const handleDelete = (order) => {
    const orderId = String(order?.id || order?.orderId || '').trim();
    const orderNumber = order?.orderNumber || order?.order_number || order?.number || order?.id || '';
    if (!orderId) {
      Alert.alert(t('ordersScreen.cannotDeleteTitle'), t('ordersScreen.cannotDeleteMessage1'));
      return;
    }
    if (!isDeletableByUser(order)) {
      Alert.alert(t('ordersScreen.cannotDeleteTitle'), t('ordersScreen.cannotDeleteMessage2'));
      return;
    }

    Alert.alert(
      'Delete order?',
      `Are you sure you want to delete order ${String(orderNumber)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserOrder(token, orderId);
              setOrders((prev) => prev.filter((o) => String(o?.id || o?.orderId || '') !== orderId));
              setExpandedOrderKey((prev) => (prev === orderId ? '' : prev));
            } catch (e) {
              Alert.alert(t('ordersScreen.deleteFailedTitle'), e?.message || t('ordersDetailAlerts.pleaseTryAgain'));
            }
          },
        },
      ]
    );
  };

  const toggleExpanded = (key) => {
    const k = String(key || '');
    setExpandedOrderKey((prev) => (prev === k ? '' : k));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#E74C3C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('orders.title')}</Text>
          <Text style={styles.headerTitle}>{t('orders.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('ordersScreen.loginRequired')}</Text>
          <Text style={styles.emptyText}>{t('ordersScreen.loginRequiredText')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.title')}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E74C3C" />}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E74C3C" />
            <Text style={styles.loadingText}>{t('ordersScreen.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>{t('ordersScreen.couldNotLoad')}</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : sortedOrders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>{t('ordersScreen.noOrdersYet')}</Text>
            <Text style={styles.emptyText}>{t('ordersScreen.noOrdersHint')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedOrders.map((o) => {
              const orderNumber = o.orderNumber || o.order_number || o.number || o.id;
              const createdAt = o.createdAt || o.created_at || o.date;
              const status = o.status || 'PENDING';
              const paymentStatus = o.paymentStatus || o.payment_status || '';
              const paymentMethod = o.paymentMethod || o.payment_method || '';
              const total = o.total ?? o.totalAmount ?? o.total_amount ?? o.amount ?? 0;
              const shippingRaw = o.shipping ?? o.shippingCost ?? 0;
              const vat = o.vat ?? o.vatAmount ?? 0;
              const subtotal = o.subtotal ?? o.subTotal ?? o.sub_total ?? 0;
              const freeShipping = Number(subtotal) >= 1000;
              const shipping = freeShipping ? 0 : shippingRaw;
              const itemCount =
                o.itemCount ??
                (Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) : 0);
              const emirate = o.customerEmirate || o.emirate || '';
              const hasExistingPaymentUrl =
                !!(o?.paymentUrl || o?.paymentLink || o?.payment_url || o?.payment_link);
              const showPay = !isPaidLike(o) && !isCodLike(o) && (hasExistingPaymentUrl || isCardLike(o));
              const keyId = String(o.id || orderNumber);
              const isPaying = payingOrderId === keyId;
              const isExpanded = expandedOrderKey === keyId;
              return (
                <View key={String(o.id || orderNumber)} style={styles.card}>
                  <View style={styles.cardTop}>
                    <TouchableOpacity
                      style={styles.orderToggle}
                      onPress={() => toggleExpanded(keyId)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.orderNumber}>Order {String(orderNumber)}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>

                    <View style={styles.detailsActions}>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/profile/orders/[id]', params: { id: String(o.id || orderNumber) } })}
                        activeOpacity={0.85}
                        style={styles.detailsPill}
                      >
                        <Text style={styles.detailsPillText}>{t('ordersScreen.details')}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#8E8E93" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(o)}
                        activeOpacity={0.85}
                        style={styles.deletePill}
                      >
                        <Ionicons name="trash-outline" size={16} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(status) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(status) }]}>{statusLabel(status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    {formatDate(createdAt)}
                    {emirate ? ` • ${emirate}` : ''}
                    {paymentMethod ? ` • ${String(paymentMethod).toUpperCase()}` : ''}
                    {paymentStatus ? ` • ${statusLabel(paymentStatus)}` : ''}
                  </Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.totalText}>AED {formatAED(total)}</Text>
                    <Text style={styles.itemsText}>{itemCount} items</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownText}>Shipping: {freeShipping ? 'FREE' : `AED ${formatAED(shipping)}`}</Text>
                  </View>

                  {isExpanded ? (
                    <View style={styles.orderSummaryBody}>
                      <Text style={styles.orderSummaryTitle}>{t('ordersScreen.orderSummary')}</Text>

                      {(Array.isArray(o.items) ? o.items : []).map((it, idx) => {
                        const qty = Number(it?.quantity) || 0;
                        const name = it?.name || it?.productName || `Item ${idx + 1}`;
                        const size = it?.size || it?.selectedSize || '';
                        const color = it?.color || it?.selectedColor || '';
                        const extras = [size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean).join(' • ');
                        const price = Number(it?.price ?? 0) || 0;
                        const isPromo = it?.isPromotionItem === true;
                        return (
                          <Text key={`${String(it?.productId || it?.id || name)}-${idx}`} style={styles.orderSummaryLine}>
                            {qty}× {String(name)}{extras ? ` — ${extras}` : ''} — {isPromo ? 'FREE' : `AED ${formatAED(price)}`}
                          </Text>
                        );
                      })}

                      <View style={styles.orderSummaryDivider} />
                      <View style={styles.orderTotalsRow}>
                        <Text style={styles.orderTotalsLabel}>{t('ordersScreen.subtotal')}</Text>
                        <Text style={styles.orderTotalsValue}>AED {formatAED(subtotal)}</Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text style={styles.orderTotalsLabel}>{t('ordersScreen.shipping')}</Text>
                        <Text style={styles.orderTotalsValue}>{freeShipping ? 'FREE' : `AED ${formatAED(shipping)}`}</Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text style={styles.orderTotalsLabel}>{t('ordersScreen.vatIncluded')}</Text>
                        <Text style={styles.orderTotalsValue}>AED {formatAED(vat)}</Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text style={styles.orderTotalsLabelStrong}>{t('ordersScreen.total')}</Text>
                        <Text style={styles.orderTotalsValueStrong}>AED {formatAED(total)}</Text>
                      </View>
                    </View>
                  ) : null}

                  {showPay ? (
                    <TouchableOpacity
                      style={[styles.payButton, isPaying && styles.payButtonDisabled]}
                      onPress={() => handlePay(o)}
                      disabled={isPaying}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="card-outline" size={16} color="#ffffff" />
                      <Text style={styles.payButtonText}>{isPaying ? t('orders.startingPayment') : t('orders.payNow')}</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.supportButton}
                    onPress={() => contactSupportWhatsApp(o)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                    <Text style={styles.supportButtonText}>{t('ordersScreen.supportWhatsapp')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000000' },
  headerSpacer: { width: 28 },
  refreshButton: { padding: 4 },
  scrollView: { flex: 1 },
  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#8E8E93' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F', marginBottom: 6, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  list: { padding: 20, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  orderToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  detailsActions: { alignItems: 'flex-end', gap: 8 },
  detailsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  detailsPillText: { fontSize: 12, fontWeight: '700', color: '#1D1D1F' },
  deletePill: {
    width: 36,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-start' },
  orderNumber: { fontSize: 15, fontWeight: '700', color: '#1D1D1F' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaText: { marginTop: 6, fontSize: 12, color: '#8E8E93' },
  cardBottom: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalText: { fontSize: 15, fontWeight: '700', color: '#E74C3C' },
  itemsText: { fontSize: 12, color: '#8E8E93' },
  breakdownRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-start' },
  breakdownText: { fontSize: 12, color: '#8E8E93' },
  orderSummaryBody: {
    marginTop: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  orderSummaryTitle: { fontSize: 13, fontWeight: '800', color: '#1D1D1F', marginBottom: 8 },
  orderSummaryLine: { fontSize: 12, color: '#3C3C43', lineHeight: 18, marginBottom: 4 },
  orderSummaryDivider: { height: 1, backgroundColor: '#E5E5EA', marginTop: 10, marginBottom: 6 },
  orderTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  orderTotalsLabel: { fontSize: 12, color: '#3C3C43', fontWeight: '700' },
  orderTotalsValue: { fontSize: 12, color: '#1D1D1F', fontWeight: '800' },
  orderTotalsLabelStrong: { fontSize: 13, color: '#1D1D1F', fontWeight: '900' },
  orderTotalsValueStrong: { fontSize: 13, color: '#1D1D1F', fontWeight: '900' },
  payButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 10,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  supportButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 10,
  },
  supportButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});





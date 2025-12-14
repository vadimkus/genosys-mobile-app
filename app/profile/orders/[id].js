import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchUserOrderById, fetchUserOrders } from '../../../services/api';
import { getPaymentUrlForExistingOrder } from '../../../services/orderService';
import { useLocalization } from '../../../contexts/LocalizationContext';

const formatAED = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
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

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const idParam = String(params.id || '');

  const { user } = useAuth();
  const token = user?.token || user?.accessToken || '';
  const { t } = useLocalization();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Canonical: GET /api/mobile/orders/:id
      let match = null;
      try {
        match = await fetchUserOrderById(token, idParam);
      } catch {
        match = null;
      }

      // Fallback: some builds may navigate using orderNumber. In that case, search in list payloads.
      if (!match) {
        const list = await fetchUserOrders(token, { page: 1, limit: 50 }).catch(() => []);
        const orders = Array.isArray(list) ? list : [];
        match =
          orders.find((o) => String(o?.id || o?.orderId || '') === idParam) ||
          orders.find((o) => String(o?.orderNumber || o?.order_number || o?.number || '') === idParam) ||
          null;
      }

      setOrder(match);
    } catch (e) {
      Alert.alert(t('common.error'), e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, idParam]);

  useEffect(() => {
    load();
  }, [load]);

  const orderNumber = order?.orderNumber || order?.order_number || order?.number || order?.id || idParam;
  const paymentMethod = order?.paymentMethod || order?.payment_method || '';
  const status = order?.status || 'PENDING';
  const paymentStatus = order?.paymentStatus || order?.payment_status || '';
  const subtotal = Number(order?.subtotal ?? order?.subTotal ?? order?.sub_total ?? 0) || 0;
  const shippingRaw = Number(order?.shipping ?? order?.shippingCost ?? 0) || 0;
  const freeShipping = subtotal >= 1000;
  const shipping = freeShipping ? 0 : shippingRaw;
  const vat = Number(order?.vat ?? order?.vatAmount ?? 0) || 0;
  const total = Number(order?.total ?? order?.totalAmount ?? order?.total_amount ?? order?.amount ?? 0) || 0;

  const showPay = useMemo(() => {
    if (!order) return false;
    const hasExistingPaymentUrl = !!(order?.paymentUrl || order?.paymentLink || order?.payment_url || order?.payment_link);
    return !isPaidLike(order) && !isCodLike(order) && (hasExistingPaymentUrl || isCardLike(order));
  }, [order]);

  const onPay = async () => {
    if (!token || !order) return;
    setPaying(true);
    try {
      const orderId = String(order?.id || order?.orderId || '');
      const orderNum = String(order?.orderNumber || order?.order_number || order?.number || '');

      const existingUrl = order?.paymentUrl || order?.paymentLink || order?.payment_url || order?.payment_link || '';
      if (existingUrl) {
        router.push({
          pathname: '/payment/stripe',
          params: { orderId, orderNumber: orderNum, paymentUrl: String(existingUrl), fromOrders: '1' },
        });
        return;
      }

      const res = await getPaymentUrlForExistingOrder({ token, orderId, orderNumber: orderNum, order });
      if (!res?.success || !res?.paymentUrl) {
        throw new Error(
          res?.error ||
            'Could not start payment. This usually means the backend does not yet support resuming Stripe payments for pending orders.'
        );
      }
      router.push({
        pathname: '/payment/stripe',
        params: { orderId, orderNumber: orderNum, paymentUrl: String(res.paymentUrl), fromOrders: '1' },
      });
    } catch (e) {
      Alert.alert(t('ordersDetailAlerts.couldNotStartPaymentTitle'), e?.message || t('ordersDetailAlerts.pleaseTryAgain'));
    } finally {
      setPaying(false);
    }
  };

  const onSupport = () => {
    const phoneNumber = '971585487665';
    const message = `Hi! I need help with order ${String(orderNumber)}. Can you assist me?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order {String(orderNumber)}</Text>
        <TouchableOpacity onPress={load} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E74C3C" />
          <Text style={styles.loadingText}>{t('ordersDetail.loading')}</Text>
        </View>
      ) : !order ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('ordersDetail.notFound')}</Text>
          <Text style={styles.emptyText}>{t('ordersDetail.notFoundHint')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.meta}>
              Status: {String(status)}{paymentStatus ? ` • Payment: ${String(paymentStatus)}` : ''}{paymentMethod ? ` • ${String(paymentMethod).toUpperCase()}` : ''}
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>{t('ordersDetail.subtotal')}</Text>
              <Text style={styles.value}>AED {formatAED(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('ordersDetail.shipping')}</Text>
              <Text style={styles.value}>{freeShipping ? 'FREE' : `AED ${formatAED(shipping)}`}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('ordersDetail.vatIncluded')}</Text>
              <Text style={styles.value}>AED {formatAED(vat)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>{t('ordersDetail.total')}</Text>
              <Text style={styles.totalValue}>AED {formatAED(total)}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>{t('ordersDetail.items')}</Text>
            {(Array.isArray(order.items) ? order.items : []).map((it, idx) => {
              const qty = Number(it?.quantity) || 0;
              const name = it?.name || it?.productName || `Item ${idx + 1}`;
              const size = it?.size || it?.selectedSize || '';
              const color = it?.color || it?.selectedColor || '';
              const extras = [size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean).join(' • ');
              return (
                <Text key={`${String(it?.productId || it?.id || name)}-${idx}`} style={styles.itemLine}>
                  {qty}× {String(name)}{extras ? ` — ${extras}` : ''}
                </Text>
              );
            })}

            {showPay ? (
              <TouchableOpacity
                style={[styles.payButton, paying && styles.buttonDisabled]}
                onPress={onPay}
                disabled={paying}
                activeOpacity={0.85}
              >
                <Ionicons name="card-outline" size={16} color="#ffffff" />
                <Text style={styles.payButtonText}>{paying ? 'Starting payment…' : 'Pay now'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.supportButton} onPress={onSupport} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={styles.supportButtonText}>{t('ordersDetail.supportWhatsapp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1F' },
  refreshButton: { padding: 4 },
  scrollView: { flex: 1 },
  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#8E8E93' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1D1D1F', marginBottom: 6, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  card: {
    margin: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  meta: { fontSize: 12, color: '#8E8E93', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  value: { fontSize: 13, color: '#1D1D1F', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 10 },
  totalLabel: { fontSize: 14, color: '#1D1D1F', fontWeight: '800' },
  totalValue: { fontSize: 14, color: '#E74C3C', fontWeight: '900' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1D1D1F', marginBottom: 8 },
  itemLine: { fontSize: 12, color: '#3C3C43', lineHeight: 18, marginBottom: 4 },
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
  buttonDisabled: { opacity: 0.6 },
});




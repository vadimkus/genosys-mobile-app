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

const formatDateTime = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${dateStr} at ${timeStr}`;
  } catch {
    return null;
  }
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

const isPromoItem = (item) => {
  return item?.isPromotionItem === true || item?.selectedSize === '__PROMO__' || Number(item?.price || 0) === 0;
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
      let match = null;
      try {
        match = await fetchUserOrderById(token, idParam);
      } catch {
        match = null;
      }

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
  
  const customerName = order?.customerName || order?.customer_name || user?.name || '';
  const customerEmail = order?.customerEmail || order?.customer_email || user?.email || '';
  const customerPhone = order?.customerPhone || order?.customer_phone || user?.phone || '';
  const customerAddress = order?.customerAddress || order?.customer_address || order?.address || '';
  const emirate = order?.emirate || '';
  
  const createdAt = order?.createdAt || order?.created_at || order?.orderDate || order?.order_date;
  const formattedDateTime = formatDateTime(createdAt);

  const items = Array.isArray(order?.items) ? order.items : [];
  const paidItems = items.filter((it) => !isPromoItem(it));
  const promoItems = items.filter((it) => isPromoItem(it));

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ordersDetail.orderDetails')}</Text>
        <TouchableOpacity onPress={load} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E74C3C" />
          <Text style={styles.loadingText}>{t('ordersDetail.loading')}</Text>
        </View>
      ) : !order ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={64} color="#E5E5EA" />
          <Text style={styles.emptyTitle}>{t('ordersDetail.notFound')}</Text>
          <Text style={styles.emptyText}>{t('ordersDetail.notFoundHint')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Number Card */}
          <View style={styles.orderNumberCard}>
            <View style={styles.orderNumberHeader}>
              <Ionicons name="receipt" size={24} color="#E74C3C" />
              <View style={styles.orderNumberTextContainer}>
                <Text style={styles.orderNumberLabel}>{t('ordersDetail.orderNumber')}</Text>
                <Text style={styles.orderNumber}>{String(orderNumber)}</Text>
              </View>
            </View>
            {formattedDateTime ? (
              <View style={styles.dateTimeRow}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={styles.dateTimeText}>{formattedDateTime}</Text>
              </View>
            ) : null}
          </View>

          {/* Status Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>{t('ordersDetail.status')}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{String(status)}</Text>
              </View>
              {paymentStatus ? (
                <View style={[styles.statusBadge, styles.paymentStatusBadge]}>
                  <Text style={styles.statusBadgeText}>{String(paymentStatus)}</Text>
                </View>
              ) : null}
              {paymentMethod ? (
                <View style={[styles.statusBadge, styles.methodBadge]}>
                  <Text style={styles.statusBadgeText}>{String(paymentMethod).toUpperCase()}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bag-handle" size={20} color="#E74C3C" />
              <Text style={styles.sectionTitle}>{t('ordersDetail.items')}</Text>
            </View>
            
            {/* Paid Items */}
            {paidItems.map((it, idx) => {
              const qty = Number(it?.quantity) || 1;
              const price = Number(it?.price) || 0;
              const name = it?.name || it?.productName || `Item ${idx + 1}`;
              const size = it?.size || it?.selectedSize || '';
              const color = it?.color || it?.selectedColor || '';
              const itemTotal = qty * price;
              
              return (
                <View key={`paid-${String(it?.productId || it?.id || name)}-${idx}`} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{String(name)}</Text>
                    <Text style={styles.itemPrice}>AED {formatAED(itemTotal)}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemDetailText}>Qty: {qty}</Text>
                    {size && size !== '__PROMO__' ? (
                      <Text style={styles.itemDetailText}>• Size: {String(size)}</Text>
                    ) : null}
                    {color ? (
                      <Text style={styles.itemDetailText}>• Color: {String(color)}</Text>
                    ) : null}
                    <Text style={styles.itemDetailText}>• AED {formatAED(price)} each</Text>
                  </View>
                </View>
              );
            })}

            {/* Promo/Free Items */}
            {promoItems.length > 0 ? (
              <View style={styles.promoSection}>
                <View style={styles.promoHeader}>
                  <Ionicons name="gift" size={16} color="#16A34A" />
                  <Text style={styles.promoHeaderText}>{t('ordersDetail.freeItems')}</Text>
                </View>
                {promoItems.map((it, idx) => {
                  const qty = Number(it?.quantity) || 1;
                  const name = it?.name || it?.productName || `Free Item ${idx + 1}`;
                  
                  return (
                    <View key={`promo-${String(it?.productId || it?.id || name)}-${idx}`} style={styles.promoItemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.promoItemName}>{String(name)}</Text>
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
                        </View>
                      </View>
                      <Text style={styles.promoItemQty}>Qty: {qty}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Shipping Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#27AE60" />
              <Text style={styles.sectionTitle}>{t('ordersDetail.shippingDetails')}</Text>
            </View>
            
            {customerName ? (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailLabel}>{t('ordersDetail.customer')}</Text>
                <Text style={styles.detailValue}>{String(customerName)}</Text>
              </View>
            ) : null}
            
            {customerPhone ? (
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailLabel}>{t('ordersDetail.phone')}</Text>
                <Text style={styles.detailValue}>{String(customerPhone)}</Text>
              </View>
            ) : null}
            
            {customerEmail ? (
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailLabel}>{t('ordersDetail.email')}</Text>
                <Text style={styles.detailValue}>{String(customerEmail)}</Text>
              </View>
            ) : null}
            
            {emirate ? (
              <View style={styles.detailRow}>
                <Ionicons name="flag-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailLabel}>{t('ordersDetail.emirate')}</Text>
                <Text style={styles.detailValue}>{String(emirate)}</Text>
              </View>
            ) : null}
            
            {customerAddress ? (
              <View style={styles.detailRow}>
                <Ionicons name="home-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailLabel}>{t('ordersDetail.address')}</Text>
                <Text style={[styles.detailValue, styles.addressValue]}>{String(customerAddress)}</Text>
              </View>
            ) : null}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>{t('ordersDetail.orderSummary')}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('ordersDetail.subtotal')}</Text>
              <Text style={styles.summaryValue}>AED {formatAED(subtotal)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('ordersDetail.shipping')}</Text>
              {freeShipping ? (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
                </View>
              ) : (
                <Text style={styles.summaryValue}>AED {formatAED(shipping)}</Text>
              )}
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('ordersDetail.vatIncluded')}</Text>
              <Text style={styles.summaryValue}>AED {formatAED(vat)}</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('ordersDetail.total')}</Text>
              <Text style={styles.totalValue}>AED {formatAED(total)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            {showPay ? (
              <TouchableOpacity
                style={[styles.payButton, paying && styles.buttonDisabled]}
                onPress={onPay}
                disabled={paying}
                activeOpacity={0.85}
              >
                {paying ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name="card" size={20} color="#ffffff" />
                )}
                <Text style={styles.payButtonText}>
                  {paying ? t('ordersDetail.startingPayment') : t('ordersDetail.payNow')}
                </Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity style={styles.supportButton} onPress={onSupport} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
              <Text style={styles.supportButtonText}>{t('ordersDetail.supportWhatsapp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  refreshButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Order Number Card
  orderNumberCard: {
    margin: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderNumberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderNumberTextContainer: {
    flex: 1,
  },
  orderNumberLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    fontFamily: 'monospace',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  dateTimeText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  
  // Status
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  paymentStatusBadge: {
    backgroundColor: '#27AE60',
  },
  methodBadge: {
    backgroundColor: '#8E8E93',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  
  // Items
  itemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E74C3C',
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetailText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  // Promo Items
  promoSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  promoHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  promoItemCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  promoItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
    lineHeight: 18,
  },
  promoItemQty: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    marginTop: 4,
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  
  // Shipping Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
    lineHeight: 18,
  },
  addressValue: {
    lineHeight: 20,
  },
  
  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E74C3C',
  },
  
  // Actions
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});


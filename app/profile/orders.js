import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { fetchUserOrders, fetchUserOrderById, deleteUserOrder } from '../../services/api';
import { getPaymentUrlForExistingOrder } from '../../services/orderService';
import { OrdersSkeleton } from '../../components/SkeletonLoader';
import { useLocalization } from '../../contexts/LocalizationContext';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { createLogger } from '../../utils/logger';

const log = createLogger('Orders');

const EMPTY_UNI_IMAGE = 'https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Funi.png&w=512&q=75';

const formatAED = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

const isUserDiscountExcludedOrderItemName = (nameRaw) => {
  const name = String(nameRaw || '').trim().toLowerCase();
  if (!name) return false;
  // Beauty Boxes (bundles already discounted)
  if (name.includes('beauty box') || name.includes('beautybox')) return true;
  // Hydro Cool Modelling Mask
  if (name.includes('hydro') && name.includes('cool') && name.includes('mask')) return true;
  // Devices (fallback by name)
  if (name.includes('genoled') || name.includes('gentron') || name.includes('hairgen')) return true;
  return false;
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const inferOriginalUnitPriceFromPct = ({ unitPrice, discountPct }) => {
  const p = Number(unitPrice);
  const pct = Number(discountPct);
  if (!Number.isFinite(p) || p <= 0) return null;
  if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
  const mult = 1 - pct / 100;
  if (!Number.isFinite(mult) || mult <= 0) return null;
  const inferred = p / mult;
  if (!Number.isFinite(inferred) || inferred <= p * 1.001) return null;
  return inferred;
};

const statusLabelKey = (status) => {
  const s = String(status || '').trim().toLowerCase();
  const map = {
    pending: 'ordersDetail.statusPending',
    processing: 'ordersDetail.statusProcessing',
    confirmed: 'ordersDetail.statusConfirmed',
    paid: 'ordersDetail.statusPaid',
    completed: 'ordersDetail.statusCompleted',
    shipped: 'ordersDetail.statusShipped',
    shipping: 'ordersDetail.statusShipped',
    delivered: 'ordersDetail.statusDelivered',
    cancelled: 'ordersDetail.statusCancelled',
    canceled: 'ordersDetail.statusCancelled',
    refunded: 'ordersDetail.statusRefunded',
    failed: 'ordersDetail.statusFailed',
    deleted: 'ordersDetail.statusDeleted',
  };
  return map[s] || null;
};

const formatStatusLabel = (t, rawStatus) => {
  const raw = String(rawStatus || '').trim();
  const key = statusLabelKey(raw);
  return key ? t(key) : (raw ? raw.toUpperCase() : t('ordersDetail.statusPending'));
};

const statusColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'pending') return '#dc2626';
  if (s === 'paid' || s === 'confirmed' || s === 'delivered') return '#27AE60';
  if (s === 'cancelled' || s === 'canceled') return '#dc2626';
  if (s === 'shipped') return '#007AFF';
  return '#8E8E93';
};

const parsePaymentMetadata = (order) => {
  const raw = order?.paymentMetadata ?? order?.payment_metadata ?? null;
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isApplePayLike = (order) => {
  const flow = String(order?.paymentFlow || order?.payment_flow || '').toLowerCase();
  if (flow === 'apple_pay') return true;
  const pm = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  if (pm.includes('apple')) return true;
  const meta = parsePaymentMetadata(order);
  const metaFlow = String(meta?.paymentFlow || meta?.payment_flow || '').toLowerCase();
  return metaFlow === 'apple_pay';
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
  const { refreshOrdersCount } = useOrders();
  const token = user?.token || user?.accessToken || '';
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();

  const [openedFromProfile, setOpenedFromProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const src = await AsyncStorage.getItem('@genosys_nav_orders_source').catch(() => null);
      if (mounted) setOpenedFromProfile(src === 'profile');
      // Clear the source flag so Orders opened from the tab/footer behaves normally.
      await AsyncStorage.removeItem('@genosys_nav_orders_source').catch((e) => log.warn('Failed to clear nav source', e?.message));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const backTo = openedFromProfile ? '/profile' : '/(tabs)/shop';
  const backLabel = openedFromProfile ? t('profile.accountTitle') : t('tabs.home');

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
      const pending = await fetchUserOrders(token, { status: 'pending', page: 1, limit: 20 }).catch((e) => { log.warn('Failed to fetch pending orders', e?.message); return []; });
      const recent = await fetchUserOrders(token, { page: 1, limit: 30 }).catch((e) => { log.warn('Failed to fetch recent orders', e?.message); return []; });
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
      // Refresh the orders count in the tab bar
      refreshOrdersCount();
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
          res?.error || t('ordersDetailAlerts.couldNotStartPaymentMessage')
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
      Alert.alert(t('orders.couldNotStartPayment'), e?.message || t('ordersDetailAlerts.pleaseTryAgain'));
    } finally {
      setPayingOrderId('');
    }
  };

  const contactSupportWhatsApp = (order) => {
    const orderNumber = order?.orderNumber || order?.order_number || order?.number || order?.id || '';
    const phoneNumber = '971585487665';
    const message = t('support.whatsappOrderHelpMessage', { orderNumber: String(orderNumber) });
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch((e) => {
      log.warn('Failed to open WhatsApp', e?.message);
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
      t('ordersScreen.deleteOrderTitle'),
      t('ordersScreen.deleteOrderMessage', { orderNumber: String(orderNumber) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserOrder(token, orderId);
              setOrders((prev) => prev.filter((o) => String(o?.id || o?.orderId || '') !== orderId));
              setExpandedOrderKey((prev) => (prev === orderId ? '' : prev));
              // Refresh the orders count in the tab bar
              refreshOrdersCount();
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
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.replace(backTo)} style={styles.backButton}>
            <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
              <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
              <Text style={[styles.backText, isRTL && styles.backTextRTL]}>{backLabel}</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('orders.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.center, isRTL && styles.centerRTL]}>
          <Text style={[styles.emptyTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.loginRequired')}</Text>
          <Text style={[styles.emptyText, isRTL && styles.textRTLRight]}>{t('ordersScreen.loginRequiredText')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.replace(backTo)} style={styles.backButton}>
          <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
            <Text style={[styles.backText, isRTL && styles.backTextRTL]}>{backLabel}</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('orders.title')}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 0) + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
      >
        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <View style={[styles.center, isRTL && styles.centerRTL]}>
            <Text style={[styles.emptyTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.couldNotLoad')}</Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTLRight]}>{error}</Text>
          </View>
        ) : sortedOrders.length === 0 ? (
          <View style={[styles.center, styles.centerTop, isRTL && styles.centerRTL]}>
            <Image source={EMPTY_UNI_IMAGE} style={styles.emptyUniImage} contentFit="contain" />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.noOrdersYet')}</Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTLRight]}>{t('ordersScreen.noOrdersHint')}</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace('/(tabs)/shop')}
              activeOpacity={0.85}
            >
              <Text style={[styles.shopButtonText, isRTL && styles.shopButtonTextRTL]}>{t('bag.startShopping')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedOrders.map((o, orderIndex) => {
              const orderNumber = o.orderNumber || o.order_number || o.number || o.id;
              const createdAt = o.createdAt || o.created_at || o.date;
              const status = o.status || 'PENDING';
              const paymentStatus = o.paymentStatus || o.payment_status || '';
              const paymentMethod = o.paymentMethod || o.payment_method || '';
              const total = o.total ?? o.totalAmount ?? o.total_amount ?? o.amount ?? 0;
              const shippingRaw = o.shipping ?? o.shippingCost ?? 0;
              const vat = o.vat ?? o.vatAmount ?? 0;
              const subtotal = o.subtotal ?? o.subTotal ?? o.sub_total ?? 0;
              // Use server-provided shipping (already 0 when free shipping applied)
              // Fallback: check threshold for display purposes
              const freeShipping = Number(shippingRaw) === 0 && Number(subtotal) > 0;
              const shipping = Number(shippingRaw) || 0;
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
              // Prefer the discount% stored with the order (captures the rate at time of purchase),
              // falling back to the user's current discount% for older orders without this field.
              const orderDiscPct = Number(o?.discountPercentage);
              const discountPct = (Number.isFinite(orderDiscPct) && orderDiscPct > 0)
                ? orderDiscPct
                : Number(user?.discountPercentage);
              return (
                <View key={`${String(o.id || orderNumber)}-${orderIndex}`} style={styles.card}>
                  <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
                    <TouchableOpacity
                      style={[styles.orderToggle, isRTL && styles.orderToggleRTL]}
                      onPress={() => toggleExpanded(keyId)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.orderNumber, isRTL && styles.textRTLRight]}>
                        {t('ordersScreen.orderLabel')}: {String(orderNumber)}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>

                    <View style={[styles.detailsActions, isRTL && styles.detailsActionsRTL]}>
                      <TouchableOpacity
                        onPress={() => router.push({ pathname: '/profile/orders/[id]', params: { id: String(o.id || orderNumber) } })}
                        activeOpacity={0.85}
                        style={[styles.detailsPill, isRTL && styles.detailsPillRTL]}
                      >
                        <Text style={[styles.detailsPillText, isRTL && styles.textRTLRight]}>{t('ordersScreen.details')}</Text>
                        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color="#8E8E93" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        // Safer UX: delete is long-press only to prevent accidental taps.
                        onPress={() => Alert.alert(t('ordersScreen.holdToDeleteTitle'), t('ordersScreen.holdToDeleteMessage'))}
                        onLongPress={() => handleDelete(o)}
                        delayLongPress={650}
                        activeOpacity={0.85}
                        style={styles.deletePill}
                      >
                        <Ionicons name="trash-outline" size={16} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(status) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor(status) }]}>
                        {formatStatusLabel(t, status)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
                    <Text style={[styles.metaText, isRTL && styles.textRTLRight]}>
                      {formatDate(createdAt)}
                      {emirate ? ` • ${formatEmirateLabel(t, emirate)}` : ''}
                    </Text>
                    <View style={[styles.metaRight, isRTL && styles.metaRightRTL]}>
                      {isApplePayLike(o) ? (
                        <>
                          <Ionicons name="logo-apple" size={14} color="#111827" style={styles.appleLogo} />
                          <Text style={[styles.metaText, isRTL && styles.textRTLRight]}>{t('ordersDetail.paymentMethodApplePay')}</Text>
                        </>
                      ) : paymentMethod ? (
                        <Text style={[styles.metaText, isRTL && styles.textRTLRight]}>{String(paymentMethod).toUpperCase()}</Text>
                      ) : null}
                      {paymentStatus ? <Text style={[styles.metaText, isRTL && styles.textRTLRight]}> • {formatStatusLabel(t, paymentStatus)}</Text> : null}
                    </View>
                  </View>
                  <View style={[styles.cardBottom, isRTL && styles.cardBottomRTL]}>
                    <Text style={[styles.totalText, isRTL && styles.valueLTR]}>AED {formatAED(total)}</Text>
                    <Text style={[styles.itemsText, isRTL && styles.textRTLRight]}>
                      {t('ordersScreen.itemsCount', { count: itemCount })}
                    </Text>
                  </View>
                  <View style={[styles.breakdownRow, isRTL && styles.breakdownRowRTL]}>
                    <Text style={[styles.breakdownText, isRTL && styles.textRTLRight]}>
                      {t('ordersScreen.shipping')}: {freeShipping ? t('common.free') : `AED ${formatAED(shipping)}`}
                    </Text>
                  </View>

                  {isExpanded ? (
                    <View style={styles.orderSummaryBody}>
                      <Text style={[styles.orderSummaryTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.orderSummary')}</Text>

                      {(Array.isArray(o.items) ? o.items : []).map((it, idx) => {
                        const qty = Number(it?.quantity) || 0;
                        const name = it?.name || it?.productName || `${t('ordersScreen.item')} ${idx + 1}`;
                        const size = it?.size || it?.selectedSize || '';
                        const color = it?.color || it?.selectedColor || '';
                        const extras = [
                          size && `${t('common.size')}: ${size}`,
                          color && `${t('common.color')}: ${color}`,
                        ]
                          .filter(Boolean)
                          .join(' • ');
                        const price = Number(it?.price ?? 0) || 0;
                        const isPromo =
                          it?.isPromotionItem === true ||
                          String(size || '').trim() === '__PROMO__' ||
                          Number(price) === 0;
                        const excludedFromUserDiscount = isUserDiscountExcludedOrderItemName(name);
                        // Detect bundle items — bundle discount is mutually exclusive with VIP per item
                        const orderBundleDiscPct = Number(o?.bundleDiscountPercentage);
                        const orderBundleDiscAmt = Number(o?.bundleDiscountAmount);
                        const hasBundleOnOrder = Number.isFinite(orderBundleDiscPct) && orderBundleDiscPct > 0 && Number.isFinite(orderBundleDiscAmt) && orderBundleDiscAmt > 0;
                        const itemFromBundle = it?.fromBundle === true;
                        const isBundleItem = itemFromBundle || (hasBundleOnOrder && !excludedFromUserDiscount);

                        // For bundle items use bundle discount; for regular items use VIP discount
                        const effectiveDiscountPct = isBundleItem && hasBundleOnOrder ? orderBundleDiscPct : discountPct;
                        const originalUnit = (!isPromo && !excludedFromUserDiscount)
                          ? inferOriginalUnitPriceFromPct({ unitPrice: price, discountPct: effectiveDiscountPct })
                          : null;
                        const showDiscount = originalUnit != null;
                        const discountLabel = isBundleItem && hasBundleOnOrder
                          ? `${Math.round(orderBundleDiscPct)}% Bundle`
                          : (Number.isFinite(discountPct) ? `${Math.round(discountPct)}%` : '');
                        return (
                          <View
                            key={`${String(it?.productId || it?.id || name)}-${idx}`}
                            style={styles.orderSummaryItemRow}
                          >
                            <Text style={[styles.orderSummaryLine, isRTL && styles.textRTLRight]}>
                              {qty}× {String(name)}{extras ? ` — ${extras}` : ''}
                            </Text>
                            {isPromo ? (
                              <Text style={[styles.orderSummaryLineMuted, isRTL && styles.textRTLRight]}>{t('common.free')}</Text>
                            ) : showDiscount ? (
                              <Text style={[styles.orderSummaryLineMuted, isRTL && styles.textRTLRight]}>
                                {t('ordersDetail.fullPrice')}: <Text style={[styles.orderSummaryPriceStrike, isRTL && styles.valueLTR]}>AED {formatAED(originalUnit)}</Text>{' '}
                                • {t('ordersDetail.discount')}: {discountLabel}{' '}
                                • {t('ordersDetail.priceAfterDiscount')}: <Text style={[styles.orderSummaryPriceFinal, isRTL && styles.valueLTR]}>AED {formatAED(price)}</Text>
                              </Text>
                            ) : (
                              <Text style={[styles.orderSummaryLineMuted, isRTL && styles.valueLTR]}>AED {formatAED(price)}</Text>
                            )}
                          </View>
                        );
                      })}

                      <View style={styles.orderSummaryDivider} />

                      {/* Waterfall Discount Breakdown */}
                      {(() => {
                        const discAmt = Number(o?.discountAmount);
                        const bundleDiscAmt = Number(o?.bundleDiscountAmount);
                        const bundleDiscPct = Number(o?.bundleDiscountPercentage);
                        const hasVip = Number.isFinite(discAmt) && discAmt > 0;
                        const hasBundle = Number.isFinite(bundleDiscAmt) && bundleDiscAmt > 0;
                        const hasAnyDiscount = hasVip || hasBundle;
                        const retailTotal = Number(subtotal) + (hasVip ? discAmt : 0) + (hasBundle ? bundleDiscAmt : 0);
                        const afterVipSubtotal = retailTotal - (hasVip ? discAmt : 0);
                        const totalSaved = (hasVip ? discAmt : 0) + (hasBundle ? bundleDiscAmt : 0);
                        const paidCount = Array.isArray(o.items) ? o.items.filter(it => !(it?.isPromotionItem === true || String(it?.selectedSize || '').trim() === '__PROMO__' || Number(it?.price || 0) === 0)).length : 0;

                        return (
                          <>
                            {hasAnyDiscount ? (
                              <>
                                {/* Retail Price (strikethrough) */}
                                <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                  <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTLRight]}>
                                    {t('ordersDetail.retailPrice')} ({paidCount} {paidCount === 1 ? t('checkout.item') : t('checkout.items')})
                                  </Text>
                                  <Text style={[styles.orderTotalsValueMuted, isRTL && styles.valueLTR]}>AED {formatAED(retailTotal)}</Text>
                                </View>
                                {/* VIP Discount (purple) */}
                                {hasVip ? (
                                  <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                    <Text style={[styles.orderTotalsLabelPurple, isRTL && styles.textRTLRight]}>
                                      {t('ordersDetail.vipDiscount')}{Number.isFinite(discountPct) && discountPct > 0 ? ` (${Math.round(discountPct)}%)` : ''}
                                    </Text>
                                    <Text style={[styles.orderTotalsValuePurple, isRTL && styles.valueLTR]}>-AED {formatAED(discAmt)}</Text>
                                  </View>
                                ) : null}
                                {/* Intermediate Subtotal (only when both VIP + Bundle) */}
                                {hasVip && hasBundle ? (
                                  <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                    <Text style={[styles.orderTotalsLabelMuted, isRTL && styles.textRTLRight]}>{t('checkout.intermediateSubtotal')}</Text>
                                    <Text style={[styles.orderTotalsValueMutedSmall, isRTL && styles.valueLTR]}>AED {formatAED(afterVipSubtotal)}</Text>
                                  </View>
                                ) : null}
                                {/* Bundle Discount (green) */}
                                {hasBundle ? (
                                  <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                    <Text style={[styles.orderTotalsLabelGreen, isRTL && styles.textRTLRight]}>
                                      {t('ordersDetail.bundleDiscount')}{Number.isFinite(bundleDiscPct) && bundleDiscPct > 0 ? ` (${Math.round(bundleDiscPct)}%)` : ''}
                                    </Text>
                                    <Text style={[styles.orderTotalsValueGreen, isRTL && styles.valueLTR]}>-AED {formatAED(bundleDiscAmt)}</Text>
                                  </View>
                                ) : null}
                                <View style={styles.orderSummaryDividerLight} />
                                {/* Net Subtotal (bold) */}
                                <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                  <Text style={[styles.orderTotalsLabelBold, isRTL && styles.textRTLRight]}>{t('checkout.netSubtotal')}</Text>
                                  <Text style={[styles.orderTotalsValueBold, isRTL && styles.valueLTR]}>AED {formatAED(subtotal)}</Text>
                                </View>
                              </>
                            ) : (
                              /* No discounts — simple subtotal */
                              <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                                <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTLRight]}>{t('ordersScreen.subtotal')}</Text>
                                <Text style={[styles.orderTotalsValue, isRTL && styles.valueLTR]}>AED {formatAED(subtotal)}</Text>
                              </View>
                            )}

                            {/* Shipping */}
                            <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                              <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTLRight]}>
                                {emirate ? t('checkout.shippingTo', { emirate: formatEmirateLabel(t, emirate) }) : t('ordersScreen.shipping')}
                              </Text>
                              <Text style={[styles.orderTotalsValue, freeShipping && styles.orderTotalsValueFree, isRTL && styles.valueLTR]}>
                                {freeShipping ? t('common.free') : `AED ${formatAED(shipping)}`}
                              </Text>
                            </View>

                            {/* Free Shipping banner */}
                            {freeShipping ? (
                              <View style={styles.freeShippingBanner}>
                                <Ionicons name="checkmark-circle" size={12} color="#27AE60" style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
                                <Text style={[styles.freeShippingText, isRTL && styles.textRTLRight]}>
                                  {t('checkout.freeShippingApplied')}
                                </Text>
                              </View>
                            ) : null}

                            {/* VAT */}
                            <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                              <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTLRight]}>{t('ordersScreen.vatIncluded')}</Text>
                              <Text style={[styles.orderTotalsValue, isRTL && styles.valueLTR]}>AED {formatAED(vat)}</Text>
                            </View>
                            <Text style={[styles.vatNoteRed, isRTL && styles.textRTLRight]}>
                              {t('checkout.allPricesVatInclusive')}
                            </Text>

                            <View style={styles.orderSummaryDivider} />

                            {/* Total */}
                            <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                              <Text style={[styles.orderTotalsLabelStrong, isRTL && styles.textRTLRight]}>{t('ordersScreen.total')}</Text>
                              <Text style={[styles.orderTotalsValueStrong, isRTL && styles.valueLTR]}>AED {formatAED(total)}</Text>
                            </View>

                            {/* You Saved banner (after total) */}
                            {hasAnyDiscount && totalSaved > 0 ? (
                              <View style={styles.youSavedBanner}>
                                <Text style={styles.youSavedText}>🎉 {t('checkout.youSaved')}: AED {formatAED(totalSaved)}</Text>
                              </View>
                            ) : null}
                          </>
                        );
                      })()}
                    </View>
                  ) : null}

                  {showPay ? (
                    <TouchableOpacity
                      style={[styles.payButton, isRTL && styles.buttonRTL, isPaying && styles.payButtonDisabled]}
                      onPress={() => handlePay(o)}
                      disabled={isPaying}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="card-outline" size={16} color="#ffffff" />
                      <Text style={[styles.payButtonText, isRTL && styles.textRTLRight]}>{isPaying ? t('orders.startingPayment') : t('orders.payNow')}</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.supportButton, isRTL && styles.buttonRTL]}
                    onPress={() => contactSupportWhatsApp(o)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                    <Text style={[styles.supportButtonText, isRTL && styles.textRTLRight]}>{t('ordersScreen.supportWhatsapp')}</Text>
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
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: { padding: 4 },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { fontSize: 14, color: '#dc2626', fontWeight: '600' },
  backTextRTL: { writingDirection: 'rtl', textAlign: 'right' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000000' },
  headerSpacer: { width: 28 },
  refreshButton: { padding: 4 },
  scrollView: { flex: 1 },
  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  centerTop: { justifyContent: 'flex-start', paddingTop: 16 },
  emptyUniImage: { width: 240, height: 240, marginBottom: 24 },
  centerRTL: { alignItems: 'flex-end' },
  loadingText: { marginTop: 12, color: '#8E8E93' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F', marginBottom: 6, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  shopButton: {
    marginTop: 18,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 180,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButtonTextRTL: {
    writingDirection: 'rtl',
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  textRTLRight: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  list: { padding: 20, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTopRTL: { flexDirection: 'row-reverse' },
  orderToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  orderToggleRTL: { flexDirection: 'row-reverse' },
  // More spacing between Details and Delete to reduce accidental taps.
  detailsActions: { alignItems: 'flex-end', gap: 16 },
  detailsActionsRTL: { alignItems: 'flex-start' },
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
  detailsPillRTL: { flexDirection: 'row-reverse' },
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
    marginTop: 4,
  },
  statusRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-start' },
  statusRowRTL: { justifyContent: 'flex-end' },
  orderNumber: { fontSize: 15, fontWeight: '700', color: '#1D1D1F' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaRowRTL: { flexDirection: 'row-reverse' },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaRightRTL: { flexDirection: 'row-reverse' },
  appleLogo: { marginEnd: 4 },
  metaText: { marginTop: 6, fontSize: 12, color: '#8E8E93' },
  cardBottom: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardBottomRTL: { flexDirection: 'row-reverse' },
  totalText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  itemsText: { fontSize: 12, color: '#8E8E93' },
  breakdownRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-start' },
  breakdownRowRTL: { justifyContent: 'flex-end' },
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
  orderSummaryItemRow: { marginBottom: 6 },
  orderSummaryLineMuted: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  orderSummaryPriceStrike: { textDecorationLine: 'line-through', color: '#9CA3AF', fontWeight: '700' },
  orderSummaryPriceFinal: { color: '#dc2626', fontWeight: '800' },
  orderSummaryDivider: { height: 1, backgroundColor: '#E5E5EA', marginTop: 10, marginBottom: 6 },
  orderSummaryDividerLight: { height: StyleSheet.hairlineWidth, backgroundColor: '#D1D5DB', marginVertical: 4 },
  orderTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  orderTotalsRowRTL: { flexDirection: 'row-reverse' },
  orderTotalsLabel: { fontSize: 12, color: '#3C3C43', fontWeight: '700' },
  orderTotalsLabelGreen: { fontSize: 12, color: '#16A34A', fontWeight: '700' },
  orderTotalsLabelPurple: { fontSize: 12, color: '#7C3AED', fontWeight: '700' },
  orderTotalsLabelMuted: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  orderTotalsValue: { fontSize: 12, color: '#1D1D1F', fontWeight: '800' },
  orderTotalsValueMuted: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', textDecorationLine: 'line-through' },
  orderTotalsValueMutedSmall: { fontSize: 12, color: '#9CA3AF', fontWeight: '700' },
  orderTotalsValueGreen: { fontSize: 12, color: '#16A34A', fontWeight: '800' },
  orderTotalsValuePurple: { fontSize: 12, color: '#7C3AED', fontWeight: '800' },
  orderTotalsLabelBold: { fontSize: 12, color: '#1D1D1F', fontWeight: '800' },
  orderTotalsValueBold: { fontSize: 12, color: '#1D1D1F', fontWeight: '800' },
  orderTotalsValueFree: { color: '#16A34A', fontWeight: '800' },
  orderTotalsLabelStrong: { fontSize: 13, color: '#1D1D1F', fontWeight: '900' },
  orderTotalsValueStrong: { fontSize: 13, color: '#1D1D1F', fontWeight: '900' },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  freeShippingText: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
  },
  vatNoteRed: {
    fontSize: 10,
    color: '#dc2626',
    paddingVertical: 1,
  },
  youSavedBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  youSavedText: { fontSize: 12, color: '#16A34A', fontWeight: '800' },
  payButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
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
  buttonRTL: { flexDirection: 'row-reverse' },
  // Keep prices readable in RTL contexts.
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
});





import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { fetchUserOrderById, fetchUserOrders, fetchProductById } from '../../../services/api';
import { getPaymentUrlForExistingOrder } from '../../../services/orderService';
import { Image } from 'expo-image';
import { useLocalization } from '../../../contexts/LocalizationContext';
import { formatEmirateLabel } from '../../../utils/emirateUtils';
import AUTH_CONFIG from '../../../config/auth';

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

/**
 * Resolve an image path to a full URL.
 * Order items may store relative paths (e.g. "/images/products/…") or already-full URLs.
 * Returns '' when no usable value is available.
 */
const resolveImageUrl = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  // Already a full URL
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  // Relative path — prepend asset origin
  return `${ASSET_ORIGIN}${s.startsWith('/') ? '' : '/'}${s}`;
};

const formatAED = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

const FLEX_ROW = I18nManager.isRTL ? 'row-reverse' : 'row';

const formatDateTime = (dateString, locale, t) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString(locale || undefined, {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString(locale || undefined, {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${dateStr} ${t('common.at')} ${timeStr}`;
  } catch {
    return null;
  }
};

const isPaidLike = (order) => {
  const s = String(order?.status || '').toLowerCase();
  const ps = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return s === 'paid' || s === 'confirmed' || ps === 'paid' || ps === 'confirmed';
};

const parsePaymentMetadata = (order) => {
  const raw =
    order?.paymentMetadata ??
    order?.payment_metadata ??
    order?.paymentMeta ??
    order?.payment_meta ??
    null;
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
  const pm = String(order?.paymentMethod || order?.payment_method || '').toLowerCase();
  if (pm.includes('apple')) return true;
  const meta = parsePaymentMetadata(order);
  const flow = String(meta?.paymentFlow || meta?.payment_flow || '').toLowerCase();
  const provider = String(meta?.provider || meta?.paymentProvider || '').toLowerCase();
  return flow === 'apple_pay' || provider.includes('apple');
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

const inferOriginalUnitPriceFromPct = ({ unitPrice, discountPct }) => {
  const p = Number(unitPrice);
  const pct = Number(discountPct);
  if (!Number.isFinite(p) || p <= 0) return null;
  if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
  const mult = 1 - pct / 100;
  if (!Number.isFinite(mult) || mult <= 0) return null;
  const inferred = p / mult;
  // Only accept if it produces a meaningful "full price" above the discounted unit price.
  if (!Number.isFinite(inferred) || inferred <= p * 1.001) return null;
  return inferred;
};

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const idParam = String(params.id || '');

  const { user } = useAuth();
  const { addItem } = useCart();
  const token = user?.token || user?.accessToken || '';
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [reordering, setReordering] = useState(false);

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
      Alert.alert(t('common.error'), e?.message || t('ordersDetailAlerts.pleaseTryAgain'));
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
  const shipping = Number(order?.shipping ?? order?.shippingCost ?? 0) || 0;
  // Trust the server-provided shipping value (already 0 when free shipping was applied)
  const freeShipping = shipping === 0 && subtotal > 0;
  const vat = Number(order?.vat ?? order?.vatAmount ?? 0) || 0;
  const total = Number(order?.total ?? order?.totalAmount ?? order?.total_amount ?? order?.amount ?? 0) || 0;
  
  const customerName = order?.customerName || order?.customer_name || user?.name || '';
  const orderEmailRaw = String(order?.customerEmail || order?.customer_email || '').trim();
  const contactEmailRaw = String(user?.contactEmail || '').trim();
  const isAppleRelayEmail = orderEmailRaw.includes('@privaterelay.appleid.com');
  // If the order stored an Apple relay email but the user has provided a real contact email,
  // show the real email in Order Details.
  const customerEmail =
    (isAppleRelayEmail && contactEmailRaw) ? contactEmailRaw
    : (orderEmailRaw || contactEmailRaw || String(user?.email || '').trim() || '');
  const customerPhone = order?.customerPhone || order?.customer_phone || user?.phone || '';
  const customerAddress = order?.customerAddress || order?.customer_address || order?.address || '';
  const emirate = order?.emirate || '';
  const orderNotes = String(order?.orderNotes || order?.order_notes || '').trim();
  
  const createdAt = order?.createdAt || order?.created_at || order?.orderDate || order?.order_date;
  const formattedDateTime = formatDateTime(createdAt, locale, t);

  const getStatusLabel = () => {
    const raw = String(status || '').trim();
    const s = raw.toLowerCase();
    const map = {
      pending: 'ordersDetail.statusPending',
      processing: 'ordersDetail.statusProcessing',
      confirmed: 'ordersDetail.statusConfirmed',
      paid: 'ordersDetail.statusPaid',
      completed: 'ordersDetail.statusCompleted',
      shipped: 'ordersDetail.statusShipped',
      delivered: 'ordersDetail.statusDelivered',
      cancelled: 'ordersDetail.statusCancelled',
      canceled: 'ordersDetail.statusCancelled',
      refunded: 'ordersDetail.statusRefunded',
      failed: 'ordersDetail.statusFailed',
      deleted: 'ordersDetail.statusDeleted',
    };
    const key = map[s];
    return key ? t(key) : raw.toUpperCase();
  };

  const getPaymentMethodLabel = () => {
    if (isApplePayLike(order)) return t('ordersDetail.paymentMethodApplePay');
    if (isCodLike(order)) return t('ordersDetail.paymentMethodCod');
    if (isCardLike(order)) return t('ordersDetail.paymentMethodCard');
    const pm = String(paymentMethod || '').trim();
    if (!pm) return t('ordersDetail.paymentMethodUnknown');
    return t('ordersDetail.paymentMethodOther', { method: pm.toUpperCase() });
  };

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
    const message = t('support.whatsappOrderHelpMessage', { orderNumber: String(orderNumber) });
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
    });
  };

  const onReorder = async () => {
    if (!order || !user) return;
    
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const itemsToReorder = orderItems.filter((it) => !isPromoItem(it));
    
    if (itemsToReorder.length === 0) {
      Alert.alert(t('ordersDetail.reorderTitle'), t('ordersDetail.noItemsToReorder'));
      return;
    }
    
    setReordering(true);
    let addedCount = 0;
    let failedCount = 0;
    
    try {
      for (const item of itemsToReorder) {
        const productId = item?.productId || item?.id;
        const qty = Number(item?.quantity) || 1;
        const size = item?.size || item?.selectedSize || '';
        const color = item?.color || item?.selectedColor || '';
        
        if (!productId) {
          failedCount++;
          continue;
        }
        
        try {
          // Fetch fresh product data
          const product = await fetchProductById(productId, user, { locale });
          if (product) {
            // Add to cart with original size/color selection
            await addItem(product, qty, color !== '__PROMO__' ? color : '', size !== '__PROMO__' ? size : '');
            addedCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }
      
      if (addedCount > 0) {
        Alert.alert(
          t('ordersDetail.reorderSuccessTitle'),
          failedCount > 0
            ? t('ordersDetail.reorderPartialSuccess', { added: addedCount, failed: failedCount })
            : t('ordersDetail.reorderSuccess', { count: addedCount }),
          [
            { text: t('common.continueShopping'), style: 'cancel' },
            { text: t('ordersDetail.viewBag'), onPress: () => router.push('/(tabs)/bag') }
          ]
        );
      } else {
        Alert.alert(t('ordersDetail.reorderTitle'), t('ordersDetail.reorderFailed'));
      }
    } catch (e) {
      Alert.alert(t('common.error'), e?.message || t('ordersDetail.reorderFailed'));
    } finally {
      setReordering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/orders')} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('ordersDetail.orderDetails')}</Text>
        <TouchableOpacity onPress={load} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{t('ordersDetail.loading')}</Text>
        </View>
      ) : !order ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={64} color="#E5E5EA" />
          <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t('ordersDetail.notFound')}</Text>
          <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('ordersDetail.notFoundHint')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Number Card */}
          <View style={styles.orderNumberCard}>
            <View style={[styles.orderNumberHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="receipt" size={24} color="#dc2626" />
              <View style={[styles.orderNumberTextContainer, isRTL && styles.alignEndRTL]}>
                <Text style={[styles.orderNumberLabel, isRTL && styles.textRTL]}>{t('ordersDetail.orderNumber')}</Text>
                <Text style={styles.orderNumber}>{String(orderNumber)}</Text>
              </View>
            </View>
            {formattedDateTime ? (
              <View style={[styles.dateTimeRow, isRTL && styles.rowRTL]}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={[styles.dateTimeText, isRTL && styles.textRTL]}>{formattedDateTime}</Text>
              </View>
            ) : null}
          </View>

          {/* Order Status Section */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.orderStatus')}</Text>
            </View>
            <View style={[styles.statusRow, isRTL && styles.statusRowRTL]}>
              <View
                style={[
                  styles.statusBadge,
                  String(status || '').trim().toLowerCase() === 'pending' && styles.statusBadgePending,
                ]}
              >
                <Text style={[styles.statusBadgeText, isRTL && styles.textRTL]}>{getStatusLabel()}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="card" size={20} color="#27AE60" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.paymentMethod')}</Text>
            </View>
            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodRow}>
                {isApplePayLike(order) ? (
                  <Ionicons name="logo-apple" size={16} color="#111827" style={styles.appleLogo} />
                ) : null}
                <Text style={[styles.paymentMethodText, isRTL && styles.textRTL]}>{getPaymentMethodLabel()}</Text>
                {isPaidLike(order) && isApplePayLike(order) ? (
                  <Text style={[styles.paymentMethodPaidHint, isRTL && styles.textRTL]}> • {t('ordersDetail.paid')}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Order Notes */}
          {orderNotes ? (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#6B7280" />
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.orderNotes')}</Text>
              </View>
              <View style={styles.notesCard}>
                <Text style={[styles.notesText, isRTL && styles.textRTL]}>{orderNotes}</Text>
              </View>
            </View>
          ) : null}

          {/* Items Section */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="bag-handle" size={20} color="#dc2626" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.items')}</Text>
            </View>
            
            {/* Paid Items */}
            {paidItems.map((it, idx) => {
              const qty = Number(it?.quantity) || 1;
              const price = Number(it?.price) || 0;
              const name = it?.name || it?.productName || t('common.itemWithNumber', { number: idx + 1 });
              const size = it?.size || it?.selectedSize || '';
              const color = it?.color || it?.selectedColor || '';
              const itemTotal = qty * price;

              // Prefer the discount% stored with the order (captures the rate at time of purchase),
              // falling back to the user's current discount% for older orders that lack this field.
              const orderDiscountPct = Number(order?.discountPercentage);
              const discountPct = (Number.isFinite(orderDiscountPct) && orderDiscountPct > 0)
                ? orderDiscountPct
                : Number(user?.discountPercentage);
              const excludedFromUserDiscount = isUserDiscountExcludedOrderItemName(name);
              const inferredOriginalUnit = inferOriginalUnitPriceFromPct({ unitPrice: price, discountPct });
              const canShowDiscountBreakdown = !isPromoItem(it) && !excludedFromUserDiscount && inferredOriginalUnit != null;
              const discountUnit = canShowDiscountBreakdown ? (inferredOriginalUnit - price) : 0;
              const originalLineTotal = canShowDiscountBreakdown ? (inferredOriginalUnit * qty) : null;
              const discountLineTotal = canShowDiscountBreakdown ? (discountUnit * qty) : null;
              
              const imageUrl = resolveImageUrl(it?.image || it?.imageUrl || it?.thumbnail);

              return (
                <View key={`paid-${String(it?.productId || it?.id || name)}-${idx}`} style={styles.itemCard}>
                  <View style={styles.itemHeaderWithImage}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.itemThumbnail}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                        recyclingKey={`paid-img-${it?.productId || idx}`}
                      />
                    ) : (
                      <View style={[styles.itemThumbnail, styles.itemThumbnailPlaceholder]}>
                        <Ionicons name="cube-outline" size={20} color="#C7C7CC" />
                      </View>
                    )}
                    <View style={styles.itemHeaderContent}>
                      <View style={styles.itemTitleWrap}>
                        <Text style={[styles.itemName, isRTL && styles.textRTL]} numberOfLines={2}>{String(name)}</Text>
                        {canShowDiscountBreakdown && Number.isFinite(discountPct) ? (
                          <View style={styles.discountPill}>
                            <Text style={styles.discountPillText}>{`${Math.round(discountPct)}%`}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.itemPrice, isRTL && styles.valueLTR]}>AED {formatAED(itemTotal)}</Text>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemDetailText, isRTL && styles.textRTL]}>
                      {(() => {
                        const parts = [`${t('ordersDetail.qty')}: ${qty}`];
                        if (size && size !== '__PROMO__') parts.push(`${t('ordersDetail.size')}: ${String(size)}`);
                        if (color) parts.push(`${t('ordersDetail.color')}: ${String(color)}`);
                        return parts.join(' • ');
                      })()}
                    </Text>
                  </View>

                  <View style={styles.itemPriceBlock}>
                    <View style={styles.itemPriceRow}>
                      <Text style={[styles.itemPriceLabel, isRTL && styles.textRTL]}>{t('ordersDetail.each')}</Text>
                      <Text style={[styles.itemPriceValue, isRTL && styles.valueLTR]}>AED {formatAED(price)}</Text>
                    </View>

                    {canShowDiscountBreakdown ? (
                      <>
                        <View style={styles.itemPriceRow}>
                          <Text style={[styles.itemPriceLabel, isRTL && styles.textRTL]}>{t('ordersDetail.fullPrice')}</Text>
                          <Text style={[styles.itemPriceValue, styles.itemPriceValueMuted, styles.itemPriceValueStrikethrough, isRTL && styles.valueLTR]}>
                            AED {formatAED(inferredOriginalUnit)}
                          </Text>
                        </View>
                        <View style={styles.itemPriceRow}>
                          <Text style={[styles.itemPriceLabel, isRTL && styles.textRTL]}>
                            {t('ordersDetail.discount')}
                            {Number.isFinite(discountPct) ? (
                              <Text style={[styles.discountPctText, isRTL && styles.valueLTR]}> {`(${Math.round(discountPct)}%)`}</Text>
                            ) : null}
                          </Text>
                          <Text style={[styles.itemPriceValue, styles.discountValue, isRTL && styles.valueLTR]}>-AED {formatAED(discountUnit)}</Text>
                        </View>
                        <View style={styles.itemPriceRow}>
                          <Text style={[styles.itemPriceLabelStrong, isRTL && styles.textRTL]}>{t('ordersDetail.priceAfterDiscount')}</Text>
                          <Text style={[styles.itemPriceValue, styles.itemPriceValueStrong, isRTL && styles.valueLTR]}>AED {formatAED(price)}</Text>
                        </View>
                      </>
                    ) : null}

                    {qty > 1 ? (
                      <View style={styles.itemLineTotals}>
                        {canShowDiscountBreakdown ? (
                          <>
                            <View style={styles.itemPriceRow}>
                              <Text style={[styles.itemPriceLabel, isRTL && styles.textRTL]}>{t('ordersDetail.fullPrice')}</Text>
                              <Text style={[styles.itemPriceValue, styles.itemPriceValueMuted, styles.itemPriceValueStrikethrough, isRTL && styles.valueLTR]}>
                                AED {formatAED(originalLineTotal)}
                              </Text>
                            </View>
                            <View style={styles.itemPriceRow}>
                              <Text style={[styles.itemPriceLabel, isRTL && styles.textRTL]}>{t('ordersDetail.discount')}</Text>
                              <Text style={[styles.itemPriceValue, styles.discountValue, isRTL && styles.valueLTR]}>-AED {formatAED(discountLineTotal)}</Text>
                            </View>
                          </>
                        ) : null}
                        <View style={styles.itemPriceRow}>
                          <Text style={[styles.itemPriceLabelStrong, isRTL && styles.textRTL]}>{t('ordersDetail.total')}</Text>
                          <Text style={[styles.itemPrice, isRTL && styles.valueLTR]}>{`AED ${formatAED(itemTotal)}`}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {/* Promo/Free Items */}
            {promoItems.length > 0 ? (
              <View style={styles.promoSection}>
                <View style={[styles.promoHeader, isRTL && styles.rowRTL]}>
                  <Ionicons name="gift" size={16} color="#16A34A" />
                  <Text style={[styles.promoHeaderText, isRTL && styles.textRTL]}>{t('ordersDetail.freeItems')}</Text>
                </View>
                {promoItems.map((it, idx) => {
                  const qty = Number(it?.quantity) || 1;
                  const name = it?.name || it?.productName || t('common.freeItemWithNumber', { number: idx + 1 });
                  const promoImageUrl = resolveImageUrl(it?.image || it?.imageUrl || it?.thumbnail);
                  
                  return (
                    <View key={`promo-${String(it?.productId || it?.id || name)}-${idx}`} style={styles.promoItemCard}>
                      <View style={styles.promoItemRow}>
                        {promoImageUrl ? (
                          <Image
                            source={{ uri: promoImageUrl }}
                            style={styles.promoThumbnail}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                            recyclingKey={`promo-img-${it?.productId || idx}`}
                          />
                        ) : (
                          <View style={[styles.promoThumbnail, styles.promoThumbnailPlaceholder]}>
                            <Ionicons name="gift-outline" size={16} color="#16A34A" />
                          </View>
                        )}
                        <View style={styles.promoItemContent}>
                          <View style={styles.itemHeader}>
                            <Text style={[styles.promoItemName, isRTL && styles.textRTL]}>{String(name)}</Text>
                            <View style={styles.freeBadge}>
                              <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
                            </View>
                          </View>
                          <Text style={[styles.promoItemQty, isRTL && styles.textRTL]}>{t('ordersDetail.qty')}: {qty}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Shipping Details */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="location" size={20} color="#27AE60" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.shippingDetails')}</Text>
            </View>
            
            {customerName ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="person-outline" size={16} color="#8E8E93" />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.customer')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{String(customerName)}</Text>
              </View>
            ) : null}
            
            {customerPhone ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.phone')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.valueLTR]}>{String(customerPhone)}</Text>
              </View>
            ) : null}
            
            {customerEmail ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.email')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.valueLTR]}>{String(customerEmail)}</Text>
              </View>
            ) : null}
            
            {emirate ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="flag-outline" size={16} color="#8E8E93" />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.emirate')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{formatEmirateLabel(t, emirate)}</Text>
              </View>
            ) : null}
            
            {customerAddress ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="home-outline" size={16} color="#8E8E93" />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.address')}</Text>
                <Text style={[styles.detailValue, styles.addressValue, isRTL && styles.textRTL]}>{String(customerAddress)}</Text>
              </View>
            ) : null}
          </View>

          {/* Order Summary — Waterfall Pricing Breakdown */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <Ionicons name="calculator" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('ordersDetail.orderSummary')}</Text>
            </View>

            {(() => {
              const orderDiscPct = Number(order?.discountPercentage);
              const orderDiscAmt = Number(order?.discountAmount);
              const bundleDiscPct = Number(order?.bundleDiscountPercentage);
              const bundleDiscAmt = Number(order?.bundleDiscountAmount);
              const hasVipDiscount = Number.isFinite(orderDiscAmt) && orderDiscAmt > 0;
              const hasBundleDiscount = Number.isFinite(bundleDiscAmt) && bundleDiscAmt > 0;
              const hasAnyDiscount = hasVipDiscount || hasBundleDiscount;
              const retailTotal = subtotal + (hasVipDiscount ? orderDiscAmt : 0) + (hasBundleDiscount ? bundleDiscAmt : 0);
              const afterVipSubtotal = retailTotal - (hasVipDiscount ? orderDiscAmt : 0);
              const totalSaved = (hasVipDiscount ? orderDiscAmt : 0) + (hasBundleDiscount ? bundleDiscAmt : 0);

              return (
                <>
                  {hasAnyDiscount ? (
                    <>
                      {/* Retail Price (strikethrough) */}
                      <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                        <Text style={[styles.summaryLabel, isRTL && styles.textRTL]}>
                          {t('ordersDetail.retailPrice')} ({paidItems.length} {paidItems.length === 1 ? t('checkout.item') : t('checkout.items')})
                        </Text>
                        <Text style={[styles.summaryValue, styles.summaryValueStrikethrough, isRTL && styles.valueLTR]}>AED {formatAED(retailTotal)}</Text>
                      </View>

                      {/* VIP Discount (purple) */}
                      {hasVipDiscount ? (
                        <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                          <Text style={[styles.summaryLabelPurple, isRTL && styles.textRTL]}>
                            {t('ordersDetail.vipDiscount')}{Number.isFinite(orderDiscPct) && orderDiscPct > 0 ? ` (${Math.round(orderDiscPct)}%)` : ''}
                          </Text>
                          <Text style={[styles.summaryValuePurple, isRTL && styles.valueLTR]}>-AED {formatAED(orderDiscAmt)}</Text>
                        </View>
                      ) : null}

                      {/* Intermediate Subtotal (only when both VIP + Bundle) */}
                      {hasVipDiscount && hasBundleDiscount ? (
                        <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                          <Text style={[styles.summaryLabelMuted, isRTL && styles.textRTL]}>{t('checkout.intermediateSubtotal')}</Text>
                          <Text style={[styles.summaryValueMuted, isRTL && styles.valueLTR]}>AED {formatAED(afterVipSubtotal)}</Text>
                        </View>
                      ) : null}

                      {/* Bundle Discount (green) */}
                      {hasBundleDiscount ? (
                        <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                          <Text style={[styles.summaryLabelDiscount, isRTL && styles.textRTL]}>
                            {t('ordersDetail.bundleDiscount')}{Number.isFinite(bundleDiscPct) && bundleDiscPct > 0 ? ` (${Math.round(bundleDiscPct)}%)` : ''}
                          </Text>
                          <Text style={[styles.summaryValueDiscount, isRTL && styles.valueLTR]}>-AED {formatAED(bundleDiscAmt)}</Text>
                        </View>
                      ) : null}

                      <View style={styles.summaryDividerLight} />

                      {/* Net Subtotal (bold) */}
                      <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                        <Text style={[styles.summaryLabelBold, isRTL && styles.textRTL]}>{t('checkout.netSubtotal')}</Text>
                        <Text style={[styles.summaryValueBold, isRTL && styles.valueLTR]}>AED {formatAED(subtotal)}</Text>
                      </View>
                    </>
                  ) : (
                    /* No discounts — simple subtotal */
                    <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                      <Text style={[styles.summaryLabel, isRTL && styles.textRTL]}>{t('ordersDetail.subtotal')}</Text>
                      <Text style={[styles.summaryValue, isRTL && styles.valueLTR]}>AED {formatAED(subtotal)}</Text>
                    </View>
                  )}

                  {/* Shipping */}
                  <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                    <Text style={[styles.summaryLabel, isRTL && styles.textRTL]}>
                      {emirate ? t('checkout.shippingTo', { emirate: formatEmirateLabel(t, emirate) }) : t('ordersDetail.shipping')}
                    </Text>
                    {freeShipping ? (
                      <Text style={[styles.summaryValue, styles.summaryValueFree, isRTL && styles.valueLTR]}>{t('common.free')}</Text>
                    ) : (
                      <Text style={[styles.summaryValue, isRTL && styles.valueLTR]}>AED {formatAED(shipping)}</Text>
                    )}
                  </View>

                  {/* Free Shipping banner */}
                  {freeShipping ? (
                    <View style={styles.freeShippingBanner}>
                      <Ionicons name="checkmark-circle" size={14} color="#27AE60" style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
                      <Text style={[styles.freeShippingText, isRTL && styles.textRTL]}>
                        {t('checkout.freeShippingApplied')}
                      </Text>
                    </View>
                  ) : null}

                  {/* VAT */}
                  <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                    <Text style={[styles.summaryLabel, isRTL && styles.textRTL]}>{t('ordersDetail.vatIncluded')}</Text>
                    <Text style={[styles.summaryValue, isRTL && styles.valueLTR]}>AED {formatAED(vat)}</Text>
                  </View>
                  <Text style={[styles.vatNoteRed, isRTL && styles.textRTL]}>
                    {t('checkout.allPricesVatInclusive')}
                  </Text>

                  <View style={styles.summaryDivider} />

                  {/* Total */}
                  <View style={[styles.totalRow, isRTL && styles.summaryRowRTL]}>
                    <Text style={[styles.totalLabel, isRTL && styles.textRTL]}>{t('ordersDetail.total')}</Text>
                    <Text style={[styles.totalValue, isRTL && styles.valueLTR]}>AED {formatAED(total)}</Text>
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

          {/* Actions */}
          <View style={styles.actionsSection}>
            {/* Reorder Button */}
            <TouchableOpacity
              style={[styles.reorderButton, isRTL && styles.buttonRTL, reordering && styles.buttonDisabled]}
              onPress={onReorder}
              disabled={reordering}
              activeOpacity={0.85}
            >
              {reordering ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="repeat" size={20} color="#ffffff" />
              )}
              <Text style={[styles.reorderButtonText, isRTL && styles.textRTL]}>
                {reordering ? t('ordersDetail.reordering') : t('ordersDetail.reorderButton')}
              </Text>
            </TouchableOpacity>

            {showPay ? (
              <TouchableOpacity
                style={[styles.payButton, isRTL && styles.buttonRTL, paying && styles.buttonDisabled]}
                onPress={onPay}
                disabled={paying}
                activeOpacity={0.85}
              >
                {paying ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name="card" size={20} color="#ffffff" />
                )}
                <Text style={[styles.payButtonText, isRTL && styles.textRTL]}>
                  {paying ? t('ordersDetail.startingPayment') : t('ordersDetail.payNow')}
                </Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity style={[styles.supportButton, isRTL && styles.buttonRTL]} onPress={onSupport} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
              <Text style={[styles.supportButtonText, isRTL && styles.textRTL]}>{t('ordersDetail.supportWhatsapp')}</Text>
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
  headerRTL: {
    flexDirection: 'row-reverse',
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
  statusRowRTL: {
    flexDirection: 'row-reverse',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  statusBadgePending: {
    backgroundColor: '#dc2626',
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
  // RTL helpers
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  alignEndRTL: {
    alignItems: 'flex-end',
  },
  
  // Payment Method
  paymentMethodCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  appleLogo: {
    marginEnd: 8,
  },
  notesCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 15,
    color: '#1D1D1F',
    lineHeight: 22,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  paymentMethodRow: {
    flexDirection: FLEX_ROW,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paymentMethodPaidHint: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
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
  itemHeaderWithImage: {
    flexDirection: FLEX_ROW,
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  itemThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  itemHeaderContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: 4,
  },
  itemHeader: {
    flexDirection: FLEX_ROW,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  itemTitleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: FLEX_ROW,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 18,
  },
  discountPill: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  discountPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#16A34A',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
  },
  itemDetails: {
    flexDirection: FLEX_ROW,
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetailText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  itemPriceBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  itemPriceRow: {
    flexDirection: FLEX_ROW,
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 6,
  },
  itemPriceLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  itemPriceLabelStrong: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '800',
  },
  itemPriceValue: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '700',
  },
  itemPriceValueMuted: {
    color: '#9CA3AF',
  },
  itemPriceValueStrikethrough: {
    textDecorationLine: 'line-through',
  },
  itemPriceValueStrong: {
    fontWeight: '900',
  },
  discountValue: {
    color: '#16A34A',
    fontWeight: '900',
  },
  discountPctText: {
    color: '#16A34A',
    fontWeight: '900',
  },
  itemLineTotals: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
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
  promoItemRow: {
    flexDirection: FLEX_ROW,
    alignItems: 'center',
    gap: 10,
  },
  promoThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  promoThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
  },
  promoItemContent: {
    flex: 1,
    minWidth: 0,
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
  detailRowRTL: {
    flexDirection: 'row-reverse',
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
  summaryRowRTL: {
    flexDirection: 'row-reverse',
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
  summaryValueStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  summaryLabelPurple: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  summaryValuePurple: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  summaryLabelMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  summaryValueMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  summaryLabelDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  summaryValueDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  youSavedBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  youSavedText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '800',
  },
  summaryLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  summaryValueFree: {
    color: '#16A34A',
    fontWeight: '700',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  freeShippingText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  vatNoteRed: {
    fontSize: 11,
    color: '#dc2626',
    paddingVertical: 2,
  },
  summaryDividerLight: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 8,
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
    color: '#dc2626',
  },
  
  // Actions
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#dc2626',
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
  buttonRTL: {
    flexDirection: 'row-reverse',
  },
  valueLTR: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
});


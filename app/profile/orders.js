import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, RefreshControl, Alert, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { getPaymentUrlForExistingOrder } from '../../services/orderService';
import {
  canResumeOrderPayment,
  fetchOrdersOverview,
  findOrder,
  getOrderId,
  getOrderKey,
  getOrderNumber,
  getOrderPaymentUrl,
  isUserDeletableOrder,
  mergeOrders,
  removeOrder,
  sortOrdersNewestFirst,
} from '../../services/ordersRepository';
import { OrdersSkeleton } from '../../components/SkeletonLoader';
import { useLocalization } from '../../contexts/LocalizationContext';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { createLogger } from '../../utils/logger';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors, shadow, surfaces, statusStyle } from '../../utils/theme';
import AUTH_CONFIG from '../../config/auth';
import { withErrorBoundary } from '../../components/ErrorBoundary';
import { ASSET_ORIGIN, EMPTY_UNI_IMAGE } from '../../utils/assets';

const log = createLogger('Orders');


// Enable LayoutAnimation on Android for the inline summary expand/collapse.
// Old-arch Android needs the opt-in; on Fabric (new arch) it's a no-op that
// logs a deprecation warning, so skip it there.
if (Platform.OS === 'android' && !global?.nativeFabricUIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const resolveImageUrl = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `${ASSET_ORIGIN}${s.startsWith('/') ? '' : '/'}${s}`;
};

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
  // Devices (fallback by name) — compact to alphanumerics so hyphenated
  // names match too: "GENO-LED IR II" -> genoledirii, "Hair-GENTRON" -> hairgentron.
  const compact = name.replace(/[^a-z0-9]/g, '');
  // Hair Stamp is a consumable for the HairGen Booster, not a device — discounts apply.
  if (compact.includes('hairstamp')) return false;
  if (compact.includes('genoled') || compact.includes('gentron') || compact.includes('hairgen')) return true;
  return false;
};

const formatDate = (value, locale = 'en') => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const localeTag = locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US';
  return d.toLocaleDateString(localeTag, { year: 'numeric', month: 'short', day: 'numeric' });
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
    out_for_delivery: 'ordersDetail.statusOutForDelivery',
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

/** Tinted status capsule with leading dot — shared look with details screen. */
function StatusCapsule({ status, label, isRTL }) {
  const s = statusStyle(status);
  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg }, isRTL && styles.rowRTL]}>
      <View style={[styles.statusDot, { backgroundColor: s.color }]} />
      <Text style={[styles.statusText, { color: s.color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders: contextOrders, refreshOrdersCount } = useOrders();
  const token = user?.token || user?.accessToken || '';
  const { t, dir, locale } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight } = useCollapsibleHeader();

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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [payingOrderId, setPayingOrderId] = useState('');
  const [expandedOrderKey, setExpandedOrderKey] = useState('');

  const load = async () => {
    if (!token) {
      return;
    }
    setError('');
    try {
      const data = await fetchOrdersOverview(token);
      setOrders(Array.isArray(data) ? data : []);
      // Refresh the orders count in the tab bar
      refreshOrdersCount();
    } catch (e) {
      log.warn('Failed to load orders', e?.message || e);
      setError(t('ordersDetailAlerts.pleaseTryAgain'));
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
    return sortOrdersNewestFirst(mergeOrders(orders, contextOrders));
  }, [orders, contextOrders]);

  const openDetails = (o) => {
    haptics.lightTap();
    const orderNumber = o.orderNumber || o.order_number || o.number || o.id;
    router.push({ pathname: '/profile/orders/[id]', params: { id: String(o.id || orderNumber) } });
  };

  const handlePay = async (order) => {
    haptics.mediumTap();
    if (!token) return;
    const orderId = getOrderId(order);
    const orderNumber = getOrderNumber(order);
    const key = getOrderKey(order);
    setPayingOrderId(key);
    try {
      // First, re-fetch this order (many backends only include paymentUrl on the detail payload).
      let hydratedOrder = order;
      try {
        hydratedOrder = (await findOrder(token, orderId || orderNumber)) || hydratedOrder;
      } catch {
        // ignore hydration errors and fall back to resume helper
      }

      const existingUrl = getOrderPaymentUrl(hydratedOrder);
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
      log.warn('Could not start payment', e?.message || e);
      Alert.alert(t('orders.couldNotStartPayment'), t('ordersDetailAlerts.pleaseTryAgain'));
    } finally {
      setPayingOrderId('');
    }
  };

  const contactSupportWhatsApp = (order) => {
    haptics.lightTap();
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
    haptics.heavyTap();
    const orderId = getOrderId(order);
    const orderNumber = getOrderNumber(order);
    if (!orderId) {
      Alert.alert(t('ordersScreen.cannotDeleteTitle'), t('ordersScreen.cannotDeleteMessage1'));
      return;
    }
    if (!isUserDeletableOrder(order)) {
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
              await removeOrder(token, orderId);
              setOrders((prev) => prev.filter((o) => getOrderId(o) !== orderId));
              setExpandedOrderKey((prev) => (prev === orderId ? '' : prev));
              // Refresh the orders count in the tab bar
              refreshOrdersCount();
            } catch (e) {
              log.warn('Delete order failed', e?.message || e);
              Alert.alert(t('ordersScreen.deleteFailedTitle'), t('ordersDetailAlerts.pleaseTryAgain'));
            }
          },
        },
      ]
    );
  };

  const toggleExpanded = (key) => {
    haptics.lightTap();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const k = String(key || '');
    setExpandedOrderKey((prev) => (prev === k ? '' : k));
  };

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace(backTo); };

  if (!user) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={t('orders.title')} onBack={onBack} isRTL={isRTL} />
        <View style={[styles.center, { paddingTop: headerHeight + 24 }, isRTL && styles.centerRTL]}>
          <Text style={[styles.emptyTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.loginRequired')}</Text>
          <Text style={[styles.emptyText, isRTL && styles.textRTLRight]}>{t('ordersScreen.loginRequiredText')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('orders.title')} onBack={onBack} onRefresh={onRefresh} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} progressViewOffset={headerHeight} />}
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
              const freeShipping = Number(shippingRaw) === 0 && Number(subtotal) > 0;
              const shipping = Number(shippingRaw) || 0;
              const itemsArr = Array.isArray(o.items) ? o.items : [];
              const itemCount =
                o.itemCount ??
                (itemsArr.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0);
              const distinctItems = itemsArr.length;
              const firstImage = resolveImageUrl(
                itemsArr.map((it) => it?.image || it?.imageUrl || it?.thumbnail).find(Boolean) || ''
              );
              const emirate = o.customerEmirate || o.emirate || '';
              const showPay = canResumeOrderPayment(o);
              const keyId = String(o.id || orderNumber);
              const isPaying = payingOrderId === keyId;
              const isExpanded = expandedOrderKey === keyId;
              // Prefer the discount% stored with the order (captures the rate at time of purchase),
              // falling back to the user's current discount% for older orders without this field.
              const orderDiscPct = Number(o?.discountPercentage);
              const discountPct = (Number.isFinite(orderDiscPct) && orderDiscPct > 0)
                ? orderDiscPct
                : (user?.discountType ? Number(user?.discountPercentage) : 0);
              return (
                <View key={`${String(o.id || orderNumber)}-${orderIndex}`} style={[styles.card, shadow.card]}>
                  {/* Header — whole row taps through to details */}
                  <TouchableOpacity
                    style={[styles.cardHead, isRTL && styles.rowRTL]}
                    onPress={() => openDetails(o)}
                    activeOpacity={0.6}
                  >
                    {firstImage ? (
                      <View style={styles.thumbWrap}>
                        <Image
                          source={{ uri: firstImage }}
                          style={styles.thumb}
                          contentFit="contain"
                          transition={200}
                          cachePolicy="memory-disk"
                          recyclingKey={`order-thumb-${keyId}`}
                        />
                        {distinctItems > 1 ? (
                          <View style={styles.thumbBadge}>
                            <Text style={styles.thumbBadgeText}>+{distinctItems - 1}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <View style={[styles.thumb, styles.thumbPlaceholder]}>
                        <Ionicons name="bag-handle-outline" size={22} color={colors.tertiary} />
                      </View>
                    )}

                    <View style={styles.headMiddle}>
                      <Text style={[styles.orderNumber, isRTL && styles.textRTLRight]} numberOfLines={1}>
                        {String(orderNumber)}
                      </Text>
                      <Text style={[styles.headSub, isRTL && styles.textRTLRight]} numberOfLines={1}>
                        {formatDate(createdAt, locale)}{emirate ? ` · ${formatEmirateLabel(t, emirate)}` : ''}
                      </Text>
                    </View>

                    <View style={[styles.headRight, isRTL && styles.headRightRTL]}>
                      <StatusCapsule status={status} label={formatStatusLabel(t, status)} isRTL={isRTL} />
                    </View>
                    <Ionicons
                      name={isRTL ? 'chevron-back' : 'chevron-forward'}
                      size={18}
                      color={colors.tertiary}
                      style={styles.disclosure}
                    />
                  </TouchableOpacity>

                  {/* Meta footer: payment (left) · total + items (right) */}
                  <View style={styles.hairline} />
                  <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
                    <View style={[styles.metaLeft, isRTL && styles.rowRTL]}>
                      {isApplePayLike(o) ? (
                        <Ionicons name="logo-apple" size={14} color={colors.label} style={styles.appleLogo} />
                      ) : null}
                      <Text style={[styles.metaText, isRTL && styles.textRTLRight]} numberOfLines={1}>
                        {isApplePayLike(o)
                          ? t('ordersDetail.paymentMethodApplePay')
                          : (paymentMethod ? String(paymentMethod).toUpperCase() : '')}
                        {paymentStatus ? ` · ${formatStatusLabel(t, paymentStatus)}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.metaRightCol, isRTL && styles.metaRightColRTL]}>
                      <Text style={[styles.totalText, isRTL && styles.valueLTR]}>AED {formatAED(total)}</Text>
                      <Text style={[styles.itemsText, isRTL && styles.textRTLRight]}>
                        {t('ordersScreen.itemsCount', { count: itemCount })}
                        {freeShipping ? ` · ${t('common.free')}` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* GENOSYS Rewards — points earned by this order */}
                  {Number(o?.loyaltyPointsEarned) > 0 ? (
                    <View style={[styles.pointsEarnedRow, isRTL && styles.rowRTL]}>
                      <Ionicons name="ribbon-outline" size={13} color={colors.accent} />
                      <Text style={[styles.pointsEarnedText, isRTL && styles.textRTLRight]}>
                        {t('rewards.orderEarned', { points: Number(o.loyaltyPointsEarned).toLocaleString() })}
                      </Text>
                    </View>
                  ) : null}

                  {/* Quiet actions row: summary toggle + delete */}
                  <View style={[styles.quietRow, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                      style={[styles.summaryToggle, isRTL && styles.rowRTL]}
                      onPress={() => toggleExpanded(keyId)}
                      activeOpacity={0.6}
                    >
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={15} color={colors.secondaryLabel} />
                      <Text style={[styles.summaryToggleText, isRTL && styles.textRTLRight]}>
                        {isExpanded ? t('ordersScreen.hideSummary') : t('ordersScreen.viewSummary')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Alert.alert(t('ordersScreen.holdToDeleteTitle'), t('ordersScreen.holdToDeleteMessage'))}
                      onLongPress={() => handleDelete(o)}
                      delayLongPress={650}
                      activeOpacity={0.6}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={t('ordersScreen.holdToDeleteTitle')}
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.secondaryLabel} />
                    </TouchableOpacity>
                  </View>

                  {isExpanded ? (
                    <View style={styles.orderSummaryBody}>
                      <Text style={[styles.orderSummaryTitle, isRTL && styles.textRTLRight]}>{t('ordersScreen.orderSummary')}</Text>

                      {itemsArr.map((it, idx) => {
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
                        const paidCount = itemsArr.filter(it => !(it?.isPromotionItem === true || String(it?.selectedSize || '').trim() === '__PROMO__' || Number(it?.price || 0) === 0)).length;

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
                                <Ionicons name="checkmark-circle" size={12} color={colors.greenDeep} style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
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

                  {/* Primary / tertiary actions */}
                  {showPay ? (
                    <TouchableOpacity
                      style={[styles.payButton, shadow.cta(colors.cta), isRTL && styles.buttonRTL, isPaying && styles.buttonDisabled]}
                      onPress={() => handlePay(o)}
                      disabled={isPaying}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="card" size={17} color={colors.white} />
                      <Text style={[styles.payButtonText, isRTL && styles.textRTLRight]}>{isPaying ? t('orders.startingPayment') : t('orders.payNow')}</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.supportButton, isRTL && styles.buttonRTL]}
                    onPress={() => contactSupportWhatsApp(o)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color={colors.whatsappDeep} />
                    <Text style={[styles.supportButtonText, isRTL && styles.textRTLRight]}>{t('ordersScreen.support')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.card,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: { padding: 4 },
  headerTitle: { ...T.navTitle, color: colors.label },
  headerSpacer: { width: 28 },
  refreshButton: { padding: 4 },
  scrollView: { flex: 1 },
  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  centerTop: { justifyContent: 'flex-start', paddingTop: 16 },
  emptyUniImage: { width: 240, height: 240, marginBottom: 24 },
  centerRTL: { alignItems: 'flex-end' },
  emptyTitle: { ...T.sectionTitleSmall, marginBottom: 6, textAlign: 'center' },
  emptyText: { ...T.label, fontWeight: '400', color: colors.secondaryLabel, textAlign: 'center', lineHeight: 20 },
  shopButton: {
    marginTop: 18,
    backgroundColor: colors.cta,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  shopButtonText: { ...T.button },
  shopButtonTextRTL: { writingDirection: 'rtl' },
  textRTL: { writingDirection: 'rtl', textAlign: 'center' },
  textRTLRight: { writingDirection: 'rtl', textAlign: 'right' },

  list: { padding: 16, gap: 14 },

  // ── Card ──────────────────────────────────────────────────────────
  card: {
    ...surfaces.card,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbWrap: { width: 52, height: 52 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  thumbBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.label,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  thumbBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  headMiddle: { flex: 1, minWidth: 0 },
  orderNumber: { ...T.label, fontSize: 15, fontWeight: '700', color: colors.label },
  headSub: { ...T.captionSmall, color: colors.secondaryLabel, marginTop: 3 },
  headRight: { alignItems: 'flex-end' },
  headRightRTL: { alignItems: 'flex-start' },
  disclosure: { marginLeft: 2 },

  // Status capsule
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...T.captionTiny, fontSize: 11.5, fontWeight: '700' },

  // Meta footer
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginTop: 12, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pointsEarnedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  pointsEarnedText: { ...T.captionSmall, fontWeight: '600', color: colors.secondaryLabel },
  metaLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  appleLogo: { marginEnd: 5 },
  metaText: { ...T.captionSmall, color: colors.secondaryLabel, flexShrink: 1 },
  metaRightCol: { alignItems: 'flex-end' },
  metaRightColRTL: { alignItems: 'flex-start' },
  totalText: { ...T.priceSmall, color: colors.accent },
  itemsText: { ...T.captionTiny, color: colors.secondaryLabel, marginTop: 2 },

  // Quiet actions
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryToggleText: { ...T.captionSmall, fontWeight: '600', color: colors.secondaryLabel },
  deleteBtn: { padding: 4 },

  orderSummaryBody: {
    marginTop: 12,
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 12,
  },
  orderSummaryTitle: { ...T.labelSmall, fontWeight: '800', color: colors.label, marginBottom: 8 },
  orderSummaryLine: { ...T.captionSmall, color: colors.bodyText, lineHeight: 18, marginBottom: 4 },
  orderSummaryItemRow: { marginBottom: 6 },
  orderSummaryLineMuted: { ...T.captionSmall, color: colors.mutedText, lineHeight: 18 },
  orderSummaryPriceStrike: { textDecorationLine: 'line-through', color: colors.secondaryLabel, fontWeight: '700' },
  orderSummaryPriceFinal: { color: colors.accent, fontWeight: '800' },
  orderSummaryDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginTop: 10, marginBottom: 6 },
  orderSummaryDividerLight: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separatorStrong, marginVertical: 4 },
  orderTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  orderTotalsRowRTL: { flexDirection: 'row-reverse' },
  orderTotalsLabel: { fontSize: 12, color: colors.bodyText, fontWeight: '700' },
  orderTotalsLabelGreen: { fontSize: 12, color: colors.greenDeep, fontWeight: '700' },
  orderTotalsLabelPurple: { fontSize: 12, color: colors.purple, fontWeight: '700' },
  orderTotalsLabelMuted: { fontSize: 12, color: colors.secondaryLabel, fontWeight: '600' },
  orderTotalsValue: { fontSize: 12, color: colors.label, fontWeight: '800' },
  orderTotalsValueMuted: { fontSize: 12, color: colors.secondaryLabel, fontWeight: '700', textDecorationLine: 'line-through' },
  orderTotalsValueMutedSmall: { fontSize: 12, color: colors.secondaryLabel, fontWeight: '700' },
  orderTotalsValueGreen: { fontSize: 12, color: colors.greenDeep, fontWeight: '800' },
  orderTotalsValuePurple: { fontSize: 12, color: colors.purple, fontWeight: '800' },
  orderTotalsLabelBold: { fontSize: 12, color: colors.label, fontWeight: '800' },
  orderTotalsValueBold: { fontSize: 12, color: colors.label, fontWeight: '800' },
  orderTotalsValueFree: { color: colors.greenDeep, fontWeight: '800' },
  orderTotalsLabelStrong: { fontSize: 13, color: colors.label, fontWeight: '900' },
  orderTotalsValueStrong: { fontSize: 13, color: colors.label, fontWeight: '900' },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenBg,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  freeShippingText: { fontSize: 10, color: colors.greenDeep, fontWeight: '600' },
  vatNoteRed: { fontSize: 10, color: colors.accent, paddingVertical: 1 },
  youSavedBanner: {
    backgroundColor: colors.greenBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.greenLine,
  },
  youSavedText: { fontSize: 12, color: colors.greenDeep, fontWeight: '800' },

  // Buttons
  payButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    paddingVertical: 13,
    borderRadius: 14,
  },
  buttonDisabled: { opacity: 0.6 },
  payButtonText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700' },
  supportButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  supportButtonText: { ...T.buttonSmall, fontSize: 14, fontWeight: '700', color: colors.whatsappDeep },
  buttonRTL: { flexDirection: 'row-reverse' },
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
});

// Screen-level error boundary: a render crash here shows a recoverable
// error screen instead of taking down the whole navigation stack.
export default withErrorBoundary(OrdersScreen, { screenName: 'Orders' });

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, I18nManager, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../../components/CollapsibleHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { fetchProductById } from '../../../services/api';
import { getPaymentUrlForExistingOrder } from '../../../services/orderService';
import {
  canResumeOrderPayment,
  findOrder,
  getOrderId,
  getOrderNumber,
  getOrderPaymentUrl,
  isCardLikeOrder,
  isCodLikeOrder,
  isPaidLikeOrder,
} from '../../../services/ordersRepository';
import { Image } from 'expo-image';
import { useLocalization } from '../../../contexts/LocalizationContext';
import { formatEmirateLabel } from '../../../utils/emirateUtils';
import { isBeautyBoxProduct } from '../../../utils/productRules';
import { parseBeautyBoxDescription } from '../../../utils/beautyBoxDescription';
import { asText } from '../../../utils/productDetailUtils';
import AUTH_CONFIG from '../../../config/auth';
import { getOrderContactEmail } from '../../../utils/userProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as haptics from '../../../utils/haptics';
import T from '../../../utils/typography';
import OrderProgress from '../../../components/OrderProgress';
import { colors, shadow, surfaces, statusStyle } from '../../../utils/theme';
import SectionCard from '../../../components/SectionCard';
import { ASSET_ORIGIN } from '../../../utils/assets';
import { openWhatsApp } from '../../../utils/support';


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
  // Relative path - prepend asset origin
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
  // Devices (fallback by name) - compact to alphanumerics so hyphenated
  // names match too: "GENO-LED IR II" -> genoledirii, "Hair-GENTRON" -> hairgentron.
  const compact = name.replace(/[^a-z0-9]/g, '');
  // Hair Stamp is a consumable for the HairGen Booster, not a device - discounts apply.
  if (compact.includes('hairstamp')) return false;
  if (compact.includes('genoled') || compact.includes('gentron') || compact.includes('hairgen')) return true;
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
  const { onScroll, headerHeight, translateY: headerTranslateY } =
    useCollapsibleHeader({ hideOnScroll: true });

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [reordering, setReordering] = useState(false);
  // Beauty box expanded details: { [productId]: { items: [...], title: string } | null }
  const [beautyBoxDetails, setBeautyBoxDetails] = useState({});
  const [expandedBoxes, setExpandedBoxes] = useState({});

  // Subtle entrance motion (matches OrderSuccessScreen feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  // Only the latest request may write. Tapping one order, going back and
  // tapping another can leave the first fetch still in flight; if it resolved
  // second it would put order A's details under order B's title.
  const loadSeq = useRef(0);
  const load = useCallback(async () => {
    if (!token) return;
    const seq = ++loadSeq.current;
    setLoading(true);
    try {
      const match = await findOrder(token, idParam);
      if (seq !== loadSeq.current) return;
      setOrder(match);
    } catch (e) {
      if (seq !== loadSeq.current) return;
      Alert.alert(t('common.error'), t('ordersDetailAlerts.pleaseTryAgain'));
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [token, idParam]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && order) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, order, fade, lift]);

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
  const customerEmail = getOrderContactEmail(order, user);
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
    if (isCodLikeOrder(order)) return t('ordersDetail.paymentMethodCod');
    if (isCardLikeOrder(order)) return t('ordersDetail.paymentMethodCard');
    const pm = String(paymentMethod || '').trim();
    if (!pm) return t('ordersDetail.paymentMethodUnknown');
    // Partner-portal settlement methods → human labels
    const pmLower = pm.toLowerCase();
    if (pmLower === 'partner_consignment') {
      return locale === 'ru' ? 'Консигнация' : locale === 'ar' ? 'بضاعة أمانة' : 'Consignment stock';
    }
    if (pmLower === 'partner_cod') return t('ordersDetail.paymentMethodCod');
    if (pmLower === 'partner') {
      return locale === 'ru' ? 'Партнёрский заказ' : locale === 'ar' ? 'طلب شريك' : 'Partner order';
    }
    return t('ordersDetail.paymentMethodOther', { method: pm.toUpperCase() });
  };

  // Detect beauty box items by name and offer expandable details
  const isBeautyBoxItem = useCallback((item) => {
    const name = String(item?.name || item?.productName || '').trim();
    return isBeautyBoxProduct({ name, category: item?.category || '' });
  }, []);

  // Fetch beauty box product details to parse the "Kit Includes" section
  const fetchBeautyBoxDetails = useCallback(async (productId) => {
    if (!productId || beautyBoxDetails[productId] !== undefined) return;
    // Mark as loading
    setBeautyBoxDetails((prev) => ({ ...prev, [productId]: null }));
    try {
      const product = await fetchProductById(productId, user, { locale });
      if (product?.description) {
        const parsed = parseBeautyBoxDescription(product.description);
        if (parsed?.items?.length > 0) {
          setBeautyBoxDetails((prev) => ({
            ...prev,
            [productId]: { items: parsed.items, title: parsed.title || '' },
          }));
          return;
        }
      }
      // No parseable details - store empty so we don't re-fetch
      setBeautyBoxDetails((prev) => ({ ...prev, [productId]: { items: [], title: '' } }));
    } catch {
      setBeautyBoxDetails((prev) => ({ ...prev, [productId]: { items: [], title: '' } }));
    }
  }, [beautyBoxDetails, user, locale]);

  const toggleBeautyBox = useCallback((productId) => {
    haptics.lightTap();
    setExpandedBoxes((prev) => {
      const isExpanded = !prev[productId];
      if (isExpanded) {
        // Fetch details on first expand
        fetchBeautyBoxDetails(productId);
      }
      return { ...prev, [productId]: isExpanded };
    });
  }, [fetchBeautyBoxDetails]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const paidItems = items.filter((it) => !isPromoItem(it));
  const promoItems = items.filter((it) => isPromoItem(it));

  const showPay = useMemo(() => {
    if (!order) return false;
    return canResumeOrderPayment(order);
  }, [order]);

  const onPay = async () => {
    haptics.mediumTap();
    if (!token || !order) return;
    setPaying(true);
    try {
      const orderId = getOrderId(order);
      const orderNum = getOrderNumber(order);

      const existingUrl = getOrderPaymentUrl(order);
      if (existingUrl) {
        router.push({
          pathname: '/payment/stripe',
          params: { orderId, orderNumber: orderNum, paymentUrl: String(existingUrl), fromOrders: '1' },
        });
        return;
      }

      const res = await getPaymentUrlForExistingOrder({ token, orderId, orderNumber: orderNum, order });
      if (!res?.success || !res?.paymentUrl) {
        throw new Error(res?.error || t('ordersDetailAlerts.pleaseTryAgain'));
      }
      router.push({
        pathname: '/payment/stripe',
        params: { orderId, orderNumber: orderNum, paymentUrl: String(res.paymentUrl), fromOrders: '1' },
      });
    } catch (e) {
      Alert.alert(t('ordersDetailAlerts.couldNotStartPaymentTitle'), t('ordersDetailAlerts.pleaseTryAgain'));
    } finally {
      setPaying(false);
    }
  };

  const onSupport = () => {
    haptics.lightTap();
    const message = t('support.whatsappOrderHelpMessage', { orderNumber: String(orderNumber) });
    openWhatsApp(message).then((opened) => {
      if (!opened) {
        Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
      }
    });
  };

  const onReorder = async () => {
    haptics.mediumTap();
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
            const added = await addItem(
              product,
              qty,
              color !== '__PROMO__' ? color : '',
              size !== '__PROMO__' ? size : ''
            );
            if (added === false) failedCount++;
            else addedCount++;
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
            { text: t('ordersDetail.viewBag'), onPress: async () => { await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/profile/orders/[id]', params: { id: params.id } })).catch(() => {}); router.push('/(tabs)/bag'); } }
          ]
        );
      } else {
        Alert.alert(t('ordersDetail.reorderTitle'), t('ordersDetail.reorderFailed'));
      }
    } catch (e) {
      Alert.alert(t('common.error'), t('ordersDetail.reorderFailed'));
    } finally {
      setReordering(false);
    }
  };

  const statusUI = statusStyle(status);

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/(tabs)/orders'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY}
        title={t('ordersDetail.orderDetails')}
        onBack={onBack}
        onRefresh={load}
        isRTL={isRTL}
      />

      {loading ? (
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, isRTL && styles.textRTL]}>{t('ordersDetail.loading')}</Text>
        </View>
      ) : !order ? (
        <View style={[styles.centerContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="receipt-outline" size={64} color={colors.separator} />
          <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t('ordersDetail.notFound')}</Text>
          <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('ordersDetail.notFoundHint')}</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 8 }]}
        >
          {/* Order Number Card */}
          <View style={[styles.orderNumberCard, shadow.card]}>
            <View style={[styles.orderNumberHeader, isRTL && styles.rowRTL]}>
              <View style={[surfaces.iconTile, styles.heroTile, { backgroundColor: colors.cta }]}>
                <Ionicons name="receipt" size={20} color={colors.white} />
              </View>
              <View style={[styles.orderNumberTextContainer, isRTL && styles.alignEndRTL]}>
                <Text style={[styles.orderNumberLabel, isRTL && styles.textRTL]}>{t('ordersDetail.orderNumber')}</Text>
                <Text style={styles.orderNumber}>{String(orderNumber)}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: statusUI.bg }, isRTL && styles.rowRTL]}>
                <View style={[styles.statusDot, { backgroundColor: statusUI.color }]} />
                <Text style={[styles.statusPillText, { color: statusUI.color }]} numberOfLines={1}>{getStatusLabel()}</Text>
              </View>
            </View>
            {formattedDateTime ? (
              <View style={[styles.dateTimeRow, isRTL && styles.rowRTL]}>
                <Ionicons name="time-outline" size={14} color={colors.secondaryLabel} />
                <Text style={[styles.dateTimeText, isRTL && styles.textRTL]}>{formattedDateTime}</Text>
              </View>
            ) : null}
            {/* Where the order has got to, on the same card as its number: the two
                things a customer opens this screen to find. */}
            <View style={styles.progressBlock}>
              <OrderProgress order={order} t={t} isRTL={isRTL} />
            </View>
          </View>

          {/* Payment Method Section */}
          <SectionCard padding={18} icon="card" title={t('ordersDetail.paymentMethod')} isRTL={isRTL}>
            <View style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodRow}>
                {isApplePayLike(order) ? (
                  <Ionicons name="logo-apple" size={16} color={colors.label} style={styles.appleLogo} />
                ) : null}
                <Text style={[styles.paymentMethodText, isRTL && styles.textRTL]}>{getPaymentMethodLabel()}</Text>
                {isPaidLikeOrder(order) && isApplePayLike(order) ? (
                  <Text style={[styles.paymentMethodPaidHint, isRTL && styles.textRTL]}> • {t('ordersDetail.paid')}</Text>
                ) : null}
              </View>
            </View>
          </SectionCard>

          {/* Order Notes */}
          {orderNotes ? (
            <SectionCard padding={18} icon="chatbubble-ellipses" title={t('ordersDetail.orderNotes')} isRTL={isRTL}>
              <View style={styles.notesCard}>
                <Text style={[styles.notesText, isRTL && styles.textRTL]}>{orderNotes}</Text>
              </View>
            </SectionCard>
          ) : null}

          {/* Items Section */}
          <SectionCard padding={18} icon="bag-handle" title={t('ordersDetail.items')} isRTL={isRTL}>
            {/* Paid Items */}
            {paidItems.map((it, idx) => {
              const qty = Number(it?.quantity) || 1;
              const price = Number(it?.price) || 0;
              const name = it?.name || it?.productName || t('common.itemWithNumber', { number: idx + 1 });
              const size = it?.size || it?.selectedSize || '';
              const color = it?.color || it?.selectedColor || '';
              const itemTotal = qty * price;

              const orderDiscountPct = Number(order?.discountPercentage);
              const orderBundleDiscPct = Number(order?.bundleDiscountPercentage);
              const orderBundleDiscAmt = Number(order?.bundleDiscountAmount);
              const hasBundleOnOrder = Number.isFinite(orderBundleDiscPct) && orderBundleDiscPct > 0 && Number.isFinite(orderBundleDiscAmt) && orderBundleDiscAmt > 0;

              // Per-item bundleDiscount (from DB) takes priority over order-level inference
              const itemBundlePct = Number(it?.bundleDiscount);
              const hasPerItemBundleDiscount = Number.isFinite(itemBundlePct) && itemBundlePct > 0;
              const itemFromBundle = hasPerItemBundleDiscount || it?.fromBundle === true;
              const excludedFromUserDiscount = isUserDiscountExcludedOrderItemName(name);

              // Item is a bundle item if it has per-item bundleDiscount, or (legacy) order-level bundle + not excluded
              const isBundleItem = hasPerItemBundleDiscount
                || itemFromBundle
                || (hasBundleOnOrder && it?.bundleDiscount === undefined && !excludedFromUserDiscount);

              let discountPct;
              let inferredOriginalUnit;
              let canShowDiscountBreakdown;

              if (isBundleItem && (hasPerItemBundleDiscount || hasBundleOnOrder)) {
                const bundlePctToUse = hasPerItemBundleDiscount ? itemBundlePct : orderBundleDiscPct;
                const bundleFactor = 1 - bundlePctToUse / 100;
                inferredOriginalUnit = bundleFactor > 0 ? Math.round(price / bundleFactor * 100) / 100 : null;
                discountPct = bundlePctToUse;
                canShowDiscountBreakdown = !isPromoItem(it) && inferredOriginalUnit != null;
              } else {
                discountPct = (Number.isFinite(orderDiscountPct) && orderDiscountPct > 0)
                  ? orderDiscountPct
                  : (user?.discountType ? Number(user?.discountPercentage) : 0);
                inferredOriginalUnit = inferOriginalUnitPriceFromPct({ unitPrice: price, discountPct });
                canShowDiscountBreakdown = !isPromoItem(it) && !excludedFromUserDiscount && inferredOriginalUnit != null;
              }

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
                        <Ionicons name="cube-outline" size={20} color={colors.tertiary} />
                      </View>
                    )}
                    <View style={styles.itemHeaderContent}>
                      <View style={styles.itemTitleWrap}>
                        <Text style={[styles.itemName, isRTL && styles.textRTL]} numberOfLines={2}>{String(name)}</Text>
                        {canShowDiscountBreakdown && Number.isFinite(discountPct) ? (
                          <View style={[styles.discountPill, isBundleItem && { backgroundColor: colors.okBg }]}>
                            <Text style={[styles.discountPillText, isBundleItem && { color: colors.ok }]}>
                              {isBundleItem
                                ? `${Math.round(discountPct)}% Bundle`
                                : `${Math.round(discountPct)}%`}
                            </Text>
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
                            {isBundleItem
                              ? (t('ordersDetail.bundleDiscount'))
                              : t('ordersDetail.discount')}
                            {Number.isFinite(discountPct) ? (
                              <Text style={[styles.discountPctText, isRTL && styles.valueLTR]}> ({Math.round(discountPct)}%)</Text>
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

                  {/* Beauty Box: expandable kit contents */}
                  {isBeautyBoxItem(it) ? (
                    <View style={styles.beautyBoxSection}>
                      <TouchableOpacity
                        style={[styles.beautyBoxToggle, isRTL && styles.rowRTL]}
                        onPress={() => toggleBeautyBox(it?.productId || it?.id || `box-${idx}`)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="gift-outline" size={16} color={colors.accent} />
                        <Text style={[styles.beautyBoxToggleText, isRTL && styles.textRTL]}>
                          {expandedBoxes[it?.productId || it?.id || `box-${idx}`]
                            ? t('ordersDetail.hideBoxContents')
                            : t('ordersDetail.viewBoxContents')}
                        </Text>
                        <Ionicons
                          name={expandedBoxes[it?.productId || it?.id || `box-${idx}`] ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={colors.accent}
                        />
                      </TouchableOpacity>

                      {expandedBoxes[it?.productId || it?.id || `box-${idx}`] ? (
                        <View style={styles.beautyBoxContents}>
                          {(() => {
                            const boxKey = it?.productId || it?.id || `box-${idx}`;
                            const details = beautyBoxDetails[boxKey];
                            if (details === undefined || details === null) {
                              return (
                                <View style={styles.beautyBoxLoading}>
                                  <ActivityIndicator size="small" color={colors.accent} />
                                  <Text style={styles.beautyBoxLoadingText}>{t('common.loading')}</Text>
                                </View>
                              );
                            }
                            if (!details?.items?.length) {
                              return (
                                <Text style={[styles.beautyBoxNoDetails, isRTL && styles.textRTL]}>
                                  {t('ordersDetail.boxDetailsUnavailable')}
                                </Text>
                              );
                            }
                            return (
                              <>
                                <Text style={[styles.beautyBoxKitTitle, isRTL && styles.textRTL]}>
                                  {t('product.kitIncludes')}
                                </Text>
                                {details.items.map((kitItem) => (
                                  <View key={`kit-${kitItem.index}-${kitItem.header}`} style={[styles.beautyBoxKitItem, isRTL && { alignItems: 'flex-end' }]}>
                                    <View style={[styles.beautyBoxKitItemHeader, isRTL && styles.rowRTL]}>
                                      <View style={styles.beautyBoxKitBullet}>
                                        <Text style={styles.beautyBoxKitBulletText}>{kitItem.index}</Text>
                                      </View>
                                      <Text style={[styles.beautyBoxKitItemName, isRTL && styles.textRTL]} numberOfLines={2}>
                                        {asText(kitItem.header)}
                                      </Text>
                                    </View>
                                    {kitItem.body ? (
                                      <Text style={[styles.beautyBoxKitItemBody, isRTL && styles.textRTL]}>{kitItem.body}</Text>
                                    ) : null}
                                  </View>
                                ))}
                              </>
                            );
                          })()}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}

            {/* Promo/Free Items */}
            {promoItems.length > 0 ? (
              <View style={styles.promoSection}>
                <View style={[styles.promoHeader, isRTL && styles.rowRTL]}>
                  <Ionicons name="gift" size={16} color={colors.ok} />
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
                            <Ionicons name="gift-outline" size={16} color={colors.ok} />
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
          </SectionCard>

          {/* Shipping Details */}
          <SectionCard padding={18} icon="location" title={t('ordersDetail.shippingDetails')} isRTL={isRTL}>
            {customerName ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="person-outline" size={16} color={colors.secondaryLabel} />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.customer')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{String(customerName)}</Text>
              </View>
            ) : null}

            {customerPhone ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="call-outline" size={16} color={colors.secondaryLabel} />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.phone')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.valueLTR]}>{String(customerPhone)}</Text>
              </View>
            ) : null}

            {customerEmail ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="mail-outline" size={16} color={colors.secondaryLabel} />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.email')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.valueLTR]}>{String(customerEmail)}</Text>
              </View>
            ) : null}

            {emirate ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="flag-outline" size={16} color={colors.secondaryLabel} />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.emirate')}</Text>
                <Text style={[styles.detailValue, isRTL && styles.textRTL]}>{formatEmirateLabel(t, emirate)}</Text>
              </View>
            ) : null}

            {customerAddress ? (
              <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                <Ionicons name="home-outline" size={16} color={colors.secondaryLabel} />
                <Text style={[styles.detailLabel, isRTL && styles.textRTL]}>{t('ordersDetail.address')}</Text>
                <Text style={[styles.detailValue, styles.addressValue, isRTL && styles.textRTL]}>{String(customerAddress)}</Text>
              </View>
            ) : null}
          </SectionCard>

          {/* Order Summary - Waterfall Pricing Breakdown */}
          <SectionCard padding={18} icon="calculator" title={t('ordersDetail.orderSummary')} isRTL={isRTL}>
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
                    /* No discounts - simple subtotal */
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
                      <Ionicons name="checkmark-circle" size={14} color={colors.ok} style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
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
          </SectionCard>

          {/* Actions */}
          <View style={styles.actionsSection}>
            {showPay ? (
              <>
                {/* Pay is the primary action when resumable */}
                <TouchableOpacity
                  style={[styles.primaryButton, shadow.cta(colors.cta), isRTL && styles.buttonRTL, paying && styles.buttonDisabled]}
                  onPress={onPay}
                  disabled={paying}
                  activeOpacity={0.85}
                >
                  {paying ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons name="card" size={20} color={colors.white} />
                  )}
                  <Text style={[styles.primaryButtonText, isRTL && styles.textRTL]}>
                    {paying ? t('ordersDetail.startingPayment') : t('ordersDetail.payNow')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, isRTL && styles.buttonRTL, reordering && styles.buttonDisabled]}
                  onPress={onReorder}
                  disabled={reordering}
                  activeOpacity={0.7}
                >
                  {reordering ? (
                    <ActivityIndicator color={colors.label} size="small" />
                  ) : (
                    <Ionicons name="repeat" size={20} color={colors.label} />
                  )}
                  <Text style={[styles.secondaryButtonText, isRTL && styles.textRTL]}>
                    {reordering ? t('ordersDetail.reordering') : t('ordersDetail.reorderButton')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Reorder is primary when there is nothing to pay */
              <TouchableOpacity
                style={[styles.primaryButton, shadow.cta(colors.cta), isRTL && styles.buttonRTL, reordering && styles.buttonDisabled]}
                onPress={onReorder}
                disabled={reordering}
                activeOpacity={0.85}
              >
                {reordering ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Ionicons name="repeat" size={20} color={colors.white} />
                )}
                <Text style={[styles.primaryButtonText, isRTL && styles.textRTL]}>
                  {reordering ? t('ordersDetail.reordering') : t('ordersDetail.reorderButton')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.supportButton, isRTL && styles.buttonRTL]} onPress={onSupport} activeOpacity={0.7}>
              <Ionicons name="logo-whatsapp" size={18} color={colors.whatsappDeep} />
              <Text style={[styles.supportButtonText, isRTL && styles.textRTL]}>{t('ordersDetail.supportWhatsapp')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...T.navTitle,
  },
  refreshButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    ...T.label,
    fontWeight: '400',
    marginTop: 12,
    color: colors.secondaryLabel,
  },
  emptyTitle: {
    ...T.sectionTitleSmall,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Order Number Card
  orderNumberCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  orderNumberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  orderNumberTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  orderNumberLabel: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.secondaryLabel,
    marginBottom: 2,
  },
  orderNumber: {
    ...T.mono,
    fontSize: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 4 },
  statusPillText: { ...T.captionTiny, fontSize: 11.5, fontWeight: '700' },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  progressBlock: {
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  dateTimeText: {
    ...T.caption,
    fontWeight: '500',
    color: colors.secondaryLabel,
  },

  // Section

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
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 16,
  },
  appleLogo: {
    marginEnd: 8,
  },
  notesCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    ...T.bodySmall,
    color: colors.label,
  },
  paymentMethodText: {
    ...T.label,
    color: colors.label,
  },
  paymentMethodRow: {
    flexDirection: FLEX_ROW,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paymentMethodPaidHint: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.ok,
  },

  // Items
  itemCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  itemThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.groupedBg,
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
    ...T.label,
    flex: 1,
    fontWeight: '700',
    color: colors.label,
    lineHeight: 18,
  },
  discountPill: {
    backgroundColor: colors.okBg,
    borderColor: colors.ok,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountPillText: {
    ...T.captionTiny,
    fontWeight: '900',
    color: colors.ok,
  },
  itemPrice: {
    ...T.label,
    fontWeight: '800',
    color: colors.accent,
  },
  itemDetails: {
    flexDirection: FLEX_ROW,
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetailText: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    fontWeight: '500',
  },
  itemPriceBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
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
    color: colors.secondaryLabel,
    fontWeight: '600',
  },
  itemPriceLabelStrong: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: colors.label,
    fontWeight: '800',
  },
  itemPriceValue: {
    fontSize: 12,
    color: colors.label,
    fontWeight: '700',
  },
  itemPriceValueMuted: {
    color: colors.secondaryLabel,
  },
  itemPriceValueStrikethrough: {
    textDecorationLine: 'line-through',
  },
  itemPriceValueStrong: {
    fontWeight: '900',
  },
  discountValue: {
    color: colors.ok,
    fontWeight: '900',
  },
  discountPctText: {
    color: colors.ok,
    fontWeight: '900',
  },
  itemLineTotals: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },

  // Promo Items
  promoSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  promoHeaderText: {
    ...T.label,
    fontWeight: '700',
    color: colors.ok,
  },
  promoItemCard: {
    backgroundColor: colors.okBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.okLine,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.okLine,
  },
  promoThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.okBg,
  },
  promoItemContent: {
    flex: 1,
    minWidth: 0,
  },
  promoItemName: {
    ...T.labelSmall,
    flex: 1,
    color: colors.ok,
    lineHeight: 18,
  },
  promoItemQty: {
    ...T.captionSmall,
    color: colors.ok,
    fontWeight: '500',
    marginTop: 4,
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.okBg,
    borderWidth: 1,
    borderColor: colors.okLine,
  },
  freeBadgeText: {
    ...T.captionTiny,
    fontWeight: '800',
    color: colors.ok,
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
    ...T.labelSmall,
    color: colors.secondaryLabel,
    width: 80,
  },
  detailValue: {
    ...T.labelSmall,
    flex: 1,
    fontWeight: '500',
    color: colors.label,
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
    ...T.summaryLabel,
    color: colors.bodyText,
  },
  summaryValue: {
    ...T.summaryValue,
  },
  summaryValueStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.secondaryLabel,
  },
  summaryLabelPurple: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple,
  },
  summaryValuePurple: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.purple,
  },
  summaryLabelMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondaryLabel,
  },
  summaryValueMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryLabel,
  },
  summaryLabelDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ok,
  },
  summaryValueDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ok,
  },
  youSavedBanner: {
    backgroundColor: colors.okBg,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.okLine,
  },
  youSavedText: {
    ...T.labelSmall,
    fontWeight: '800',
    color: colors.ok,
  },
  summaryLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.label,
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.label,
  },
  summaryValueFree: {
    color: colors.ok,
    fontWeight: '700',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.okBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  freeShippingText: {
    ...T.captionSmall,
    color: colors.ok,
    fontWeight: '600',
  },
  vatNoteRed: {
    ...T.captionTiny,
    color: colors.accent,
    paddingVertical: 2,
  },
  summaryDividerLight: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separatorStrong,
    marginVertical: 8,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    ...T.totalLabel,
  },
  totalValue: {
    ...T.totalValue,
    fontWeight: '900',
    color: colors.accent,
  },

  // Actions
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.cta,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    ...T.button,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.fillSecondary,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  secondaryButtonText: {
    ...T.button,
    fontWeight: '700',
    color: colors.label,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    paddingVertical: 16,
    borderRadius: 14,
  },
  supportButtonText: {
    ...T.button,
    fontWeight: '700',
    color: colors.whatsappDeep,
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

  // Beauty Box expandable contents
  beautyBoxSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  beautyBoxToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  beautyBoxToggleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  beautyBoxContents: {
    marginTop: 12,
    backgroundColor: colors.orangeBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.orangeLine,
  },
  beautyBoxLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  beautyBoxLoadingText: {
    fontSize: 13,
    color: colors.secondaryLabel,
  },
  beautyBoxNoDetails: {
    fontSize: 13,
    color: colors.secondaryLabel,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  beautyBoxKitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.orange,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  beautyBoxKitItem: {
    marginBottom: 10,
  },
  beautyBoxKitItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beautyBoxKitBullet: {
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beautyBoxKitBulletText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  beautyBoxKitItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.label,
    lineHeight: 18,
  },
  beautyBoxKitItemBody: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 17,
    marginTop: 4,
    marginStart: 32,
  },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchProducts, submitPartnerOrder, fetchUserOrders, fetchUserProfile } from '../services/api';
import { getPricingDisplay, formatAed } from '../utils/pricingDisplay';
import { getLocalizedProductName } from '../utils/productLocalization';
import { isProductOutOfStock } from '../utils/stock';
import {
  classifyPartnerLine,
  isValidCreditDays,
  partnerGroupKey,
  PARTNER_CATEGORY_GROUPS,
} from '../utils/partnerCatalog';
import { AUTH_CONFIG } from '../config/auth';
import * as haptics from '../utils/haptics';
import { colors } from '../utils/theme';
import { createLogger } from '../utils/logger';
import { fetchHomecareScripts } from '../services/homecareService';

// Product images are stored as site-relative paths (e.g. /images/..). The app
// must prefix the asset origin, same as the Shop screen.
const imageUri = (product) => {
  const img = product?.image;
  if (!img) return null;
  return String(img).startsWith('http') ? img : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${img}`;
};

const rawImageUri = (img) => {
  if (!img) return null;
  return String(img).startsWith('http') ? img : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${img}`;
};

// Order lines are keyed by product id, or `id||size` when a size variant is
// selected — one product can have several lines (e.g. 200ml and 600ml).
const keyOf = (id, size) => (size ? `${id}||${size}` : String(id));
const parseKey = (key) => {
  const i = String(key).indexOf('||');
  return i === -1 ? { id: String(key) } : { id: String(key).slice(0, i), size: String(key).slice(i + 2) };
};

// Real size variants only (ignore size-less "default" price records).
const sizesOf = (product) =>
  (Array.isArray(product?.variants) ? product.variants : []).filter(
    (v) => v?.size && v.size !== 'default'
  );

const log = createLogger('PartnerPortal');

export default function PartnerPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl' || locale === 'ar';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [reorderMsg, setReorderMsg] = useState(0);
  const [expandedCards, setExpandedCards] = useState(() => new Set());
  const [expandedOrders, setExpandedOrders] = useState(() => new Set());
  const [reorderOpen, setReorderOpen] = useState(false);
  const [availableClinicPoints, setAvailableClinicPoints] = useState(0);
  const [useClinicPoints, setUseClinicPoints] = useState(false);

  const tr = (en, ru, ar) => (locale === 'ru' ? ru : locale === 'ar' ? ar : en);
  const discountPct = Math.round(Number(user?.discountPercentage) || 0);

  // Trade flags (consignment / credit / portal access): the stored user may
  // be stale (set at login), so refresh from the server on mount — they are
  // toggled by admin.
  const [freshProfile, setFreshProfile] = useState(null);
  const [profileAccessChecked, setProfileAccessChecked] = useState(false);
  useEffect(() => {
    let mounted = true;
    if (!user?.token) {
      setFreshProfile(null);
      setProfileAccessChecked(true);
      return undefined;
    }
    setFreshProfile(null);
    setProfileAccessChecked(false);
    fetchUserProfile(user.token)
      .then((fresh) => {
        if (mounted && fresh) setFreshProfile(fresh);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setProfileAccessChecked(true);
      });
    return () => {
      mounted = false;
    };
  }, [user?.token]);
  const hasPartnerAccess =
    profileAccessChecked && freshProfile?.partnerPortalAccess === true;
  const hasConsignment = (freshProfile ? freshProfile.consignmentActive : user?.consignmentActive) === true;
  const creditDays = Number(freshProfile ? freshProfile.creditDays : user?.creditDays) || 0;
  const hasCredit =
    (freshProfile ? freshProfile.creditActive : user?.creditActive) === true && isValidCreditDays(creditDays);

  const [payOption, setPayOption] = useState('cod');
  useEffect(() => {
    if (hasConsignment) setPayOption('consignment');
    else if (hasCredit) setPayOption('credit');
  }, [hasConsignment, hasCredit]);

  // Collapsible category sections (Creams, Serums, Masks…) — flat list while
  // searching. Same grouping as the website partner portal.
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const toggleGroup = (key) => {
    haptics.lightTap();
    setOpenGroups((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  useEffect(() => {
    let mounted = true;
    if (!profileAccessChecked || !hasPartnerAccess) {
      if (profileAccessChecked) setLoading(false);
      return undefined;
    }
    setLoading(true);
    (async () => {
      try {
        const list = await fetchProducts(user);
        if (mounted) setProducts(Array.isArray(list) ? list.filter((p) => p && !p.isHidden) : []);
      } catch (e) {
        log.error('Failed to load products', e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hasPartnerAccess, profileAccessChecked, user]);

  useEffect(() => {
    let mounted = true;
    if (!user?.token || !hasPartnerAccess) return undefined;
    fetchHomecareScripts(user.token)
      .then((data) => {
        if (mounted) setAvailableClinicPoints(Math.max(0, Number(data?.points?.available) || 0));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [hasPartnerAccess, user?.token]);

  // Load the partner's recent orders for one-tap reorder.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.token || !hasPartnerAccess) return;
      try {
        const list = await fetchUserOrders(user.token, { page: 1, limit: 5 });
        if (mounted) setRecentOrders(Array.isArray(list) ? list.slice(0, 4) : []);
      } catch (e) {
        log.warn('Failed to load recent orders', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, [hasPartnerAccess, user]);

  // Reorder: prefill quantities from a past order (in-stock products only).
  // Size variants are preserved (one line per product+size).
  const reorderFrom = useCallback((order) => {
    const byId = new Map(products.map((p) => [String(p.id), p]));
    const next = {};
    let loaded = 0;
    for (const it of (order?.items || [])) {
      const id = String(it?.productId || it?.id || '');
      const q = Math.floor(Number(it?.quantity) || 0);
      const p = byId.get(id);
      if (id && p && !isProductOutOfStock(p) && q > 0) {
        const productSizes = sizesOf(p);
        let size = it?.size && productSizes.some((v) => v.size === it.size) ? String(it.size) : undefined;
        // Multi-size product without a stored size (old order) → default size,
        // so the line stays visible and editable in the size selector.
        if (!size && productSizes.length >= 2) {
          size = (productSizes.find((v) => v.isDefault) || productSizes[0]).size || undefined;
        }
        const k = keyOf(id, size);
        next[k] = (next[k] || 0) + q;
        loaded += 1;
      }
    }
    if (loaded > 0) {
      haptics.lightTap();
      setQty(next);
      setReorderMsg(loaded);
      // Open the sections that contain the prefilled items.
      const groups = new Set();
      for (const k of Object.keys(next)) {
        const p = byId.get(parseKey(k).id);
        if (p) groups.add(partnerGroupKey(p.category));
      }
      setOpenGroups(groups);
    } else {
      Alert.alert(tr('Nothing to reorder', 'Нечего повторить', 'لا شيء لإعادة الطلب'), tr('Those products are no longer available.', 'Эти товары больше недоступны.', 'هذه المنتجات لم تعد متوفرة.'));
    }
  }, [products, tr]);

  const priceOf = useCallback((product, size) => {
    const base = getPricingDisplay(product);
    if (size) {
      // Variant prices from the server already include the partner discount;
      // derive the retail strike-through from the product-level discount %.
      const variantPricing = getPricingDisplay(product, { selectedSize: size });
      const unit = Number(variantPricing.displayPrice) || 0;
      const pct = base.hasDiscount ? Math.round(Number(base.discountPercentage) || 0) : 0;
      const retail = pct > 0 && pct < 100 ? Math.round((unit / (1 - pct / 100)) * 100) / 100 : null;
      return { unit, retail, discounted: pct > 0, pct };
    }
    return {
      unit: Number(base.displayPrice) || 0,
      retail: base.originalPrice ? Number(base.originalPrice) : null,
      discounted: base.hasDiscount,
      pct: Math.round(Number(base.discountPercentage) || 0),
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        String(p.productNumber || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  // Products bucketed into ordered category sections (empty groups hidden).
  const groupedProducts = useMemo(() => {
    const byKey = new Map();
    for (const p of products) {
      const k = partnerGroupKey(p.category);
      const arr = byKey.get(k) || [];
      arr.push(p);
      byKey.set(k, arr);
    }
    return PARTNER_CATEGORY_GROUPS.map((group) => ({
      group,
      items: (byKey.get(group.key) || []).sort((a, b) => String(a.name).localeCompare(String(b.name))),
    })).filter((g) => g.items.length > 0);
  }, [products]);

  // Cart lines that cannot go to consignment stock (professional/equipment).
  const nonConsignableInCart = useMemo(() => {
    const names = [];
    for (const [key, q] of Object.entries(qty)) {
      if (q <= 0) continue;
      const { id, size } = parseKey(key);
      const p = products.find((pp) => String(pp.id) === id);
      if (!p) continue;
      if (classifyPartnerLine(p, size) !== 'retail') {
        names.push(size ? `${p.name} (${size})` : p.name);
      }
    }
    return names;
  }, [qty, products]);

  const setLine = (key, next) => {
    haptics.lightTap();
    setQty((prev) => {
      const clone = { ...prev };
      if (next <= 0) delete clone[key];
      else clone[key] = next;
      return clone;
    });
  };

  const toggleCard = (id) => {
    haptics.lightTap();
    setExpandedCards((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleOrder = (id) => {
    haptics.lightTap();
    setExpandedOrders((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const productById = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products]);

  const { itemCount, total } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const [key, q] of Object.entries(qty)) {
      if (q <= 0) continue;
      const { id, size } = parseKey(key);
      const p = productById.get(id);
      if (!p) continue;
      count += q;
      sum += priceOf(p, size).unit * q;
    }
    return { itemCount: count, total: Math.round(sum * 100) / 100 };
  }, [qty, productById, priceOf]);
  const clinicPointsToRedeem =
    useClinicPoints && payOption !== 'consignment' ? Math.min(availableClinicPoints, total) : 0;
  const payableTotal = Math.max(0, Math.round((total - clinicPointsToRedeem) * 100) / 100);

  const submit = async () => {
    if (itemCount === 0 || submitting) return;
    if (payOption === 'consignment' && nonConsignableInCart.length > 0) {
      Alert.alert(
        tr('Not for consignment', 'Не для консигнации', 'ليس للأمانة'),
        tr(
          'These items are professional/equipment and cannot go to consignment stock:\n\n',
          'Эти позиции — профессиональные/оборудование, их нельзя добавить на консигнацию:\n\n',
          'هذه المنتجات مهنية/أجهزة ولا يمكن إضافتها إلى مخزون الأمانة:\n\n'
        ) + nonConsignableInCart.join('\n')
      );
      return;
    }
    setSubmitting(true);
    haptics.lightTap();
    try {
      const items = Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([key, q]) => {
          const { id, size } = parseKey(key);
          return { id, quantity: q, ...(size ? { size } : {}) };
        });
      const res = await submitPartnerOrder(user?.token, items, {
        orderNotes: notes,
        locale,
        paymentOption: payOption,
        redeemClinicPoints: clinicPointsToRedeem,
      });
      if (res?.success) {
        setQty({});
        setNotes('');
        setAvailableClinicPoints((points) => Math.max(0, points - (Number(res.clinicPointsRedeemed) || 0)));
        setUseClinicPoints(false);
        if (res.paymentUrl) {
          // Online payment: hand over to the in-app Stripe payment screen.
          router.push({
            pathname: '/payment/stripe',
            params: {
              orderId: String(res.orderId || ''),
              orderNumber: String(res.orderNumber || ''),
              paymentUrl: String(res.paymentUrl),
              fromOrders: '1',
            },
          });
          return;
        }
        setPlaced({ orderNumber: res.orderNumber, total: res.total, paymentOption: res.paymentOption || payOption });
      } else {
        Alert.alert(tr('Order failed', 'Ошибка заказа', 'فشل الطلب'), res?.error || tr('Please try again.', 'Попробуйте снова.', 'حاول مرة أخرى.'));
      }
    } catch (e) {
      log.error('Partner order failed', e?.message || e);
      Alert.alert(tr('Order failed', 'Ошибка заказа', 'فشل الطلب'), tr('Please try again.', 'Попробуйте снова.', 'حاول مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Access guard ──
  if (!profileAccessChecked) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.guardText}>
          {tr('Verifying partner access…', 'Проверяем доступ партнёра…', 'جارٍ التحقق من صلاحية الشريك…')}
        </Text>
      </View>
    );
  }

  if (!hasPartnerAccess) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.secondaryLabel} />
        <Text style={styles.guardTitle}>{tr('Partners only', 'Только для партнёров', 'للشركاء فقط')}</Text>
        <Text style={styles.guardText}>
          {tr(
            'This area is for GENOSYS partner clinics & salons.',
            'Раздел для клиник и салонов-партнёров GENOSYS.',
            'هذا القسم لعيادات وصالونات شركاء GENOSYS.'
          )}
        </Text>
        <TouchableOpacity style={styles.guardBtn} onPress={() => router.replace('/(tabs)/shop')}>
          <Text style={styles.guardBtnText}>
            {tr('Continue to shop', 'Перейти в магазин', 'الانتقال إلى المتجر')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Success ──
  if (placed) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={36} color={colors.white} />
        </View>
        <Text style={styles.guardTitle}>{tr('Order sent', 'Заказ отправлен', 'تم إرسال الطلب')}</Text>
        <Text style={styles.successOrder}>{placed.orderNumber}</Text>
        <Text style={styles.successTotal}>{formatAed(placed.total)}</Text>
        {placed.paymentOption === 'consignment' ? (
          <View style={styles.consignPill}>
            <Text style={styles.consignPillText}>{tr('CONSIGNMENT STOCK', 'КОНСИГНАЦИЯ', 'بضاعة أمانة')}</Text>
          </View>
        ) : null}
        {placed.paymentOption === 'credit' ? (
          <View style={styles.creditPill}>
            <Text style={styles.consignPillText}>{tr(`CREDIT ${creditDays} DAYS`, `КРЕДИТ ${creditDays} ДНЕЙ`, `أجل ${creditDays} يومًا`)}</Text>
          </View>
        ) : null}
        <Text style={styles.guardText}>
          {placed.paymentOption === 'consignment'
            ? tr(
                'Added to your consignment stock — same-day delivery. Settlement via your monthly sales report.',
                'Добавлено на консигнационный склад — доставка в тот же день. Расчёт по ежемесячному отчёту.',
                'أُضيف إلى مخزون الأمانة — توصيل في نفس اليوم. التسوية عبر التقرير الشهري.'
              )
            : placed.paymentOption === 'credit'
              ? tr(
                  `Professional order on ${creditDays}-day credit — payment due within ${creditDays} days of delivery.`,
                  `Профессиональный заказ с отсрочкой ${creditDays} дней — оплата в течение ${creditDays} дней после доставки.`,
                  `طلب مهني بأجل ${creditDays} يومًا — الدفع خلال ${creditDays} يومًا من التسليم.`
                )
              : tr('Priority partner order — we will confirm and arrange same-day delivery.', 'Приоритетный партнёрский заказ — доставим в тот же день.', 'طلب شريك ذو أولوية — توصيل بنفس اليوم.')}
        </Text>
        <TouchableOpacity style={styles.guardBtn} onPress={() => router.replace('/(tabs)/orders')}>
          <Text style={styles.guardBtnText}>{tr('View orders', 'Мои заказы', 'طلباتي')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setPlaced(null)}>
          <Text style={styles.linkText}>{tr('Place another order', 'Ещё заказ', 'طلب آخر')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    // Collapsible category section header
    if (item.__group) {
      return (
        <TouchableOpacity
          style={[styles.groupHeader, item.selected > 0 && styles.groupHeaderActive, isRTL && styles.rowRTL]}
          onPress={() => toggleGroup(item.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.groupHeaderLeft, isRTL && styles.rowRTL]}>
            <Text style={[styles.groupLabel, isRTL && styles.rtlText]}>{item.label}</Text>
            <View style={styles.groupCount}>
              <Text style={styles.groupCountText}>{item.count}</Text>
            </View>
            {item.selected > 0 ? (
              <View style={styles.groupSelected}>
                <Text style={styles.groupSelectedText}>×{item.selected}</Text>
              </View>
            ) : null}
          </View>
          <Ionicons name={item.open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.secondaryLabel} />
        </TouchableOpacity>
      );
    }

    const product = item;
    const id = String(product.id);
    const productSizes = sizesOf(product);
    const multiSize = productSizes.length >= 2;
    const isOpen = expandedCards.has(id);
    const baseKey = keyOf(id);
    const q = qty[baseKey] || 0;
    const { unit, retail, discounted, pct } = priceOf(product);
    const name = getLocalizedProductName?.(product, locale) || product.name;
    const uri = imageUri(product);
    const soldOut = isProductOutOfStock(product);
    const productClass = classifyPartnerLine(product);
    const productBlocked = payOption === 'consignment' && productClass !== 'retail';
    const productQty = Object.entries(qty).reduce(
      (s, [k, n]) => (parseKey(k).id === id ? s + n : s), 0
    );
    const description = String(product.localizedDescription || product.description || '').trim();
    const minSizeUnit = multiSize
      ? Math.min(...productSizes.map((v) => priceOf(product, v.size).unit))
      : 0;

    return (
      <View style={[styles.card, productQty > 0 && styles.rowActive, soldOut && styles.rowSoldOut]}>
        <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
          {/* Tapping image/name expands the card (description + sizes) */}
          <TouchableOpacity
            style={[styles.cardMain, isRTL && styles.rowRTL]}
            onPress={() => toggleCard(id)}
            activeOpacity={0.7}
          >
            <View style={styles.thumb}>
              {uri ? (
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
              ) : (
                <Ionicons name="cube-outline" size={20} color={colors.separator} />
              )}
              {soldOut ? (
                <View style={styles.soldOverlay}>
                  <Text style={styles.soldOverlayText}>{tr('Sold out', 'Нет', 'نفد')}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, isRTL && styles.rtlText]} numberOfLines={2}>{name}</Text>
              <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                {multiSize ? (
                  <>
                    <Text style={styles.rowPrice}>{tr('from', 'от', 'من')} {formatAed(minSizeUnit)}</Text>
                    <View style={styles.sizeCountBadge}>
                      <Text style={styles.sizeCountBadgeText}>
                        {productSizes.length} {tr('sizes', 'объёма', 'أحجام')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.rowPrice}>{formatAed(unit)}</Text>
                    {discounted && retail ? (
                      <>
                        <Text style={styles.rowRetail}>{formatAed(retail)}</Text>
                        {pct > 0 ? (
                          <View style={styles.offBadge}>
                            <Text style={styles.offBadgeText}>−{pct}%</Text>
                          </View>
                        ) : null}
                      </>
                    ) : null}
                  </>
                )}
                {productClass === 'professional' ? (
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                ) : null}
                {productClass === 'equipment' ? (
                  <View style={styles.equipBadge}>
                    <Text style={styles.proBadgeText}>{tr('EQUIPMENT', 'ОБОРУД.', 'أجهزة')}</Text>
                  </View>
                ) : null}
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color={colors.separator}
                />
              </View>
            </View>
          </TouchableOpacity>
          {/* Right-side control */}
          {soldOut ? (
            <View style={styles.soldPill}>
              <Text style={styles.soldPillText}>{tr('Sold out', 'Нет в наличии', 'نفدت')}</Text>
            </View>
          ) : multiSize ? (
            productQty > 0 ? (
              <TouchableOpacity style={styles.qtyPill} onPress={() => toggleCard(id)}>
                <Text style={styles.qtyPillText}>×{productQty}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => toggleCard(id)}>
                <Text style={styles.addBtnText}>{tr('Sizes', 'Объём', 'الأحجام')}</Text>
              </TouchableOpacity>
            )
          ) : q > 0 ? (
            <View style={[styles.stepper, isRTL && styles.rowRTL]}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setLine(baseKey, q - 1)} accessibilityRole="button" accessibilityLabel="Decrease quantity">
                <Ionicons name="remove" size={18} color={colors.label} />
              </TouchableOpacity>
              <Text style={styles.stepQty}>{q}</Text>
              <TouchableOpacity style={[styles.stepBtn, styles.stepBtnAdd]} onPress={() => setLine(baseKey, q + 1)} accessibilityRole="button" accessibilityLabel="Increase quantity">
                <Ionicons name="add" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : productBlocked ? (
            <View style={styles.soldPill}>
              <Text style={styles.soldPillText}>{tr('Not for consignment', 'Не для консигнации', 'ليس للأمانة')}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => setLine(baseKey, 1)} disabled={unit <= 0}>
              <Text style={[styles.addBtnText, unit <= 0 && { color: colors.secondaryLabel }]}>
                {unit <= 0 ? tr('N/A', 'Н/Д', 'غير متاح') : tr('Add', 'Добавить', 'إضافة')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expanded: description + size lines */}
        {isOpen ? (
          <View style={styles.cardExpanded}>
            {description ? (
              <Text style={[styles.cardDescription, isRTL && styles.rtlText]} numberOfLines={4}>
                {description}
              </Text>
            ) : null}
            {productSizes.map((v) => {
              const lineKey = keyOf(id, v.size);
              const lq = qty[lineKey] || 0;
              const vp = priceOf(product, v.size);
              const unavailable = v.available === false;
              const rowClass = classifyPartnerLine(product, v.size);
              const rowBlocked = payOption === 'consignment' && rowClass !== 'retail';
              return (
                <View key={lineKey} style={[styles.sizeRow, unavailable && { opacity: 0.5 }, isRTL && styles.rowRTL]}>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                      <Text style={[styles.sizeLabel, isRTL && styles.rtlText]}>{v.size}</Text>
                      {rowClass === 'professional' ? (
                        <View style={styles.proBadge}>
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                      <Text style={styles.rowPrice}>{formatAed(vp.unit)}</Text>
                      {vp.discounted && vp.retail ? (
                        <Text style={styles.rowRetail}>{formatAed(vp.retail)}</Text>
                      ) : null}
                    </View>
                  </View>
                  {unavailable ? (
                    <Text style={styles.soldPillText}>{tr('Unavailable', 'Недоступно', 'غير متاح')}</Text>
                  ) : rowBlocked && lq === 0 ? (
                    <Text style={styles.soldPillText}>{tr('Not for consignment', 'Не для консигнации', 'ليس للأمانة')}</Text>
                  ) : lq > 0 ? (
                    <View style={[styles.stepper, isRTL && styles.rowRTL]}>
                      <TouchableOpacity style={styles.stepBtnSmall} onPress={() => setLine(lineKey, lq - 1)} accessibilityRole="button" accessibilityLabel="Decrease quantity">
                        <Ionicons name="remove" size={16} color={colors.label} />
                      </TouchableOpacity>
                      <Text style={styles.stepQty}>{lq}</Text>
                      <TouchableOpacity style={[styles.stepBtnSmall, styles.stepBtnAdd]} onPress={() => setLine(lineKey, lq + 1)} accessibilityRole="button" accessibilityLabel="Increase quantity">
                        <Ionicons name="add" size={16} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addBtnSmall} onPress={() => setLine(lineKey, 1)}>
                      <Text style={styles.addBtnText}>{tr('Add', 'Добавить', 'إضافة')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Corporate dark header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('../assets/genosys-logo-white.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerLabel}>{tr('PARTNER', 'ПАРТНЁР', 'شريك')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.offPill}>
              <Text style={styles.offPillText}>{discountPct > 0 ? `−${discountPct}%` : tr('Partner', 'Партнёр', 'شريك')}</Text>
            </View>
          </View>
        </View>

        {/* Active trade agreements — clear cards instead of cramped pills */}
        {(hasConsignment || hasCredit) ? (
          <View style={styles.agreeWrap}>
            {hasConsignment ? (
              <View style={[styles.agreeCard, styles.agreeCardAmber, isRTL && styles.rowRTL]}>
                <View style={[styles.agreeDot, { backgroundColor: colors.orange }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.agreeTitle, { color: colors.orange }, isRTL && styles.rtlText]}>
                    {tr('CONSIGNMENT AGREEMENT — ACTIVE', 'ДОГОВОР КОНСИГНАЦИИ — АКТИВЕН', 'اتفاقية الأمانة — مفعّلة')}
                  </Text>
                  <Text style={[styles.agreeDesc, isRTL && styles.rtlText]}>
                    {tr('Retail products · settle via monthly sales report', 'Розничные продукты · расчёт по ежемесячному отчёту', 'منتجات التجزئة · تسوية عبر التقرير الشهري')}
                  </Text>
                </View>
              </View>
            ) : null}
            {hasCredit ? (
              <View style={[styles.agreeCard, styles.agreeCardBlue, isRTL && styles.rowRTL]}>
                <View style={[styles.agreeDot, { backgroundColor: colors.blue }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.agreeTitle, { color: colors.blue }, isRTL && styles.rtlText]}>
                    {tr(`CREDIT ${creditDays} DAYS — ACTIVE`, `КРЕДИТ ${creditDays} ДНЕЙ — АКТИВЕН`, `أجل ${creditDays} يومًا — مفعّل`)}
                  </Text>
                  <Text style={[styles.agreeDesc, isRTL && styles.rtlText]}>
                    {tr(`Professional products · pay within ${creditDays} days of delivery`, `Профессиональные продукты · оплата в течение ${creditDays} дней`, `منتجات مهنية · الدفع خلال ${creditDays} يومًا من التسليم`)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.homecareShortcut, isRTL && styles.rowRTL]}
          onPress={() => {
            haptics.lightTap();
            router.push('/homecare-scripts');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.homecareShortcutIcon}>
            <Ionicons name="paper-plane" size={16} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.homecareShortcutTitle, isRTL && styles.rtlText]}>
              {tr('Homecare Scripts', 'Домашние рекомендации', 'توصيات العناية المنزلية')}
            </Text>
            <Text style={[styles.homecareShortcutText, isRTL && styles.rtlText]}>
              {tr('Recommend products · earn Clinic Points', 'Рекомендуйте продукты · получайте баллы', 'أوصِ بالمنتجات · اكسب نقاط العيادة')}
            </Text>
          </View>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={17} color={colors.placeholder} />
        </TouchableOpacity>
        <View style={[styles.searchBox, isRTL && styles.rowRTL]}>
          <Ionicons name="search" size={16} color={colors.secondaryLabel} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={tr('Search products…', 'Поиск товаров…', 'ابحث عن المنتجات…')}
            placeholderTextColor={colors.secondaryLabel}
            style={[styles.searchInput, isRTL && styles.rtlText]}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={
            search.trim()
              ? filtered
              : groupedProducts.flatMap(({ group, items }) => {
                  const open = openGroups.has(group.key);
                  const selected = items.reduce(
                    (sum, p) =>
                      sum +
                      Object.entries(qty).reduce(
                        (s, [k, n]) => (parseKey(k).id === String(p.id) ? s + n : s),
                        0
                      ),
                    0
                  );
                  const header = {
                    __group: true,
                    key: group.key,
                    label: locale === 'ru' ? group.ru : locale === 'ar' ? group.ar : group.en,
                    count: items.length,
                    selected,
                    open,
                  };
                  return open ? [header, ...items] : [header];
                })
          }
          keyExtractor={(item) => (item.__group ? `group:${item.key}` : String(item.id))}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: itemCount > 0 ? 250 : 40 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            (!search && recentOrders.length > 0) || reorderMsg > 0 ? (
              <View style={{ marginBottom: 12 }}>
                {reorderMsg > 0 ? (
                  <View style={[styles.reorderBanner, isRTL && styles.rowRTL]}>
                    <Ionicons name="refresh" size={16} color={colors.white} />
                    <Text style={[styles.reorderBannerText, isRTL && styles.rtlText]}>
                      {tr(`Loaded ${reorderMsg} item${reorderMsg === 1 ? '' : 's'} — adjust & place`, `Загружено ${reorderMsg} — измените и оформите`, `تم تحميل ${reorderMsg} — عدّل ثم قدّم`)}
                    </Text>
                  </View>
                ) : null}
                {!search && recentOrders.length > 0 ? (
                  <>
                    {/* Collapsible reorder section — same visual language as
                        the category headers below */}
                    <TouchableOpacity
                      style={[styles.groupHeader, isRTL && styles.rowRTL]}
                      onPress={() => { haptics.lightTap(); setReorderOpen(v => !v); }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.groupHeaderLeft, isRTL && styles.rowRTL]}>
                        <Ionicons name="refresh" size={14} color={colors.secondaryLabel} />
                        <Text style={[styles.groupLabel, isRTL && styles.rtlText]}>{tr('Reorder', 'Повторить заказ', 'إعادة الطلب')}</Text>
                        <View style={styles.groupCount}>
                          <Text style={styles.groupCountText}>{recentOrders.length}</Text>
                        </View>
                      </View>
                      <Ionicons name={reorderOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.secondaryLabel} />
                    </TouchableOpacity>
                    {reorderOpen ? recentOrders.map((o) => {
                      const oid = String(o.id || o.orderNumber);
                      const orderOpen = expandedOrders.has(oid);
                      const orderItems = Array.isArray(o.items) ? o.items : [];
                      return (
                        <View key={oid} style={styles.reorderCard}>
                          {/* Tap the row to see what was ordered */}
                          <TouchableOpacity
                            style={[styles.reorderRow, isRTL && styles.rowRTL]}
                            onPress={() => toggleOrder(oid)}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.reorderNo, isRTL && styles.rtlText]} numberOfLines={1}>{o.orderNumber}</Text>
                              <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                                <Text style={[styles.reorderMeta, isRTL && styles.rtlText]}>
                                  {orderItems.length} {tr('items', 'товаров', 'منتجات')} · {formatAed(o.total)}
                                </Text>
                                <Ionicons name={orderOpen ? 'chevron-up' : 'chevron-down'} size={12} color={colors.separator} />
                              </View>
                            </View>
                            <TouchableOpacity style={styles.reorderBtn} onPress={() => reorderFrom(o)}>
                              <Ionicons name="refresh" size={14} color={colors.accent} />
                              <Text style={styles.reorderBtnText}>{tr('Reorder', 'Повторить', 'إعادة')}</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                          {orderOpen ? (
                            <View style={styles.reorderItems}>
                              {orderItems.map((it, idx) => {
                                const itUri = rawImageUri(it?.image);
                                const itName = String(it?.productName || it?.name || tr('Product', 'Товар', 'منتج'));
                                const itQty = Math.floor(Number(it?.quantity) || 0) || 1;
                                const itPrice = Number(it?.price) || 0;
                                return (
                                  <View key={`${oid}-${idx}`} style={[styles.reorderItemRow, isRTL && styles.rowRTL]}>
                                    <View style={styles.reorderItemThumb}>
                                      {itUri ? (
                                        <Image source={{ uri: itUri }} style={styles.thumbImg} resizeMode="cover" />
                                      ) : (
                                        <Ionicons name="cube-outline" size={14} color={colors.separator} />
                                      )}
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                                      <Text style={[styles.reorderItemName, isRTL && styles.rtlText]} numberOfLines={2}>{itName}</Text>
                                      <Text style={[styles.reorderItemMeta, isRTL && styles.rtlText]}>
                                        ×{itQty}{it?.size ? ` · ${it.size}` : ''}
                                      </Text>
                                    </View>
                                    <Text style={styles.reorderItemPrice}>{formatAed(itPrice * itQty)}</Text>
                                  </View>
                                );
                              })}
                              {orderItems.length === 0 ? (
                                <Text style={styles.reorderMeta}>{tr('No item details', 'Нет данных о позициях', 'لا توجد تفاصيل')}</Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      );
                    }) : null}
                    {reorderOpen ? (
                      <Text style={[styles.reorderHint, isRTL && styles.rtlText]}>{tr('Or add products below', 'Или добавьте товары ниже', 'أو أضف المنتجات أدناه')}</Text>
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.empty}>{tr('No products found', 'Товары не найдены', 'لا توجد منتجات')}</Text>}
          ListFooterComponent={
            itemCount > 0 ? (
              <View>
                <View style={styles.notesWrap}>
                  <Text style={[styles.notesLabel, isRTL && styles.rtlText]}>{tr('Notes (optional)', 'Примечание', 'ملاحظات')}</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={tr('Delivery date, requests…', 'Дата доставки, пожелания…', 'تاريخ التسليم، طلبات…')}
                    placeholderTextColor={colors.secondaryLabel}
                    style={[styles.notesInput, isRTL && styles.rtlText]}
                    multiline
                    maxLength={1000}
                  />
                </View>

              </View>
            ) : null
          }
        />
      )}

      {/* Sticky submit bar (settlement pills always visible) */}
      {itemCount > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {availableClinicPoints > 0 ? (
            <TouchableOpacity
              style={[styles.pointsRow, payOption === 'consignment' && styles.pointsRowDisabled]}
              disabled={payOption === 'consignment'}
              onPress={() => {
                haptics.lightTap();
                setUseClinicPoints((value) => !value);
              }}
            >
              <View>
                <Text style={styles.pointsTitle}>
                  {tr('Use Clinic Points', 'Использовать баллы клиники', 'استخدم نقاط العيادة')}
                </Text>
                <Text style={styles.pointsBalance}>
                  {availableClinicPoints.toFixed(2)} {tr('available', 'доступно', 'متاحة')}
                </Text>
              </View>
              <Ionicons
                name={useClinicPoints && payOption !== 'consignment' ? 'checkbox' : 'square-outline'}
                size={22}
                color={colors.orange}
              />
            </TouchableOpacity>
          ) : null}
          <View style={[styles.footerPills, isRTL && styles.rowRTL]}>
            {hasConsignment ? (
              <TouchableOpacity
                style={[styles.pill, payOption === 'consignment' && styles.pillConsign]}
                onPress={() => {
                  if (nonConsignableInCart.length > 0) {
                    Alert.alert(
                      tr('Retail products only', 'Только розничные продукты', 'منتجات التجزئة فقط'),
                      tr(
                        'Remove professional/equipment items first — consignment stock is retail products only:\n\n',
                        'Сначала уберите профессиональные позиции — на консигнацию идут только розничные продукты:\n\n',
                        'أزل المنتجات المهنية أولًا — مخزون الأمانة للتجزئة فقط:\n\n'
                      ) + nonConsignableInCart.join('\n')
                    );
                    return;
                  }
                  haptics.lightTap();
                  setPayOption('consignment');
                }}
              >
                <Text style={[styles.pillText, payOption === 'consignment' && styles.pillTextActive]}>
                  {tr('Consignment', 'Консигнация', 'أمانة')}
                </Text>
              </TouchableOpacity>
            ) : null}
            {hasCredit ? (
              <TouchableOpacity
                style={[styles.pill, payOption === 'credit' && styles.pillCredit]}
                onPress={() => { haptics.lightTap(); setPayOption('credit'); }}
              >
                <Text style={[styles.pillText, payOption === 'credit' && styles.pillTextActive]}>
                  {tr(`Credit ${creditDays}d`, `Кредит ${creditDays}д`, `أجل ${creditDays} يومًا`)}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.pill, payOption === 'online' && styles.pillActive]}
              onPress={() => { haptics.lightTap(); setPayOption('online'); }}
            >
              <Text style={[styles.pillText, payOption === 'online' && styles.pillTextActive]}>
                {tr('Pay online', 'Онлайн', 'دفع أونلاين')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, payOption === 'cod' && styles.pillActive]}
              onPress={() => { haptics.lightTap(); setPayOption('cod'); }}
            >
              <Text style={[styles.pillText, payOption === 'cod' && styles.pillTextActive]}>
                {tr('Cash on delivery', 'При получении', 'عند الاستلام')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.footerHint, isRTL && styles.rtlText]}>
            {payOption === 'consignment'
              ? tr('Retail products only — settle via monthly sales report', 'Только розничные продукты — расчёт по ежемесячному отчёту', 'منتجات التجزئة فقط — تسوية عبر التقرير الشهري')
              : payOption === 'credit'
                ? tr(`Professional order — pay within ${creditDays} days of delivery`, `Профессиональный заказ — оплата в течение ${creditDays} дней`, `طلب مهني — الدفع خلال ${creditDays} يومًا`)
              : payOption === 'online'
                ? tr('Card / Apple Pay — secure checkout', 'Карта / Apple Pay — безопасная оплата', 'بطاقة / Apple Pay — دفع آمن')
                : tr('Pay when your order arrives', 'Оплатите при доставке', 'ادفع عند وصول الطلب')}
          </Text>
          <View style={[styles.footerRow, isRTL && styles.rowRTL]}>
            <View style={isRTL ? { alignItems: 'flex-end' } : null}>
              <Text style={styles.footerCount}>
                {itemCount} {itemCount === 1 ? tr('item', 'товар', 'منتج') : tr('items', 'товаров', 'منتجات')}
              </Text>
              {clinicPointsToRedeem > 0 ? (
                <Text style={styles.pointsApplied}>−{clinicPointsToRedeem.toFixed(2)} Clinic Points</Text>
              ) : null}
              <Text style={styles.footerTotal}>{formatAed(payableTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>
                  {payOption === 'online'
                    ? tr('Continue to payment', 'К оплате', 'المتابعة إلى الدفع')
                    : payOption === 'consignment'
                      ? tr('Add to consignment', 'На консигнацию', 'إضافة إلى الأمانة')
                      : payOption === 'credit'
                        ? tr(`Place order — ${creditDays}d credit`, `Оформить — кредит ${creditDays}д`, `تقديم الطلب — أجل ${creditDays} يومًا`)
                        : tr('Place order', 'Оформить заказ', 'تقديم الطلب')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.groupedBg },
  // Header
  header: { backgroundColor: colors.label, paddingHorizontal: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 40 },
  headerBrand: { color: colors.white, fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  headerLogo: { width: 118, height: 34 },
  headerLabel: { color: colors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 3, marginTop: 1 },
  offPill: { backgroundColor: colors.cta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, minWidth: 40, alignItems: 'center' },
  offPillText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 },
  searchInput: { flex: 1, color: colors.white, fontSize: 15, padding: 0 },
  // Rows / cards
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.separator },
  card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.separator },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  cardExpanded: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.groupedBg, gap: 8 },
  cardDescription: { fontSize: 12, color: colors.secondaryLabel, lineHeight: 17 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.groupedBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  sizeLabel: { fontSize: 13, fontWeight: '700', color: colors.label },
  sizeCountBadge: { backgroundColor: colors.groupedBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  sizeCountBadgeText: { color: colors.secondaryLabel, fontSize: 10, fontWeight: '700' },
  qtyPill: { backgroundColor: colors.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  qtyPillText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  rowActive: { borderColor: colors.accent },
  rowSoldOut: { opacity: 0.6 },
  rowRTL: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.groupedBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  soldOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, alignItems: 'center' },
  soldOverlayText: { color: colors.white, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  soldPill: { backgroundColor: colors.groupedBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  soldPillText: { color: colors.secondaryLabel, fontSize: 12, fontWeight: '700' },
  rowInfo: { flex: 1, marginHorizontal: 12 },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.label, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rowPrice: { fontSize: 14, fontWeight: '800', color: colors.accent },
  rowRetail: { fontSize: 12, color: colors.secondaryLabel, textDecorationLine: 'line-through' },
  offBadge: { backgroundColor: colors.greenBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  offBadgeText: { color: colors.greenDeep, fontSize: 10, fontWeight: '800' },
  // Stepper / add
  addBtn: { backgroundColor: colors.redBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.groupedBg, alignItems: 'center', justifyContent: 'center' },
  stepBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.separator, alignItems: 'center', justifyContent: 'center' },
  addBtnSmall: { backgroundColor: colors.redBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  stepBtnAdd: { backgroundColor: colors.cta, borderColor: colors.accent },
  stepQty: { minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.label },
  // Notes
  notesWrap: { marginTop: 8 },
  notesLabel: { fontSize: 12, fontWeight: '700', color: colors.secondaryLabel, marginBottom: 6 },
  notesInput: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.separator, padding: 12, fontSize: 14, color: colors.label, minHeight: 60, textAlignVertical: 'top' },
  empty: { textAlign: 'center', color: colors.secondaryLabel, marginTop: 40, fontSize: 14 },
  // Reorder strip
  reorderBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.label, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  reorderBannerText: { color: colors.white, fontSize: 13, fontWeight: '600', flex: 1 },
  reorderTitle: { fontSize: 13, fontWeight: '800', color: colors.secondaryLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  reorderCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.separator, marginBottom: 8, overflow: 'hidden' },
  reorderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  reorderNo: { fontSize: 14, fontWeight: '700', color: colors.label },
  reorderMeta: { fontSize: 12, color: colors.secondaryLabel, marginTop: 2 },
  reorderItems: { borderTopWidth: 1, borderTopColor: colors.groupedBg, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  reorderItemRow: { flexDirection: 'row', alignItems: 'center' },
  reorderItemThumb: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.groupedBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  reorderItemName: { fontSize: 12.5, color: colors.label, fontWeight: '600' },
  reorderItemMeta: { fontSize: 11, color: colors.secondaryLabel, marginTop: 1 },
  reorderItemPrice: { fontSize: 12.5, fontWeight: '700', color: colors.label },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.redBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  reorderBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  reorderHint: { fontSize: 12, color: colors.secondaryLabel, marginTop: 4, marginBottom: 2 },
  // Footer
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.separator, paddingHorizontal: 16, paddingTop: 10 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.orangeBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  pointsRowDisabled: { opacity: 0.45 },
  pointsTitle: { fontSize: 12, fontWeight: '700', color: colors.orange },
  pointsBalance: { fontSize: 11, color: colors.orange, marginTop: 1 },
  pointsApplied: { fontSize: 11, color: colors.orange },
  footerPills: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: colors.separator, backgroundColor: colors.card },
  pillActive: { backgroundColor: colors.label, borderColor: colors.label },
  pillConsign: { backgroundColor: colors.orange, borderColor: colors.orange },
  pillCredit: { backgroundColor: colors.blue, borderColor: colors.blue },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.secondaryLabel },
  pillTextActive: { color: colors.white },
  footerHint: { fontSize: 11, color: colors.secondaryLabel, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  footerCount: { fontSize: 12, color: colors.secondaryLabel },
  footerTotal: { fontSize: 18, fontWeight: '800', color: colors.label },
  submitBtn: { flex: 1, backgroundColor: colors.cta, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  // Guard / success
  guardTitle: { fontSize: 18, fontWeight: '700', color: colors.label, marginTop: 16 },
  guardText: { fontSize: 14, color: colors.secondaryLabel, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  guardBtn: { marginTop: 20, backgroundColor: colors.cta, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13 },
  guardBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  linkText: { color: colors.secondaryLabel, fontSize: 14 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  successOrder: { fontSize: 15, fontWeight: '700', color: colors.label, marginTop: 8 },
  successTotal: { fontSize: 20, fontWeight: '800', color: colors.accent, marginTop: 4, marginBottom: 4 },
  // Consignment chips
  consignPill: { backgroundColor: colors.orangeBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  consignPillText: { color: colors.orange, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  consignHeaderPill: { backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  consignHeaderPillText: { color: colors.orange, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  creditPill: { backgroundColor: colors.blueBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  creditHeaderPill: { backgroundColor: 'rgba(37,99,235,0.3)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  creditHeaderPillText: { color: colors.blue, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  // Trade agreement cards in the dark header
  agreeWrap: { gap: 8, marginTop: 12 },
  agreeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  agreeCardAmber: { backgroundColor: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.30)' },
  agreeCardBlue: { backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(59,130,246,0.30)' },
  agreeDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  agreeTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  agreeDesc: { fontSize: 10.5, color: colors.secondaryLabel, marginTop: 2, lineHeight: 15 },
  homecareShortcut: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  homecareShortcutIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.cta, alignItems: 'center', justifyContent: 'center' },
  homecareShortcutTitle: { color: colors.white, fontSize: 12.5, fontWeight: '800' },
  homecareShortcutText: { color: colors.secondaryLabel, fontSize: 10.5, marginTop: 1 },
  // Category section headers
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.groupedBg, paddingHorizontal: 16, paddingVertical: 15, marginBottom: 10 },
  groupHeaderActive: { borderColor: colors.redLine },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupLabel: { fontSize: 14, fontWeight: '800', color: colors.label },
  groupCount: { backgroundColor: colors.groupedBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  groupCountText: { fontSize: 10, fontWeight: '700', color: colors.secondaryLabel },
  groupSelected: { backgroundColor: colors.cta, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  groupSelectedText: { fontSize: 10, fontWeight: '800', color: colors.white },
  // Professional / equipment badges
  proBadge: { backgroundColor: colors.blue, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1.5 },
  equipBadge: { backgroundColor: colors.label, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1.5 },
  proBadgeText: { color: colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
});

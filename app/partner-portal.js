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
import { AUTH_CONFIG } from '../config/auth';
import * as haptics from '../utils/haptics';
import { colors } from '../utils/theme';
import { createLogger } from '../utils/logger';

// Product images are stored as site-relative paths (e.g. /images/..). The app
// must prefix the asset origin, same as the Shop screen.
const imageUri = (product) => {
  const img = product?.image;
  if (!img) return null;
  return String(img).startsWith('http') ? img : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${img}`;
};

const log = createLogger('PartnerPortal');

const isPartnerUser = (user) => {
  const t = String(user?.discountType || '').toUpperCase();
  return t === 'CLINIC' || t === 'VIP';
};

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

  const tr = (en, ru, ar) => (locale === 'ru' ? ru : locale === 'ar' ? ar : en);
  const discountPct = Math.round(Number(user?.discountPercentage) || 0);

  // Consignment flag: stored user may be stale (set at login), so refresh from
  // the server on mount — the flag is toggled by admin / the MoySklad matcher.
  const [freshConsign, setFreshConsign] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (!user?.token) return undefined;
    fetchUserProfile(user.token)
      .then((fresh) => {
        if (mounted && fresh && typeof fresh.consignmentActive === 'boolean') {
          setFreshConsign(fresh.consignmentActive);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [user?.token]);
  const hasConsignment = freshConsign === null ? user?.consignmentActive === true : freshConsign === true;

  const [payOption, setPayOption] = useState('cod');
  useEffect(() => {
    if (hasConsignment) setPayOption('consignment');
  }, [hasConsignment]);

  useEffect(() => {
    let mounted = true;
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
  }, [user]);

  // Load the partner's recent orders for one-tap reorder.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.token) return;
      try {
        const list = await fetchUserOrders(user.token, { page: 1, limit: 5 });
        if (mounted) setRecentOrders(Array.isArray(list) ? list.slice(0, 4) : []);
      } catch (e) {
        log.warn('Failed to load recent orders', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  // Reorder: prefill quantities from a past order (in-stock products only).
  const reorderFrom = useCallback((order) => {
    const byId = new Map(products.map((p) => [String(p.id), p]));
    const next = {};
    let loaded = 0;
    for (const it of (order?.items || [])) {
      const id = String(it?.productId || it?.id || '');
      const q = Math.floor(Number(it?.quantity) || 0);
      const p = byId.get(id);
      if (id && p && !isProductOutOfStock(p) && q > 0) {
        next[id] = (next[id] || 0) + q;
        loaded += 1;
      }
    }
    if (loaded > 0) {
      haptics.lightTap();
      setQty(next);
      setReorderMsg(loaded);
    } else {
      Alert.alert(tr('Nothing to reorder', 'Нечего повторить', 'لا شيء لإعادة الطلب'), tr('Those products are no longer available.', 'Эти товары больше недоступны.', 'هذه المنتجات لم تعد متوفرة.'));
    }
  }, [products, tr]);

  const priceOf = useCallback((product) => {
    const pricing = getPricingDisplay(product);
    return {
      unit: Number(pricing.displayPrice) || 0,
      retail: pricing.originalPrice ? Number(pricing.originalPrice) : null,
      discounted: pricing.hasDiscount,
      pct: Math.round(Number(pricing.discountPercentage) || 0),
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

  const setLine = (id, next) => {
    haptics.lightTap();
    setQty((prev) => {
      const clone = { ...prev };
      if (next <= 0) delete clone[id];
      else clone[id] = next;
      return clone;
    });
  };

  const { itemCount, total } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const p of products) {
      const q = qty[p.id] || 0;
      if (q > 0) {
        count += q;
        sum += priceOf(p).unit * q;
      }
    }
    return { itemCount: count, total: Math.round(sum * 100) / 100 };
  }, [qty, products, priceOf]);

  const submit = async () => {
    if (itemCount === 0 || submitting) return;
    setSubmitting(true);
    haptics.lightTap();
    try {
      const items = Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ id, quantity: q }));
      const res = await submitPartnerOrder(user?.token, items, { orderNotes: notes, locale, paymentOption: payOption });
      if (res?.success) {
        setQty({});
        setNotes('');
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
  if (!isPartnerUser(user)) {
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
        <TouchableOpacity style={styles.guardBtn} onPress={() => router.back()}>
          <Text style={styles.guardBtnText}>{tr('Go back', 'Назад', 'رجوع')}</Text>
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
        <Text style={styles.guardText}>
          {placed.paymentOption === 'consignment'
            ? tr(
                'Added to your consignment stock — same-day delivery. Settlement via your monthly sales report.',
                'Добавлено на консигнационный склад — доставка в тот же день. Расчёт по ежемесячному отчёту.',
                'أُضيف إلى مخزون الأمانة — توصيل في نفس اليوم. التسوية عبر التقرير الشهري.'
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

  const renderItem = ({ item: product }) => {
    const q = qty[product.id] || 0;
    const { unit, retail, discounted, pct } = priceOf(product);
    const name = getLocalizedProductName?.(product, locale) || product.name;
    const uri = imageUri(product);
    const soldOut = isProductOutOfStock(product);
    return (
      <View style={[styles.row, q > 0 && styles.rowActive, soldOut && styles.rowSoldOut, isRTL && styles.rowRTL]}>
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
          </View>
        </View>
        {soldOut ? (
          <View style={styles.soldPill}>
            <Text style={styles.soldPillText}>{tr('Sold out', 'Нет в наличии', 'نفدت')}</Text>
          </View>
        ) : q > 0 ? (
          <View style={[styles.stepper, isRTL && styles.rowRTL]}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setLine(product.id, q - 1)}>
              <Ionicons name="remove" size={18} color={colors.label} />
            </TouchableOpacity>
            <Text style={styles.stepQty}>{q}</Text>
            <TouchableOpacity style={[styles.stepBtn, styles.stepBtnAdd]} onPress={() => setLine(product.id, q + 1)}>
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setLine(product.id, 1)} disabled={unit <= 0}>
            <Text style={[styles.addBtnText, unit <= 0 && { color: colors.secondaryLabel }]}>
              {unit <= 0 ? tr('N/A', 'Н/Д', 'غير متاح') : tr('Add', 'Добавить', 'إضافة')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Corporate dark header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerBrand}>GENOSYS</Text>
            <Text style={styles.headerLabel}>{tr('PARTNER', 'ПАРТНЁР', 'شريك')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={styles.offPill}>
              <Text style={styles.offPillText}>{discountPct > 0 ? `−${discountPct}%` : tr('Partner', 'Партнёр', 'شريك')}</Text>
            </View>
            {hasConsignment ? (
              <View style={styles.consignHeaderPill}>
                <Text style={styles.consignHeaderPillText}>{tr('CONSIGNMENT', 'КОНСИГНАЦИЯ', 'أمانة')}</Text>
              </View>
            ) : null}
          </View>
        </View>
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
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: itemCount > 0 ? 250 : 40 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            (!search && recentOrders.length > 0) || reorderMsg > 0 ? (
              <View style={{ marginBottom: 12 }}>
                {reorderMsg > 0 ? (
                  <View style={[styles.reorderBanner, isRTL && styles.rowRTL]}>
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                    <Text style={[styles.reorderBannerText, isRTL && styles.rtlText]}>
                      {tr(`Loaded ${reorderMsg} item${reorderMsg === 1 ? '' : 's'} — adjust & place`, `Загружено ${reorderMsg} — измените и оформите`, `تم تحميل ${reorderMsg} — عدّل ثم قدّم`)}
                    </Text>
                  </View>
                ) : null}
                {!search && recentOrders.length > 0 ? (
                  <>
                    <Text style={[styles.reorderTitle, isRTL && styles.rtlText]}>{tr('Reorder', 'Повторить заказ', 'إعادة الطلب')}</Text>
                    {recentOrders.map((o) => (
                      <View key={String(o.id || o.orderNumber)} style={[styles.reorderRow, isRTL && styles.rowRTL]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.reorderNo, isRTL && styles.rtlText]} numberOfLines={1}>{o.orderNumber}</Text>
                          <Text style={[styles.reorderMeta, isRTL && styles.rtlText]}>{(o.items?.length || 0)} {tr('items', 'товаров', 'منتجات')} · {formatAed(o.total)}</Text>
                        </View>
                        <TouchableOpacity style={styles.reorderBtn} onPress={() => reorderFrom(o)}>
                          <Ionicons name="refresh" size={14} color={colors.brand} />
                          <Text style={styles.reorderBtnText}>{tr('Reorder', 'Повторить', 'إعادة')}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <Text style={[styles.reorderHint, isRTL && styles.rtlText]}>{tr('Or add products below', 'Или добавьте товары ниже', 'أو أضف المنتجات أدناه')}</Text>
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
          <View style={[styles.footerPills, isRTL && styles.rowRTL]}>
            {hasConsignment ? (
              <TouchableOpacity
                style={[styles.pill, payOption === 'consignment' && styles.pillConsign]}
                onPress={() => { haptics.lightTap(); setPayOption('consignment'); }}
              >
                <Text style={[styles.pillText, payOption === 'consignment' && styles.pillTextActive]}>
                  {tr('Consignment', 'Консигнация', 'أمانة')}
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
              ? tr('Settle via monthly sales report — no payment now', 'Расчёт по ежемесячному отчёту — без оплаты сейчас', 'التسوية عبر التقرير الشهري — بدون دفع الآن')
              : payOption === 'online'
                ? tr('Card / Apple Pay — secure checkout', 'Карта / Apple Pay — безопасная оплата', 'بطاقة / Apple Pay — دفع آمن')
                : tr('Pay when your order arrives', 'Оплатите при доставке', 'ادفع عند وصول الطلب')}
          </Text>
          <View style={[styles.footerRow, isRTL && styles.rowRTL]}>
            <View style={isRTL ? { alignItems: 'flex-end' } : null}>
              <Text style={styles.footerCount}>
                {itemCount} {itemCount === 1 ? tr('item', 'товар', 'منتج') : tr('items', 'товаров', 'منتجات')}
              </Text>
              <Text style={styles.footerTotal}>{formatAed(total)}</Text>
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
  container: { flex: 1, backgroundColor: colors.groupedBackground || '#F2F2F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#FFFFFF' },
  // Header
  header: { backgroundColor: '#0B0B0C', paddingHorizontal: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 40 },
  headerBrand: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  headerLabel: { color: colors.brand, fontSize: 9, fontWeight: '700', letterSpacing: 3, marginTop: 1 },
  offPill: { backgroundColor: colors.brand, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, minWidth: 40, alignItems: 'center' },
  offPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, padding: 0 },
  // Rows
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.separator },
  rowActive: { borderColor: colors.brand },
  rowSoldOut: { opacity: 0.6 },
  rowRTL: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.groupedBackground || '#F2F2F7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  soldOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, alignItems: 'center' },
  soldOverlayText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  soldPill: { backgroundColor: colors.groupedBackground || '#F2F2F7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  soldPillText: { color: colors.secondaryLabel, fontSize: 12, fontWeight: '700' },
  rowInfo: { flex: 1, marginHorizontal: 12 },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.label, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rowPrice: { fontSize: 14, fontWeight: '800', color: colors.brand },
  rowRetail: { fontSize: 12, color: colors.secondaryLabel, textDecorationLine: 'line-through' },
  offBadge: { backgroundColor: '#E9F9EF', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  offBadgeText: { color: '#0F7B3E', fontSize: 10, fontWeight: '800' },
  // Stepper / add
  addBtn: { backgroundColor: '#FCE8E8', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: colors.brand, fontSize: 13, fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.groupedBackground || '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  stepBtnAdd: { backgroundColor: colors.brand },
  stepQty: { minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.label },
  // Notes
  notesWrap: { marginTop: 8 },
  notesLabel: { fontSize: 12, fontWeight: '700', color: colors.secondaryLabel, marginBottom: 6 },
  notesInput: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: colors.separator, padding: 12, fontSize: 14, color: colors.label, minHeight: 60, textAlignVertical: 'top' },
  empty: { textAlign: 'center', color: colors.secondaryLabel, marginTop: 40, fontSize: 14 },
  // Reorder strip
  reorderBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0B0B0C', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  reorderBannerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },
  reorderTitle: { fontSize: 13, fontWeight: '800', color: colors.secondaryLabel, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  reorderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: colors.separator, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  reorderNo: { fontSize: 14, fontWeight: '700', color: colors.label },
  reorderMeta: { fontSize: 12, color: colors.secondaryLabel, marginTop: 2 },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FCE8E8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  reorderBtnText: { color: colors.brand, fontSize: 13, fontWeight: '700' },
  reorderHint: { fontSize: 12, color: colors.secondaryLabel, marginTop: 4, marginBottom: 2 },
  // Footer
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.separator, paddingHorizontal: 16, paddingTop: 10 },
  footerPills: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: colors.separator, backgroundColor: '#FFFFFF' },
  pillActive: { backgroundColor: '#0B0B0C', borderColor: '#0B0B0C' },
  pillConsign: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.secondaryLabel },
  pillTextActive: { color: '#FFFFFF' },
  footerHint: { fontSize: 11, color: colors.secondaryLabel, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  footerCount: { fontSize: 12, color: colors.secondaryLabel },
  footerTotal: { fontSize: 18, fontWeight: '800', color: colors.label },
  submitBtn: { flex: 1, backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  // Guard / success
  guardTitle: { fontSize: 18, fontWeight: '700', color: colors.label, marginTop: 16 },
  guardText: { fontSize: 14, color: colors.secondaryLabel, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  guardBtn: { marginTop: 20, backgroundColor: colors.brand, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13 },
  guardBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  linkText: { color: colors.secondaryLabel, fontSize: 14 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  successOrder: { fontSize: 15, fontWeight: '700', color: colors.label, marginTop: 8 },
  successTotal: { fontSize: 20, fontWeight: '800', color: colors.brand, marginTop: 4, marginBottom: 4 },
  // Consignment chips
  consignPill: { backgroundColor: '#FEF3C7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  consignPillText: { color: '#92400E', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  consignHeaderPill: { backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  consignHeaderPillText: { color: '#FCD34D', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});

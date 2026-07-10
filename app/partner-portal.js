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
import { fetchProducts, submitPartnerOrder } from '../services/api';
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

  const tr = (en, ru, ar) => (locale === 'ru' ? ru : locale === 'ar' ? ar : en);
  const discountPct = Math.round(Number(user?.discountPercentage) || 0);

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
      const res = await submitPartnerOrder(user?.token, items, { orderNotes: notes, locale });
      if (res?.success) {
        setPlaced({ orderNumber: res.orderNumber, total: res.total });
        setQty({});
        setNotes('');
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
        <Text style={styles.guardText}>
          {tr('Priority partner order — we will confirm and arrange same-day delivery.', 'Приоритетный партнёрский заказ — доставим в тот же день.', 'طلب شريك ذو أولوية — توصيل بنفس اليوم.')}
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
          <View style={styles.offPill}>
            <Text style={styles.offPillText}>{discountPct > 0 ? `−${discountPct}%` : tr('Partner', 'Партнёр', 'شريك')}</Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: itemCount > 0 ? 200 : 40 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>{tr('No products found', 'Товары не найдены', 'لا توجد منتجات')}</Text>}
          ListFooterComponent={
            itemCount > 0 ? (
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
            ) : null
          }
        />
      )}

      {/* Sticky submit bar */}
      {itemCount > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
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
              <Text style={styles.submitText}>{tr('Place order', 'Оформить заказ', 'تقديم الطلب')}</Text>
            )}
          </TouchableOpacity>
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
  // Footer
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.separator, paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
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
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchProducts } from '../services/api';
import {
  createHomecareScript,
  fetchHomecareScripts,
  revokeHomecareScript,
  updateHomecareScript,
} from '../services/homecareService';
import { classifyPartnerLine } from '../utils/partnerCatalog';
import AUTH_CONFIG from '../config/auth';
import { colors } from '../utils/theme';
import * as haptics from '../utils/haptics';

const imageUri = (product) => {
  const image = product?.image;
  if (!image) return null;
  return String(image).startsWith('http') ? image : `${AUTH_CONFIG.ASSET_ORIGIN}${image}`;
};

const keyOf = (productId, size) => `${productId}::${size || ''}`;

export default function HomecareScriptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { locale, dir } = useLocalization();
  const isRTL = dir === 'rtl' || locale === 'ar';
  const tr = useCallback((en, ru, ar) => locale === 'ru' ? ru : locale === 'ar' ? ar : en, [locale]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [points, setPoints] = useState({ available: 0, pending: 0 });
  const [products, setProducts] = useState([]);
  const [builder, setBuilder] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [patientLabel, setPatientLabel] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const [scriptsResult, productList] = await Promise.all([
        fetchHomecareScripts(user.token),
        fetchProducts(user),
      ]);
      setScripts(Array.isArray(scriptsResult?.scripts) ? scriptsResult.scripts : []);
      setPoints(scriptsResult?.points || { available: 0, pending: 0 });
      setProducts((Array.isArray(productList) ? productList : []).filter((product) => {
        if (!product || product.isHidden || product.inStock === false) return false;
        if (classifyPartnerLine(product) === 'retail') return true;
        return (product.variants || []).some(
          (variant) => variant?.available !== false && classifyPartnerLine(product, variant?.size) === 'retail'
        );
      }));
    } catch {
      Alert.alert(tr('Unable to load', 'Не удалось загрузить', 'تعذر التحميل'), tr('Please check your connection and try again.', 'Проверьте соединение и повторите.', 'تحقق من الاتصال وحاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }, [tr, user]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setBuilder(false);
    setEditingId(null);
    setPatientLabel('');
    setCareInstructions('');
    setSelected({});
    setSearch('');
  };

  const startNew = () => {
    reset();
    setBuilder(true);
    haptics.lightTap();
  };

  const startEdit = (script) => {
    const version = script?.versions?.[0];
    const next = {};
    for (const item of version?.items || []) {
      next[keyOf(item.productId, item.size)] = {
        productId: item.productId,
        size: item.size || null,
        quantity: item.quantity || 1,
      };
    }
    setEditingId(script.id);
    setPatientLabel(script.patientLabel || '');
    setCareInstructions(version?.careInstructions || '');
    setSelected(next);
    setBuilder(true);
    haptics.lightTap();
  };

  const toggle = (productId, size) => {
    haptics.selectionTick();
    const key = keyOf(productId, size);
    setSelected((current) => {
      const next = { ...current };
      if (next[key]) delete next[key];
      else next[key] = { productId, size: size || null, quantity: 1 };
      return next;
    });
  };

  const save = async () => {
    if (!user?.token || saving) return;
    const items = Object.values(selected);
    if (!items.length) {
      Alert.alert(tr('Select products', 'Выберите продукты', 'اختر المنتجات'), tr('Select at least one retail product.', 'Выберите хотя бы один розничный продукт.', 'اختر منتج تجزئة واحدًا على الأقل.'));
      return;
    }
    setSaving(true);
    try {
      const input = { patientLabel, careInstructions, items };
      if (editingId) await updateHomecareScript(user.token, editingId, input);
      else await createHomecareScript(user.token, input);
      reset();
      await load();
      haptics.success();
    } catch {
      Alert.alert(tr('Could not save', 'Не удалось сохранить', 'تعذر الحفظ'), tr('Please try again.', 'Попробуйте снова.', 'حاول مرة أخرى.'));
    } finally {
      setSaving(false);
    }
  };

  const shareScript = async (script) => {
    const url = `${AUTH_CONFIG.WEB_ORIGIN}/r/${script.publicToken}`;
    const message = tr(
      `Your GENOSYS homecare recommendation from our clinic is ready: ${url}`,
      `Ваша рекомендация GENOSYS от нашей клиники готова: ${url}`,
      `توصيتك المنزلية من GENOSYS جاهزة: ${url}`
    );
    await Share.share({ title: 'GENOSYS Homecare', message, url });
  };

  const confirmRevoke = (script) => {
    Alert.alert(
      tr('Revoke link?', 'Отозвать ссылку?', 'إلغاء الرابط؟'),
      tr('The patient will no longer be able to add products from it.', 'Пациент больше не сможет добавлять продукты по ссылке.', 'لن يتمكن المريض من إضافة المنتجات من الرابط.'),
      [
        { text: tr('Cancel', 'Отмена', 'إلغاء'), style: 'cancel' },
        {
          text: tr('Revoke', 'Отозвать', 'إلغاء الرابط'),
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeHomecareScript(user?.token, script.id);
              await load();
            } catch {
              Alert.alert(tr('Unable to revoke', 'Не удалось отозвать', 'تعذر الإلغاء'));
            }
          },
        },
      ]
    );
  };

  const productLines = useMemo(() => {
    const query = search.trim().toLowerCase();
    const visible = query
      ? products.filter((product) =>
          String(product.name || '').toLowerCase().includes(query) ||
          String(product.productNumber || '').toLowerCase().includes(query))
      : products;
    return visible.flatMap((product) => {
      const retailVariants = (product.variants || []).filter(
        (variant) => variant?.available !== false && variant?.size && variant.size !== 'default' &&
          classifyPartnerLine(product, variant.size) === 'retail'
      );
      if (retailVariants.length) {
        return retailVariants.map((variant) => ({ product, size: variant.size }));
      }
      return classifyPartnerLine(product) === 'retail' ? [{ product, size: null }] : [];
    });
  }, [products, search]);

  const renderProduct = ({ item }) => {
    const key = keyOf(item.product.id, item.size);
    const active = !!selected[key];
    return (
      <TouchableOpacity style={[styles.productRow, active && styles.productRowActive, isRTL && styles.rowRTL]} onPress={() => toggle(item.product.id, item.size)}>
        <View style={styles.thumb}>
          {imageUri(item.product) ? <Image source={{ uri: imageUri(item.product) }} style={styles.thumbImage} resizeMode="contain" /> : <Ionicons name="cube-outline" size={20} color={colors.secondaryLabel} />}
        </View>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.productName, isRTL && styles.rtlText]} numberOfLines={2}>{item.product.name}</Text>
          {item.size ? <Text style={[styles.productMeta, isRTL && styles.rtlText]}>{item.size}</Text> : null}
        </View>
        <View style={[styles.check, active && styles.checkActive]}>
          {active ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (builder) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
            <TouchableOpacity onPress={reset} style={styles.iconButton}><Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={25} color={colors.white} /></TouchableOpacity>
            <Text style={styles.headerTitle}>{editingId ? tr('Update recommendation', 'Обновить рекомендацию', 'تحديث التوصية') : tr('New recommendation', 'Новая рекомендация', 'توصية جديدة')}</Text>
            <View style={styles.iconButton} />
          </View>
        </View>
        <FlatList
          data={productLines}
          keyExtractor={(item) => keyOf(item.product.id, item.size)}
          renderItem={renderProduct}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 110 }}
          ListHeaderComponent={
            <View>
              <Text style={styles.label}>{tr('Patient reference (optional)', 'Метка пациента (необязательно)', 'مرجع المريض (اختياري)')}</Text>
              <TextInput value={patientLabel} onChangeText={setPatientLabel} maxLength={80} style={[styles.input, isRTL && styles.rtlText]} placeholder={tr('e.g. Anna — July visit', 'напр. Анна — визит в июле', 'مثال: سارة — زيارة يوليو')} placeholderTextColor={colors.secondaryLabel} />
              <Text style={styles.label}>{tr('Product-use notes (optional)', 'Инструкции по применению', 'ملاحظات استخدام المنتجات')}</Text>
              <TextInput value={careInstructions} onChangeText={setCareInstructions} maxLength={1000} multiline style={[styles.input, styles.notes, isRTL && styles.rtlText]} placeholder={tr('AM/PM order and instructions', 'Порядок применения утром/вечером', 'ترتيب الاستخدام صباحًا ومساءً')} placeholderTextColor={colors.secondaryLabel} />
              <View style={[styles.search, isRTL && styles.rowRTL]}>
                <Ionicons name="search" size={17} color={colors.secondaryLabel} />
                <TextInput value={search} onChangeText={setSearch} style={[styles.searchInput, isRTL && styles.rtlText]} placeholder={tr('Search retail products', 'Поиск розничных продуктов', 'بحث منتجات التجزئة')} placeholderTextColor={colors.secondaryLabel} />
              </View>
              <Text style={styles.selectedText}>{Object.keys(selected).length} {tr('selected', 'выбрано', 'مختارة')}</Text>
            </View>
          }
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={[styles.saveButton, (!Object.keys(selected).length || saving) && { opacity: 0.45 }]} onPress={save} disabled={!Object.keys(selected).length || saving}>
            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>{editingId ? tr('Save new version', 'Сохранить новую версию', 'حفظ نسخة جديدة') : tr('Create private link', 'Создать приватную ссылку', 'إنشاء رابط خاص')}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={25} color={colors.white} /></TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.brand}>GENOSYS</Text>
            <Text style={styles.headerSubtitle}>{tr('HOMECARE SCRIPTS', 'РЕКОМЕНДАЦИИ', 'توصيات منزلية')}</Text>
          </View>
          <TouchableOpacity onPress={startNew} style={styles.iconButton}><Ionicons name="add-circle" size={27} color={colors.accent} /></TouchableOpacity>
        </View>
        <Text style={styles.intro}>{tr('Recommend retail products and earn Clinic Points after eligible patient purchases.', 'Рекомендуйте продукты и получайте баллы после покупок пациентов.', 'أوصِ بمنتجات التجزئة واكسب نقاط العيادة بعد مشتريات المرضى المؤهلة.')}</Text>
      </View>

      <View style={styles.pointsRow}>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsValue}>{Number(points.available || 0).toFixed(2)}</Text>
          <Text style={styles.pointsLabel}>{tr('Available', 'Доступно', 'متاحة')}</Text>
        </View>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsValue}>{Number(points.pending || 0).toFixed(2)}</Text>
          <Text style={styles.pointsLabel}>{tr('Pending · 14 days', 'Ожидают · 14 дней', 'معلقة · 14 يومًا')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>
      ) : (
        <FlatList
          data={scripts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            Array.isArray(points.transactions) && points.transactions.length > 0 ? (
              <View style={styles.historyCard}>
                <Text style={styles.historyTitle}>
                  {tr('Clinic Points history', 'История баллов клиники', 'سجل نقاط العيادة')}
                </Text>
                {points.transactions.slice(0, 8).map((transaction) => (
                  <View key={transaction.id} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDescription} numberOfLines={1}>
                        {transaction.description || String(transaction.type || '').replaceAll('_', ' ')}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {new Date(transaction.createdAt).toLocaleDateString()} · {String(transaction.status || '').toLowerCase()}
                      </Text>
                    </View>
                    <Text style={[styles.historyPoints, transaction.points < 0 && styles.historyPointsNegative]}>
                      {transaction.points >= 0 ? '+' : ''}{Number(transaction.points).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="paper-plane-outline" size={42} color={colors.separatorStrong} />
              <Text style={styles.emptyTitle}>{tr('No recommendations yet', 'Рекомендаций пока нет', 'لا توجد توصيات بعد')}</Text>
              <TouchableOpacity onPress={startNew} style={styles.emptyButton}><Text style={styles.emptyButtonText}>{tr('Create first link', 'Создать первую ссылку', 'إنشاء أول رابط')}</Text></TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const active = item.effectiveStatus === 'ACTIVE';
            const version = item.versions?.[0];
            return (
              <View style={styles.scriptCard}>
                <View style={[styles.scriptTop, isRTL && styles.rowRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scriptTitle, isRTL && styles.rtlText]}>{item.patientLabel || tr('Patient recommendation', 'Рекомендация пациенту', 'توصية المريض')}</Text>
                    <Text style={[styles.scriptMeta, isRTL && styles.rtlText]}>{version?.items?.length || 0} {tr('products', 'продуктов', 'منتجات')} · {item.openCount || 0} {tr('opens', 'открытий', 'مرات فتح')}</Text>
                  </View>
                  <View style={[styles.status, active ? styles.statusActive : styles.statusInactive]}><Text style={[styles.statusText, active && { color: '#15803D' }]}>{item.effectiveStatus}</Text></View>
                </View>
                {active ? (
                  <View style={[styles.actions, isRTL && styles.rowRTL]}>
                    <TouchableOpacity style={styles.primaryAction} onPress={() => shareScript(item)}><Ionicons name="share-outline" size={17} color={colors.white} /><Text style={styles.primaryActionText}>{tr('Share', 'Отправить', 'مشاركة')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.action} onPress={() => startEdit(item)}><Ionicons name="create-outline" size={17} color={colors.label} /><Text style={styles.actionText}>{tr('Edit', 'Изменить', 'تعديل')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.deleteAction} onPress={() => confirmRevoke(item)}><Ionicons name="trash-outline" size={17} color={colors.red} /></TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  header: { backgroundColor: colors.label, paddingHorizontal: 16, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  intro: { color: colors.placeholder, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
  pointsRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 0 },
  pointsCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: colors.groupedBg },
  pointsValue: { color: colors.label, fontSize: 23, fontWeight: '900' },
  pointsLabel: { color: colors.mutedText, fontSize: 11, marginTop: 3 },
  historyCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 14 },
  historyTitle: { fontSize: 15, fontWeight: '800', color: colors.label, marginBottom: 6 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  historyDescription: { fontSize: 12, fontWeight: '600', color: colors.label },
  historyMeta: { marginTop: 2, fontSize: 10, color: colors.secondaryLabel },
  historyPoints: { fontSize: 13, fontWeight: '800', color: '#15803D' },
  historyPointsNegative: { color: colors.red },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scriptCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.groupedBg, padding: 15, marginBottom: 11 },
  scriptTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  scriptTitle: { color: colors.label, fontSize: 15, fontWeight: '800' },
  scriptMeta: { color: colors.mutedText, fontSize: 11, marginTop: 4 },
  status: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  statusActive: { backgroundColor: '#ECFDF3' },
  statusInactive: { backgroundColor: colors.fill },
  statusText: { color: colors.mutedText, fontSize: 9, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.groupedBg },
  primaryAction: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.label, borderRadius: 10, paddingVertical: 10 },
  primaryActionText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  action: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fill, borderRadius: 10, paddingVertical: 10 },
  actionText: { color: colors.label, fontSize: 13, fontWeight: '700' },
  deleteAction: { width: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentBg, borderRadius: 10 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { color: colors.label, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyButton: { backgroundColor: colors.cta, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 16 },
  emptyButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  label: { color: colors.mutedText, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: colors.card, borderRadius: 13, borderWidth: 1, borderColor: colors.separator, color: colors.label, fontSize: 14, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 15 },
  notes: { minHeight: 76, textAlignVertical: 'top' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 13, borderWidth: 1, borderColor: colors.separator, paddingHorizontal: 13, marginBottom: 8 },
  searchInput: { flex: 1, color: colors.label, fontSize: 14, paddingVertical: 12 },
  selectedText: { color: colors.mutedText, fontSize: 12, fontWeight: '600', marginBottom: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.groupedBg, padding: 10, marginBottom: 8 },
  productRowActive: { borderColor: colors.accent, backgroundColor: '#FFF7F7' },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  productName: { color: colors.label, fontSize: 13.5, fontWeight: '700' },
  productMeta: { color: colors.mutedText, fontSize: 11, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.separatorStrong, alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: colors.cta, borderColor: colors.accent },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.separator, padding: 14 },
  saveButton: { backgroundColor: colors.cta, borderRadius: 14, minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  rowRTL: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});

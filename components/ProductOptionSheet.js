import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AUTH_CONFIG from '../config/auth';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName } from '../utils/productLocalization';
import {
  applyProductOptionPrice,
  extractProductOptions,
  getInitialProductSelection,
  getProductOptionPrice,
  isOptionAvailable,
  isProductSelectionComplete,
} from '../utils/productOptions';
import { isProductOutOfStock } from '../utils/stock';
import { formatAed, getPricingDisplay } from '../utils/pricingDisplay';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, tint } from '../utils/theme';

const MAX_QTY = 99;

export default function ProductOptionSheet({
  visible,
  product,
  isRefreshing = false,
  refreshError = '',
  isAdding = false,
  onRetry,
  onClose,
  onConfirm,
}) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const openedProductRef = useRef('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const model = useMemo(() => extractProductOptions(product), [product]);
  const selection = useMemo(
    () => ({ selectedSize, selectedColor }),
    [selectedSize, selectedColor]
  );
  const selectionComplete = isProductSelectionComplete(product, selection);
  const outOfStock = isProductOutOfStock(product);
  const selectedPrice = getProductOptionPrice(product, selection);
  const selectedPricing = getPricingDisplay(
    applyProductOptionPrice(product, selection),
    selection
  );
  const discountMatch = String(selectedPricing.discountLabel || '')
    .trim()
    .match(/^(\d+(?:\.\d+)?)%\s*OFF$/i);
  const selectedDiscountLabel = discountMatch
    ? t('product.discountPercent', { percent: Math.round(Number(discountMatch[1])) })
    : selectedPricing.discountLabel;

  useEffect(() => {
    if (!visible || !product?.id) return;
    const productId = String(product.id);
    if (openedProductRef.current === productId) return;
    openedProductRef.current = productId;
    const initial = getInitialProductSelection(product);
    setSelectedSize(initial.selectedSize);
    setSelectedColor(initial.selectedColor);
    setQuantity(1);
  }, [visible, product?.id]);

  useEffect(() => {
    if (!visible) {
      openedProductRef.current = '';
      return;
    }

    if (selectedSize && !model.sizes.some((option) => option.value === selectedSize)) {
      setSelectedSize(model.sizes.length === 1 ? model.sizes[0].value : '');
    }
    if (selectedColor && !model.colors.some((option) => option.value === selectedColor)) {
      setSelectedColor(model.colors.length === 1 ? model.colors[0].value : '');
    }
  }, [visible, model, selectedSize, selectedColor]);

  if (!product) return null;

  const imageUrl = product.image
    ? (String(product.image).startsWith('http')
      ? product.image
      : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`)
    : null;
  const localizedName = getLocalizedProductName(product, locale) || product.name || '';
  const canConfirm = !isAdding && !isRefreshing && !outOfStock && selectionComplete;

  const selectOption = (dimension, value) => {
    haptics.selectionTick();
    if (dimension === 'size') {
      const next = { selectedSize: value, selectedColor };
      setSelectedSize(value);
      if (
        selectedColor &&
        !isOptionAvailable(model, 'color', selectedColor, next)
      ) {
        setSelectedColor('');
      }
      return;
    }

    const next = { selectedSize, selectedColor: value };
    setSelectedColor(value);
    if (selectedSize && !isOptionAvailable(model, 'size', selectedSize, next)) {
      setSelectedSize('');
    }
  };

  const renderOption = (dimension, option) => {
    const selected = dimension === 'size'
      ? selectedSize === option.value
      : selectedColor === option.value;
    const available = isOptionAvailable(model, dimension, option.value, selection);
    const label = option.label || option.value;

    return (
      <TouchableOpacity
        key={`${dimension}-${option.value}`}
        style={[
          styles.option,
          dimension === 'color' && styles.colorOption,
          selected && styles.optionSelected,
          !available && styles.optionDisabled,
        ]}
        onPress={() => selectOption(dimension, option.value)}
        disabled={!available || isAdding}
        activeOpacity={0.75}
        accessibilityRole="radio"
        accessibilityLabel={`${dimension === 'size' ? t('variant.size') : t('variant.color')}: ${label}`}
        accessibilityState={{ selected, disabled: !available || isAdding }}
      >
        {dimension === 'color' && (
          <View
            style={[
              styles.swatch,
              { backgroundColor: option.hex || colors.fill },
              selected && styles.swatchSelected,
            ]}
          />
        )}
        <Text
          style={[
            styles.optionLabel,
            selected && styles.optionLabelSelected,
            !available && styles.optionLabelDisabled,
            isRTL && styles.textRTL,
          ]}
        >
          {label}
        </Text>
        {!available && (
          <Text style={[styles.unavailable, isRTL && styles.textRTL]}>
            {t('variant.unavailable')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isAdding) onClose?.();
      }}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (!isAdding) onClose?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <View style={[styles.header, isRTL && styles.rowRTL]}>
            <View style={[styles.productSummary, isRTL && styles.rowRTL]}>
              {imageUrl ? (
                <Image
                  source={imageUrl}
                  style={styles.image}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  accessibilityLabel={localizedName}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>
                    {localizedName.charAt(0) || 'G'}
                  </Text>
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={[styles.eyebrow, isRTL && styles.textRTL]}>
                  {t('variant.chooseOptions')}
                </Text>
                <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={3}>
                  {localizedName}
                </Text>
                <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                  {selectedPricing.originalPrice ? (
                    <Text style={styles.originalPrice}>
                      {formatAed(selectedPricing.originalPrice)}
                    </Text>
                  ) : null}
                  <Text style={[styles.price, isRTL && styles.textRTL]}>
                    {formatAed(selectedPrice)}
                  </Text>
                  {selectedDiscountLabel ? (
                    <Text style={styles.discountLabel}>
                      {selectedDiscountLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isAdding}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.label} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isRefreshing && (
              <View style={[styles.notice, isRTL && styles.rowRTL]}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.noticeText, isRTL && styles.textRTL]}>
                  {t('variant.refreshingOptions')}
                </Text>
              </View>
            )}

            {!!refreshError && !isRefreshing && (
              <View style={styles.errorCard}>
                <Text style={[styles.errorText, isRTL && styles.textRTL]}>
                  {refreshError}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onRetry}
                  accessibilityRole="button"
                >
                  <Text style={styles.retryText}>{t('common.tryAgain')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {model.missingOptionData ? (
              <View style={styles.errorCard}>
                <Ionicons name="cloud-offline-outline" size={26} color={colors.orange} />
                <Text style={[styles.errorText, isRTL && styles.textRTL]}>
                  {t('variant.optionsUnavailable')}
                </Text>
              </View>
            ) : (
              <>
                {model.sizes.length > 0 && (
                  <View style={styles.group}>
                    <View style={[styles.groupHeading, isRTL && styles.rowRTL]}>
                      <Text style={[styles.groupTitle, isRTL && styles.textRTL]}>
                        {t('variant.size')}
                      </Text>
                      {model.required.size && !selectedSize && (
                        <Text style={styles.requiredText}>{t('variant.required')}</Text>
                      )}
                    </View>
                    <View style={[styles.options, isRTL && styles.optionsRTL]}>
                      {model.sizes.map((option) => renderOption('size', option))}
                    </View>
                  </View>
                )}

                {model.colors.length > 0 && (
                  <View style={styles.group}>
                    <View style={[styles.groupHeading, isRTL && styles.rowRTL]}>
                      <Text style={[styles.groupTitle, isRTL && styles.textRTL]}>
                        {t('variant.color')}
                      </Text>
                      {model.required.color && !selectedColor && (
                        <Text style={styles.requiredText}>{t('variant.required')}</Text>
                      )}
                    </View>
                    <View style={[styles.options, isRTL && styles.optionsRTL]}>
                      {model.colors.map((option) => renderOption('color', option))}
                    </View>
                  </View>
                )}

                <View style={styles.group}>
                  <Text style={[styles.groupTitle, isRTL && styles.textRTL]}>
                    {t('product.quantity')}
                  </Text>
                  <View style={[styles.quantity, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                      style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                      onPress={() => {
                        haptics.selectionTick();
                        setQuantity((current) => Math.max(1, current - 1));
                      }}
                      disabled={quantity <= 1 || isAdding}
                      accessibilityRole="button"
                      accessibilityLabel={t('shop.decreaseQuantity')}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={quantity <= 1 ? colors.tertiary : colors.label}
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        haptics.selectionTick();
                        setQuantity((current) => Math.min(MAX_QTY, current + 1));
                      }}
                      disabled={quantity >= MAX_QTY || isAdding}
                      accessibilityRole="button"
                      accessibilityLabel={t('shop.increaseQuantity')}
                    >
                      <Ionicons name="add" size={20} color={colors.label} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isAdding}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
              onPress={() => {
                if (!canConfirm) {
                  haptics.warning();
                  return;
                }
                haptics.mediumTap();
                onConfirm?.(selection, quantity, product);
              }}
              disabled={!canConfirm}
              accessibilityRole="button"
              accessibilityLabel={`${t('shop.addToBag')} — ${localizedName}`}
              accessibilityState={{ disabled: !canConfirm }}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="bag-add" size={19} color={colors.white} />
              )}
              <Text style={styles.confirmText}>
                {outOfStock ? t('stock.outOfStock') : t('shop.addToBag')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow.card,
  },
  handle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  productSummary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  imagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: colors.fillSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.accent,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...T.captionSmall,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  productName: {
    ...T.label,
    color: colors.label,
    lineHeight: 19,
  },
  price: {
    ...T.price,
    color: colors.accent,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 5,
  },
  originalPrice: {
    ...T.priceStrikethrough,
    fontSize: 11,
  },
  discountLabel: {
    ...T.captionTiny,
    color: colors.greenDeep,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fillSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: tint(colors.blue),
    marginBottom: 14,
  },
  noticeText: {
    ...T.caption,
    flex: 1,
    color: colors.label,
  },
  errorCard: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    marginBottom: 16,
  },
  errorText: {
    ...T.bodySmall,
    textAlign: 'center',
    color: '#9A3412',
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  retryText: {
    ...T.buttonTiny,
    color: colors.accent,
  },
  group: {
    marginBottom: 22,
  },
  groupHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  groupTitle: {
    ...T.sectionTitleSmall,
    color: colors.label,
    marginBottom: 10,
  },
  requiredText: {
    ...T.captionTiny,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionsRTL: {
    flexDirection: 'row-reverse',
  },
  option: {
    minWidth: 82,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.separator,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOption: {
    minWidth: 96,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  optionDisabled: {
    opacity: 0.48,
    backgroundColor: colors.fillSecondary,
  },
  optionLabel: {
    ...T.label,
    color: colors.label,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  optionLabelDisabled: {
    color: colors.secondaryLabel,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.separator,
    marginBottom: 6,
  },
  swatchSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  unavailable: {
    ...T.captionTiny,
    color: colors.red,
    marginTop: 2,
  },
  quantity: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 14,
    backgroundColor: colors.fillSecondary,
    padding: 4,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: colors.subtleBg,
  },
  quantityValue: {
    minWidth: 42,
    textAlign: 'center',
    ...T.label,
    color: colors.label,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  cancelButton: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.fillSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...T.button,
    color: colors.label,
  },
  confirmButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.cta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadow.cta(colors.cta),
  },
  confirmButtonDisabled: {
    backgroundColor: colors.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    ...T.button,
    color: colors.white,
    textAlign: 'center',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

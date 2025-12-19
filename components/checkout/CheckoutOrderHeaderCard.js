import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName } from '../../utils/productLocalization';
import { formatEmirateLabel } from '../../utils/emirateUtils';

export default function CheckoutOrderHeaderCard({
  styles,
  orderNumber,
  itemCount,
  orderSummaryExpanded,
  onToggle,
  paidItems,
  promoItems,
  safeSubtotal,
  safeShipping,
  safeVat,
  safeTotal,
  selectedEmirate,
}) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  return (
    <View style={styles.orderHeaderCard}>
      <TouchableOpacity
        style={[styles.orderHeader, isRTL && styles.orderHeaderRTL]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <View style={[styles.orderHeaderLeft, isRTL && styles.orderHeaderLeftRTL]}>
          <Text style={[styles.orderNumber, isRTL && styles.textRTL]}>{t('checkout.orderNumberLine', { orderNumber })}</Text>
          <Text style={[styles.itemCount, isRTL && styles.textRTL]}>
            {t('bag.header', {
              count: itemCount,
              label: itemCount === 1 ? t('bag.item') : t('bag.items'),
            })}
          </Text>
        </View>
        <Ionicons
          name={orderSummaryExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#ffffff"
        />
      </TouchableOpacity>

      {orderSummaryExpanded ? (
        <View style={styles.orderSummaryBody}>
          <Text style={[styles.orderSummaryTitle, isRTL && styles.textRTL]}>{t('checkout.orderSummary')}</Text>

          {(paidItems || []).map((it, idx) => {
            const name = getLocalizedProductName(it.product, locale) || it.product?.name || t('common.item');
            const qty = Number(it.quantity) || 0;
            const size = it.selectedSize ? String(it.selectedSize) : '';
            const color = it.selectedColor ? String(it.selectedColor) : '';
            const extras = [
              size && `${t('common.size')}: ${size}`,
              color && `${t('common.color')}: ${color}`,
            ]
              .filter(Boolean)
              .join(' • ');
            const price = Number(it.product?.displayPrice ?? it.product?.price ?? 0) || 0;
            return (
              <Text key={`${it.product?.id || name}-${idx}`} style={[styles.orderSummaryLine, isRTL && styles.textRTL]}>
                {qty}× {name}
                {extras ? ` — ${extras}` : ''} — AED {price.toFixed(2)}
              </Text>
            );
          })}

          {promoItems?.length ? (
            <>
              <Text style={[styles.orderSummarySection, isRTL && styles.textRTL]}>{t('checkout.promotion')}</Text>
              {promoItems.map((it, idx) => {
                const name = getLocalizedProductName(it.product, locale) || it.product?.name || t('common.promoItem');
                const qty = Number(it.quantity) || 1;
                const size = it.product?.size ? String(it.product.size) : '';
                return (
                  <Text key={`${it.product?.id || name}-promo-${idx}`} style={[styles.orderSummaryLine, isRTL && styles.textRTL]}>
                    {qty}× {name}
                    {size ? ` — ${size}` : ''} — {t('common.free')}
                  </Text>
                );
              })}
            </>
          ) : null}

          <View style={styles.orderSummaryDivider} />
          <Text style={[styles.orderSummarySection, isRTL && styles.textRTL]}>{t('checkout.totals')}</Text>
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>{t('checkout.subtotal')}</Text>
            <Text style={[styles.orderTotalsValue, isRTL && styles.summaryValueRTL]}>AED {Number(safeSubtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>
              {t('checkout.shippingTo', { emirate: formatEmirateLabel(t, selectedEmirate) })}
            </Text>
            <Text style={[styles.orderTotalsValue, isRTL && styles.summaryValueRTL]}>
              {Number(safeShipping || 0) === 0 ? t('common.free') : `AED ${Number(safeShipping || 0).toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>{t('checkout.vatIncluded')}</Text>
            <Text style={[styles.orderTotalsValue, isRTL && styles.summaryValueRTL]}>AED {Number(safeVat || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabelStrong, isRTL && styles.textRTL]}>{t('checkout.total')}</Text>
            <Text style={[styles.orderTotalsValueStrong, isRTL && styles.summaryValueRTL]}>AED {Number(safeTotal || 0).toFixed(2)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}






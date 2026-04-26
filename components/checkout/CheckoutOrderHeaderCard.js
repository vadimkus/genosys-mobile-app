import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName } from '../../utils/productLocalization';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { getPricingDisplay, formatAed } from '../../utils/pricingDisplay';

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
  waterfall,
}) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const wf = waterfall || {};
  const isFreeShipping = Number(safeShipping || 0) === 0;

  return (
    <View style={styles.orderHeaderCard}>
      <TouchableOpacity
        style={[styles.orderHeader, isRTL && styles.orderHeaderRTL]}
        onPress={onToggle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: !!orderSummaryExpanded }}
        accessibilityLabel={t('checkout.orderSummary')}
      >
        <View style={[styles.orderHeaderIconWrap, isRTL && styles.orderHeaderIconWrapRTL]}>
          <Ionicons name="bag-handle" size={18} color="#dc2626" />
        </View>
        <View style={[styles.orderHeaderLeft, isRTL && styles.orderHeaderLeftRTL]}>
          <Text style={[styles.orderEyebrow, isRTL && styles.textRTL]}>
            {t('checkout.orderNumberLine', { orderNumber })}
          </Text>
          <Text style={[styles.orderHeaderTotal, isRTL && styles.textRTL]}>
            AED {Number(safeTotal || 0).toFixed(2)}
          </Text>
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
          color="#6B7280"
        />
      </TouchableOpacity>

      {orderSummaryExpanded ? (
        <View style={styles.orderSummaryBody}>
          <Text style={[styles.orderSummaryTitle, isRTL && styles.textRTL]}>{t('checkout.orderSummary')}</Text>

          {/* Line items */}
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
            const pricing = getPricingDisplay(it.product, {
              selectedSize: it.selectedSize,
              selectedColor: it.selectedColor,
            });
            return (
              <Text key={`${it.product?.id || name}-${idx}`} style={[styles.orderSummaryLine, isRTL && styles.textRTL]}>
                {qty}× {name}
                {extras ? ` — ${extras}` : ''} — {formatAed(pricing.displayPrice)}
              </Text>
            );
          })}

          {/* Promo items banner */}
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

          {/* ─── Waterfall Discount Breakdown ─── */}
          <Text style={[styles.orderSummarySection, isRTL && styles.textRTL]}>{t('checkout.totals')}</Text>

          {wf.hasAnyDiscount ? (
            <>
              {/* Retail Price (strikethrough) */}
              <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>
                  {t('checkout.retailPrice')} ({itemCount} {itemCount === 1 ? t('checkout.item') : t('checkout.items')})
                </Text>
                <Text style={[styles.orderTotalsValue, styles.summaryValueStrikethrough, isRTL && styles.summaryValueRTL]}>
                  AED {wf.retailTotal.toFixed(2)}
                </Text>
              </View>

              {/* VIP / User Discount */}
              {wf.hasUserDiscount && (
                <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                  <Text style={[styles.summaryLabelDiscount, isRTL && styles.textRTL]}>
                    {t('checkout.yourDiscount')}{wf.userDiscountPct > 0 ? ` (${Math.round(wf.userDiscountPct)}%)` : ''}
                  </Text>
                  <Text style={[styles.summaryValueDiscount, isRTL && styles.summaryValueRTL]}>
                    -AED {wf.userDiscountTotal.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Intermediate Subtotal (only when both VIP + Bundle) */}
              {wf.hasUserDiscount && wf.hasBundleDiscount && (
                <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                  <Text style={[styles.summaryLabelIntermediate, isRTL && styles.textRTL]}>
                    {t('checkout.intermediateSubtotal')}
                  </Text>
                  <Text style={[styles.summaryValueIntermediate, isRTL && styles.summaryValueRTL]}>
                    AED {wf.afterVipSubtotal.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Bundle Discount */}
              {wf.hasBundleDiscount && (
                <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                  <Text style={[styles.summaryLabelBundle, isRTL && styles.textRTL]}>
                    {t('checkout.bundleDiscount')}{wf.bundleDiscountPct > 0 ? ` (${Math.round(wf.bundleDiscountPct)}%)` : ''}
                  </Text>
                  <Text style={[styles.summaryValueBundle, isRTL && styles.summaryValueRTL]}>
                    -AED {wf.bundleDiscountTotal.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Net Subtotal */}
              <View style={styles.summaryDividerLight} />
              <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
                <Text style={[styles.summaryLabelBold, isRTL && styles.textRTL]}>
                  {t('checkout.netSubtotal')}
                </Text>
                <Text style={[styles.summaryValueBold, isRTL && styles.summaryValueRTL]}>
                  AED {Number(safeSubtotal || 0).toFixed(2)}
                </Text>
              </View>
            </>
          ) : (
            /* No discounts — simple subtotal row */
            <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
              <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>{t('checkout.subtotal')}</Text>
              <Text style={[styles.orderTotalsValue, isRTL && styles.summaryValueRTL]}>AED {Number(safeSubtotal || 0).toFixed(2)}</Text>
            </View>
          )}

          {/* Shipping */}
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>
              {t('checkout.shippingTo', { emirate: formatEmirateLabel(t, selectedEmirate) })}
            </Text>
            <Text style={[styles.orderTotalsValue, isFreeShipping && styles.summaryValueFree, isRTL && styles.summaryValueRTL]}>
              {isFreeShipping ? t('common.free') : `AED ${Number(safeShipping || 0).toFixed(2)}`}
            </Text>
          </View>

          {/* Free Shipping banner */}
          {isFreeShipping && (
            <View style={styles.freeShippingBanner}>
              <Ionicons name="checkmark-circle" size={14} color="#27AE60" style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
              <Text style={[styles.freeShippingText, isRTL && styles.textRTL]}>
                {t('checkout.freeShippingApplied')}
              </Text>
            </View>
          )}

          {/* VAT */}
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabel, isRTL && styles.textRTL]}>{t('checkout.vatIncluded')}</Text>
            <Text style={[styles.orderTotalsValue, isRTL && styles.summaryValueRTL]}>AED {Number(safeVat || 0).toFixed(2)}</Text>
          </View>
          <Text style={[styles.vatNoteRed, isRTL && styles.textRTL]}>
            {t('checkout.allPricesVatInclusive')}
          </Text>

          <View style={styles.orderSummaryDivider} />

          {/* Total */}
          <View style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}>
            <Text style={[styles.orderTotalsLabelStrong, isRTL && styles.textRTL]}>{t('checkout.total')}</Text>
            <Text style={[styles.orderTotalsValueStrong, isRTL && styles.summaryValueRTL]}>AED {Number(safeTotal || 0).toFixed(2)}</Text>
          </View>

          {/* You Saved banner */}
          {wf.hasAnyDiscount && wf.totalSaved > 0 && (
            <View style={styles.youSavedBanner}>
              <Text style={styles.youSavedText}>
                🎉 {t('checkout.youSaved')}: AED {wf.totalSaved.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

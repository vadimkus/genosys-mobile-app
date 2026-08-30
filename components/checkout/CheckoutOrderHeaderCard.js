import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName } from '../../utils/productLocalization';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { getPricingDisplay, formatAed } from '../../utils/pricingDisplay';
import { colors } from '../../utils/theme';

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
  loyalty,
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
        <View style={[styles.orderHeaderIconWrap, isRTL && styles.orderHeaderIconWrapRTL, { backgroundColor: colors.cta }]}>
          <Ionicons name="bag-handle" size={18} color={colors.white} />
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
          {wf.hasBundleDiscount && wf.bundleDiscountPct > 0 ? (
            <Text style={[styles.orderHeaderDiscountBadge, isRTL && styles.textRTL]}>
              {t('checkout.bundleDiscount')} ({Math.round(wf.bundleDiscountPct)}%)
            </Text>
          ) : null}
        </View>
        <Ionicons
          name={orderSummaryExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.secondaryLabel}
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
            const isBundleItem = it?.fromBundle === true || it.product?.fromBundle === true;
            const bundlePct = Number(it?.bundleDiscountPercent || it.product?.bundleDiscountPercent) || 0;
            const unitPrice = isBundleItem
              ? Number(it.product?.displayPrice ?? it.product?.price ?? pricing.displayPrice)
              : Number(pricing.displayPrice);
            const retailUnit = isBundleItem
              ? Number(it.product?.originalPrice || pricing.originalPrice || pricing.basePrice || 0)
              : Number(pricing.originalPrice || pricing.basePrice || unitPrice);
            const hasLineDiscount =
              bundlePct > 0 &&
              Number.isFinite(unitPrice) &&
              Number.isFinite(retailUnit) &&
              retailUnit > unitPrice + 0.01;
            const finalLine = (Number.isFinite(unitPrice) ? unitPrice : 0) * qty;
            const retailLine = (Number.isFinite(retailUnit) ? retailUnit : 0) * qty;

            if (hasLineDiscount) {
              return (
                <View key={`${it.product?.id || name}-${idx}`} style={styles.orderSummaryLineBlock}>
                  <Text style={[styles.orderSummaryLine, isRTL && styles.textRTL]}>
                    {qty}× {name}
                    {extras ? ` - ${extras}` : ''}
                  </Text>
                  <View style={[styles.orderSummaryPriceRow, isRTL && styles.orderTotalsRowRTL]}>
                    <Text style={[styles.orderSummaryOriginalPrice, isRTL && styles.textRTL]}>
                      {formatAed(retailLine)}
                    </Text>
                    <Text style={styles.orderSummaryDiscountPill}>
                      -{Math.round(bundlePct)}%
                    </Text>
                    <Text style={[styles.orderSummaryDiscountedPrice, isRTL && styles.textRTL]}>
                      {formatAed(finalLine)}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <Text key={`${it.product?.id || name}-${idx}`} style={[styles.orderSummaryLine, isRTL && styles.textRTL]}>
                {qty}× {name}
                {extras ? ` - ${extras}` : ''} - {formatAed(finalLine)}
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
                    {size ? ` - ${size}` : ''} - {t('common.free')}
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
            /* No discounts - simple subtotal row */
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
              <Ionicons name="checkmark-circle" size={14} color={colors.ok} style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
              <Text style={[styles.freeShippingText, isRTL && styles.textRTL]}>
                {t('checkout.freeShippingApplied')}
              </Text>
            </View>
          )}

          {/* GENOSYS Rewards redemption toggle */}
          {loyalty ? (
            <TouchableOpacity
              style={[styles.orderTotalsRow, isRTL && styles.orderTotalsRowRTL]}
              onPress={loyalty.onToggle}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!loyalty.enabled }}
              accessibilityLabel={t('rewards.useMyPoints')}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Ionicons
                  name={loyalty.enabled ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={loyalty.enabled ? colors.blue : colors.tertiary}
                />
                <Text style={[styles.orderTotalsLabel, { color: colors.blue }, isRTL && styles.textRTL]}>
                  ★ {t('rewards.useMyPoints')} ({Number(loyalty.points).toLocaleString()} {t('rewards.points')})
                </Text>
              </View>
              <Text style={[styles.orderTotalsValue, { color: loyalty.enabled ? colors.blue : colors.tertiary }, isRTL && styles.summaryValueRTL]}>
                -AED {Number(loyalty.aed).toFixed(2)}
              </Text>
            </TouchableOpacity>
          ) : null}

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

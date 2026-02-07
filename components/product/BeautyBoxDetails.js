import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription } from '../../utils/productLocalization';
import { asText } from '../../utils/productDetailUtils';
import { parseBeautyBoxDescription } from '../../utils/beautyBoxDescription';

/**
 * Map of normalised product-name fragments → product IDs.
 * Used to make kit-item headers tappable links to individual product pages.
 */
const PRODUCT_NAME_MAP = [
  // Cleansers
  { pattern: /snow\s*o2|snow\s*o₂|snow.*cleanser/i, id: 10 },
  { pattern: /makeup\s*remover|skin\s*defender.*lip/i, id: 11 },
  // Peeling
  { pattern: /peeling\s*gel|epi\s*turnover/i, id: 12 },
  { pattern: /peeling\s*system|skin\s*renewal\s*peeling/i, id: 13 },
  // Toners / Mists
  { pattern: /microbiome.*mist|energy\s*infusing\s*mist/i, id: 14 },
  { pattern: /problem\s*control\s*toner/i, id: 15 },
  { pattern: /snow\s*booster/i, id: 16 },
  // Serums
  { pattern: /eye.*contour\s*serum|eyecell.*serum/i, id: 17 },
  { pattern: /hyaluron\s*serum|moisture.*hyaluron.*serum/i, id: 18 },
  { pattern: /sensitive\s*serum|all\s*for\s*sensitive/i, id: 19 },
  { pattern: /problem\s*control\s*serum/i, id: 20 },
  { pattern: /radiance\s*serum|multi\s*vita.*serum/i, id: 21 },
  { pattern: /anti.wrinkle\s*serum|multi\s*functional.*serum/i, id: 22 },
  // Creams
  { pattern: /nd\s*cell|anti.wrinkle\s*cream/i, id: 23 },
  { pattern: /eye.*contour\s*cream|eyecell.*cream/i, id: 24 },
  { pattern: /postcream|soothing\s*repair\s*post/i, id: 25 },
  { pattern: /oxymask|egf\s*repair/i, id: 26 },
  { pattern: /barrier\s*protect.*cream|skin\s*barrier/i, id: 27 },
  { pattern: /hydro\s*soothing\s*cream|intensive\s*hydro/i, id: 28 },
  { pattern: /hyaluron\s*cream|moisture.*hyaluron.*cream/i, id: 29 },
  { pattern: /problem\s*control\s*cream/i, id: 30 },
  { pattern: /radiance\s*cream|multi\s*vita.*cream/i, id: 31 },
  { pattern: /anti.wrinkle\s*cream|multi\s*functional.*cream/i, id: 32 },
  // Masks
  { pattern: /eye.*peptide\s*gel\s*patch|eyecell.*patch/i, id: 33 },
  { pattern: /overnight.*mask|skin\s*rescue/i, id: 34 },
  { pattern: /hydro\s*cool|modeling\s*mask/i, id: 35 },
  { pattern: /sea\s*algae|soothing\s*bomb/i, id: 36 },
  { pattern: /peptide\s*gel\s*mask/i, id: 37 },
  { pattern: /co2\s*mask|ez\s*co/i, id: 38 },
  { pattern: /bio.ferment.*mask|powder\s*mask/i, id: 51 },
  { pattern: /pdrn\s*mask|skin\s*reboot/i, id: 52 },
  // Sun Protection
  { pattern: /ultra\s*shield|spf\s*50/i, id: 39 },
  { pattern: /multi\s*sun|spf\s*40/i, id: 40 },
  { pattern: /blemish\s*balm\s*cushion|cushion.*spf/i, id: 41 },
  { pattern: /blemish\s*balm\s*cream|bb\s*cream.*spf/i, id: 42 },
  // Neck
  { pattern: /neck\s*lift/i, id: 10 }, // placeholder — update if neck cream gets its own ID
];

/** Try to match a kit-item header text to a product ID */
function matchProductId(headerText) {
  const text = asText(headerText);
  for (const entry of PRODUCT_NAME_MAP) {
    if (entry.pattern.test(text)) return entry.id;
  }
  return null;
}

export default function BeautyBoxDetails({ product, styles: parentStyles }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  if (!product) return null;

  const rtlText = isRTL ? (parentStyles?.textRTL || { textAlign: 'right', writingDirection: 'rtl' }) : null;
  const rtlRow = isRTL ? { flexDirection: 'row-reverse' } : null;
  const rtlAlignEnd = isRTL ? { alignItems: 'flex-end' } : null;

  const localizedDescription = getLocalizedProductDescription(product, locale) || product.description;
  const shouldParse = String(locale || 'en').toLowerCase().startsWith('en');
  const parsed = shouldParse ? parseBeautyBoxDescription(product.description) : null;
  const safeParsed = parsed || { description: '', pricingLine: '', title: '', items: [] };

  const handleProductPress = (productId) => {
    router.push({ pathname: '/product/[id]', params: { id: String(productId) } });
  };

  return (
    <View style={parentStyles.section}>
      <Text style={[parentStyles.sectionTitle, rtlText]}>{t('product.productDescription')}</Text>
      <View style={parentStyles.descriptionContainer}>
        <Text style={[parentStyles.description, rtlText]}>{safeParsed.description || asText(localizedDescription)}</Text>
      </View>

      {safeParsed.pricingLine ? (
        <View style={parentStyles.beautyBoxPriceLineWrap}>
          <Text style={[parentStyles.beautyBoxPriceLine, rtlText]}>{safeParsed.pricingLine}</Text>
        </View>
      ) : null}

      {Array.isArray(safeParsed.items) && safeParsed.items.length > 0 ? (
        <>
          {/* Show this block only when we actually have parsed kit items (EN parsing). */}
          <View style={[parentStyles.beautyBoxTitleRow, rtlRow]}>
            <Text style={parentStyles.beautyBoxTitleHeart}>❤️</Text>
            <Text style={[parentStyles.beautyBoxTitleText, rtlText]}>
              {`Beauty Box: ${(safeParsed.title || asText(getLocalizedProductName(product, locale) || product.name).replace(/beauty box/i, '').trim())}`}
            </Text>
          </View>

          <Text style={[parentStyles.beautyBoxKitTitle, rtlText]}>{t('product.kitIncludes')}</Text>

          <View style={parentStyles.beautyBoxKitList}>
            {safeParsed.items.map((it) => {
              const linkedId = matchProductId(it.header);
              return (
                <View key={`${it.index}-${it.header}`} style={[parentStyles.beautyBoxKitItem, rtlAlignEnd]}>
                  {linkedId ? (
                    <TouchableOpacity
                      onPress={() => handleProductPress(linkedId)}
                      activeOpacity={0.7}
                      style={[localStyles.kitHeaderLink, isRTL && localStyles.kitHeaderLinkRTL]}
                    >
                      <Text style={[parentStyles.beautyBoxKitHeader, localStyles.kitHeaderLinkText, rtlText]}>
                        {`${it.index}. ${asText(it.header)}`}
                      </Text>
                      <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={16}
                        color="#dc2626"
                        style={localStyles.kitHeaderChevron}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Text style={[parentStyles.beautyBoxKitHeader, rtlText]}>{`${it.index}. ${asText(it.header)}`}</Text>
                  )}
                  {it.body ? <Text style={[parentStyles.beautyBoxKitBody, rtlText]}>{it.body}</Text> : null}
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const localStyles = StyleSheet.create({
  kitHeaderLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kitHeaderLinkRTL: {
    flexDirection: 'row-reverse',
  },
  kitHeaderLinkText: {
    color: '#dc2626',
    flex: 1,
  },
  kitHeaderChevron: {
    marginStart: 4,
  },
});




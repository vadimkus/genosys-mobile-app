import React from 'react';
import { View, Text } from 'react-native';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription } from '../../utils/productLocalization';
import { asText } from '../../utils/productDetailUtils';
import { parseBeautyBoxDescription } from '../../utils/beautyBoxDescription';

export default function BeautyBoxDetails({ product, styles }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  if (!product) return null;

  const rtlText = isRTL ? (styles?.textRTL || { textAlign: 'right', writingDirection: 'rtl' }) : null;
  const rtlRow = isRTL ? { flexDirection: 'row-reverse' } : null;
  const rtlAlignEnd = isRTL ? { alignItems: 'flex-end' } : null;

  const localizedDescription = getLocalizedProductDescription(product, locale) || product.description;
  const shouldParse = String(locale || 'en').toLowerCase().startsWith('en');
  const parsed = shouldParse ? parseBeautyBoxDescription(product.description) : null;
  const safeParsed = parsed || { description: '', pricingLine: '', title: '', items: [] };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, rtlText]}>{t('product.productDescription')}</Text>
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, rtlText]}>{safeParsed.description || asText(localizedDescription)}</Text>
      </View>

      {safeParsed.pricingLine ? (
        <View style={styles.beautyBoxPriceLineWrap}>
          <Text style={[styles.beautyBoxPriceLine, rtlText]}>{safeParsed.pricingLine}</Text>
        </View>
      ) : null}

      {Array.isArray(safeParsed.items) && safeParsed.items.length > 0 ? (
        <>
          {/* Show this block only when we actually have parsed kit items (EN parsing). */}
          <View style={[styles.beautyBoxTitleRow, rtlRow]}>
            <Text style={styles.beautyBoxTitleHeart}>❤️</Text>
            <Text style={[styles.beautyBoxTitleText, rtlText]}>
              {`Beauty Box: ${(safeParsed.title || asText(getLocalizedProductName(product, locale) || product.name).replace(/beauty box/i, '').trim())}`}
            </Text>
          </View>

          <Text style={[styles.beautyBoxKitTitle, rtlText]}>{t('product.kitIncludes')}</Text>

          <View style={styles.beautyBoxKitList}>
            {safeParsed.items.map((it) => (
              <View key={`${it.index}-${it.header}`} style={[styles.beautyBoxKitItem, rtlAlignEnd]}>
                <Text style={[styles.beautyBoxKitHeader, rtlText]}>{`${it.index}. ${asText(it.header)}`}</Text>
                {it.body ? <Text style={[styles.beautyBoxKitBody, rtlText]}>{it.body}</Text> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}




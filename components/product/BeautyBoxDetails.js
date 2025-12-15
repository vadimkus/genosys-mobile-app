import React from 'react';
import { View, Text } from 'react-native';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription } from '../../utils/productLocalization';
import { asText } from '../../utils/productDetailUtils';
import { parseBeautyBoxDescription } from '../../utils/beautyBoxDescription';

export default function BeautyBoxDetails({ product, styles }) {
  const { t, locale } = useLocalization();
  if (!product) return null;

  const localizedDescription = getLocalizedProductDescription(product, locale) || product.description;
  const shouldParse = String(locale || 'en').toLowerCase().startsWith('en');
  const parsed = shouldParse ? parseBeautyBoxDescription(product.description) : null;
  const safeParsed = parsed || { description: '', pricingLine: '', title: '', items: [] };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('product.productDescription')}</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{safeParsed.description || asText(localizedDescription)}</Text>
      </View>

      {safeParsed.pricingLine ? (
        <View style={styles.beautyBoxPriceLineWrap}>
          <Text style={styles.beautyBoxPriceLine}>{safeParsed.pricingLine}</Text>
        </View>
      ) : null}

      {Array.isArray(safeParsed.items) && safeParsed.items.length > 0 ? (
        <>
          {/* Show this block only when we actually have parsed kit items (EN parsing). */}
          <View style={styles.beautyBoxTitleRow}>
            <Text style={styles.beautyBoxTitleHeart}>❤️</Text>
            <Text style={styles.beautyBoxTitleText}>
              {`Beauty Box: ${(safeParsed.title || asText(getLocalizedProductName(product, locale) || product.name).replace(/beauty box/i, '').trim())}`}
            </Text>
          </View>

          <Text style={styles.beautyBoxKitTitle}>{t('product.kitIncludes')}</Text>

          <View style={styles.beautyBoxKitList}>
            {safeParsed.items.map((it) => (
              <View key={`${it.index}-${it.header}`} style={styles.beautyBoxKitItem}>
                <Text style={styles.beautyBoxKitHeader}>{`${it.index}. ${it.header}`}</Text>
                {it.body ? <Text style={styles.beautyBoxKitBody}>{it.body}</Text> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}



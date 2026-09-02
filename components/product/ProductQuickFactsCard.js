import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

const COPY = {
  en: { title: 'Quick facts', eyebrow: 'Product snapshot' },
  ru: { title: 'Кратко о продукте', eyebrow: 'Краткий обзор' },
  ar: { title: 'حقائق سريعة عن المنتج', eyebrow: 'نظرة سريعة' },
};

const ICONS = [
  'sparkles-outline',
  'cube-outline',
  'layers-outline',
  'moon-outline',
  'checkmark-circle-outline',
  'pricetag-outline',
];

function languageFor(locale) {
  const value = String(locale || 'en').toLowerCase();
  if (value.startsWith('ar')) return 'ar';
  if (value.startsWith('ru')) return 'ru';
  return 'en';
}

export default function ProductQuickFactsCard({ facts }) {
  const { locale, dir } = useLocalization();
  if (!Array.isArray(facts) || facts.length === 0) return null;

  const isRTL = dir === 'rtl';
  const copy = COPY[languageFor(locale)];

  return (
    <View style={[styles.card, shadow.card]} accessibilityLabel={copy.title}>
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={17} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.eyebrow, isRTL && styles.textRTL]}>{copy.eyebrow}</Text>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{copy.title}</Text>
        </View>
      </View>

      <View style={styles.factList}>
        {facts.map((fact, index) => (
          <View
            key={`${fact?.title || 'fact'}-${index}`}
            style={[styles.fact, isRTL && styles.rowRTL]}
          >
            <View style={styles.factIcon}>
              <Ionicons
                name={ICONS[index % ICONS.length]}
                size={17}
                color={colors.accent}
              />
            </View>
            <View style={styles.factCopy}>
              {fact?.title ? (
                <Text style={[styles.factTitle, isRTL && styles.textRTL]}>
                  {String(fact.title)}
                </Text>
              ) : null}
              <Text style={[styles.factText, isRTL && styles.textRTL]}>
                {String(fact?.text || '')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaces.card,
    padding: 20,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cta,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...T.eyebrow,
  },
  title: {
    ...T.body,
    marginTop: 1,
    color: colors.label,
    fontWeight: '800',
  },
  factList: {
    gap: 10,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.subtleBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  factIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBg,
    flexShrink: 0,
  },
  factCopy: {
    flex: 1,
    minWidth: 0,
  },
  factTitle: {
    ...T.label,
    color: colors.label,
    fontWeight: '800',
    lineHeight: 19,
  },
  factText: {
    ...T.bodySmall,
    marginTop: 2,
    color: colors.secondaryLabel,
    lineHeight: 19,
    flexShrink: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import T from '../utils/typography';
import { colors } from '../utils/theme';

/**
 * The opening block of an information page: a title, and a line saying what the page is
 * for.
 *
 * Nine pages had written this out by hand and drifted apart. The padding came in four
 * combinations, the title was `pageTitle` on seven pages and the smaller `sectionTitle` on
 * brand, and the subtitle was `body` on two pages and `subtitle` on three. Opening two of
 * them in a row, they did not look like the same app.
 *
 * The ornament went with it. About, brand and contact each opened with the GENOSYS logo,
 * which repeated on every page what the header already said and pushed the actual content
 * below the fold; locations opened with a flag emoji, partners and training with an icon
 * tile. The help page — the one everything else is being brought in line with — has none
 * of that, and reads better for it.
 *
 * Geometry is the help page's.
 */
export default function PageHero({ title, subtitle, isRTL = false, children }) {
  return (
    <View style={styles.hero}>
      <Text style={[styles.title, isRTL && styles.rtl]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, isRTL && styles.rtl]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    ...T.pageTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...T.body,
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  rtl: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});

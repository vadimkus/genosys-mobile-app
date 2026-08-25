import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

export default function EmirateFlagIcon({ name }) {
  const emirate = String(name || '').trim();

  // UAE national flag (used for Fujairah per requirement)
  const UAE = () => (
    <View style={flagStyles.flagBox}>
      <View style={flagStyles.uaeRed} />
      <View style={flagStyles.uaeRight}>
        <View style={[flagStyles.uaeStripe, { backgroundColor: colors.flagGreen }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: colors.card }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: colors.label }]} />
      </View>
    </View>
  );

  // Abu Dhabi: red field with a small white canton in the upper hoist corner
  const AbuDhabi = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: colors.flagRed }]}>
      <View style={flagStyles.abuDhabiCanton} />
    </View>
  );

  // Dubai / Ajman: red field with a vertical white stripe at the hoist
  const DubaiAjman = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: colors.flagRed }]}>
      <View style={flagStyles.hoistWhiteStripe} />
    </View>
  );

  // Sharjah / Ras Al Khaimah: red rectangle on a white field
  const SharjahRas = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: colors.card }]}>
      <View style={flagStyles.centerRedRect} />
    </View>
  );

  // Umm Al Quwain: red field with a vertical white stripe at hoist and a white crescent + star
  const UmmAlQuwain = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: colors.flagRed }]}>
      <View style={flagStyles.hoistWhiteStripe} />
      {/* Crescent (approx) */}
      <View style={flagStyles.uaqCrescentOuter} />
      <View style={flagStyles.uaqCrescentInner} />
      {/* Star */}
      <Text style={flagStyles.uaqStar}>★</Text>
    </View>
  );

  if (emirate === 'Fujairah') return <UAE />;
  if (emirate === 'Abu Dhabi') return <AbuDhabi />;
  if (emirate === 'Dubai' || emirate === 'Ajman') return <DubaiAjman />;
  if (emirate === 'Sharjah' || emirate === 'Ras Al Khaimah') return <SharjahRas />;
  if (emirate === 'Umm Al Quwain') return <UmmAlQuwain />;

  return <UAE />;
}

const flagStyles = StyleSheet.create({
  flagBox: {
    width: 26,
    height: 18,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.separator,
    backgroundColor: colors.card,
    position: 'relative',
  },

  // UAE
  uaeRed: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '24%',
    backgroundColor: colors.flagRed,
  },
  uaeRight: {
    position: 'absolute',
    left: '24%',
    top: 0,
    bottom: 0,
    right: 0,
  },
  uaeStripe: {
    flex: 1,
  },

  // Abu Dhabi
  abuDhabiCanton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40%',
    height: '45%',
    backgroundColor: colors.card,
  },

  // Dubai / Ajman / UAQ hoist stripe
  hoistWhiteStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: colors.card,
  },

  // Sharjah / Ras Al Khaimah
  centerRedRect: {
    position: 'absolute',
    left: '16%',
    top: '18%',
    width: '68%',
    height: '64%',
    backgroundColor: colors.flagRed,
  },

  // Umm Al Quwain (approx crescent + star)
  uaqCrescentOuter: {
    position: 'absolute',
    left: '46%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.card,
  },
  uaqCrescentInner: {
    position: 'absolute',
    left: '50%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.flagRed,
  },
  uaqStar: {
    position: 'absolute',
    left: '58%',
    top: '28%',
    fontSize: 8,
    color: colors.white,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
});







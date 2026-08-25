import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import PrivacyPolicyContent from '../../components/PrivacyPolicyContent';
import * as haptics from '../../utils/haptics';
import { colors } from '../../utils/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { scrollY, onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      {/* PrivacyPolicyContent owns its own (now Animated) ScrollView; we pass it our
          scroll handler + top inset so the header fades in on scroll like every other screen. */}
      <CollapsibleHeader translateY={headerTranslateY} title={t('privacy.title')} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <PrivacyPolicyContent showLastUpdated onScroll={onScroll} contentTopInset={headerHeight} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  body: {
    flex: 1,
  },
});

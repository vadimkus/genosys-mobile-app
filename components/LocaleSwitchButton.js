import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSettings } from '../services/databaseService';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow } from '../utils/theme';

/**
 * Compact language control for content screens.
 *
 * Changing language used to mean leaving whatever you were reading, walking to
 * Profile > Language, switching, and finding your way back. On a product page
 * or an article — the two screens where language actually matters, because they
 * are the ones carrying translated copy — that is enough friction that most
 * people never discover the translations exist.
 *
 * English and Russian apply in place: both screens list `locale` in the effect
 * that fetches their content, so the copy is refetched from the API and swaps
 * under the reader without losing their position.
 *
 * Arabic is different. `I18nManager.forceRTL` only takes effect before the
 * React tree mounts, so switching into or out of Arabic restarts the app and
 * drops the reader on the home screen. That is a platform constraint, not a
 * choice, so we warn first and let them decline rather than yanking the screen
 * away unannounced.
 */

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

export default function LocaleSwitchButton({ style }) {
  const { locale, dir, t, setLocale } = useLocalization();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isRTL = dir === 'rtl';
  const token = user?.token || user?.accessToken || '';

  const applyLocale = async (next) => {
    setBusy(true);
    try {
      await setLocale(next);
      if (token) {
        await updateUserSettings(token, { language: next }).catch(() => null);
      }
    } finally {
      setBusy(false);
    }
  };

  const select = (next) => {
    haptics.selectionTick();
    setOpen(false);
    if (next === locale) return;

    const flipsDirection = (locale === 'ar') !== (next === 'ar');
    if (!flipsDirection) {
      applyLocale(next);
      return;
    }

    Alert.alert(
      t('profile.restartRequiredTitle'),
      t('profile.restartRequiredMessage'),
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        { text: t('common.ok') || 'OK', onPress: () => applyLocale(next) },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => {
          haptics.lightTap();
          setOpen(true);
        }}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={t('profile.language')}
      >
        <Ionicons name="globe-outline" size={15} color={colors.label} />
        <Text style={styles.triggerText}>{String(locale).toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stop taps inside the sheet from closing it. */}
          <Pressable
            style={[styles.sheet, { paddingBottom: (insets?.bottom || 0) + 12 }]}
            onPress={() => {}}
          >
            <View style={styles.grabber} />
            <Text style={[styles.sheetTitle, isRTL && styles.textRTL]}>
              {t('profile.selectLanguage')}
            </Text>

            {LANGUAGES.map((lang, idx) => {
              const active = lang.code === locale;
              return (
                <View key={lang.code}>
                  {idx > 0 ? <View style={styles.hairline} /> : null}
                  <TouchableOpacity
                    style={[styles.row, isRTL && styles.rowRTL]}
                    onPress={() => select(lang.code)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.rowLabel,
                        active && styles.rowLabelActive,
                        isRTL && styles.textRTL,
                      ]}
                    >
                      {lang.native}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={20} color={colors.blue} />
                    ) : (
                      <View style={styles.checkPlaceholder} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...shadow.card,
  },
  triggerText: {
    ...T.captionSmall,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.label,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.separator,
    marginBottom: 12,
  },
  sheetTitle: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  rowLabel: { ...T.label, fontSize: 16, flex: 1, color: colors.label },
  rowLabelActive: { fontWeight: '600', color: colors.blue },
  checkPlaceholder: { width: 20 },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});

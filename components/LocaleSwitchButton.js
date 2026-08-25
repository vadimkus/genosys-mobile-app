import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSettings } from '../services/databaseService';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, tint } from '../utils/theme';

/**
 * Compact language control for content screens.
 *
 * Changing language used to mean leaving whatever you were reading, walking to
 * Profile > Language, switching, and finding your way back. On a product page
 * or an article — the two screens where language actually matters, because they
 * are the ones carrying translated copy — that is enough friction that most
 * people never discover the translations exist.
 *
 * Presentation deliberately mirrors the language control in the home header
 * (`app/(tabs)/shop.js`): the same green locale code with a chevron, and the
 * same small anchored dropdown. A language switcher that looks like one thing
 * on the home screen and a full-height sheet on a product page reads as two
 * different features.
 *
 * English and Russian apply in place: both screens list `locale` in the effect
 * that fetches their content, so the copy is refetched from the API and swaps
 * under the reader without losing their position. Arabic restarts the app,
 * because `I18nManager.forceRTL` only takes effect before the React tree
 * mounts. That is a platform constraint, and the home control handles it the
 * same way: switch, let the restart happen.
 */

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'ru', native: 'Русский' },
  { code: 'ar', native: 'العربية' },
];

// Fixed rather than `minWidth`, so the dropdown can be aligned to an edge of
// the trigger without measuring the menu itself after layout.
const MENU_WIDTH = 150;
const SCREEN_EDGE = 12;

export default function LocaleSwitchButton({ style }) {
  const { locale, dir, t, setLocale } = useLocalization();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const isRTL = dir === 'rtl';
  const token = user?.token || user?.accessToken || '';

  // This component is dropped into several different headers, so the dropdown
  // cannot assume a position the way the home header can. Measure the trigger
  // and hang the menu off it.
  const openMenu = () => {
    haptics.lightTap();
    const node = triggerRef.current;
    if (node?.measureInWindow) {
      node.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setOpen(true);
      });
      return;
    }
    setAnchor(null);
    setOpen(true);
  };

  const select = async (next) => {
    haptics.selectionTick();
    setOpen(false);
    if (next === locale) return;

    setBusy(true);
    try {
      await setLocale(next);
      if (token) {
        await updateUserSettings(token, { language: next }).catch(() => null);
      }
    } finally {
      // Switching to or from Arabic reloads the app, which tears this down
      // anyway; the timeout only matters for the in-place swaps.
      setTimeout(() => setBusy(false), 150);
    }
  };

  const menuTop = anchor ? anchor.y + anchor.height + 6 : 64;
  const rawLeft = anchor
    ? isRTL
      ? anchor.x
      : anchor.x + anchor.width - MENU_WIDTH
    : screenWidth - MENU_WIDTH - SCREEN_EDGE;
  const menuLeft = Math.max(
    SCREEN_EDGE,
    Math.min(rawLeft, screenWidth - MENU_WIDTH - SCREEN_EDGE)
  );

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={[styles.trigger, style]}
        onPress={openMenu}
        disabled={busy}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('common.switchLanguage')}
      >
        <Text style={styles.triggerText}>{String(locale).toUpperCase()}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.greenDeep}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { top: menuTop, left: menuLeft }]}>
            {LANGUAGES.map((lang) => {
              const active = lang.code === locale;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => select(lang.code)}
                  activeOpacity={0.85}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      isRTL && styles.menuItemTextRtl,
                      active && styles.menuItemTextActive,
                    ]}
                  >
                    {lang.native}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  triggerText: {
    ...T.captionSmall,
    fontWeight: '800',
    color: colors.greenDeep, // matches home header and website
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemActive: {
    backgroundColor: colors.accentBg,
  },
  menuItemText: {
    ...T.label,
    color: colors.label,
  },
  menuItemTextRtl: {
    textAlign: 'right',
  },
  menuItemTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
});

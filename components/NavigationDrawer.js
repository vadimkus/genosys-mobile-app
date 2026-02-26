/**
 * NavigationDrawer - Hamburger menu overlay matching mobile web design
 * Slide-down modal with 2-column navigation grid
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { buildAuthenticatedWebViewUrl } from '../utils/webViewAuth';
import * as haptics from '../utils/haptics';

export default function NavigationDrawer({ visible, onClose, headerHeight = 56 }) {
  const { user, logout } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const favCount = getFavoritesCount();

  const navigateTo = (path) => {
    onClose();
    // Small delay so modal closes before navigation
    setTimeout(() => router.push(path), 120);
  };

  const navigateWebView = (urlPath, title) => {
    onClose();
    const url = buildAuthenticatedWebViewUrl(urlPath, locale, user);
    setTimeout(() => {
      router.push({
        pathname: '/webview',
        params: { url, title: title || '' },
      });
    }, 120);
  };

  const handleLogout = () => {
    onClose();
    logout?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={() => { haptics.lightTap(); onClose(); }}>
        <View />
      </Pressable>

      {/* Menu Content - positioned below header */}
      <View style={[styles.menuContainer, { top: headerHeight }]}>
        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ─── Primary Navigation (core app screens) ─── */}
          <View style={[styles.grid, isRTL && styles.gridRTL]}>
            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/(tabs)/shop'); }} activeOpacity={0.7}>
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.products') || 'Products'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/(tabs)/orders'); }} activeOpacity={0.7}>
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.orders') || 'Orders'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/favorites'); }} activeOpacity={0.7}>
              <View style={styles.badgeRow}>
                <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                  {t('navigation.favorites') || 'Favorites'}
                </Text>
                {favCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/profile'); }} activeOpacity={0.7}>
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.profile') || 'Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Highlight actions (full-width, prominent) ─── */}
          <View style={[styles.highlightRow, isRTL && styles.gridRTL]}>
            <TouchableOpacity
              style={styles.highlightBtn}
              onPress={() => { haptics.lightTap(); navigateTo('/bundle-builder'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.highlightBtnText}>🎁 {t('navigation.bundleBuilder') || 'Bundle Builder'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.highlightBtn}
              onPress={() => { haptics.lightTap(); navigateTo('/skin-analysis'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.highlightBtnText}>✨ {t('navigation.aiSkinAnalysis') || 'AI Skin Analysis'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.highlightRow, isRTL && styles.gridRTL]}>
            <TouchableOpacity
              style={styles.highlightBtn}
              onPress={() => { haptics.lightTap(); navigateTo('/skin-concerns'); }}
              activeOpacity={0.7}
            >
              <Text style={styles.highlightBtnText}>🌿 {t('categories.skinConcern') || 'Skin Concern'}</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Divider ─── */}
          <View style={styles.divider} />

          {/* ─── Info & Pages (2-column grid, even pairs) ─── */}
          <View style={[styles.grid, isRTL && styles.gridRTL]}>
            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/about'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.about') || 'About'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/brand'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.brand') || 'Brand'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/delivery'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.delivery') || 'Delivery'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/contact'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.contact') || 'Contact'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/faq'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.faq') || 'FAQ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/locations'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.locations') || 'Locations'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/blog'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.blog') || 'Blog'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/partners'); }} activeOpacity={0.7}>
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.partners') || 'Partners'}
              </Text>
            </TouchableOpacity>

            {user ? (
              <TouchableOpacity style={styles.gridItem} onPress={() => { haptics.lightTap(); navigateTo('/training'); }} activeOpacity={0.7}>
                <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                  {t('navigation.training') || 'Training'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ─── Divider ─── */}
          <View style={styles.divider} />

          {/* ─── Login / Logout ─── */}
          {user ? (
            <TouchableOpacity style={styles.authButton} onPress={() => { haptics.lightTap(); handleLogout(); }} activeOpacity={0.7}>
              <View style={[styles.authRow, isRTL && styles.authRowRTL]}>
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                <Text style={styles.logoutText}>{t('common.logout') || 'Sign Out'}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.authButton} onPress={() => { haptics.lightTap(); navigateTo('/auth/login'); }} activeOpacity={0.7}>
              <View style={[styles.authRow, isRTL && styles.authRowRTL]}>
                <Ionicons name="log-in-outline" size={18} color="#dc2626" />
                <Text style={styles.logoutText}>{t('common.login') || 'Login'}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  /* ── 2-column grid ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridRTL: {
    flexDirection: 'row-reverse',
  },
  gridItem: {
    width: '50%',
    paddingVertical: 11,
  },
  /* ── Primary links (bold) ── */
  primaryLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.1,
  },
  /* ── Secondary links (regular) ── */
  secondaryLink: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  /* ── Highlight row (full-width cards) ── */
  highlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  highlightBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  highlightBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: -0.1,
  },
  /* ── Badge ── */
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: '#dc2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 14,
  },
  /* ── Dividers ── */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  /* ── Auth (login/logout) ── */
  authButton: {
    paddingVertical: 10,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authRowRTL: {
    flexDirection: 'row-reverse',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  textRTL: {
    textAlign: 'right',
  },
});

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
    const baseUrl = 'https://genosys.ae';
    const prefix = locale === 'ar' ? '/ar' : locale === 'ru' ? '/ru' : '';
    const url = `${baseUrl}${prefix}${urlPath}`;
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
      <Pressable style={styles.backdrop} onPress={onClose}>
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
          {/* Primary Navigation */}
          <View style={[styles.grid, isRTL && styles.gridRTL]}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/(tabs)/shop')}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.products') || 'Products'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/bundle-builder', t('navigation.bundleBuilder') || 'Bundle Builder')}
              activeOpacity={0.7}
            >
              <Text style={[styles.highlightLink, isRTL && styles.textRTL]}>
                🎁 {t('navigation.bundleBuilder') || 'Bundle Builder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/(tabs)/orders')}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.orders') || 'Orders'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/favorites')}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.favorites') || 'Favorites'}
                {favCount > 0 ? (
                  <Text style={styles.badge}> {favCount}</Text>
                ) : null}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/profile')}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryLink, isRTL && styles.textRTL]}>
                {t('navigation.profile') || 'Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Secondary Navigation */}
          <View style={[styles.grid, isRTL && styles.gridRTL]}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/profile/about')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.about') || 'About'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/brand', t('navigation.brand') || 'Brand')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.brand') || 'Brand'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/delivery', t('navigation.delivery') || 'Delivery')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.delivery') || 'Delivery'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/profile/contact')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.contact') || 'Contact'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/faq', t('navigation.faq') || 'FAQ')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.faq') || 'FAQ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/locations', t('navigation.locations') || 'Locations')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.locations') || 'Locations'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/blog', t('navigation.blog') || 'Blog')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.blog') || 'Blog'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/partners', t('navigation.partners') || 'Partners')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                {t('navigation.partners') || 'Partners'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateWebView('/certificates', t('navigation.certificates') || 'Gift Certificates')}
              activeOpacity={0.7}
            >
              <Text style={[styles.highlightLink, isRTL && styles.textRTL]}>
                🎫 {t('navigation.certificates') || 'Gift Certificates'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigateTo('/skin-analysis')}
              activeOpacity={0.7}
            >
              <Text style={[styles.highlightLink, isRTL && styles.textRTL]}>
                {t('navigation.aiSkinAnalysis') || 'AI Skin Analysis'}
              </Text>
            </TouchableOpacity>

            {user ? (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => navigateWebView('/training', t('navigation.training') || 'Training')}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryLink, isRTL && styles.textRTL]}>
                  {t('navigation.training') || 'Training'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Login/Logout */}
          {user ? (
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.logoutText, isRTL && styles.textRTL]}>
                {t('common.logout') || 'Sign Out'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => navigateTo('/auth/login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.highlightLink, isRTL && styles.textRTL]}>
                {t('common.login') || 'Login'}
              </Text>
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
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridRTL: {
    flexDirection: 'row-reverse',
  },
  gridItem: {
    width: '50%',
    paddingVertical: 10,
  },
  primaryLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  secondaryLink: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  highlightLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  authButton: {
    paddingVertical: 10,
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

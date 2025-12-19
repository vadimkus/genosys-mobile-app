import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useCart } from '../../contexts/CartContext';
import { useLocalization } from '../../contexts/LocalizationContext';

function TabBarBadge({ count, color }) {
  if (!count || count === 0) return null;
  
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { t } = useLocalization();
  const isExpoGo = Constants.appOwnership === 'expo';

  // Lazy-load SF Symbols module so Expo Go doesn't try to import a native module it doesn't have.
  const canUseSFSymbols = Platform.OS === 'ios' && !isExpoGo;
  const [SFSymbolComponent, setSFSymbolComponent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!canUseSFSymbols) return;

    (async () => {
      try {
        const mod = await import('react-native-sfsymbols');
        if (!cancelled) setSFSymbolComponent(() => mod?.SFSymbol || null);
      } catch {
        // If module isn't available, silently fall back to Ionicons.
        if (!cancelled) setSFSymbolComponent(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canUseSFSymbols]);

  const TabIcon = useMemo(
    () =>
      ({ iosName, androidActiveName, androidInactiveName, color, size, focused }) => {
        if (canUseSFSymbols && SFSymbolComponent) {
          const name = focused ? `${iosName}.fill` : iosName;
          const SFSymbol = SFSymbolComponent;
          return (
            <SFSymbol
              name={name}
              color={color}
              size={size}
              weight="semibold"
              scale="medium"
              style={{ width: size, height: size }}
            />
          );
        }
        return <Ionicons name={focused ? androidActiveName : androidInactiveName} size={size} color={color} />;
      },
    [SFSymbolComponent, canUseSFSymbols]
  );

  return (
    <Tabs
      initialRouteName="shop"
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === 'ios' ? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          height: 88,
          paddingTop: 8,
          paddingBottom: 34, // Safe area for home indicator
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        } : styles.androidTabBar,
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="shop"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              iosName="house"
              androidActiveName="home"
              androidInactiveName="home-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              iosName="receipt"
              androidActiveName="receipt"
              androidInactiveName="receipt-outline"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: t('tabs.bag'),
          tabBarStyle: { display: 'none' }, // Hide tab bar on bag page
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <TabIcon
                iosName="bag"
                androidActiveName="bag-handle"
                androidInactiveName="bag-handle-outline"
                color={color}
                size={size}
                focused={focused}
              />
              <TabBarBadge count={cartCount} color="#dc2626" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  androidTabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    height: 60,
    paddingBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

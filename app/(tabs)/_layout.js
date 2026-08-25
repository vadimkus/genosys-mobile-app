import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors } from '../../utils/theme';

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
  const { ordersCount } = useOrders();
  const cartCount = getTotalItems();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const androidBottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 0) : 0;

  // Always use Ionicons for tab icons.
  // This avoids device/build-specific SF Symbols rendering issues that can appear as "triangles".
  const TabIcon = useMemo(
    () =>
      ({ androidActiveName, androidInactiveName, color, size, focused }) => {
        return <Ionicons name={focused ? androidActiveName : androidInactiveName} size={size} color={color} />;
      },
    []
  );

  return (
    <Tabs
      initialRouteName="shop"
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          Platform.OS === 'ios'
            ? {
                position: 'absolute',
                bottom: 0,
                start: 0,
                end: 0,
                elevation: 0,
                // Cream rather than white, so the bar reads as the same sheet
                // of paper as the page above it. The old white sat as a panel
                // on top and the drop shadow underlined that; the website
                // separates with a hairline and nothing else.
                backgroundColor: 'rgba(250, 247, 245, 0.94)',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.separator,
                height: 88,
                paddingTop: 8,
                paddingBottom: 34, // Safe area for home indicator
              }
            : styles.androidTabBar,
          Platform.OS === 'android' && {
            height: 60 + androidBottomInset,
            paddingBottom: 8 + androidBottomInset,
          },
          isRTL && { flexDirection: 'row-reverse' },
        ],
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryLabel,
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
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
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
          tabBarLabel: t('tabs.orders'),
          tabBarIcon: ({ color, size, focused }) => {
            // Change orders icon color to green when there are orders
            const ordersColor = ordersCount > 0 ? '#10b981' : color; // green-500 when orders exist
            return (
              <View>
                <TabIcon
                  androidActiveName="list"
                  androidInactiveName="list-outline"
                  color={ordersColor}
                  size={size}
                  focused={focused}
                />
                <TabBarBadge count={ordersCount} color={colors.accent} />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: t('tabs.bag'),
          tabBarLabel: t('tabs.bag'),
          // Keep the tab bar visible on the EMPTY bag so there's always a way to
          // navigate; only hide it once there are items (the sticky checkout bar
          // takes over for a focused, full-screen checkout).
          ...(cartCount > 0 ? { tabBarStyle: { display: 'none' } } : {}),
          tabBarIcon: ({ color, size, focused }) => {
            // Change bag icon color to green when cart has items
            const bagColor = cartCount > 0 ? '#10b981' : color; // green-500 when cart has items
            return (
              <View>
                <TabIcon
                  androidActiveName="bag"
                  androidInactiveName="bag-outline"
                  color={bagColor}
                  size={size}
                  focused={focused}
                />
                <TabBarBadge count={cartCount} color={colors.accent} />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  androidTabBar: {
    backgroundColor: colors.groupedBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    height: 60,
    paddingBottom: 8,
    // Flat, like the iOS bar above and like the website. Android's elevation
    // would otherwise paint a shadow the hairline is meant to replace.
    elevation: 0,
  },
  badge: {
    position: 'absolute',
    top: -6,
    end: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});

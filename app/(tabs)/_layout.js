import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors, shadow } from '../../utils/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_INSET } from '../../utils/tabBar';

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
        // A floating bar rather than a docked one: inset from all three edges,
        // rounded and on its own shadow, so it is the same kind of object as
        // the header at the top of the page. Content passes underneath it, and
        // the screens leave room for it via `tabBarSpace`.
        tabBarStyle: [
          styles.floatingTabBar,
          {
            bottom: insets.bottom || TAB_BAR_INSET,
            height: TAB_BAR_HEIGHT,
          },
          isRTL && { flexDirection: 'row-reverse' },
        ],
        tabBarItemStyle: styles.tabBarItem,
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
            const ordersColor = ordersCount > 0 ? colors.green : color; // green-500 when orders exist
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
            const bagColor = cartCount > 0 ? colors.green : color; // green-500 when cart has items
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
  floatingTabBar: {
    position: 'absolute',
    start: TAB_BAR_INSET,
    end: TAB_BAR_INSET,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: colors.card,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderTopWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
  },
  // The docked bar could rely on its own height for centring; a shorter
  // floating one needs the icon and label to sit as one block.
  tabBarItem: {
    paddingTop: 0,
    paddingBottom: 0,
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

import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

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
        tabBarActiveTintColor: '#E74C3C',
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="bag" size={size} color={color} />
              <TabBarBadge count={cartCount} color="#E74C3C" />
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

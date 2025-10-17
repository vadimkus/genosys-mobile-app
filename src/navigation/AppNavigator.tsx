import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { useCart } from '../contexts/CartContext';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import CartScreen from '../screens/main/CartScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import AddressesScreen from '../screens/main/AddressesScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import TrainingMaterialsScreen from '../screens/main/TrainingMaterialsScreen';
import AdvancedFeaturesScreen from '../screens/main/AdvancedFeaturesScreen';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MainTabs: { screen?: string; params?: any };
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderDetail: { orderId: string };
  Orders: undefined;
  Addresses: undefined;
  Wishlist: undefined;
  Settings: undefined;
  EditProfile: undefined;
  TrainingMaterials: undefined;
  AdvancedFeatures: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Training: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <AuthStack.Screen name='Login' component={LoginScreen} />
      <AuthStack.Screen name='Register' component={RegisterScreen} />
      <AuthStack.Screen
        name='ForgotPassword'
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

// Main Stack Navigator for screens that need navigation
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name='MainTabs' component={MainTabNavigator} />
      <Stack.Screen name='ProductDetail' component={ProductDetailScreen} />
      <Stack.Screen name='Checkout' component={CheckoutScreen} />
      <Stack.Screen name='OrderDetail' component={OrderDetailScreen} />
      <Stack.Screen name='Orders' component={OrdersScreen} />
      <Stack.Screen name='Addresses' component={AddressesScreen} />
      <Stack.Screen name='Wishlist' component={WishlistScreen} />
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='EditProfile' component={EditProfileScreen} />
      <Stack.Screen
        name='TrainingMaterials'
        component={TrainingMaterialsScreen}
      />
      <Stack.Screen
        name='AdvancedFeatures'
        component={AdvancedFeaturesScreen}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Training') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          if (route.name === 'Cart' && cartItemCount > 0) {
            return (
              <View style={{ position: 'relative' }}>
                <Ionicons name={iconName} size={size} color={color} />
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: '#dc2626',
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name='Home'
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen
        name='Products'
        component={ProductsScreen}
        options={{ tabBarLabel: 'Products' }}
      />
      <MainTab.Screen
        name='Cart'
        component={CartScreen}
        options={{ tabBarLabel: 'Cart' }}
      />
      <MainTab.Screen
        name='Training'
        component={TrainingMaterialsScreen}
        options={{ tabBarLabel: 'Training' }}
      />
      <MainTab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <Text style={{ fontSize: 18, color: '#dc2626' }}>Loading...</Text>
    </View>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useStore();

  console.log(
    'AppNavigator - isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name='Main' component={MainStackNavigator} />
            <Stack.Screen name='MainTabs' component={MainTabNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name='Auth' component={AuthStackNavigator} />
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='Register' component={RegisterScreen} />
            <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

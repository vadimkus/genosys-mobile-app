import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import AuthWrapper from './AuthWrapper';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <StatusBar style="dark" backgroundColor="#ffffff" />
          <AuthWrapper />
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

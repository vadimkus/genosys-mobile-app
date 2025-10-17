import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';
import { PricingService } from '../services/pricingService';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  uniqueId: string; // Combination of productId + color + size for unique identification
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => {
    setItems(prevItems => {
      // Create unique ID based on product ID, color, and size
      const uniqueId = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
      
      const existingItem = prevItems.find(
        item => item.uniqueId === uniqueId
      );

      // Calculate the correct price based on selected size
      let finalPrice = product.price;
      if (selectedSize) {
        finalPrice = PricingService.getPriceForSize(product, selectedSize);
      }

      // Create a product copy with the correct price
      const productWithCorrectPrice = {
        ...product,
        price: finalPrice
      };

      if (existingItem) {
        // Update quantity if exact same variant already exists
        return prevItems.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + quantity, product: productWithCorrectPrice }
            : item
        );
      } else {
        // Add new item to cart with variant information and correct price
        return [...prevItems, { 
          product: productWithCorrectPrice, 
          quantity, 
          selectedColor, 
          selectedSize, 
          uniqueId 
        }];
      }
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setItems(prevItems =>
      prevItems.filter(item => item.uniqueId !== uniqueId)
    );
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

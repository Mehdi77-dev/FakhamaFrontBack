import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CartItem = {
  productId: number | string;
  name: string;
  image?: string;
  size?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pricePerDay?: number;
  days?: number;
  totalPrice?: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const STORAGE_KEY = 'Fakhama:cartItems';

  // Load persisted cart on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCartItems(parsed);
        }
      } catch (e) {
        console.warn('Failed to load cart from storage', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Persist cart on change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to save cart to storage', e);
      }
    };
    save();
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;

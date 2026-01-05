import React from 'react';
import { render, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider, useCart } from '../app/context/CartContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

function TestConsumer() {
  const { cartItems, addToCart, removeFromCart, clearCart, getCartTotal } = useCart();
  return (
    // simple rendering to trigger hooks
    null
  );
}

describe('CartContext persistence', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  it('loads from storage on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([{ productId: 1, name: 'Test', totalPrice: 10 }]));

    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );
    });

    expect(AsyncStorage.getItem).toHaveBeenCalled();
  });

  it('saves to storage when cart changes', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    let add: any;

    function LocalConsumer() {
      const { addToCart } = useCart();
      add = addToCart;
      return null;
    }

    await act(async () => {
      render(
        <CartProvider>
          <LocalConsumer />
        </CartProvider>
      );
    });

    await act(async () => {
      add({ productId: 2, name: 'A', totalPrice: 5 });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});

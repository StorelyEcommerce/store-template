import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Cart, CartItem } from '../api/client';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], subtotalCents: 0, totalCents: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addToCart(productId: string, quantity: number = 1) {
    try {
      const updatedCart = await api.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    try {
      const updatedCart = await api.updateCartItem(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  }

  async function removeFromCart(productId: string) {
    try {
      const updatedCart = await api.removeFromCart(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }

  async function clearCart() {
    try {
      const emptyCart = await api.clearCart();
      setCart(emptyCart);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }

  function getItemCount(): number {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


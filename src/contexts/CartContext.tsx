'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number;
  type: 'food' | 'beverage' | 'snack';
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  description?: string;
  customizations?: string[];
  uniqueId: string; // For handling same items with different customizations
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('canteenCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('canteenCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // Auto-hide after 4 seconds
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'uniqueId'>) => {
    setCartItems(prevItems => {
      // Create unique ID based on item properties and customizations
      const customizationString = item.customizations?.join(',') || '';
      const uniqueId = `${item.type}-${item.id}-${customizationString}`;
      const existingItem = prevItems.find(cartItem => cartItem.uniqueId === uniqueId);

      if (existingItem) {
        showNotification(`Added another ${item.name} to cart!`, 'success');
        return prevItems.map(cartItem =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        showNotification(`${item.name} added to cart!`, 'success');
        return [...prevItems, { ...item, quantity: 1, uniqueId }];
      }
    });
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (uniqueId: string) => {
    const item = cartItems.find(item => item.uniqueId === uniqueId);
    if (item) {
      showNotification(`${item.name} removed from cart`, 'info');
    }
    setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
  };

  const clearCart = () => {
    setCartItems([]);
    showNotification('Cart cleared', 'info');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    showNotification,
    notification,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 animate-slideDown ${
          notification.type === 'success'
            ? 'bg-green-500 text-white'
            : notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

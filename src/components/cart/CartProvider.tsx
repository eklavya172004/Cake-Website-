// src/components/cart/CartProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: {
    size?: string;
    flavor?: string;
    toppings?: string[];
    frosting?: string;
    color?: string;
    shape?: string;
    message?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, customization?: any) => void;
  updateQuantity: (itemId: string, customization: any, newQuantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      // Check if item with same customization exists
      const existingIndex = prev.findIndex(i => 
        i.id === item.id && 
        JSON.stringify(i.customization) === JSON.stringify(item.customization)
      );
      
      if (existingIndex > -1) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }
      
      // Add new item
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string, customization?: any) => {
    setItems(prev => prev.filter(i => 
      !(i.id === itemId && JSON.stringify(i.customization) === JSON.stringify(customization))
    ));
  };

  const updateQuantity = (itemId: string, customization: any, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setItems(prev => prev.map(i =>
      i.id === itemId && JSON.stringify(i.customization) === JSON.stringify(customization)
        ? { ...i, quantity: newQuantity }
        : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      setIsCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
// src/components/cart/CartProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface CartItem {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  quantity: number;
  image?: string;
  deliveryFee?: number; // Add delivery fee from vendor
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
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const currentUserId = session?.user?.email || 'guest';
    
    // If user has changed (logged in/out or switched user), clear cart and update userId
    if (lastUserId !== null && lastUserId !== currentUserId) {
      console.log(`🔄 User changed from ${lastUserId} to ${currentUserId}, clearing cart`);
      localStorage.removeItem(`cart_${lastUserId}`);
      setLastUserId(currentUserId);
      setItems([]);
    } else if (lastUserId === null) {
      // First load - set the current user
      setLastUserId(currentUserId);
      
      // Load cart for current user
      const cartKey = `cart_${currentUserId}`;
      const savedCart = localStorage.getItem(cartKey);
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
    }
  }, [session?.user?.email, lastUserId]);

  // Save cart to localStorage whenever it changes (use user-specific key)
  useEffect(() => {
    if (isHydrated && lastUserId) {
      const cartKey = `cart_${lastUserId}`;
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, isHydrated, lastUserId]);

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
    if (lastUserId) {
      localStorage.removeItem(`cart_${lastUserId}`);
    }
  };

  const getTotal = () => {
    const itemsTotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(String(item.price)) || 0;
      const itemQty = parseInt(String(item.quantity)) || 0;
      return sum + (itemPrice * itemQty);
    }, 0);
    
    // Get unique vendors and sum their delivery fees (once per vendor)
    const uniqueVendors = new Map<string, number>();
    items.forEach(item => {
      if (item.vendorId && item.deliveryFee && !uniqueVendors.has(item.vendorId)) {
        const deliveryFee = parseFloat(String(item.deliveryFee)) || 0;
        uniqueVendors.set(item.vendorId, deliveryFee);
      }
    });
    
    const deliveryTotal = Array.from(uniqueVendors.values()).reduce((sum, fee) => sum + fee, 0);
    return itemsTotal + deliveryTotal;
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
// src/components/cart/CartButton.tsx
'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';

export function CartButton() {
  const { isCartOpen, setIsCartOpen, getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <button
      onClick={() => setIsCartOpen(!isCartOpen)}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold animate-bounce shadow-lg">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-pink-400 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500"></span>
    </button>
  );
}
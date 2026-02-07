'use client';

import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from './CartProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function CartSidebar() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    updateQuantity, 
    removeItem, 
    getTotal 
  } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="serif text-xl">Your Cart ({items.length})</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-black underline underline-offset-4 hover:opacity-70"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {item.image && item.image.startsWith('http') ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : item.image && item.image.length === 1 ? (
                    <span>{item.image}</span>
                  ) : (
                    <img 
                      src={item.image || '🎂'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{item.vendor}</p>
                  
                  {/* Customizations */}
                  {item.customization && (
                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                      {item.customization.size && <p>Size: {item.customization.size}</p>}
                      {item.customization.flavor && <p>Flavor: {item.customization.flavor}</p>}
                      {item.customization.message && <p className="italic">"{item.customization.message}"</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.customization, Math.max(0, item.quantity - 1))}
                        className="hover:text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.customization, item.quantity + 1)}
                        className="hover:text-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.customization)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="space-y-3 mb-6">
              {/* Items Subtotal */}
              <div className="flex justify-between items-center text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-medium">₹{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(0)}</span>
              </div>
              
              {/* Delivery Charges - Show once per vendor */}
              {Array.from(new Map(items.map(item => [item.vendorId, item.deliveryFee])).entries()).map(([vendorId, fee]) => (
                fee !== undefined && fee > 0 && (
                  <div key={vendorId} className="flex justify-between items-center text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium">₹{fee.toFixed(0)}</span>
                  </div>
                )
              ))}
              
              {/* Total */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-pink-600">₹{getTotal().toFixed(0)}</span>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Taxes calculated at checkout
              </p>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-black text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

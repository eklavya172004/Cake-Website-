'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    instructions: ''
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="serif text-3xl mb-4">Your cart is empty</h1>
          <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to payment step
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          cakeId: item.id,
          name: item.name,
          quantity: item.quantity,
          customization: item.customization,
          price: item.price,
        })),
        deliveryDetails: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          landmark: formData.instructions,
          pincode: formData.pincode,
        },
        deliveryType: 'delivery',
        paymentMethod: paymentMethod,
        subtotal: getTotal(),
        deliveryFee: 50,
        discount: 0,
        total: getTotal() + 50,
      };

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      // If Razorpay payment
      if (paymentMethod === 'razorpay') {
        // TODO: Add actual Razorpay integration later
        // For now, just confirm the order as paid
        clearCart();
        router.push(`/orders/${result.orderId}`);
      } else {
        // COD - redirect directly to orders page
        clearCart();
        router.push(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-black text-white border-black' : 'border-gray-300'}`}>1</div>
                <span className="font-medium">Details</span>
              </div>
              <div className="w-12 h-px bg-gray-300" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-black text-white border-black' : 'border-gray-300'}`}>2</div>
                <span className="font-medium">Payment</span>
              </div>
            </div>

            <form onSubmit={handleDetailsSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="serif text-2xl mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">First Name</label>
                  <input
                    required
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Last Name</label>
                  <input
                    required
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Address</label>
                <textarea
                  required
                  name="address"
                  placeholder="Street address, building, apartment"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">City</label>
                  <input
                    required
                    name="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Pincode</label>
                  <input
                    required
                    name="pincode"
                    placeholder="6-digit postal code"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-black text-white uppercase tracking-widest font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </form>
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="serif text-2xl mb-6">Payment Method</h2>
                
                <div className="space-y-4 mb-8">
                  {/* COD Option */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600 mt-1">Pay when your order arrives</div>
                    </div>
                  </label>

                  {/* Razorpay Option */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Razorpay</div>
                      <div className="text-sm text-gray-600 mt-1">Credit/Debit Card, UPI, or Net Banking</div>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 flex gap-3 mb-8">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Secure checkout. Your payment information is encrypted and safe.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-900 uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-black text-white uppercase tracking-widest font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay ₹${getTotal() + 50}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
              <h3 className="serif text-xl mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 text-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center text-xl shrink-0">
                      {item.image || '🎂'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                      <p className="text-gray-500 text-xs mb-1">Qty: {item.quantity}</p>
                      {item.customization?.message && (
                        <p className="text-gray-400 text-xs italic truncate">&quot;{item.customization.message}&quot;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{getTotal() + 50}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 flex gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>Secure checkout powered by Razorpay. Your data is encrypted and safe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

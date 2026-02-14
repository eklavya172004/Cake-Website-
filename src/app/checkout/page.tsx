'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import SplitPaymentUI from '@/components/checkout/SplitPaymentUI';
import AddressSelection from '@/components/checkout/AddressSelection';

interface Address {
  id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggedInAtStart] = useState(!!session);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [splitPaymentLinks, setSplitPaymentLinks] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [vendorDetails, setVendorDetails] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    instructions: ''
  });

  // Fetch vendor details to get delivery fees
  React.useEffect(() => {
    const fetchVendorDetails = async () => {
      if (items.length === 0) return;
      
      try {
        // Get unique vendor IDs
        const vendorIds = [...new Set(items.map(item => item.vendorId))];
        
        // Fetch vendor details for each vendor
        const vendors: Record<string, any> = {};
        for (const vendorId of vendorIds) {
          const response = await fetch(`/api/vendors/${vendorId}`);
          if (response.ok) {
            const data = await response.json();
            vendors[vendorId] = data;
          }
        }
        
        setVendorDetails(vendors);
        
        // Calculate total delivery fee (sum of all vendor delivery fees)
        const totalFee = vendorIds.reduce((sum, vendorId) => {
          return sum + (vendors[vendorId]?.deliveryFee || 0);
        }, 0);
        
        setDeliveryFee(totalFee);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        // Fallback to default fee if fetch fails
        setDeliveryFee(50);
      }
    };
    
    fetchVendorDetails();
  }, [items]);

  // Auto-fill email and name if user is logged in
  React.useEffect(() => {
    if (session?.user) {
      const user = session.user;
      const nameParts = user.name?.split(' ') || ['', ''];
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
      }));
    }
  }, [session]);

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

  // Calculate items-only subtotal (without delivery fees)
  const getItemsOnlySubtotal = () => {
    return items.reduce((sum, item) => {
      const itemPrice = parseFloat(String(item.price)) || 0;
      const itemQty = parseInt(String(item.quantity)) || 0;
      return sum + (itemPrice * itemQty);
    }, 0);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to payment step
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For split payment, redirect to payment status page
    if (paymentMethod === 'split') {
      if (splitPaymentLinks.length === 0) {
        alert('Please generate and send payment links to co-payers first');
        return;
      }
      
      console.log('Split Payment Links being stored:', splitPaymentLinks); // Debug
      
      setLoading(true);
      
      try {
        const itemsSubtotal = getItemsOnlySubtotal();
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
          subtotal: itemsSubtotal,
          deliveryFee: deliveryFee,
          discount: 0,
          total: itemsSubtotal + deliveryFee,
          paymentStatus: 'pending',
          notes: JSON.stringify({
            splitPaymentLinks: splitPaymentLinks,
          }),
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();
        console.log('Order created:', result); // Debug

        if (!response.ok) {
          alert(result.error || 'Failed to create order');
          setLoading(false);
          return;
        }

        // Save order to localStorage for guest users
        try {
          const storedOrders = localStorage.getItem('userOrders');
          const orders = storedOrders ? JSON.parse(storedOrders) : [];
          
          // Extract vendor name from the first item
          let vendorName = 'Unknown Vendor';
          if (items.length > 0 && items[0].vendor) {
            vendorName = items[0].vendor;
          }
          
          const itemsSubtotal = getItemsOnlySubtotal();
          const newOrder = {
            id: result.orderId,
            orderNumber: result.orderNumber,
            status: 'pending',
            paymentMethod: 'split',
            paymentStatus: 'pending',
            finalAmount: itemsSubtotal + deliveryFee,
            notes: JSON.stringify({
              splitPaymentLinks: splitPaymentLinks,
            }),
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              customization: item.customization,
            })),
            deliveryAddress: {
              fullName: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
            },
            vendor: {
              name: vendorName,
            },
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          };
          orders.unshift(newOrder);
          localStorage.setItem('userOrders', JSON.stringify(orders));
          console.log('Order saved to localStorage:', newOrder);
          console.log('Total orders in localStorage:', orders.length);
        } catch (error) {
          console.error('Failed to save order to localStorage:', error);
        }

        // Auto-login user with their email so they can see orders in dashboard
        try {
          await signIn('credentials', {
            email: formData.email,
            redirect: false,
          });
          console.log('User auto-logged in with email:', formData.email);
        } catch (signInError) {
          console.error('Auto-login failed:', signInError);
          // Still redirect even if auto-login fails
        }

        // Redirect to success page if guest, otherwise to split payment status page
        clearCart();
        if (!isLoggedInAtStart) {
          router.push(`/guest-checkout-success/${result.orderId}`);
        } else {
          router.push(`/split-payment-status/${result.orderId}`);
        }
      } catch (error) {
        console.error('Error creating order:', error);
        alert('An error occurred. Please try again.');
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);

    try {
      // Prepare order data
      const itemsSubtotal = getItemsOnlySubtotal();
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
        subtotal: itemsSubtotal,
        deliveryFee: deliveryFee,
        discount: 0,
        total: itemsSubtotal + deliveryFee,
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

      // Save order to localStorage
      try {
        const storedOrders = localStorage.getItem('userOrders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        const newOrder = {
          id: result.orderId,
          orderNumber: result.orderNumber,
          status: 'pending',
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          finalAmount: getTotal() + deliveryFee,
          notes: null,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
          })),
          deliveryAddress: {
            city: formData.city,
          },
          vendor: {
            name: 'Unknown Vendor',
          },
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        };
        orders.unshift(newOrder);
        localStorage.setItem('userOrders', JSON.stringify(orders));
        console.log('Order saved to localStorage:', newOrder);
      } catch (error) {
        console.error('Failed to save order to localStorage:', error);
      }

      // Auto-login user with their email
      try {
        await signIn('credentials', {
          email: formData.email,
          redirect: false,
        });
        console.log('User auto-logged in with email:', formData.email);
      } catch (signInError) {
        console.error('Auto-login failed:', signInError);
      }

      // If Razorpay payment
      if (paymentMethod === 'razorpay') {
        try {
          // Generate Razorpay payment link
          const paymentResponse = await fetch('/api/payment/create-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: result.orderId,
              amount: itemsSubtotal + deliveryFee,
              customerEmail: formData.email,
              customerName: formData.firstName + ' ' + formData.lastName,
            }),
          });

          const paymentData = await paymentResponse.json();

          if (!paymentResponse.ok) {
            throw new Error(paymentData.error || 'Failed to generate payment link');
          }

          console.log('Payment link generated:', paymentData.paymentLink.url);

          // Clear cart and redirect to Razorpay link
          clearCart();
          
          // Redirect to Razorpay payment link
          window.location.href = paymentData.paymentLink.url;
        } catch (paymentError) {
          console.error('Error generating payment link:', paymentError);
          alert('Failed to generate payment link. Please try again.');
          setLoading(false);
        }
      } else {
        // COD - redirect to success page if guest, otherwise to orders page
        clearCart();
        if (!isLoggedInAtStart) {
          router.push(`/guest-checkout-success/${result.orderId}`);
        } else {
          router.push(`/orders/${result.orderId}`);
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Steps Indicator */}
            <div className="flex items-center gap-2 md:gap-4 mb-8">
              <div className={`flex items-center gap-1 md:gap-2 ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm md:text-base ${step >= 1 ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300'}`}>1</div>
                <span className="font-medium text-xs md:text-sm">Details</span>
              </div>
              <div className="w-4 md:w-12 h-px bg-gray-300" />
              <div className={`flex items-center gap-1 md:gap-2 ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm md:text-base ${step >= 2 ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-300'}`}>2</div>
                <span className="font-medium text-xs md:text-sm">Payment</span>
              </div>
            </div>

            <form onSubmit={handleDetailsSubmit} className="bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-600">First Name</label>
                  <input
                    required
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Last Name</label>
                  <input
                    required
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Address Selection Component */}
              <div className="space-y-2 mb-6">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Delivery Address</label>
                <AddressSelection 
                  onAddressSelect={(address) => {
                    setSelectedAddress(address);
                    setFormData(prev => ({
                      ...prev,
                      address: address.street,
                      city: address.city,
                      pincode: address.pincode,
                      phone: address.phone,
                      state: address.state
                    }));
                  }}
                  onAddNewAddress={() => {
                    setSelectedAddress(null);
                    setFormData(prev => ({
                      ...prev,
                      address: '',
                      city: '',
                      pincode: '',
                      state: ''
                    }));
                  }}
                  selectedAddress={selectedAddress}
                />
              </div>

              {/* Show address fields only if no saved address is selected */}
              {!selectedAddress?.id && (
                <>
                  <div className="space-y-2 mb-6">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Address</label>
                    <textarea
                      required
                      name="address"
                      placeholder="Street address, building, apartment"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-gray-600">City</label>
                      <input
                        required
                        name="city"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-gray-600">State</label>
                      <input
                        required
                        name="state"
                        placeholder="Your state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <label className="text-xs uppercase tracking-widest font-bold text-gray-600">Pincode</label>
                    <input
                      required
                      name="pincode"
                      placeholder="6-digit postal code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-pink-600 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* Show confirmation when saved address is selected */}
              {selectedAddress?.id && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-8">
                  <p className="text-sm text-green-800">
                    ✓ Address <strong>{selectedAddress.label}</strong> selected. Order will be delivered to this address.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-pink-600 text-white uppercase tracking-widest font-bold hover:bg-pink-700 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </form>
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-3 md:space-y-4 mb-8">
                  {/* COD Option */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 cursor-pointer accent-pink-600"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600 mt-1">Pay when your order arrives</div>
                    </div>
                  </label>

                  {/* Razorpay Option */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 cursor-pointer accent-pink-600"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Razorpay</div>
                      <div className="text-sm text-gray-600 mt-1">Credit/Debit Card, UPI, or Net Banking</div>
                    </div>
                  </label>

                  {/* Split Payment Option */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'split'
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="split"
                      checked={paymentMethod === 'split'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Split Payment</div>
                      <div className="text-sm text-gray-600 mt-1">Split with friends - Everyone pays their share</div>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 flex gap-3 mb-8">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Secure checkout. Your payment information is encrypted and safe.</p>
                </div>

                {paymentMethod === 'split' && (
                  <div className="mb-8">
                    <SplitPaymentUI 
                      totalAmount={getItemsOnlySubtotal() + (parseFloat(String(deliveryFee)) || 0)}
                      cakeName={items.map(i => i.name).join(', ')}
                      orderData={{
                        items: items.map(item => ({
                          cakeId: item.id,
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          vendorId: item.vendorId,
                          customization: item.customization,
                        })),
                        customer: {
                          name: formData.firstName + ' ' + formData.lastName,
                          email: formData.email || session?.user?.email,
                          phone: formData.phone,
                        },
                        deliveryAddress: selectedAddress || {
                          street: formData.address,
                          city: formData.city,
                          state: formData.state,
                          pincode: formData.pincode,
                          phone: formData.phone,
                          fullName: formData.firstName + ' ' + formData.lastName,
                          email: formData.email || session?.user?.email,
                        },
                        vendorDetails: vendorDetails,
                        deliveryFee: deliveryFee,
                        subtotal: getItemsOnlySubtotal(),
                        instructions: formData.instructions,
                      }}
                      onPaymentLinksGenerated={(links) => {
                        setSplitPaymentLinks(links);
                        alert('Payment links have been sent. Order will be placed once all co-payers complete their payment.');
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 md:py-4 border-2 border-gray-300 text-gray-900 uppercase tracking-widest font-bold text-xs md:text-sm hover:bg-gray-50 transition-all rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (paymentMethod === 'split' && splitPaymentLinks.length === 0)}
                    className="flex-1 py-3 md:py-4 bg-pink-600 text-white uppercase tracking-widest font-bold text-xs md:text-sm hover:bg-pink-700 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay ₹${(getItemsOnlySubtotal() + (parseFloat(String(deliveryFee)) || 0)).toFixed(0)}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 sticky top-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-3 md:space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex gap-4 text-sm border-b border-gray-100 pb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-xl shrink-0 overflow-hidden border border-gray-200">
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
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="font-semibold text-gray-900">₹{(parseFloat(String(item.price)) || 0) * (parseInt(String(item.quantity)) || 0)}</span>
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
                  <span>Subtotal (Items)</span>
                  <span>₹{getItemsOnlySubtotal().toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span>₹{(parseFloat(String(deliveryFee)) || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{(getItemsOnlySubtotal() + (parseFloat(String(deliveryFee)) || 0)).toFixed(0)}</span>
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

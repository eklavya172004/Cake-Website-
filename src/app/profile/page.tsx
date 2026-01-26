'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  User, Package, Truck, CreditCard, HelpCircle, MessageSquare, LogOut,
  ChevronRight, Users, Settings, Award, TrendingUp, Wallet, Mail, Phone
} from 'lucide-react';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import AddressManager from '@/components/profile/AddressManager';

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'tracking' | 'payments' | 'support' | 'help'>('profile');
  const [paymentSubSection, setPaymentSubSection] = useState<'all' | 'split'>('all');
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await fetch('/api/user/profile', { credentials: 'include' });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setUser(profileData.user);

      const ordersResponse = await fetch('/api/user/orders', { credentials: 'include' });
      let allOrders = [];
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        allOrders = ordersData.orders || [];
      }
      setOrders(allOrders);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetail(true);
  };

  const getSplitPaymentData = (order: any) => {
    if (!order.notes) return null;
    try {
      const notes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
      return notes.splitPaymentLinks ? { coPayers: notes.splitPaymentLinks } : null;
    } catch (e) {
      return null;
    }
  };

  const splitPaymentOrders = orders.filter(order => getSplitPaymentData(order) !== null);

  const faqs = [
    { question: 'How do I track my order?', answer: 'Go to the Order Tracking section to see real-time updates of your order status.' },
    { question: 'Can I cancel my order?', answer: 'You can cancel orders within 1 hour of placement. Visit Orders section for more details.' },
    { question: 'What is the delivery time?', answer: 'Delivery typically takes 2-4 hours depending on your location and bakery availability.' },
    { question: 'Do you offer custom cakes?', answer: 'Yes! You can customize your cake by selecting flavors, toppings, and adding personalized messages.' },
    { question: 'What payment methods do you accept?', answer: 'We accept Credit Cards, Debit Cards, UPI, and Cash on Delivery.' },
  ];

  const supportChannels = [
    { channel: 'Email', contact: 'support@cakeshop.com', icon: 'E', response: '24 hours' },
    { channel: 'Phone', contact: '+91 1800-CAKE-123', icon: 'P', response: '2 hours' },
    { channel: 'Live Chat', contact: 'Available 10 AM - 10 PM', icon: 'C', response: 'Instant' },
    { channel: 'WhatsApp', contact: '+91 98765 43210', icon: 'W', response: '30 mins' },
  ];

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen pt-32 bg-linear-to-br from-white via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-linear-to-r from-pink-600 to-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-900 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 bg-linear-to-br from-white via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-xl">X</span>
          </div>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 bg-linear-to-br from-white via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 pt-32 bg-linear-to-br from-white via-pink-50 to-orange-50">
      <div className="sticky top-32 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-linear-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Account Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100 sticky top-40">
                <div className="h-24 bg-linear-to-r from-pink-600 via-pink-500 to-orange-500"></div>
                <div className="px-6 pb-6 -mt-12 relative z-10">
                  <div className="mb-4">
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-pink-400 to-orange-400 flex items-center justify-center text-4xl shadow-lg border-4 border-white">
                      {user.avatar || 'C'}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Member since</p>
                    <p className="text-sm font-semibold text-gray-900">{joinDate}</p>
                  </div>
                </div>
              </div>

              <nav className="bg-white rounded-2xl shadow-lg border border-pink-100 p-2">
                {[
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
                  { id: 'tracking', label: 'Tracking', icon: Truck },
                  { id: 'payments', label: 'Payments', icon: Wallet },
                  { id: 'support', label: 'Support', icon: MessageSquare },
                  { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
                        activeSection === item.id
                          ? 'bg-linear-to-r from-pink-600 to-orange-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          activeSection === item.id
                            ? 'bg-white/30'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6 hidden lg:block">
                <h4 className="font-bold text-gray-900 mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="font-bold text-lg text-pink-600">{orders.length}</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className="font-bold text-lg text-green-600">
                      INR {(orders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0)).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
                  <div className="h-32 bg-linear-to-r from-pink-600 via-pink-500 to-orange-500"></div>
                  <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 relative z-10 mb-8">
                      <div className="flex items-end gap-4">
                        <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-pink-400 to-orange-400 flex items-center justify-center text-6xl shadow-lg border-4 border-white">
                          {user.avatar || 'C'}
                        </div>
                        <div className="pb-2">
                          <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                          <p className="text-gray-600">Member since {joinDate}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-6 py-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors font-semibold flex items-center gap-2"
                      >
                        <Settings className="w-5 h-5" />
                        Edit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email Address</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-pink-600" />
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-pink-600" />
                          {user.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account Status</p>
                        <p className="font-semibold text-green-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          Active
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <Package className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">INR {(orders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0)).toFixed(0)}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Deliveries</p>
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'delivered').length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Customer Rating</p>
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">4.8 Stars</p>
                  </div>
                </div>

                {/* Delivery Addresses Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-pink-600" />
                    Delivery Addresses
                  </h3>
                  <AddressManager user={user} onAddressUpdate={fetchUserProfile} />
                </div>
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">Your Orders</h2>
                  <span className="text-sm text-gray-600 bg-pink-50 px-4 py-2 rounded-lg font-medium">{orders.length} total</span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-8">Start your cake shopping journey today!</p>
                    {process.env.NODE_ENV === 'development' && (
                      <a
                        href="/dev/create-test-order"
                        className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
                      >
                        Create Test Order
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-gray-900">{order.orderNumber || order.id.slice(0, 8)}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'ready' ? 'bg-indigo-100 text-indigo-700' :
                                order.status === 'out_for_delivery' ? 'bg-cyan-100 text-cyan-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {order.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{order.vendor?.name || 'Unknown Vendor'}</p>
                            <p className="text-xs text-gray-500">Order date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-pink-600 mb-2">INR {order.finalAmount || order.totalAmount || 0}</p>
                            <button className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700">
                              View Details
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'tracking' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Order Tracking</h2>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Truck className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Your orders will appear here once you place one</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Order #{order.orderNumber || order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-600">Vendor: {order.vendor?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-pink-600">₹{order.finalAmount || order.totalAmount}</p>
                            <span className={`inline-block mt-2 px-4 py-1.5 rounded-lg font-semibold text-sm capitalize ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'ready' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'picked_up' ? 'bg-cyan-100 text-cyan-800' :
                              order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-100">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Order Date</p>
                            <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Delivery Location</p>
                            <p className="text-sm font-semibold text-gray-900">{order.deliveryAddress?.city}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-600 mb-2 font-semibold">Items</p>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm text-gray-700">
                                • {item.name} x{item.quantity}
                              </p>
                            ))}
                            {order.items?.length > 2 && (
                              <p className="text-sm text-gray-600">+ {order.items.length - 2} more items</p>
                            )}
                          </div>
                        </div>

                        <button className="w-full py-2 px-4 bg-pink-50 text-pink-600 font-semibold hover:bg-pink-100 transition-colors rounded-lg flex items-center justify-center gap-2">
                          View Full Tracking
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Payment Status</h2>

                <div className="bg-white rounded-xl border border-pink-100 p-1 flex gap-2 w-fit">
                  <button
                    onClick={() => setPaymentSubSection('all')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      paymentSubSection === 'all'
                        ? 'bg-linear-to-r from-pink-600 to-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Payments
                  </button>
                  <button
                    onClick={() => setPaymentSubSection('split')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      paymentSubSection === 'split'
                        ? 'bg-linear-to-r from-pink-600 to-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Split Payments
                    {splitPaymentOrders.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 font-bold">
                        {splitPaymentOrders.length}
                      </span>
                    )}
                  </button>
                </div>

                {paymentSubSection === 'all' && (
                  <div className="grid gap-4">
                    {orders.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No payment records yet</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{order.orderNumber || order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {order.paymentMethod === 'split' ? 'Split Payment' : order.paymentMethod || 'Razorpay'}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 mb-2">INR {order.finalAmount || order.totalAmount || 0}</p>
                              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                                order.paymentStatus === 'paid' || order.status === 'delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.paymentStatus === 'paid' || order.status === 'delivered' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {paymentSubSection === 'split' && (
                  <div className="grid gap-4">
                    {splitPaymentOrders.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No split payments found</p>
                      </div>
                    ) : (
                      splitPaymentOrders.map((order) => {
                        const splitData = getSplitPaymentData(order);
                        const coPayers = splitData?.coPayers || [];
                        const paidCount = coPayers.filter((p: any) => p.status === 'paid').length;
                        const totalCount = coPayers.length;
                        const paidAmount = coPayers.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                        const totalAmount = coPayers.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

                        return (
                          <div
                            key={order.id}
                            onClick={() => router.push(`/split-payment-status/${order.id}`)}
                            className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{order.orderNumber || order.id.slice(0, 8)}</h3>
                                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              </div>
                              <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                                paidCount === totalCount
                                  ? 'bg-green-100 text-green-700'
                                  : paidCount > 0
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {paidCount === totalCount ? 'Complete' : `${paidCount}/${totalCount} Paid`}
                              </span>
                            </div>

                            <div className="mb-4">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                  className="bg-linear-to-r from-pink-600 to-orange-500 h-2.5 rounded-full transition-all"
                                  style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-600">INR {paidAmount.toFixed(0)} / INR {totalAmount.toFixed(0)}</p>
                            </div>

                            <div className="space-y-2">
                              {coPayers.slice(0, 2).map((payer: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${payer.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-gray-700 font-medium">{payer.email}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold">INR {payer.amount}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                      payer.status === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {payer.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {totalCount > 2 && (
                                <p className="text-xs text-gray-600 pt-2">+{totalCount - 2} more</p>
                              )}
                            </div>

                            <button className="mt-4 w-full flex items-center justify-center gap-2 text-pink-600 font-semibold hover:text-pink-700">
                              View Details
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'support' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">Customer Support</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {supportChannels.map((support, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow border border-pink-100 p-6 hover:shadow-lg transition-all group">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{support.icon}</div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{support.channel}</h3>
                      <p className="text-gray-600 mb-3 text-sm font-medium">{support.contact}</p>
                      <p className="text-xs text-gray-500">Response: {support.response}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Tell us how we can help..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent resize-none"
                    ></textarea>
                    <button
                      type="button"
                      className="w-full bg-linear-to-r from-pink-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Help & FAQ</h2>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="bg-white rounded-xl border border-pink-100 shadow hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                    >
                      <summary className="p-6 font-bold text-lg text-gray-900 flex justify-between items-center hover:bg-pink-50 transition-colors">
                        <span className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-600 rounded-full text-sm font-bold group-open:bg-pink-600 group-open:text-white transition-all">?</span>
                          {faq.question}
                        </span>
                        <span className="text-2xl text-pink-600 group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <div className="px-6 pb-6 pt-2 bg-linear-to-br from-pink-50/50 to-orange-50/50 border-t border-pink-100">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          isOpen={showOrderDetail}
          orderId={selectedOrderId}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrderId(null);
          }}
        />
      )}

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={fetchUserProfile}
      />
    </div>
  );
}

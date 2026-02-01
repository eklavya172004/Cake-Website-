'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Clock,
} from 'lucide-react';

const vendorMenuItems = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/onboarding', label: 'Onboarding', icon: Clock, showIf: 'onboarding' },
  { href: '/vendor/cakes/upload', label: 'Upload Cake', icon: Package },
  { href: '/vendor/products', label: 'Manage Cakes', icon: Package },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/vendor/profile', label: 'Vendor Profile', icon: User },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vendor dashboard data to check onboarding status
    const fetchVendorData = async () => {
      try {
        const response = await fetch(`/api/vendor/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setVendorProfile(data);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchVendorData();
    }
  }, [session]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-linear-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <div className="font-bold text-xl">CakeShop</div>
              <div className="text-xs text-gray-400">Vendor Panel</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {vendorMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            // Hide onboarding if approved
            if (item.showIf === 'onboarding' && vendorProfile?.approvalStatus === 'approved') {
              return null;
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition ${
                  isActive ? 'bg-pink-600 border-l-4 border-pink-400' : ''
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && (
            <div className="mb-3 text-sm">
              <p className="text-gray-400">Shop Owner:</p>
              <p className="font-semibold text-white truncate">{session?.user?.name}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col h-screen`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Page Content with Scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

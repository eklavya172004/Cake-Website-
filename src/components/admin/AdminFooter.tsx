'use client';

import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">CakeShop Admin</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Manage your entire cake shop ecosystem with powerful analytics, vendor management, and order processing tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/admin" className="text-gray-400 hover:text-pink-500 text-sm transition">Dashboard</a></li>
              <li><a href="/admin/vendors" className="text-gray-400 hover:text-pink-500 text-sm transition">Vendors</a></li>
              <li><a href="/admin/orders" className="text-gray-400 hover:text-pink-500 text-sm transition">Orders</a></li>
              <li><a href="/admin/analytics" className="text-gray-400 hover:text-pink-500 text-sm transition">Analytics</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={16} className="text-pink-500" />
                <a href="mailto:admin@cakeshop.com" className="hover:text-pink-500 transition">admin@cakeshop.com</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone size={16} className="text-pink-500" />
                <a href="tel:+919876543210" className="hover:text-pink-500 transition">+91-9876543210</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={16} className="text-pink-500" />
                <span>Delhi, India</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform Stats</h3>
            <ul className="space-y-2">
              <li className="flex justify-between text-gray-400 text-sm">
                <span>Active Vendors:</span>
                <span className="text-pink-500 font-semibold">150+</span>
              </li>
              <li className="flex justify-between text-gray-400 text-sm">
                <span>Monthly Orders:</span>
                <span className="text-pink-500 font-semibold">5K+</span>
              </li>
              <li className="flex justify-between text-gray-400 text-sm">
                <span>GMV:</span>
                <span className="text-pink-500 font-semibold">₹50L+</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p>&copy; {currentYear} CakeShop. All rights reserved.</p>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">Contact Us</a>
            </div>

            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart size={14} className="text-pink-500 fill-pink-500" />
              <span>for amazing vendors</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

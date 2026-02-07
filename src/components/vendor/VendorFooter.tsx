'use client';

import { Heart, Mail, Phone, MapPin, TrendingUp } from 'lucide-react';

export default function VendorFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">Your Shop</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Grow your cake business with our powerful vendor dashboard. Manage products, orders, and track your success.
            </p>
          </div>

          {/* My Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop Management</h3>
            <ul className="space-y-2">
              <li><a href="/vendor" className="text-gray-400 hover:text-blue-400 text-sm transition">Dashboard</a></li>
              <li><a href="/vendor/products" className="text-gray-400 hover:text-blue-400 text-sm transition">Products</a></li>
              <li><a href="/vendor/orders" className="text-gray-400 hover:text-blue-400 text-sm transition">Orders</a></li>
              <li><a href="/vendor/analytics" className="text-gray-400 hover:text-blue-400 text-sm transition">Analytics</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition">Seller Guidelines</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition">Best Practices</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={16} className="text-blue-400" />
                <a href="mailto:vendor@purblepalace.in" className="hover:text-blue-400 transition">vendor@purblepalace.in</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone size={16} className="text-blue-400" />
                <a href="tel:+919876543211" className="hover:text-blue-400 transition">+91-9876543211</a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <TrendingUp size={16} className="text-blue-400" />
                <span>24/7 Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              <p>&copy; {currentYear} PurblePalace Vendor Dashboard. All rights reserved.</p>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Vendor Agreement</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Feedback</a>
            </div>

            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Keep growing</span>
              <Heart size={14} className="text-blue-400 fill-blue-400" />
              <span>your business</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-2 border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-pink-600 mb-4">🎂 Cake Shop</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Crafting premium custom cakes and delightful memories. Artistic designs meet unforgettable flavors.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Home</a></li>
              <li><a href="/cakes" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Browse Cakes</a></li>
              <li><a href="/orders" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Track Order</a></li>
              <li><a href="/profile" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">My Profile</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Return Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                <span className="font-medium">+91 9876-543-210</span>
              </li>
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                <span className="font-medium">hello@cakeshop.com</span>
              </li>
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                <span className="font-medium">New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm font-medium">© {currentYear} Cake Shop. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Sitemap</a>
            <a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Contact Us</a>
            <a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
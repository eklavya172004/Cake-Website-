'use client';

import Link from 'next/link';
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
            <h3 className="text-2xl font-bold text-pink-600 mb-4">🎂 Purble Palace</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Crafting premium custom cakes and delightful memories. Artistic designs meet unforgettable flavors.
            </p>
            <div className="flex gap-4">
              <a href="#" title="Facebook" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" title="Instagram" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" title="Twitter" className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Home</Link></li>
              <li><Link href="/cakes" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Browse Cakes</Link></li>
              <li><Link href="/orders" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Track Order</Link></li>
              <li><Link href="/profile" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Terms of Service</Link></li>
              <li><Link href="/return-policy" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Return Policy</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <Phone className="w-5 h-5 shrink-0 mt-0.5" /> 
                <span className="font-medium">+91 9876-543-210</span>
              </li>
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 shrink-0 mt-0.5" /> 
                <span className="font-medium">hello@purblepalace.in</span>
              </li>
              <li className="flex gap-3 text-gray-600 hover:text-pink-600 transition-colors cursor-pointer">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" /> 
                <span className="font-medium">New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm font-medium">© {currentYear} Purble Palace. All rights reserved.</p>
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
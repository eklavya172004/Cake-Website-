'use client';

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-[#F7E47D] mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div>
            <h3 className="serif text-3xl font-bold mb-4">SAVOR</h3>
            <p className="text-[#F7E47D]/70 text-sm mb-4">
              Crafting delightful custom cakes for every celebration. Premium quality, artistic designs, and unforgettable flavors.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/#catalog" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  Browse Cakes
                </a>
              </li>
              <li>
                <a href="/orders" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  Track Orders
                </a>
              </li>
              <li>
                <a href="/profile" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  My Account
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F7E47D]/70">+91 9876-543-210</p>
                  <p className="text-[#F7E47D]/70">+91 9898-765-432</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@savor.com" className="text-[#F7E47D]/70 hover:text-white transition-colors">
                  support@savor.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F7E47D]/70">North Delhi, Gurgaon,</p>
                  <p className="text-[#F7E47D]/70">Noida & Surrounding Areas</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F7E47D]/20 pt-8 mb-8">
          {/* Newsletter Section */}
          <div className="mb-8">
            <h4 className="font-bold text-white mb-4">Subscribe to Our Newsletter</h4>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded bg-[#F7E47D]/10 border border-[#F7E47D]/20 text-[#F7E47D] placeholder-[#F7E47D]/50 focus:outline-none focus:border-[#F7E47D]"
              />
              <button className="bg-[#F7E47D] text-[#1a1a1a] px-6 py-2 rounded font-bold hover:shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-[#F7E47D]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#F7E47D]/70 text-sm">
            © {currentYear} SAVOR. All rights reserved. | Crafted with ❤️ for cake lovers
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
              Sitemap
            </a>
            <a href="#" className="text-[#F7E47D]/70 hover:text-white transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

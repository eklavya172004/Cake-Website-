"use client";

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import CustomCakeGenerator from "@/components/cakes/CustomCakeGenerator";

export default function CustomCakePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wand2 className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Design Your Dream Cake
            </h1>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create a personalized cake with your custom flavors, toppings, and message. 
            Let AI bring your cake vision to life!
          </p>
        </div>

        {/* Generator Component */}
        <CustomCakeGenerator />

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Design</h3>
            <p className="text-gray-600">
              Our AI generates a visual preview of your custom cake based on your description.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unlimited Flavors</h3>
            <p className="text-gray-600">
              Choose from classic flavors or create your own flavor combinations.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Personal Touch</h3>
            <p className="text-gray-600">
              Add custom messages and specify exactly how you want your cake to look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function CustomCakeGenerator() {
  const [formData, setFormData] = useState({
    flavor: '',
    size: '',
    design: '',
    topping: '',
    message: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.flavor || !formData.size || !formData.design) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Placeholder for API call to generate custom cake
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Custom cake design generated! (This is a placeholder)');
    } catch (error) {
      console.error('Error generating cake:', error);
      alert('Failed to generate custom cake design');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-pink-600" />
        <h1 className="text-3xl font-bold text-gray-800">Custom Cake Generator</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cake Flavor *
          </label>
          <select
            name="flavor"
            value={formData.flavor}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select a flavor</option>
            <option value="chocolate">Chocolate</option>
            <option value="vanilla">Vanilla</option>
            <option value="strawberry">Strawberry</option>
            <option value="red-velvet">Red Velvet</option>
            <option value="cheesecake">Cheesecake</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cake Size *
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select a size</option>
            <option value="half-kg">Half Kg</option>
            <option value="1-kg">1 Kg</option>
            <option value="1.5-kg">1.5 Kg</option>
            <option value="2-kg">2 Kg</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Design Theme *
          </label>
          <select
            name="design"
            value={formData.design}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select a design</option>
            <option value="minimalist">Minimalist</option>
            <option value="floral">Floral</option>
            <option value="modern">Modern</option>
            <option value="elegant">Elegant</option>
            <option value="playful">Playful</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topping
          </label>
          <select
            name="topping"
            value={formData.topping}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">No additional topping</option>
            <option value="sprinkles">Sprinkles</option>
            <option value="chocolate-chips">Chocolate Chips</option>
            <option value="fresh-berries">Fresh Berries</option>
            <option value="nuts">Nuts</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Add a special message for the cake (e.g., Happy Birthday!)"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Custom Cake Design'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useMemo } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { getAllCategoryOptions, getMainCategories, getSubcategoriesForMain } from '@/lib/categories';

interface CakeUploadFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CakeUploadForm({ onSuccess, onError }: CakeUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get categories dynamically from centralized list
  const categoryOptions = useMemo(() => getAllCategoryOptions(), []);
  const mainCategories = useMemo(() => getMainCategories(), []);
  
  const [mainCategory, setMainCategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    cakeType: '',
    basePrice: '',
    flavors: [] as string[],
    flavorInput: '',
    toppings: [] as string[],
    toppingInput: '',
    tags: [] as string[],
    tagInput: '',
    isCustomizable: true,
    availableSizes: [] as { size: string; price: string }[],
    sizeInput: '',
    priceInput: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = images.length + newFiles.length;

    if (totalFiles > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    setImages([...images, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const addFlavor = () => {
    if (formData.flavorInput.trim() && formData.flavors.length < 10) {
      setFormData((prev) => ({
        ...prev,
        flavors: [...prev.flavors, prev.flavorInput.trim()],
        flavorInput: '',
      }));
    }
  };

  const removeFlavor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((_, i) => i !== index),
    }));
  };

  const addTopping = () => {
    if (formData.toppingInput.trim() && formData.toppings.length < 10) {
      setFormData((prev) => ({
        ...prev,
        toppings: [...prev.toppings, prev.toppingInput.trim()],
        toppingInput: '',
      }));
    }
  };

  const removeTopping = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      toppings: prev.toppings.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (!formData.tagInput.trim()) return;

    const tagValue = formData.tagInput.trim().toLowerCase();

    if (formData.tags.includes(tagValue)) {
      setError('This tag is already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tagValue],
      tagInput: '',
    }));
    setError(null);
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addSize = () => {
    if (
      formData.sizeInput.trim() &&
      formData.priceInput &&
      formData.availableSizes.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        availableSizes: [
          ...prev.availableSizes,
          { size: prev.sizeInput.trim(), price: prev.priceInput },
        ],
        sizeInput: '',
        priceInput: '',
      }));
    }
  };

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableSizes: prev.availableSizes.filter((_, i) => i !== index),
    }));
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setMainCategory(selected);
    
    // Get subcategories for the selected main category
    const subs = selected ? getSubcategoriesForMain(selected) : [];
    setAvailableSubcategories(subs);
    
    // Reset category and cakeType selections when main category changes
    setFormData((prev) => ({
      ...prev,
      category: selected || '', // Set category to selected main category
      cakeType: '', // Clear cakeType
    }));
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setFormData((prev) => ({
      ...prev,
      cakeType: selected, // Save subcategory to cakeType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Cake name is required');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      setError('Valid base price is required');
      return;
    }

    if (formData.flavors.length === 0) {
      setError('Add at least one flavor');
      return;
    }

    if (formData.toppings.length === 0) {
      setError('Add at least one topping option');
      return;
    }

    if (images.length === 0) {
      setError('Add at least one image');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('category', formData.category);
      form.append('cakeType', formData.cakeType);
      form.append('basePrice', formData.basePrice);
      form.append('flavors', JSON.stringify(formData.flavors));
      form.append('toppings', JSON.stringify(formData.toppings));
      form.append('tags', JSON.stringify(formData.tags));
      form.append(
        'availableSizes',
        JSON.stringify(
          formData.availableSizes.length > 0
            ? formData.availableSizes
            : [
                { size: '0.5kg', price: formData.basePrice },
                { size: '1kg', price: (parseFloat(formData.basePrice) * 1.5).toString() },
                { size: '2kg', price: (parseFloat(formData.basePrice) * 2.5).toString() },
              ]
        )
      );
      form.append('isCustomizable', formData.isCustomizable.toString());

      images.forEach((image, index) => {
        form.append('images', image);
      });

      const response = await fetch('/api/vendor/cakes/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload cake');
      }

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        category: '',
        cakeType: '',
        basePrice: '',
        flavors: [],
        flavorInput: '',
        toppings: [],
        toppingInput: '',
        tags: [],
        tagInput: '',
        isCustomizable: true,
        availableSizes: [],
        sizeInput: '',
        priceInput: '',
      });
      setImages([]);
      setImagePreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Success!</h3>
            <p className="text-sm text-green-800 mt-1">Cake has been added successfully to your catalog.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cake Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chocolate Truffle Cake"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            About / Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your cake, ingredients, special features..."
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Category *
            </label>
            <select
              value={mainCategory}
              onChange={handleMainCategoryChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
              title="Select a main category"
              required
            >
              <option value="">Select Main Category</option>
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sub Category {mainCategory === 'Cakes' && '*'}
            </label>
            <select
              value={formData.cakeType}
              onChange={handleSubcategoryChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Select a sub category"
              disabled={!mainCategory || availableSubcategories.length === 0}
              required={mainCategory === 'Cakes'}
            >
              <option value="">
                {!mainCategory ? 'Select a main category first' : 'Select Sub Category'}
              </option>
              {availableSubcategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Base Price (₹) *
            </label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="e.g., 500"
              min="1"
              step="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCustomizable}
              onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
              className="w-4 h-4 text-pink-600 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">
              This cake is customizable
            </span>
          </label>
        </div>
      </div>

      {/* Flavors */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Flavors *</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.flavorInput}
            onChange={(e) => setFormData({ ...formData, flavorInput: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
            placeholder="e.g., Chocolate, Vanilla, Strawberry"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
          <button
            type="button"
            onClick={addFlavor}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.flavors.map((flavor, index) => (
            <span
              key={index}
              className="bg-pink-100 text-pink-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {flavor}
              <button
                type="button"
                onClick={() => removeFlavor(index)}
                className="text-pink-600 hover:text-pink-800 transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {formData.flavors.length === 0 && (
          <p className="text-sm text-gray-500">No flavors added yet</p>
        )}
      </div>

      {/* Toppings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Toppings *</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.toppingInput}
            onChange={(e) => setFormData({ ...formData, toppingInput: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopping())}
            placeholder="e.g., Sprinkles, Chocolate Chips, Almonds"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
          <button
            type="button"
            onClick={addTopping}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.toppings.map((topping, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {topping}
              <button
                type="button"
                onClick={() => removeTopping(index)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {formData.toppings.length === 0 && (
          <p className="text-sm text-gray-500">No toppings added yet</p>
        )}
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Tags (Optional)</h2>
        <p className="text-sm text-gray-600">Add tags like bestseller, trending, new, sugar-free, eggless, etc.</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.tagInput}
            onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="e.g., bestseller"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              ✨ {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {formData.tags.length === 0 && (
          <p className="text-sm text-gray-500">No tags added yet</p>
        )}
      </div>

      {/* Available Sizes (Optional) */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Available Sizes (Optional)</h2>
        <p className="text-sm text-gray-600">
          Leave blank to use default sizes (0.5kg, 1kg, 2kg)
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.sizeInput}
            onChange={(e) => setFormData({ ...formData, sizeInput: e.target.value })}
            placeholder="e.g., 1kg, 2kg, 500g"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
          <input
            type="number"
            value={formData.priceInput}
            onChange={(e) => setFormData({ ...formData, priceInput: e.target.value })}
            placeholder="Price"
            min="1"
            step="1"
            className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
          />
          <button
            type="button"
            onClick={addSize}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {formData.availableSizes.map((size, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <span className="text-sm font-medium text-gray-900">
                {size.size} - ₹{size.price}
              </span>
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Cake Images (1-4 images required) *
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-600 hover:bg-pink-50 transition">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
          </button>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600">
          {images.length}/4 images uploaded
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Cake'
          )}
        </button>
      </div>
    </form>
  );
}

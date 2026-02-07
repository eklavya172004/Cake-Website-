'use client';

import { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { X, Upload, Loader, CheckCircle } from 'lucide-react';
import { getAllCategoryOptions, getMainCategories, getSubcategoriesForMain } from '@/lib/categories';

interface CakeEditFormProps {
  cake: {
    id: string;
    name: string;
    description: string;
    category: string;
    cakeType?: string | null;
    basePrice: number;
    flavors: string[];
    tags?: string[];
    customOptions: {
      toppings: string[];
    };
    availableSizes: { size: string; price: number }[];
    isCustomizable: boolean;
    images: string[];
    isActive: boolean;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CakeEditForm({ cake, onSuccess, onError }: CakeEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get categories dynamically from centralized list
  const categoryOptions = useMemo(() => getAllCategoryOptions(), []);
  const mainCategories = useMemo(() => getMainCategories(), []);
  
  // Determine initial main category from cake.category
  const getInitialMainCategory = () => {
    // Check if the current category is a main category
    if (mainCategories.includes(cake.category)) {
      return cake.category;
    }
    // Otherwise, find which main category this subcategory belongs to
    for (const mainCat of mainCategories) {
      const subs = getSubcategoriesForMain(mainCat);
      if (subs.includes(cake.category)) {
        return mainCat;
      }
    }
    return ''; // Default empty if not found
  };

  const [mainCategory, setMainCategory] = useState(getInitialMainCategory());
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>(
    mainCategory ? getSubcategoriesForMain(mainCategory) : []
  );

  // Form state
  const [formData, setFormData] = useState({
    name: cake.name,
    description: cake.description,
    category: cake.category,
    cakeType: cake.cakeType || '',
    basePrice: cake.basePrice.toString(),
    flavors: cake.flavors,
    flavorInput: '',
    toppings: cake.customOptions?.toppings || [],
    toppingInput: '',
    tags: cake.tags || [],
    tagInput: '',
    isCustomizable: cake.isCustomizable,
    availableSizes: cake.availableSizes || [],
    sizeInput: '',
    priceInput: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(cake.images || []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = imagePreviews.length + newFiles.length;

    if (totalImages > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    setImages(newFiles);

    // Create previews for new images
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => {
          const updated = [...prev, reader.result as string];
          return updated.length > 4 ? updated.slice(0, 4) : updated;
        });
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index >= cake.images.length) {
      const newFileIndex = index - cake.images.length;
      setImages((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? (target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleAddFlavor = () => {
    if (!formData.flavorInput.trim()) return;

    if (formData.flavors.includes(formData.flavorInput.trim())) {
      setError('This flavor is already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      flavors: [...prev.flavors, prev.flavorInput.trim()],
      flavorInput: '',
    }));
    setError(null);
  };

  const removeFlavor = (flavor: string) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((f) => f !== flavor),
    }));
  };

  const handleAddTopping = () => {
    if (!formData.toppingInput.trim()) return;

    if (formData.toppings.includes(formData.toppingInput.trim())) {
      setError('This topping is already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      toppings: [...prev.toppings, prev.toppingInput.trim()],
      toppingInput: '',
    }));
    setError(null);
  };

  const removeTopping = (topping: string) => {
    setFormData((prev) => ({
      ...prev,
      toppings: prev.toppings.filter((t) => t !== topping),
    }));
  };

  const handleAddTag = () => {
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
      tags: prev.tags.filter((t: string) => t !== tag),
    }));
  };

  const handleAddSize = () => {
    if (!formData.sizeInput.trim() || !formData.priceInput) return;

    const newSize = {
      size: formData.sizeInput.trim(),
      price: parseFloat(formData.priceInput),
    };

    if (formData.availableSizes.some((s) => s.size === newSize.size)) {
      setError('This size is already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      availableSizes: [...prev.availableSizes, newSize],
      sizeInput: '',
      priceInput: '',
    }));
    setError(null);
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      availableSizes: prev.availableSizes.filter((s) => s.size !== size),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Cake name is required');
      }
      if (!formData.category) {
        throw new Error('Main category is required');
      }
      if (formData.category === 'Cakes' && !formData.cakeType) {
        throw new Error('Sub category is required when selecting Cakes');
      }
      if (!formData.basePrice) {
        throw new Error('Base price is required');
      }
      if (formData.flavors.length === 0) {
        throw new Error('At least one flavor is required');
      }
      if (imagePreviews.length === 0) {
        throw new Error('At least one image is required');
      }

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      if (formData.cakeType) {
        formDataToSend.append('cakeType', formData.cakeType);
      }
      formDataToSend.append('basePrice', formData.basePrice);
      formDataToSend.append('flavors', JSON.stringify(formData.flavors));
      formDataToSend.append('toppings', JSON.stringify(formData.toppings));
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('isCustomizable', formData.isCustomizable.toString());
      formDataToSend.append('availableSizes', JSON.stringify(formData.availableSizes));

      // Append only new image files
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Send update request
      const response = await fetch(`/api/vendor/cakes/${cake.id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update cake');
      }

      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      if (onError) {
        onError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-green-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-green-900">Cake Updated Successfully!</h3>
            <p className="text-green-800 mt-2">Your cake details have been updated. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">{error}</p>
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
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Chocolate Truffle Cake"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your cake..."
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
              name="basePrice"
              value={formData.basePrice}
              onChange={handleInputChange}
              placeholder="e.g., 599"
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isCustomizable"
            id="isCustomizable"
            checked={formData.isCustomizable}
            onChange={handleInputChange}
            className="w-4 h-4 text-pink-600 rounded focus:ring-2 focus:ring-pink-600"
          />
          <label htmlFor="isCustomizable" className="text-sm font-semibold text-gray-700">
            This cake is customizable
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
            onChange={(e) => setFormData((prev) => ({ ...prev, flavorInput: e.target.value }))}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFlavor();
              }
            }}
            placeholder="e.g., Chocolate"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddFlavor}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.flavors.map((flavor) => (
            <div
              key={flavor}
              className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full flex items-center gap-2"
            >
              {flavor}
              <button
                type="button"
                onClick={() => removeFlavor(flavor)}
                className="text-pink-600 hover:text-pink-800"
                title="Remove flavor"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toppings */}
      {formData.isCustomizable && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Toppings (Optional)</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={formData.toppingInput}
              onChange={(e) => setFormData((prev) => ({ ...prev, toppingInput: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopping();
                }
              }}
              placeholder="e.g., Sprinkles"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTopping}
              className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
              title="Add topping"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.toppings.map((topping) => (
              <div
                key={topping}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {topping}
                <button
                  type="button"
                  onClick={() => removeTopping(topping)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Tags (Optional)</h2>
        <p className="text-sm text-gray-600">Add tags like bestseller, trending, new, sugar-free, eggless, etc.</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.tagInput}
            onChange={(e) => setFormData((prev) => ({ ...prev, tagInput: e.target.value }))}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="e.g., bestseller"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
            title="Add tag"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag: string) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 font-semibold"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
                title="Remove tag"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Available Sizes */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Available Sizes (Optional)</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={formData.sizeInput}
            onChange={(e) => setFormData((prev) => ({ ...prev, sizeInput: e.target.value }))}
            placeholder="e.g., 1kg"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
          />
          <input
            type="number"
            value={formData.priceInput}
            onChange={(e) => setFormData((prev) => ({ ...prev, priceInput: e.target.value }))}
            placeholder="Price"
            min="1"
            step="0.01"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddSize}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
            title="Add size"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {formData.availableSizes.map((size) => (
            <div key={size.size} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-semibold text-gray-900">
                {size.size} - ₹{size.price}
              </span>
              <button
                type="button"
                onClick={() => removeSize(size.size)}
                className="text-red-600 hover:text-red-800"
                title="Remove size"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Images *</h2>
        <p className="text-sm text-gray-600">Upload up to 4 images of your cake</p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center cursor-pointer hover:bg-pink-50 transition"
        >
          <Upload className="w-12 h-12 text-pink-600 mx-auto mb-2" />
          <p className="text-gray-900 font-semibold">Click to upload images</p>
          <p className="text-gray-600 text-sm">or drag and drop</p>
          <p className="text-gray-500 text-xs mt-2">PNG, JPG up to 5MB each</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg"
          onChange={handleImageChange}
          className="hidden"
          title="Upload cake images"
        />

        {imagePreviews.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Uploaded Images ({imagePreviews.length}/4)
            </p>
            <div className="grid grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  {preview.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={`Cake preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt={`Cake preview ${index + 1}`}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" /> Updating...
            </>
          ) : (
            'Update Cake'
          )}
        </button>
      </div>
    </form>
  );
}

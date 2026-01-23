'use client';

import React, { useState } from 'react';
import { Star, Heart, Share2, Clock, Plus, Minus, ShoppingCart, Upload, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import AICakePreview from '@/components/cakes/AICakePreview';

interface CakeDetailClientProps {
  cake: any;
}

export default function CakeDetailClient({ cake }: CakeDetailClientProps) {
  const { addItem } = useCart();

  const defaultSize = { size: 'Regular', price: cake?.basePrice || 0 };
  const defaultFlavor = cake?.flavors?.[0] || 'Vanilla';
  const defaultFrosting = cake?.customOptions?.frostings?.[0] || { name: 'Classic', price: 0 };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(cake?.availableSizes?.[0] || defaultSize);
  const [selectedFlavor, setSelectedFlavor] = useState(defaultFlavor);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);
  const [selectedFrosting, setSelectedFrosting] = useState(defaultFrosting);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?cakeId=${cake.id}`);
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [cake.id]);

  const toggleTopping = (topping: any) => {
    setSelectedToppings(prev =>
      prev.find(t => t.name === topping.name)
        ? prev.filter(t => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const calculateTotal = () => {
    let total = selectedSize?.price || 0;
    total += selectedFrosting?.price || 0;
    selectedToppings.forEach(t => total += t.price || 0);
    return total * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      id: cake.id,
      name: cake.name,
      vendor: cake.vendor.name,
      vendorId: cake.vendor.id,
      price: calculateTotal() / quantity,
      quantity: quantity,
      image: cake.images?.[0],
      customization: {
        size: selectedSize?.size || 'Regular',
        flavor: selectedFlavor,
        toppings: selectedToppings.map(t => t.name),
        frosting: selectedFrosting?.name || 'Classic',
        message: message || undefined,
      },
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('cakeId', cake.id);
      formData.append('rating', reviewRating.toString());
      formData.append('text', reviewText);
      formData.append('userName', 'Guest User');

      reviewPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const reviewsResponse = await fetch(`/api/reviews?cakeId=${cake.id}`);
        const data = await reviewsResponse.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setReviewRating(0);
        setReviewText('');
        setReviewPhotos([]);
        alert('Review submitted successfully!');
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen mt-40 bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{cake.name}</h1>
          <div className="flex gap-4">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Heart className="w-6 h-6" fill={isFavorite ? '#EF4444' : 'none'} stroke={isFavorite ? '#EF4444' : 'currentColor'} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side - Images */}
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 rounded-xl h-96 flex items-center justify-center text-8xl shadow-lg hover:shadow-xl transition border border-red-100">
                {cake.images?.[selectedImage] || '🍰'}
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array(3).fill(0).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg transition-all border-2 flex items-center justify-center text-4xl ${
                      selectedImage === i 
                        ? 'border-red-600 shadow-md' 
                        : 'border-gray-200 hover:border-red-300'
                    } bg-gradient-to-br from-red-50 to-pink-50`}
                  >
                    🍰
                  </button>
                ))}
              </div>
            </div>

            {/* AI Preview */}
            <div className="pt-8 border-t border-gray-200">
              <AICakePreview
                name={cake.name}
                flavor={selectedFlavor}
                size={selectedSize?.size || 'Regular'}
                toppings={selectedToppings.map(t => t.name)}
                frosting={selectedFrosting?.name || 'Classic'}
                message={message}
              />
            </div>
          </div>

          {/* Right Side - Details & Options */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor & Rating */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{cake.vendor?.name || 'PurplePalace'}</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">({reviews.length} reviews)</span>
              </div>
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  {cake.vendor?.preparationTime || '30'} mins delivery
                </span>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
              <h3 className="font-bold text-gray-900 mb-4">Customer Rating</h3>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">{averageRating || '4.9'}</div>
                  <div className="flex gap-1 justify-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating || 4.9)) ? 'fill-red-600 text-red-600' : 'fill-gray-300 text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">Based on {reviews.length || '245'} reviews</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-red-600 text-white rounded-xl p-6">
              <p className="text-sm opacity-90 mb-2">Price for {quantity} item(s)</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">₹{Math.round(totalPrice)}</span>
                {totalPrice > 0 && <span className="text-sm opacity-75">(Includes all customizations)</span>}
              </div>
            </div>

            {/* Size Selection */}
            {Array.isArray(cake.availableSizes) && cake.availableSizes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Choose Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cake.availableSizes.map((size: any) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSize?.size === size.size
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{size.size}</div>
                      <div className="text-sm text-gray-600">₹{size.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Selection */}
            {Array.isArray(cake.flavors) && cake.flavors.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Choose Flavor</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cake.flavors.map((flavor: string) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFlavor === flavor
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{flavor}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frosting Selection */}
            {Array.isArray(cake.customOptions?.frostings) && cake.customOptions.frostings.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Choose Frosting</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cake.customOptions.frostings.map((frosting: any) => (
                    <button
                      key={frosting.name}
                      onClick={() => setSelectedFrosting(frosting)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFrosting?.name === frosting.name
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{frosting.name}</div>
                      <div className="text-sm text-gray-600">+₹{frosting.price || 0}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Selection */}
            {Array.isArray(cake.customOptions?.toppings) && cake.customOptions.toppings.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Add Toppings</h3>
                <div className="space-y-2">
                  {cake.customOptions.toppings.map((topping: any) => (
                    <button
                      key={topping.name}
                      onClick={() => toggleTopping(topping)}
                      className={`w-full p-4 rounded-lg border-2 transition-all flex justify-between items-center ${
                        selectedToppings.find(t => t.name === topping.name)
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{topping.name}</span>
                      <span className="text-sm text-gray-600">+₹{topping.price || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Custom Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.substring(0, 50))}
                placeholder="Add a special message on your cake..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none resize-none text-gray-900"
                rows={3}
              />
              <p className="text-xs text-gray-600">{message.length}/50 characters</p>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Quantity</h3>
              <div className="flex items-center gap-4 w-fit bg-gray-100 rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white rounded transition"
                >
                  <Minus className="w-5 h-5 text-gray-700" />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-white rounded transition"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              Add to Cart - ₹{Math.round(totalPrice)}
            </button>
          </div>
        </div>

        {/* Description */}
        {cake.description && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">About This Cake</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{cake.description}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-12">Customer Reviews</h3>

          {/* Review Form */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Share Your Review</h4>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-900 mb-3 block">Your Rating</label>
              <div className="flex gap-3">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${i < reviewRating ? 'fill-red-600 text-red-600' : 'fill-gray-300 text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-900 mb-3 block">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience with this cake..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none resize-none text-gray-900"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-900 mb-3 block">Add Photos</label>
              <input
                id="photoUpload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setReviewPhotos(Array.from(e.target.files || []))}
              />
              <label htmlFor="photoUpload" className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-600 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">Click to upload photos</p>
              </label>
              {reviewPhotos.length > 0 && (
                <div className="mt-4 flex gap-3">
                  {reviewPhotos.map((file, i) => (
                    <div key={i} className="relative w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-600">
                      {file.name.substring(0, 6)}...
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-bold rounded-lg transition-all disabled:opacity-50"
              disabled={reviewRating === 0 || !reviewText.trim() || submittingReview}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-bold text-gray-900">{review.userName}</h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-red-600 text-red-600' : 'fill-gray-300 text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{review.text}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-3">
                      {review.photos.map((photo: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoModal(photo.url)}
                          className="relative w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden hover:opacity-75 transition-opacity cursor-pointer"
                        >
                          <img src={photo.url} alt="Review" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-12">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="relative bg-white rounded-lg max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <img
              src={selectedPhotoModal}
              alt="Review photo"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

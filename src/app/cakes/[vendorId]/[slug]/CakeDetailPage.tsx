// src/app/cakes/[vendorId]/[slug]/CakeDetailPage.tsx
'use client';

import React, { useState } from 'react';
import { Star, Heart, Share2, Clock, Truck, Check, Plus, Minus, ShoppingCart, Upload, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import AICakePreview from '@/components/cakes/AICakePreview';

interface CakeDetailClientProps {
  cake: any; // Replace with proper Cake type from Prisma
}

export default function CakeDetailClient({ cake }: CakeDetailClientProps) {
  const { addItem } = useCart();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(cake.availableSizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(cake.flavors[0]);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);
  const [selectedFrosting, setSelectedFrosting] = useState(
    cake.customOptions?.frostings?.[0] || { name: 'Classic', price: 0 }
  );
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userPincode] = useState('110001'); // Get from location store

  // Review states
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Fetch reviews on mount
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
    let total = selectedSize.price;
    total += selectedFrosting.price || 0;
    selectedToppings.forEach(t => total += t.price);
    return total * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      id: cake.id,
      name: cake.name,
      vendor: cake.vendor.name,
      vendorId: cake.vendor.id,
      price: calculateTotal() / quantity, // Price per item
      quantity: quantity,
      image: cake.images?.[0],
      customization: {
        size: selectedSize.size,
        flavor: selectedFlavor,
        toppings: selectedToppings.map(t => t.name),
        frosting: selectedFrosting.name,
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
      formData.append('userName', 'Guest User'); // Can be customized
      
      reviewPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh reviews
        const reviewsResponse = await fetch(`/api/reviews?cakeId=${cake.id}`);
        const data = await reviewsResponse.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);

        // Reset form
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
    <div className="min-h-screen bg-[#FFF9EB] text-[#1a1a1a]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#FFF9EB] border-b border-[#1a1a1a]/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="serif text-3xl">{cake.name}</h1>
          <div className="flex gap-3">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-3 hover:bg-[#1a1a1a]/5 rounded-full transition-colors">
              <Heart className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button className="p-3 hover:bg-[#1a1a1a]/5 rounded-full transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Product Images & AI Preview */}
          <div className="space-y-6">
            {/* Product Image Gallery */}
            <div className="space-y-6">
              <div className="bg-white border border-[#1a1a1a]/10 h-80 flex items-center justify-center text-7xl hover:border-[#1a1a1a] transition-all">
                {cake.images?.[selectedImage] || '🎂'}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array(3).fill(0).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-24 h-24 border transition-all ${
                      selectedImage === i ? 'border-[#1a1a1a] bg-white' : 'border-[#1a1a1a]/20 bg-gray-50 hover:border-[#1a1a1a]'
                    } flex items-center justify-center text-4xl`}
                  >
                    {cake.images?.[i] || '🎂'}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Cake Preview */}
            <div className="pt-8 border-t border-[#1a1a1a]/10">
              <AICakePreview
                name={cake.name}
                flavor={selectedFlavor}
                size={selectedSize.size}
                toppings={selectedToppings.map(t => t.name)}
                frosting={selectedFrosting.name}
                message={message}
              />
            </div>
          </div>

          {/* Right Column: Details & Customization */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Info */}
            <div className="pb-6 border-b border-[#1a1a1a]/10">
              <div>
                <h2 className="serif text-2xl mb-3">{cake.vendor?.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#1a1a1a]" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(245 reviews)</span>
                </div>
              </div>
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {cake.vendor?.preparationTime} mins
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Delivery available
                </span>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="pb-6 border-b border-[#1a1a1a]/10">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">Cake Rating</h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="serif text-4xl mb-2">{averageRating}</div>
                  <div className="flex gap-1 justify-center">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-[#1a1a1a]' : 'fill-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Based on {reviews.length} reviews</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500">Base Price</h3>
              <div className="serif text-4xl">₹{Math.round(totalPrice)}</div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Select Size</h3>
              <div className="grid grid-cols-2 gap-3">
                {cake.availableSizes?.map((size: any) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 border transition-all text-center ${
                      selectedSize?.size === size.size
                        ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#F7E47D]'
                        : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-medium">{size.size}</div>
                    <div className="text-sm opacity-75">₹{size.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Selection */}
            {cake.flavors && cake.flavors.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Select Flavor</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cake.flavors.map((flavor: string) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`p-4 border transition-all ${
                        selectedFlavor === flavor
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#F7E47D]'
                          : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Selection */}
            {cake.customOptions?.toppings && cake.customOptions.toppings.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Select Toppings</h3>
                <div className="space-y-2">
                  {cake.customOptions.toppings.map((topping: any) => (
                    <button
                      key={topping.name}
                      onClick={() => toggleTopping(topping)}
                      className={`w-full p-4 border transition-all flex justify-between items-center ${
                        selectedToppings.find(t => t.name === topping.name)
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#F7E47D]'
                          : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a] text-[#1a1a1a]'
                      }`}
                    >
                      <span>{topping.name}</span>
                      <span className="text-sm">₹{topping.price || 0}</span>
                    </button>
                  ))}
                </div>
                {selectedToppings.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedToppings.length} topping{selectedToppings.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            {cake.customOptions?.messages && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Personalized Message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a special message (optional)"
                  className="w-full p-4 border border-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:outline-none resize-none bg-white text-[#1a1a1a]"
                  rows={3}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Quantity</h3>
              <div className="flex items-center gap-3 w-fit border border-[#1a1a1a]/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-[#1a1a1a]/5 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-[#1a1a1a]/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#1a1a1a] text-[#F7E47D] py-5 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart - ₹{Math.round(totalPrice)}
            </button>
          </div>
        </div>

        {/* Description */}
        {cake.description && (
          <div className="mt-16 pt-8 border-t border-[#1a1a1a]/10">
            <h3 className="serif text-2xl mb-6">About This Cake</h3>
            <p className="text-gray-600 leading-relaxed font-light">{cake.description}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-20 pt-12 border-t border-[#1a1a1a]/10">
          <h3 className="serif text-3xl mb-12">Customer Reviews</h3>

          {/* Write Review Form */}
          <div className="bg-white p-8 border border-[#1a1a1a]/10 mb-12">
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-6">Share Your Experience</h4>
            
            {/* Star Rating */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Rate this cake</label>
              <div className="flex gap-2">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${i < reviewRating ? 'fill-[#1a1a1a]' : 'fill-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Tell us about your experience</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about the taste, presentation, and delivery..."
                className="w-full p-4 border border-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:outline-none resize-none bg-white text-[#1a1a1a]"
                rows={4}
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Add Photos (Optional)</label>
              <input 
                id="photoUpload"
                type="file" 
                multiple 
                accept="image/*"
                className="hidden"
                onChange={(e) => setReviewPhotos(Array.from(e.target.files || []))}
              />
              <label htmlFor="photoUpload" className="block border-2 border-dashed border-[#1a1a1a]/20 rounded-lg p-6 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag & drop</p>
              </label>
              {reviewPhotos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {reviewPhotos.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 bg-gray-100 rounded border border-[#1a1a1a]/10 flex items-center justify-center text-sm">
                      {file.name.substring(0, 3)}...
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full bg-[#1a1a1a] text-[#F7E47D] py-4 font-bold uppercase tracking-widest text-sm hover:bg-black transition-all disabled:opacity-50"
              disabled={reviewRating === 0 || !reviewText.trim() || submittingReview}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-[#1a1a1a]/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-bold">{review.userName}</h5>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#1a1a1a]' : 'fill-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3 font-light">{review.text}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2">
                      {review.photos.map((photo: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoModal(photo.url)}
                          className="relative w-16 h-16 bg-gray-100 rounded border border-[#1a1a1a]/10 flex items-center justify-center overflow-hidden hover:opacity-75 transition-opacity cursor-pointer"
                        >
                          <img src={photo.url} alt={`Review ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
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
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedPhotoModal} 
              alt="Full size review photo" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

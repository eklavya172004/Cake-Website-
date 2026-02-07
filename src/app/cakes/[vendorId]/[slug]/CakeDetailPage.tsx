'use client';

import React, { useState } from 'react';
import { Star, Heart, Share2, Clock, Plus, Minus, ShoppingCart, Upload, X, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import AICakePreview from '@/components/cakes/AICakePreview';

interface CakeDetailClientProps {
  cake: any;
}

export default function CakeDetailClient({ cake }: CakeDetailClientProps) {
  const { addItem } = useCart();

  const defaultFlavor = cake?.flavors?.[0] || 'Vanilla';
  const defaultFrosting = cake?.customOptions?.frostings?.[0] || { name: 'Classic', price: 0 };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(cake?.availableSizes?.[0]);
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

  const calculatePerItemPrice = () => {
    // Use the selected size price as the base (not the cake basePrice)
    let price = selectedSize?.price || cake.basePrice || 0;
    // Add frosting cost if selected and has a price
    if (selectedFrosting && selectedFrosting.price > 0) {
      price += selectedFrosting.price;
    }
    // Add toppings cost
    selectedToppings.forEach(t => price += t.price || 0);
    return price;
  };

  const calculateTotal = () => {
    return calculatePerItemPrice() * quantity;
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
      deliveryFee: cake.vendor?.deliveryFee || 0, // Include vendor's delivery fee
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
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{cake.name}</h1>
          <div className="flex gap-2 md:gap-4">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Heart className="w-5 h-5 md:w-6 md:h-6" fill={isFavorite ? '#EF4444' : 'none'} stroke={isFavorite ? '#EF4444' : 'currentColor'} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 md:pt-20 max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Left Side - Images */}
          <div className="space-y-4 md:space-y-6">
            {/* Main Image */}
              <div className="bg-gray-100 rounded-xl h-64 sm:h-80 md:h-96 flex items-center justify-center shadow-lg hover:shadow-xl transition border border-gray-200 overflow-hidden group">
                {cake.images && cake.images.length > 0 && cake.images[selectedImage] ? (
                  <img 
                    src={cake.images[selectedImage]} 
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img 
                    src={cake.vendor?.logo || 'https://via.placeholder.com/400?text=Cake'} 
                    alt={cake.vendor?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Cake';
                    }}
                  />
                )}
              </div>
              
              {/* Thumbnail Images */}
              {cake.images && cake.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {cake.images.map((image: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg transition-all border-2 overflow-hidden ${
                        selectedImage === i 
                          ? 'border-red-600 shadow-md' 
                          : 'border-gray-200 hover:border-red-300'
                      } bg-gray-100`}
                    >
                      <img 
                        src={image} 
                        alt={`${cake.name} ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

            {/* AI Preview */}
            <div className="pt-8 border-t border-gray-200">
              <AICakePreview
                cakeId={cake.id}
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
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Vendor & Rating */}
            <div className="pb-4 md:pb-6 border-b border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{cake.vendor?.name || 'PurblePalace'}</h2>
              
              {/* Tags */}
              {cake.tags && cake.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {cake.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                    >
                      ✨ {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(cake.vendor?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">({cake.vendor?.totalReviews || 0} reviews)</span>
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
                  <div className="text-4xl font-bold text-red-600 mb-2">{Number(cake.vendor?.rating || 0).toFixed(1)}</div>
                  <div className="flex gap-1 justify-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(cake.vendor?.rating || 0) ? 'fill-red-600 text-red-600' : 'fill-gray-300 text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">Based on {cake.vendor?.totalReviews || 0} reviews</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-xl p-4 md:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="opacity-90">Size ({selectedSize?.size})</span>
                  <span className="font-semibold">₹{selectedSize?.price || cake.basePrice}</span>
                </div>

                {selectedFrosting && selectedFrosting.price > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="opacity-90">+ Frosting ({selectedFrosting.name})</span>
                    <span className="font-semibold">₹{selectedFrosting.price}</span>
                  </div>
                )}
                
                {selectedToppings.length > 0 && (
                  <div className="space-y-2 border-t border-white/20 pt-2">
                    {selectedToppings.map(topping => (
                      <div key={topping.name} className="flex justify-between items-center text-xs md:text-sm">
                        <span className="opacity-90">+ {topping.name}</span>
                        <span className="font-semibold">₹{topping.price || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-white/30 pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="opacity-90">Subtotal (per item)</span>
                  <span className="font-semibold">₹{calculatePerItemPrice()}</span>
                </div>
                
                {cake.vendor?.deliveryFee && cake.vendor.deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="opacity-90">Delivery Charge</span>
                    <span className="font-semibold">₹{cake.vendor.deliveryFee}</span>
                  </div>
                )}
                
                <div className="border-t border-white/30 pt-2 flex justify-between items-center">
                  <span className="text-xs md:text-sm opacity-90">Total ({quantity} × item{cake.vendor?.deliveryFee && cake.vendor.deliveryFee > 0 ? ' + delivery' : ''})</span>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold">₹{totalPrice + (cake.vendor?.deliveryFee && cake.vendor.deliveryFee > 0 ? cake.vendor.deliveryFee : 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {Array.isArray(cake.availableSizes) && cake.availableSizes.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">📦 Choose Size</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                  {cake.availableSizes.map((size: any) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base ${
                        selectedSize?.size === size.size
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{size.size}</div>
                      <div className="text-xs md:text-sm text-red-600 font-semibold mt-1">₹{size.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Selection */}
            {Array.isArray(cake.flavors) && cake.flavors.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">🍦 Choose Flavor</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                  {cake.flavors.map((flavor: string) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base ${
                        selectedFlavor === flavor
                          ? 'border-red-600 bg-red-50 shadow-md'
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
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">🎨 Choose Frosting</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                  {cake.customOptions.frostings.map((frosting: any) => (
                    <button
                      key={frosting.name}
                      onClick={() => setSelectedFrosting(frosting)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base ${
                        selectedFrosting?.name === frosting.name
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{frosting.name}</div>
                      <div className="text-xs md:text-sm text-red-600 font-semibold mt-1">+₹{frosting.price || 0}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Selection */}
            {Array.isArray(cake.customOptions?.toppings) && cake.customOptions.toppings.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">✨ Add Toppings</h3>
                <p className="text-xs text-gray-600">Select as many as you like (each adds extra charge)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                  {cake.customOptions.toppings.map((topping: any) => {
                    // Convert string toppings to objects if needed
                    const toppingObj = typeof topping === 'string' 
                      ? { name: topping, price: 0 } 
                      : topping;
                    
                    return (
                      <button
                        key={toppingObj.name}
                        onClick={() => toggleTopping(toppingObj)}
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base ${
                          selectedToppings.find(t => t.name === toppingObj.name)
                            ? 'border-red-600 bg-red-50 shadow-md'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">{toppingObj.name}</div>
                        <div className="text-xs md:text-sm text-red-600 font-semibold mt-1">+₹{toppingObj.price || 0}</div>
                      </button>
                    );
                  })}
                </div>
                {selectedToppings.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs md:text-sm">
                    <p className="text-blue-900"><strong>{selectedToppings.length}</strong> topping(s) selected</p>
                    <p className="text-blue-700 mt-1">{selectedToppings.map(t => t.name).join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Message */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-bold text-gray-900 text-base md:text-lg">Custom Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.substring(0, 150))}
                placeholder="Add a special message on your cake..."
                className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none resize-none text-sm md:text-base text-gray-900"
                rows={3}
              />
              <p className="text-xs text-gray-600">{message.length}/150 characters</p>
            </div>

            {/* Quantity */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-bold text-gray-900 text-base md:text-lg">Quantity</h3>
              <div className="flex items-center gap-3 md:gap-4 w-fit bg-gray-100 rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white rounded transition"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>
                <span className="w-6 md:w-8 text-center font-bold text-gray-900 text-base md:text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-white rounded transition"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 md:py-4 font-bold text-sm md:text-lg rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <span>Add to Cart - ₹{totalPrice + (cake.vendor?.deliveryFee && cake.vendor.deliveryFee > 0 ? cake.vendor.deliveryFee : 0)}</span>
            </button>
          </div>
        </div>

        {/* Description */}
        {cake.description && (
          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-gray-200">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">About This Cake</h3>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">{cake.description}</p>
          </div>
        )}

        {/* Vendor Contact Details Section */}
        <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t-2 border-gray-200">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">🏪 Shop Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Shop Details Card */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
              <h4 className="text-lg font-bold text-gray-900 mb-6">{cake.vendor?.name || 'PurblePalace'}</h4>
              
              <div className="space-y-4">
                {cake.vendor?.profile?.shopPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Phone</p>
                      <a href={'tel:' + cake.vendor.profile.shopPhone} className="text-lg font-semibold text-gray-900 hover:text-red-600 transition">
                        {cake.vendor.profile.shopPhone}
                      </a>
                    </div>
                  </div>
                )}
                
                {cake.vendor?.profile?.shopEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Email</p>
                      <a href={'mailto:' + cake.vendor.profile.shopEmail} className="text-lg font-semibold text-gray-900 hover:text-red-600 transition break-all">
                        {cake.vendor.profile.shopEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {cake.vendor?.profile?.shopAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Address</p>
                      <p className="text-sm text-gray-900 font-semibold">{cake.vendor.profile.shopAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Operating Details Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-6">Operating Details</h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Preparation Time</p>
                    <p className="text-lg font-semibold text-gray-900">Depends on Vendor please wait</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Vendor Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-gray-900">{cake.vendor?.rating || 4.9}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

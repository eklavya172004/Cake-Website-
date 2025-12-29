export interface VendorAddress {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface VendorDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  totalReviews: number;
  serviceAreas: string[];
  deliveryFee: Record<string, number>; // pincode -> fee
  minOrderAmount: number;
  preparationTime: number;
  isActive: boolean;
  phone?: string;
  email?: string;
  address?: VendorAddress;
}

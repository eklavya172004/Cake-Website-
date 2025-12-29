export interface CakeSize {
  size: string;     // "1kg"
  price: number;
}

export interface CustomOptions {
  toppings?: string[];
  frostings?: string[];
  messages?: boolean;
}

export interface CakeDTO {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  category: string;
  images: string[];
  flavors: string[];
  availableSizes: CakeSize[];
  tags: string[];
  isCustomizable: boolean;
  customOptions?: CustomOptions;
  isActive: boolean;
  popularity: number;
}

import { OrderStatus, PaymentStatus } from "./enums";
import { Address } from "./user";

export interface CakeCustomization {
  size?: string;
  flavor?: string;
  frosting?: string;
  toppings?: string[];
  message?: string;
  eggless?: boolean;
  notes?: string;
}

export interface OrderItem {
  cakeId: string;
  name: string;
  quantity: number;
  customization?: CakeCustomization;
  price: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId: string;
  vendorId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryPincode: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  estimatedDelivery?: string;
  createdAt: string;
}

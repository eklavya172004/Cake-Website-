import { CoPaymentStatus } from "./enums";

export interface CoPaymentContributor {
  email?: string;
  phone?: string;
  amount: number;
  status: "pending" | "paid";
  paymentLinkId?: string;
  paidAt?: string;
}

export interface CoPaymentDTO {
  id: string;
  orderId: string;
  totalAmount: number;
  contributors: CoPaymentContributor[];
  status: CoPaymentStatus;
  collectedAmount: number;
  expiresAt?: string;
}

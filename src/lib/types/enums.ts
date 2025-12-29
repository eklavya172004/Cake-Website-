export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  PICKED_UP = "picked_up",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum CoPaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum NotificationType {
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_PREPARING = "order_preparing",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
}
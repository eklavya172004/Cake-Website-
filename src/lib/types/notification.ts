export interface NotificationDTO {
  id: string;
  userId: string;
  orderId?: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  isRead: boolean;
  createdAt: string;
}

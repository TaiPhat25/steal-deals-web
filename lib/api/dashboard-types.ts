export type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
};

export type StoreProfileResponse = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avatarUrl: string | null;
  phone: string | null;
  ratingScore: number;
  isVerify: boolean;
  isActive: boolean;
  createdAt: string;
};

export type SurpriseBagResponse = {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string | null;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  quantityRemaining: number;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  status: string;
  categories: CategoryResponse[];
  createdAt: string;
};

export type OrderItemResponse = {
  id: string;
  bagId: string;
  bagNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
};

export type CreateOrderRequest = {
  storeId: string;
  storeNameSnapshot: string;
  contactNameSnapshot: string;
  contactPhoneSnapshot: string;
  deliveryFee: number;
  voucherDiscount: number;
  deliveryType: string;
  deliveryAddress: string;
  items: Array<{
    bagId: string;
    bagNameSnapshot: string;
    unitPriceSnapshot: number;
    quantity: number;
  }>;
};

export type OrderResponse = {
  id: string;
  userId: string;
  storeId: string;
  storeNameSnapshot: string;
  contactNameSnapshot: string;
  contactPhoneSnapshot: string;
  deliveryFee: number;
  voucherDiscount: number;
  totalAmount: number;
  deliveryType: string;
  deliveryAddress: string;
  pickupCode: string | null;
  status: string;
  pickupDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
};

export type StoreReviewResponse = {
  id: string;
  orderId: string;
  buyerId: string;
  storeId: string;
  bagId: string;
  ratingScore: number;
  comment: string;
  storeReply: string | null;
  isReported: boolean;
  createdAt: string;
};

export const CURRENT_ORDER_STATUSES = [
  "Pending",
  "InventoryReservationFailed",
  "PaymentFailed",
  "Confirmed",
  "Cancelled",
] as const;

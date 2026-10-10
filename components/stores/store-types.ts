export type Category = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
};

export type StoreReview = {
  id: string;
  orderId: string;
  buyerId: string;
  storeId: string;
  bagId: string;
  ratingScore: number;
  comment: string | null;
  storeReply: string | null;
  isReported: boolean;
  createdAt: string;
};

export type StoreSurpriseBag = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  quantityRemaining: number;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  categories: Category[];
  storeReviews: StoreReview[];
};

export type StoreProfile = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avatarUrl: string | null;
  phone: string | null;
  bankAccount: string | null;
  ratingScore: number;
  reviewCount?: number;
  licenseUrl: string | null;
  isVerify: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  surpriseBags: StoreSurpriseBag[];
  storeReviews: StoreReview[];
};

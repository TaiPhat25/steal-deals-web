import type {
  PublicStoreReviewResponse,
  StoreProfileResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";
import type { StoreProfile, StoreReview, StoreSurpriseBag } from "@/components/stores/store-profile-data";

function mapBagResponse(bag: SurpriseBagResponse): StoreSurpriseBag {
  return {
    id: bag.id,
    storeId: bag.storeId,
    name: bag.name,
    description: bag.description,
    originalPrice: bag.originalPrice,
    salePrice: bag.salePrice,
    quantityTotal: bag.quantityTotal,
    quantityRemaining: bag.quantityRemaining,
    pickupStartTime: bag.pickupStartTime,
    pickupEndTime: bag.pickupEndTime,
    expiryDate: bag.expiryDate,
    status: bag.status,
    createdAt: bag.createdAt,
    updatedAt: null,
    categories: bag.categories,
    storeReviews: [],
  };
}

function mapReviewResponse(
  review: PublicStoreReviewResponse,
  storeId: string,
): StoreReview {
  return {
    id: review.id,
    orderId: review.orderId,
    buyerId: review.buyerId,
    storeId,
    bagId: "",
    ratingScore: review.ratingScore,
    comment: review.comment,
    storeReply: review.storeReply,
    isReported: false,
    createdAt: review.createdAt,
  };
}

export function mapStoreResponse(
  store: StoreProfileResponse,
  bags: SurpriseBagResponse[] = [],
  reviews: PublicStoreReviewResponse[] = [],
): StoreProfile {
  return {
    ...store,
    bankAccount: null,
    licenseUrl: null,
    updatedAt: null,
    surpriseBags: bags
      .filter((bag) => bag.storeId === store.id)
      .map(mapBagResponse),
    storeReviews: reviews.map((review) => mapReviewResponse(review, store.id)),
  };
}

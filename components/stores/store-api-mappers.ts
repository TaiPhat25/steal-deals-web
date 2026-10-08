import type {
  PagedResult,
  PublicStoreReviewResponse,
  StoreProfileResponse,
  StoreReviewResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";
import type { StoreProfile, StoreReview, StoreSurpriseBag } from "@/components/stores/store-types";

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
  review: PublicStoreReviewResponse | StoreReviewResponse,
  storeId: string,
): StoreReview {
  return {
    id: review.id,
    orderId: review.orderId,
    buyerId: review.buyerId,
    storeId,
    bagId: "bagId" in review ? review.bagId : "",
    ratingScore: review.ratingScore,
    comment: review.comment,
    storeReply: review.storeReply,
    isReported: false,
    createdAt: review.createdAt,
  };
}

type StoreReviews = PublicStoreReviewResponse[] | PagedResult<StoreReviewResponse>;

function mapStoreWithRelatedData(
  store: StoreProfileResponse,
  bags: SurpriseBagResponse[],
  reviews: StoreReviews = [],
): StoreProfile {
  const reviewList = Array.isArray(reviews) ? reviews : (reviews?.items ?? []);

  return {
    ...store,
    bankAccount: null,
    licenseUrl: null,
    updatedAt: null,
    surpriseBags: bags.map(mapBagResponse),
    storeReviews: reviewList.map((review) => mapReviewResponse(review, store.id)),
  };
}

export function mapStoreResponse(
  store: StoreProfileResponse,
  bags: SurpriseBagResponse[] = [],
  reviews: StoreReviews = [],
): StoreProfile {
  return mapStoreWithRelatedData(
    store,
    bags.filter((bag) => bag.storeId === store.id),
    reviews,
  );
}

export function mapStoreResponses(
  stores: StoreProfileResponse[],
  bags: SurpriseBagResponse[] = [],
) {
  const bagsByStore = new Map<string, SurpriseBagResponse[]>();

  for (const bag of bags) {
    const storeBags = bagsByStore.get(bag.storeId);
    if (storeBags) {
      storeBags.push(bag);
    } else {
      bagsByStore.set(bag.storeId, [bag]);
    }
  }

  return stores.map((store) => mapStoreWithRelatedData(
    store,
    bagsByStore.get(store.id) ?? [],
  ));
}

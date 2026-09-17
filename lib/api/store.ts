import { apiRequest } from "@/lib/api/client";
import type {
  CategoryResponse,
  PagedResult,
  PendingStoreResponse,
  StoreProfileResponse,
  StoreReviewResponse,
  SurpriseBagResponse,
} from "@/lib/api/dashboard-types";

export type CreateCategoryRequest = {
  name: string;
  slug: string;
  iconUrl?: string | null;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
  isActive: boolean;
};

export type CreateBagRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  status: string;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  categoryIds?: string[];
  image?: File | null;
};

export type UpdateStoreRequest = {
  name: string;
  description?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  phone?: string | null;
  bankAccount?: string | null;
  licenseUrl?: string | null;
};

export type CreateStoreRequest = {
  name: string;
  description?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  phone?: string | null;
  bankAccount?: string | null;
  licenseUrl?: string | null;
};

export type UpdateBagRequest = Omit<CreateBagRequest, "status"> & {
  status?: string;
};

export type ReviewFilterRequest = {
  page?: number;
  pageSize?: number;
  ratingScore?: number;
  hasReply?: boolean;
  search?: string;
  isReported?: boolean;
};

const STORE_API_BASE_URL = process.env.NEXT_PUBLIC_STORE_API_URL;

function storeApiBaseUrl() {
  if (!STORE_API_BASE_URL) throw new Error("NEXT_PUBLIC_STORE_API_URL is not configured.");
  return STORE_API_BASE_URL;
}

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function listCategories() {
  return apiRequest<CategoryResponse[]>(
    "/api/categories",
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function listStores() {
  return apiRequest<StoreProfileResponse[]>(
    "/api/stores",
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function getStore(id: string) {
  return apiRequest<StoreProfileResponse>(
    `/api/stores/${encodeURIComponent(id)}`,
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function createStore(
  accessToken: string,
  request: CreateStoreRequest,
) {
  return apiRequest<StoreProfileResponse>(
    "/api/stores",
    { method: "POST", headers: bearer(accessToken), body: request },
    storeApiBaseUrl(),
  );
}

export function listPendingStores(accessToken: string) {
  return apiRequest<PendingStoreResponse[]>(
    "/api/stores/pending",
    { method: "GET", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function listBags() {
  return apiRequest<SurpriseBagResponse[]>(
    "/api/bags",
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function getBag(id: string) {
  return apiRequest<SurpriseBagResponse>(
    `/api/bags/${encodeURIComponent(id)}`,
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function createCategory(
  accessToken: string,
  request: CreateCategoryRequest,
) {
  return apiRequest<CategoryResponse>(
    "/api/categories",
    { method: "POST", headers: bearer(accessToken), body: request },
    storeApiBaseUrl(),
  );
}

export function updateCategory(
  accessToken: string,
  id: string,
  request: UpdateCategoryRequest,
) {
  return apiRequest<CategoryResponse>(
    `/api/categories/${encodeURIComponent(id)}`,
    { method: "PUT", headers: bearer(accessToken), body: request },
    storeApiBaseUrl(),
  );
}

export function deleteCategory(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/categories/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function buildBagFormData(
  request: (CreateBagRequest | UpdateBagRequest) & { status?: string },
): FormData {
  const formData = new FormData();
  formData.append("name", request.name);
  if (request.description) {
    formData.append("description", request.description);
  }
  if (request.imageUrl) {
    formData.append("imageUrl", request.imageUrl);
  }
  formData.append("originalPrice", String(request.originalPrice));
  formData.append("salePrice", String(request.salePrice));
  formData.append("quantityTotal", String(request.quantityTotal));
  if (request.status) {
    formData.append("status", request.status);
  }
  formData.append("pickupStartTime", request.pickupStartTime);
  formData.append("pickupEndTime", request.pickupEndTime);
  formData.append("expiryDate", request.expiryDate);

  if (request.categoryIds) {
    for (const categoryId of request.categoryIds) {
      formData.append("categoryIds", categoryId);
    }
  }

  if (request.image) {
    formData.append("image", request.image);
  }

  return formData;
}

export function createBag(
  accessToken: string,
  request: CreateBagRequest | FormData,
) {
  const body = request instanceof FormData ? request : buildBagFormData(request);

  return apiRequest<SurpriseBagResponse>(
    "/api/bags",
    { method: "POST", headers: bearer(accessToken), body },
    storeApiBaseUrl(),
  );
}

export async function listStoreBags(storeId: string) {
  const bags = await apiRequest<SurpriseBagResponse[]>(
    `/api/bags/store/${encodeURIComponent(storeId)}`,
    { method: "GET" },
    storeApiBaseUrl(),
  );
  // ponytail: the store-list response omits categories; remove these detail requests when the backend includes them.
  return Promise.all(bags.map((bag) => bag.categories.length ? bag : getBag(bag.id)));
}

function buildReviewQueryParams(filter?: ReviewFilterRequest) {
  const params = new URLSearchParams();
  if (filter?.page !== undefined) params.set("page", String(filter.page));
  if (filter?.pageSize !== undefined) params.set("pageSize", String(filter.pageSize));
  if (filter?.ratingScore !== undefined) params.set("ratingScore", String(filter.ratingScore));
  if (filter?.hasReply !== undefined) params.set("hasReply", String(filter.hasReply));
  if (filter?.search) params.set("search", filter.search);
  if (filter?.isReported !== undefined) params.set("isReported", String(filter.isReported));
  return params.toString();
}

export function listStoreReviews(
  storeId: string,
  filterOrPage: ReviewFilterRequest | number = 1,
  pageSize = 50,
) {
  const query =
    typeof filterOrPage === "object"
      ? buildReviewQueryParams(filterOrPage)
      : buildReviewQueryParams({ page: filterOrPage, pageSize });

  return apiRequest<PagedResult<StoreReviewResponse>>(
    `/api/reviews/store/${encodeURIComponent(storeId)}${query ? `?${query}` : ""}`,
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function listMyStoreReviews(
  accessToken: string,
  filter?: ReviewFilterRequest,
) {
  const query = buildReviewQueryParams(filter);

  return apiRequest<PagedResult<StoreReviewResponse>>(
    `/api/reviews/store/me${query ? `?${query}` : ""}`,
    { method: "GET", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function replyToStoreReview(
  accessToken: string,
  reviewId: string,
  storeReply: string,
) {
  return apiRequest<void>(
    `/api/reviews/${encodeURIComponent(reviewId)}/reply`,
    {
      method: "PATCH",
      headers: bearer(accessToken),
      body: { storeReply },
    },
    storeApiBaseUrl(),
  );
}

export function deleteReviewReply(accessToken: string, reviewId: string) {
  return apiRequest<void>(
    `/api/reviews/${encodeURIComponent(reviewId)}/reply`,
    {
      method: "DELETE",
      headers: bearer(accessToken),
    },
    storeApiBaseUrl(),
  );
}

export function reportReview(accessToken: string, reviewId: string) {
  return apiRequest<void>(
    `/api/reviews/${encodeURIComponent(reviewId)}/report`,
    {
      method: "PATCH",
      headers: bearer(accessToken),
    },
    storeApiBaseUrl(),
  );
}

export function unreportReview(accessToken: string, reviewId: string) {
  return apiRequest<void>(
    `/api/reviews/${encodeURIComponent(reviewId)}/report`,
    {
      method: "DELETE",
      headers: bearer(accessToken),
    },
    storeApiBaseUrl(),
  );
}

export function listReportedReviews(
  accessToken: string,
  page = 1,
  pageSize = 20,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return apiRequest<PagedResult<StoreReviewResponse>>(
    `/api/reviews/reported?${params.toString()}`,
    { method: "GET", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function deleteReview(accessToken: string, reviewId: string) {
  return apiRequest<void>(
    `/api/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: "DELETE",
      headers: bearer(accessToken),
    },
    storeApiBaseUrl(),
  );
}

export function updateBag(
  accessToken: string,
  id: string,
  request: UpdateBagRequest | FormData,
) {
  const body = request instanceof FormData ? request : buildBagFormData(request);

  return apiRequest<SurpriseBagResponse>(
    `/api/bags/${encodeURIComponent(id)}`,
    { method: "PUT", headers: bearer(accessToken), body },
    storeApiBaseUrl(),
  );
}

export function deleteBag(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/bags/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function updateBagStatus(accessToken: string, id: string, status: string) {
  return apiRequest<null>(
    `/api/bags/${encodeURIComponent(id)}/status`,
    { method: "PATCH", headers: bearer(accessToken), body: { status } },
    storeApiBaseUrl(),
  );
}

export function getMyStore(accessToken: string) {
  return apiRequest<StoreProfileResponse>(
    "/api/stores/me",
    { method: "GET", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function updateStore(
  accessToken: string,
  id: string,
  request: UpdateStoreRequest,
) {
  return apiRequest<StoreProfileResponse>(
    `/api/stores/${encodeURIComponent(id)}`,
    { method: "PUT", headers: bearer(accessToken), body: request },
    storeApiBaseUrl(),
  );
}

export function verifyStore(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/stores/${encodeURIComponent(id)}/verify`,
    { method: "PATCH", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function rejectPendingStore(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/stores/${encodeURIComponent(id)}/reject`,
    { method: "DELETE", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

export function toggleStoreActive(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/stores/${encodeURIComponent(id)}/toggle-active`,
    { method: "PATCH", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

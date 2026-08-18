import { apiRequest } from "@/lib/api/client";
import type {
  CategoryResponse,
  PendingStoreResponse,
  StoreProfileResponse,
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
  originalPrice: number;
  salePrice: number;
  quantityTotal: number;
  status: string;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryDate: string;
  categoryIds?: string[];
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

export type UpdateBagRequest = Omit<CreateBagRequest, "status">;

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

export function createBag(accessToken: string, request: CreateBagRequest) {
  return apiRequest<SurpriseBagResponse>(
    "/api/bags",
    { method: "POST", headers: bearer(accessToken), body: request },
    storeApiBaseUrl(),
  );
}

export function listStoreBags(storeId: string) {
  return apiRequest<SurpriseBagResponse[]>(
    `/api/bags/store/${encodeURIComponent(storeId)}`,
    { method: "GET" },
    storeApiBaseUrl(),
  );
}

export function updateBag(
  accessToken: string,
  id: string,
  request: UpdateBagRequest,
) {
  return apiRequest<SurpriseBagResponse>(
    `/api/bags/${encodeURIComponent(id)}`,
    { method: "PUT", headers: bearer(accessToken), body: request },
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

export function toggleStoreActive(accessToken: string, id: string) {
  return apiRequest<null>(
    `/api/stores/${encodeURIComponent(id)}/toggle-active`,
    { method: "PATCH", headers: bearer(accessToken) },
    storeApiBaseUrl(),
  );
}

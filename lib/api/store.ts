import { apiRequest } from "@/lib/api/client";
import type {
  CategoryResponse,
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

export async function listMyStoreBags(accessToken: string) {
  const baseUrl = storeApiBaseUrl();
  const store = await apiRequest<StoreProfileResponse>(
    "/api/stores/me",
    { method: "GET", headers: bearer(accessToken) },
    baseUrl,
  );
  return apiRequest<SurpriseBagResponse[]>(
    `/api/bags/store/${encodeURIComponent(store.id)}`,
    { method: "GET" },
    baseUrl,
  );
}

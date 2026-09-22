import { apiRequest } from "@/lib/api/client";

const CART_API_BASE_URL = process.env.NEXT_PUBLIC_CART_API_URL;

export type CartItemResponse = {
  bagId: string;
  storeId: string;
  bagNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  imageUrlSnapshot: string | null;
  pickupStartUtc: string;
  pickupEndUtc: string;
  addedAtUtc: string;
  lineTotal: number;
};

export type CartResponse = {
  userId: string;
  storeId: string;
  currency: string;
  items: CartItemResponse[];
  version: number;
  createdAtUtc: string;
  updatedAtUtc: string;
  expiresAtUtc: string;
  totalQuantity: number;
  subtotal: number;
};

export type AddCartItemRequest = {
  bagId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

function cartApiBaseUrl() {
  if (!CART_API_BASE_URL) throw new Error("NEXT_PUBLIC_CART_API_URL is not configured.");
  return CART_API_BASE_URL;
}

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function listCarts(accessToken: string) {
  return apiRequest<CartResponse[]>(
    "/api/cart",
    { method: "GET", headers: bearer(accessToken) },
    cartApiBaseUrl(),
  );
}

export function getCart(accessToken: string, storeId: string) {
  return apiRequest<CartResponse>(
    `/api/cart/stores/${encodeURIComponent(storeId)}`,
    { method: "GET", headers: bearer(accessToken) },
    cartApiBaseUrl(),
  );
}

export function addCartItem(accessToken: string, request: AddCartItemRequest) {
  return apiRequest<CartResponse>(
    "/api/cart/items",
    { method: "POST", headers: bearer(accessToken), body: request },
    cartApiBaseUrl(),
  );
}

export function updateCartItemQuantity(
  accessToken: string,
  storeId: string,
  bagId: string,
  request: UpdateCartItemRequest,
) {
  return apiRequest<CartResponse>(
    `/api/cart/stores/${encodeURIComponent(storeId)}/items/${encodeURIComponent(bagId)}`,
    { method: "PATCH", headers: bearer(accessToken), body: request },
    cartApiBaseUrl(),
  );
}

export function removeCartItem(accessToken: string, storeId: string, bagId: string) {
  return apiRequest<CartResponse>(
    `/api/cart/stores/${encodeURIComponent(storeId)}/items/${encodeURIComponent(bagId)}`,
    { method: "DELETE", headers: bearer(accessToken) },
    cartApiBaseUrl(),
  );
}

export function clearStoreCart(accessToken: string, storeId: string) {
  return apiRequest<null>(
    `/api/cart/stores/${encodeURIComponent(storeId)}`,
    { method: "DELETE", headers: bearer(accessToken) },
    cartApiBaseUrl(),
  );
}

export function clearAllCarts(accessToken: string) {
  return apiRequest<null>(
    "/api/cart",
    { method: "DELETE", headers: bearer(accessToken) },
    cartApiBaseUrl(),
  );
}

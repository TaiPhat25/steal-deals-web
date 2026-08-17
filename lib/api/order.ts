import { apiRequest } from "@/lib/api/client";
import type { CreateOrderRequest, OrderResponse } from "@/lib/api/dashboard-types";

const ORDER_API_BASE_URL = process.env.NEXT_PUBLIC_ORDER_API_URL;

function orderApiBaseUrl() {
  if (!ORDER_API_BASE_URL) throw new Error("NEXT_PUBLIC_ORDER_API_URL is not configured.");
  return ORDER_API_BASE_URL;
}

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function createOrder(accessToken: string, request: CreateOrderRequest) {
  return apiRequest<OrderResponse>(
    "/api/orders",
    { method: "POST", headers: bearer(accessToken), body: request },
    orderApiBaseUrl(),
  );
}

export function getOrder(accessToken: string, id: string) {
  return apiRequest<OrderResponse>(
    `/api/orders/${encodeURIComponent(id)}`,
    { method: "GET", headers: bearer(accessToken) },
    orderApiBaseUrl(),
  );
}

export function listMyOrders(accessToken: string) {
  return apiRequest<OrderResponse[]>(
    "/api/orders/my-orders",
    { method: "GET", headers: bearer(accessToken) },
    orderApiBaseUrl(),
  );
}

export function listStoreOrders(accessToken: string, storeId: string) {
  return apiRequest<OrderResponse[]>(
    `/api/orders/store/${encodeURIComponent(storeId)}`,
    { method: "GET", headers: bearer(accessToken) },
    orderApiBaseUrl(),
  );
}

export function updateOrderStatus(accessToken: string, id: string, status: string) {
  return apiRequest<OrderResponse>(
    `/api/orders/${encodeURIComponent(id)}/status`,
    { method: "PATCH", headers: bearer(accessToken), body: { status } },
    orderApiBaseUrl(),
  );
}

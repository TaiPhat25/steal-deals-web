import { apiRequest } from "@/lib/api/client";
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  PagedResult,
  UserDetail,
  UserSummary,
} from "@/lib/api/admin-types";

function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function listAdminUsers(accessToken: string, searchParams: URLSearchParams) {
  return apiRequest<PagedResult<UserSummary>>(
    `/api/user?${searchParams.toString()}`,
    { method: "GET", headers: bearer(accessToken) },
  );
}

export function getAdminUser(accessToken: string, id: string) {
  return apiRequest<UserDetail>(`/api/user/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: bearer(accessToken),
  });
}

export function createAdminUser(
  accessToken: string,
  request: AdminCreateUserRequest,
) {
  return apiRequest<UserDetail>("/api/user", {
    method: "POST",
    headers: bearer(accessToken),
    body: request,
  });
}

export function updateAdminUser(
  accessToken: string,
  id: string,
  request: AdminUpdateUserRequest,
) {
  return apiRequest<null>(`/api/user/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: bearer(accessToken),
    body: request,
  });
}

export function deleteAdminUser(accessToken: string, id: string) {
  return apiRequest<null>(`/api/user/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: bearer(accessToken),
  });
}

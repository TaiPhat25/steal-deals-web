import { apiRequest } from "@/lib/api/client";
import type {
  AccessTokenResponse,
  CurrentUser,
  LoginRequest,
  MessageResponse,
} from "@/lib/api/store-types";

type AdminCurrentUserResponse = {
  adminId: string | null;
  email: string | null;
  name: string | null;
  roles: string[];
};

export function adminLogin(request: LoginRequest) {
  return apiRequest<AccessTokenResponse>("/api/admin-auth/login", {
    method: "POST",
    body: request,
  });
}

export function refreshAdminAccessToken() {
  return apiRequest<AccessTokenResponse>("/api/admin-auth/refresh", {
    method: "POST",
  });
}

export function adminLogout() {
  return apiRequest<MessageResponse>("/api/admin-auth/logout", {
    method: "POST",
  });
}

export async function getCurrentAdmin(accessToken: string): Promise<CurrentUser> {
  const admin = await apiRequest<AdminCurrentUserResponse>("/api/admin-auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    userId: admin.adminId,
    email: admin.email,
    name: admin.name,
    roles: admin.roles,
  };
}

import { apiRequest } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/store-types";

export type UpdateProfileRequest = {
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export function getProfile(accessToken: string) {
  return apiRequest<UserProfile>("/api/identity/account/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updateProfile(accessToken: string, request: UpdateProfileRequest) {
  return apiRequest<UserProfile>("/api/identity/account/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: request,
  });
}

export function uploadAvatar(accessToken: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UserProfile>("/api/identity/account/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

import { apiRequest } from "@/lib/api/client";
import type { UserAddress, UserProfile } from "@/lib/api/store-types";

export type UpdateProfileRequest = {
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
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

export function changePassword(accessToken: string, request: ChangePasswordRequest) {
  return apiRequest<null>("/api/identity/account/password", {
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

export type UserAddressRequest = {
  label: string;
  address: string;
  commune: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

export function getAddresses(accessToken: string) {
  return apiRequest<UserAddress[]>("/api/identity/account/addresses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getAddress(accessToken: string, addressId: string) {
  return apiRequest<UserAddress>(`/api/identity/account/addresses/${addressId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createAddress(accessToken: string, request: UserAddressRequest) {
  return apiRequest<UserAddress>("/api/identity/account/addresses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: request,
  });
}

export function updateAddress(accessToken: string, addressId: string, request: UserAddressRequest) {
  return apiRequest<UserAddress>(`/api/identity/account/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: request,
  });
}

export function deleteAddress(accessToken: string, addressId: string) {
  return apiRequest<null>(`/api/identity/account/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

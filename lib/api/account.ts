import { apiRequest } from "@/lib/api/client";
import type { UserProfile } from "@/lib/api/store-types";

export function getProfile(accessToken: string) {
  return apiRequest<UserProfile>("/api/account/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

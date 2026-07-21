import { apiRequest } from "@/lib/api/client";
import type {
  AccessTokenResponse,
  CurrentUser,
  LoginRequest,
  MessageResponse,
  RegistrationResponse,
  RegisterRequest,
  ResendOtpRequest,
  VerifyEmailRequest,
} from "@/lib/api/types";

export function login(request: LoginRequest) {
  return apiRequest<AccessTokenResponse>("/api/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest) {
  return apiRequest<RegistrationResponse>("/api/auth/register", {
    method: "POST",
    body: request,
  });
}

export function refreshAccessToken() {
  return apiRequest<AccessTokenResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export function logout() {
  return apiRequest<MessageResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<CurrentUser>("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function verifyEmail(request: VerifyEmailRequest) {
  return apiRequest<MessageResponse>("/api/auth/verify-email", {
    method: "POST",
    body: request,
  });
}

export function resendVerificationOtp(request: ResendOtpRequest) {
  return apiRequest<MessageResponse>("/api/auth/resend-otp", {
    method: "POST",
    body: request,
  });
}

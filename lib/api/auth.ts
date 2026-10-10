import { apiRequest } from "@/lib/api/client";
import type {
  AccessTokenResponse,
  CurrentUser,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegistrationResponse,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/lib/api/store-types";

export function login(request: LoginRequest) {
  return apiRequest<AccessTokenResponse>("/api/identity/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest) {
  return apiRequest<RegistrationResponse>("/api/identity/auth/register", {
    method: "POST",
    body: request,
  });
}

export function refreshAccessToken() {
  return apiRequest<AccessTokenResponse>("/api/identity/auth/refresh", {
    method: "POST",
  });
}

export function logout() {
  return apiRequest<MessageResponse>("/api/identity/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<CurrentUser>("/api/identity/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function verifyEmail(request: VerifyEmailRequest) {
  return apiRequest<MessageResponse>("/api/identity/auth/verify-email", {
    method: "POST",
    body: request,
  });
}

export function resendVerificationOtp(request: ResendOtpRequest) {
  return apiRequest<MessageResponse>("/api/identity/auth/resend-otp", {
    method: "POST",
    body: request,
  });
}

export function requestPasswordReset(request: ForgotPasswordRequest) {
  return apiRequest<MessageResponse>("/api/identity/auth/forgot-password", {
    method: "POST",
    body: request,
  });
}

export function resetPassword(request: ResetPasswordRequest) {
  return apiRequest<MessageResponse>("/api/identity/auth/reset-password", {
    method: "POST",
    body: request,
  });
}

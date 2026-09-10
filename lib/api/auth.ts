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

export function requestPasswordReset(request: ForgotPasswordRequest) {
  return apiRequest<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: request,
  });
}

export function resetPassword(request: ResetPasswordRequest) {
  return apiRequest<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: request,
  });
}

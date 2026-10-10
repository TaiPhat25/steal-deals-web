import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  login,
  register,
  refreshAccessToken,
  logout,
  getCurrentUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationOtp,
} from "./auth";
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
} from "./store-types";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();

  return {
    ...actual,
    apiRequest: mocks.apiRequest,
  };
});

describe("Auth API", () => {
  beforeEach(() => {
    mocks.apiRequest.mockReset();
  });

  it("should send login credentials to the login endpoint", async () => {
    const request: LoginRequest = {
      email: "buyer@example.com",
      password: "password123",
    };
    const apiResponse: AccessTokenResponse = {
      accessToken: "access-token",
      accessTokenExpiresAt: "2026-10-04T12:00:00Z",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await login(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send the registration details to the register endpoint", async () => {
    const request: RegisterRequest = {
      email: "buyer@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Kenworth",
      phone: "0123456789",
    };
    const apiResponse: RegistrationResponse = {
      message: "Registration successful. Please verify your email.",
      requiresEmailVerification: true,
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await register(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should request a new access token from the refresh endpoint", async () => {
    const apiResponse: AccessTokenResponse = {
      accessToken: "new-access-token",
      accessTokenExpiresAt: "2026-10-07T12:00:00Z",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await refreshAccessToken();

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/refresh", {
      method: "POST",
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send a logout request to the logout endpoint", async () => {
    const apiResponse: MessageResponse = {
      message: "Logged out successfully.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await logout();

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(response).toEqual(apiResponse);
  });

  it("should request the current user with the access token", async () => {
    const accessToken = "access-token";
    const apiResponse: CurrentUser = {
      userId: "user-123",
      email: "buyer@example.com",
      name: "John Kenworth",
      roles: ["Buyer"],
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await getCurrentUser(accessToken);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer access-token",
      },
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send the email verification code to the verify-email endpoint", async () => {
    const request: VerifyEmailRequest = {
      email: "buyer@example.com",
      otp: "123456",
    };
    const apiResponse: MessageResponse = {
      message: "Email verified successfully.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await verifyEmail(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/verify-email", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send the email address to the resend-otp endpoint", async () => {
    const request: ResendOtpRequest = {
      email: "buyer@example.com",
    };
    const apiResponse: MessageResponse = {
      message: "A new verification code has been sent.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await resendVerificationOtp(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/resend-otp", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send the email address to the forgot-password endpoint", async () => {
    const request: ForgotPasswordRequest = {
      email: "buyer@example.com",
    };
    const apiResponse: MessageResponse = {
      message: "A password reset code has been sent.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await requestPasswordReset(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/forgot-password", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should send the reset code and new password to the reset-password endpoint", async () => {
    const request: ResetPasswordRequest = {
      email: "buyer@example.com",
      otp: "123456",
      newPassword: "NewPassword123",
    };
    const apiResponse: MessageResponse = {
      message: "Password reset successfully.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await resetPassword(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/auth/reset-password", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should propagate an API client error without modifying it", async () => {
    const request: LoginRequest = {
      email: "buyer@example.com",
      password: "incorrect-password",
    };
    const apiError = new ApiClientError(401, "Invalid email or password.", {
      code: "INVALID_CREDENTIALS",
    });

    mocks.apiRequest.mockRejectedValueOnce(apiError);

    await expect(login(request)).rejects.toBe(apiError);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
  });
});

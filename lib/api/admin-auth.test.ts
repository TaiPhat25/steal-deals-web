import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminLogin,
  refreshAdminAccessToken,
  adminLogout,
  getCurrentAdmin,
} from "./admin-auth";
import type {
  AccessTokenResponse,
  LoginRequest,
  MessageResponse,
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

describe("Admin Auth API", () => {
  beforeEach(() => {
    mocks.apiRequest.mockReset();
  });

  it("should send admin credentials to the admin login endpoint", async () => {
    const request: LoginRequest = {
      email: "admin@example.com",
      password: "adminpassword123",
    };
    const apiResponse: AccessTokenResponse = {
      accessToken: "admin-access-token",
      accessTokenExpiresAt: "2026-10-07T12:00:00Z",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await adminLogin(request);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/login", {
      method: "POST",
      body: request,
    });
    expect(response).toEqual(apiResponse);
  });

  it("should propagate an admin login error without modifying it", async () => {
    const request: LoginRequest = {
      email: "admin@example.com",
      password: "wrong-password",
    };

    const apiError = new ApiClientError(401, "Invalid admin credentials.", {
      code: "INVALID_CREDENTIALS",
    });

    mocks.apiRequest.mockRejectedValueOnce(apiError);

    await expect(adminLogin(request)).rejects.toBe(apiError);
    expect(mocks.apiRequest).toHaveBeenCalledOnce();
  });

  it("should request a new admin access token from the refresh endpoint", async () => {
    const apiResponse: AccessTokenResponse = {
      accessToken: "admin-access-token",
      accessTokenExpiresAt: "2026-10-07T12:00:00Z",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await refreshAdminAccessToken();

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/refresh", {
      method: "POST",
    });
    expect(response).toEqual(apiResponse);
  });

  it("should propagate an admin token refresh error without modifying it", async () => {
    const apiError = new ApiClientError(
      401,
      "Admin refresh token is invalid.",
      { code: "INVALID_REFRESH_TOKEN" },
    );

    mocks.apiRequest.mockRejectedValueOnce(apiError);

    await expect(refreshAdminAccessToken()).rejects.toBe(apiError);
    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/refresh", {
      method: "POST",
    });
  });

  it("should send a logout request to the admin logout endpoint", async () => {
    const apiResponse: MessageResponse = {
      message: "Logged out successfully.",
    };

    mocks.apiRequest.mockResolvedValueOnce(apiResponse);

    const response = await adminLogout();

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/logout", {
      method: "POST",
    });
    expect(response).toEqual(apiResponse);
  });

  it("should propagate an admin logout error without modifying it", async () => {
    const apiError = new ApiClientError(401, "Admin logout failed.", {
      code: "LOGOUT_FAILED",
    });

    mocks.apiRequest.mockRejectedValueOnce(apiError);

    await expect(adminLogout()).rejects.toBe(apiError);

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/logout", {
      method: "POST",
    });
  });

  it("should request the current admin with the access token", async () => {
    mocks.apiRequest.mockResolvedValueOnce({
      adminId: "admin-123",
      email: "admin@example.com",
      name: "Admin User",
      roles: ["Admin"],
    });

    await getCurrentAdmin("admin-access-token");

    expect(mocks.apiRequest).toHaveBeenCalledOnce();
    expect(mocks.apiRequest).toHaveBeenCalledWith("/api/admin-auth/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer admin-access-token",
      },
    });
  });

  it("should map adminId to userId in the current admin response", async () => {
    mocks.apiRequest.mockResolvedValueOnce({
      adminId: "admin-456",
      email: "admin@example.com",
      name: "Admin User",
      roles: ["Admin"],
    });

    const response = await getCurrentAdmin("admin-access-token");

    expect(response.userId).toBe("admin-456");
    expect(response.email).toBe("admin@example.com");
    expect(response.name).toBe("Admin User");
    expect(response.roles).toEqual(["Admin"]);
  });

  it("should preserve nullable fields in the current admin response", async () => {
    mocks.apiRequest.mockResolvedValueOnce({
      adminId: null,
      email: null,
      name: null,
      roles: [],
    });

    const response = await getCurrentAdmin("admin-access-token");

    expect(response).toEqual({
      userId: null,
      email: null,
      name: null,
      roles: [],
    });
  });

  it("should propagate a current-admin request error without modifying it", async () => {
    const apiError = new ApiClientError(401, "Unable to load admin profile.", {
      code: "ADMIN_PROFILE_ERROR",
    });

    mocks.apiRequest.mockRejectedValueOnce(apiError);

    await expect(getCurrentAdmin("admin-access-token")).rejects.toBe(apiError);
    expect(mocks.apiRequest).toHaveBeenCalledOnce();
  });
});

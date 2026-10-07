import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider, { useAuth } from "./AuthProvider";
import type {
  AccessTokenResponse,
  CurrentUser,
  RegistrationResponse,
} from "@/lib/api/store-types";
import type { PropsWithChildren } from "react";
import { ApiClientError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  refreshAccessToken: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  adminLogin: vi.fn(),
  adminLogout: vi.fn(),
  getCurrentAdmin: vi.fn(),
  refreshAdminAccessToken: vi.fn(),
  setAccessTokenRefreshHandler: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  refreshAccessToken: mocks.refreshAccessToken,
  getCurrentUser: mocks.getCurrentUser,
  login: mocks.login,
  logout: mocks.logout,
  register: mocks.register,
}));

vi.mock("@/lib/api/admin-auth", () => ({
  adminLogin: mocks.adminLogin,
  adminLogout: mocks.adminLogout,
  getCurrentAdmin: mocks.getCurrentAdmin,
  refreshAdminAccessToken: mocks.refreshAdminAccessToken,
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();

  return {
    ...actual,
    setAccessTokenRefreshHandler: mocks.setAccessTokenRefreshHandler,
  };
});

function AuthStateProbe() {
  const auth = useAuth();

  return (
    <>
      <div data-testid="initialized">{String(auth.isInitialized)}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="access-token">{auth.accessToken ?? "none"}</div>
      <div data-testid="user-email">{auth.currentUser?.email ?? "none"}</div>
    </>
  );
}

function UserAuthWrapper({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}

function AdminAuthWrapper({ children }: PropsWithChildren) {
  return <AuthProvider mode="admin">{children}</AuthProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it("should throw an error when useAuth is used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used inside an AuthProvider.");
  });

  it("should remain uninitialized while restoring the session and authenticate after a successful restoration", async () => {
    let resolveRefresh!: (response: AccessTokenResponse) => void;

    const pendingRefresh = new Promise<AccessTokenResponse>((resolve) => {
      resolveRefresh = resolve;
    });
    const currentUser: CurrentUser = {
      userId: "user-1",
      email: "buyer@example.com",
      name: "Buyer One",
      roles: ["Buyer"],
    };

    mocks.refreshAccessToken.mockReturnValueOnce(pendingRefresh);
    mocks.getCurrentUser.mockResolvedValueOnce(currentUser);

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("initialized")).toHaveTextContent("false");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("access-token")).toHaveTextContent("none");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");

    await act(async () => {
      resolveRefresh({
        accessToken: "restored-token",
        accessTokenExpiresAt: "2026-09-29T12:00:00Z",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("initialized")).toHaveTextContent("true");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("access-token")).toHaveTextContent(
        "restored-token",
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "buyer@example.com",
      );
    });

    expect(mocks.refreshAccessToken).toHaveBeenCalledOnce();
    expect(mocks.getCurrentUser).toHaveBeenCalledWith("restored-token");
  });

  it("should initialize as unauthenticated when session restoration fails", async () => {
    mocks.refreshAccessToken.mockRejectedValueOnce(
      new Error("Refresh token is invalid."),
    );

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("initialized")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("access-token")).toHaveTextContent("none");
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(mocks.refreshAccessToken).toHaveBeenCalledOnce();
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  });

  it("should log in a user, load their profile, and update the authentication state", async () => {
    const loginRequest = {
      email: "buyer@example.com",
      password: "Password123",
    };
    const tokenResponse: AccessTokenResponse = {
      accessToken: "login-token",
      accessTokenExpiresAt: "2026-09-30T12:00:00Z",
    };
    const currentUser: CurrentUser = {
      userId: "user-1",
      email: "buyer@example.com",
      name: "Buyer One",
      roles: ["Buyer"],
    };

    mocks.refreshAccessToken.mockRejectedValueOnce(
      new Error("No existing session."),
    );
    mocks.login.mockResolvedValueOnce(tokenResponse);
    mocks.getCurrentUser.mockResolvedValueOnce(currentUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: UserAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let response:
      | (AccessTokenResponse & { user: CurrentUser | null })
      | undefined;

    await act(async () => {
      response = await result.current.login(loginRequest);
    });

    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.login).toHaveBeenCalledWith(loginRequest);
    expect(mocks.getCurrentUser).toHaveBeenCalledWith("login-token");
    expect(result.current.accessToken).toBe("login-token");
    expect(result.current.currentUser).toEqual(currentUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(response).toEqual({
      ...tokenResponse,
      user: currentUser,
    });
  });

  it("should use the admin authentication APIs when mode is admin", async () => {
    const credentials = {
      email: "admin@stealdeals.com",
      password: "AdminPassword123",
    };
    const tokenResponse: AccessTokenResponse = {
      accessToken: "admin-token",
      accessTokenExpiresAt: "2026-09-30T12:00:00Z",
    };
    const currentAdmin: CurrentUser = {
      userId: "admin-1",
      email: "admin@stealdeals.com",
      name: "System Administrator",
      roles: ["Admin"],
    };

    mocks.refreshAdminAccessToken.mockRejectedValueOnce(
      new Error("No existing admin session."),
    );
    mocks.adminLogin.mockResolvedValueOnce(tokenResponse);
    mocks.getCurrentAdmin.mockResolvedValueOnce(currentAdmin);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AdminAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(mocks.refreshAdminAccessToken).toHaveBeenCalledOnce();
    expect(mocks.refreshAccessToken).not.toHaveBeenCalled();
    expect(mocks.adminLogin).toHaveBeenCalledOnce();
    expect(mocks.adminLogin).toHaveBeenCalledWith(credentials);
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.getCurrentAdmin).toHaveBeenCalledWith("admin-token");
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
    expect(result.current.accessToken).toBe("admin-token");
    expect(result.current.currentUser).toEqual(currentAdmin);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should reset the loading state and remain unauthenticated when login fails", async () => {
    const credentials = {
      email: "buyer@example.com",
      password: "WrongPassword",
    };

    mocks.refreshAccessToken.mockRejectedValueOnce(
      new Error("No existing session."),
    );
    mocks.login.mockRejectedValueOnce(
      new ApiClientError(401, "Invalid credentials."),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: UserAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await expect(result.current.login(credentials)).rejects.toThrow(
        "Invalid credentials.",
      );
    });

    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.login).toHaveBeenCalledWith(credentials);
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(result.current.currentUser).toBeNull();
  });

  it("should register a user and expose the loading state while the request is pending", async () => {
    const registrationRequest = {
      firstName: "Buyer",
      lastName: "One",
      email: "newbuyer@example.com",
      password: "Password123",
      phone: "0123456789",
    };
    const registrationResponse: RegistrationResponse = {
      message: "Registration successful.",
      requiresEmailVerification: true,
    };

    let resolveRegistration!: (response: RegistrationResponse) => void;

    const pendingRegistration = new Promise<RegistrationResponse>((resolve) => {
      resolveRegistration = resolve;
    });

    mocks.refreshAccessToken.mockRejectedValueOnce(
      new Error("No existing session."),
    );
    mocks.register.mockReturnValueOnce(pendingRegistration);

    const { result } = renderHook(() => useAuth(), {
      wrapper: UserAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let registrationPromise!: Promise<RegistrationResponse>;

    act(() => {
      registrationPromise = result.current.register(registrationRequest);
    });

    expect(result.current.isLoading).toBe(true);
    expect(mocks.register).toHaveBeenCalledOnce();
    expect(mocks.register).toHaveBeenCalledWith(registrationRequest);

    let response!: RegistrationResponse;

    await act(async () => {
      resolveRegistration(registrationResponse);
      response = await registrationPromise;
    });

    expect(response).toEqual(registrationResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });

  it("should refresh the access token and update the authentication state", async () => {
    const tokenResponse: AccessTokenResponse = {
      accessToken: "manually-refreshed-token",
      accessTokenExpiresAt: "2026-09-30T13:00:00Z",
    };

    mocks.refreshAccessToken
      .mockRejectedValueOnce(new Error("No existing session."))
      .mockResolvedValueOnce(tokenResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: UserAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(false);

    let response!: AccessTokenResponse;

    await act(async () => {
      response = await result.current.refreshAccessToken();
    });

    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(2);
    expect(response).toEqual(tokenResponse);
    expect(result.current.accessToken).toBe("manually-refreshed-token");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
    expect(result.current.currentUser).toBeNull();
  });

  it("should clear authentication state even when the logout request fails", async () => {
    const tokenResponse: AccessTokenResponse = {
      accessToken: "authenticated-token",
      accessTokenExpiresAt: "2026-09-30T14:00:00Z",
    };
    const currentUser: CurrentUser = {
      userId: "user-1",
      email: "buyer@example.com",
      name: "Buyer One",
      roles: ["Buyer"],
    };

    mocks.refreshAccessToken.mockResolvedValueOnce(tokenResponse);
    mocks.getCurrentUser.mockResolvedValueOnce(currentUser);
    mocks.logout.mockRejectedValueOnce(
      new ApiClientError(500, "Logout service is unavailable."),
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: UserAuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.accessToken).toBe("authenticated-token");
    expect(result.current.currentUser).toEqual(currentUser);
    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow(
        "Logout service is unavailable.",
      );
    });
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should register the access-token refresh handler on mount and clear it on unmount", async () => {
    mocks.refreshAccessToken.mockRejectedValueOnce(
      new Error("No existing session."),
    );

    const { unmount } = render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("initialized")).toHaveTextContent("true");
    });
    expect(mocks.setAccessTokenRefreshHandler).toHaveBeenCalledOnce();
    expect(mocks.setAccessTokenRefreshHandler).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
    );

    unmount();

    expect(mocks.setAccessTokenRefreshHandler).toHaveBeenCalledTimes(2);
    expect(mocks.setAccessTokenRefreshHandler).toHaveBeenNthCalledWith(2, null);
  });
});

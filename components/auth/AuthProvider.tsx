"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken as refreshAccessTokenRequest,
  register as registerRequest,
} from "@/lib/api/auth";
import {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  refreshAdminAccessToken,
} from "@/lib/api/admin-auth";
import { setAccessTokenRefreshHandler } from "@/lib/api/client";
import type {
  AccessTokenResponse,
  CurrentUser,
  LoginRequest,
  RegistrationResponse,
  RegisterRequest,
} from "@/lib/api/store-types";

type AuthContextValue = {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<AccessTokenResponse & { user: CurrentUser | null }>;
  register: (request: RegisterRequest) => Promise<RegistrationResponse>;
  refreshAccessToken: () => Promise<AccessTokenResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<CurrentUser>;
};

export type AuthMode = "user" | "admin";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({
  children,
  mode = "user",
}: {
  children: React.ReactNode;
  mode?: AuthMode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const restoreSessionPromise = useRef<Promise<string | null> | null>(null);

  const runAuthRequest = useCallback(
    async (request: () => Promise<AccessTokenResponse>) => {
      setIsLoading(true);

      try {
        const response = await request();
        setAccessToken(response.accessToken);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadCurrentUser = useCallback(async (token: string) => {
    try {
      const user = mode === "admin" ? await getCurrentAdmin(token) : await getCurrentUser(token);
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }, [mode]);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await runAuthRequest(() =>
        mode === "admin" ? adminLogin(request) : loginRequest(request),
      );
      const user = await loadCurrentUser(response.accessToken);
      return { ...response, user };
    },
    [loadCurrentUser, mode, runAuthRequest],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      setIsLoading(true);

      try {
        return await registerRequest(request);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refreshAccessToken = useCallback(
    () =>
      runAuthRequest(
        mode === "admin" ? refreshAdminAccessToken : refreshAccessTokenRequest,
      ),
    [mode, runAuthRequest],
  );

  const refreshAccessTokenForRequest = useCallback(async () => {
    try {
      const response =
        mode === "admin"
          ? await refreshAdminAccessToken()
          : await refreshAccessTokenRequest();
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch {
      setAccessToken(null);
      setCurrentUser(null);
      return null;
    }
  }, [mode]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await refreshAccessTokenForRequest();

      if (token) {
        await loadCurrentUser(token);
      }

      return token;
    };

    if (!restoreSessionPromise.current) {
      restoreSessionPromise.current = restoreSession();
    }

    void restoreSessionPromise.current.then(() => {
      setIsInitialized(true);
    });
  }, [loadCurrentUser, refreshAccessTokenForRequest]);

  useEffect(() => {
    setAccessTokenRefreshHandler(refreshAccessTokenForRequest);

    return () => {
      setAccessTokenRefreshHandler(null);
    };
  }, [refreshAccessTokenForRequest]);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      if (mode === "admin") {
        await adminLogout();
      } else {
        await logoutRequest();
      }
    } finally {
      setAccessToken(null);
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [mode]);

  const getUser = useCallback(async () => {
    if (!accessToken) {
      throw new Error("An access token is required to load the current user.");
    }

    const user = await loadCurrentUser(accessToken);

    if (!user) {
      throw new Error("Unable to load the current user.");
    }

    return user;
  }, [accessToken, loadCurrentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      currentUser,
      isAuthenticated: accessToken !== null,
      isInitialized,
      isLoading,
      login,
      register,
      refreshAccessToken,
      logout,
      getCurrentUser: getUser,
    }),
    [
      accessToken,
      currentUser,
      getUser,
      isInitialized,
      isLoading,
      login,
      logout,
      refreshAccessToken,
      register,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}

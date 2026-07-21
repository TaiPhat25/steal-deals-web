"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken as refreshAccessTokenRequest,
  register as registerRequest,
} from "@/lib/api/auth";
import type {
  AccessTokenResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from "@/lib/api/types";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<AccessTokenResponse>;
  register: (request: RegisterRequest) => Promise<AccessTokenResponse>;
  refreshAccessToken: () => Promise<AccessTokenResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<CurrentUser>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCESS_TOKEN_KEY = "stealdeal_access_token";
const ACCESS_TOKEN_EXPIRY_KEY = "stealdeal_access_token_expires_at";

function rememberAccessToken(response: AccessTokenResponse) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  sessionStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, response.accessTokenExpiresAt);
}

function forgetAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      const storedExpiry = sessionStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
      const expiryTime = storedExpiry ? new Date(storedExpiry).getTime() : 0;

      if (storedToken && expiryTime > Date.now()) {
        setAccessToken(storedToken);
      } else {
        forgetAccessToken();
      }
      setIsInitialized(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const runAuthRequest = useCallback(
    async (request: () => Promise<AccessTokenResponse>) => {
      setIsLoading(true);

      try {
        const response = await request();
        setAccessToken(response.accessToken);
        rememberAccessToken(response);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    (request: LoginRequest) => runAuthRequest(() => loginRequest(request)),
    [runAuthRequest],
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
    () => runAuthRequest(refreshAccessTokenRequest),
    [runAuthRequest],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      forgetAccessToken();
      setIsLoading(false);
    }
  }, []);

  const getUser = useCallback(async () => {
    if (!accessToken) {
      throw new Error("An access token is required to load the current user.");
    }

    return getCurrentUser(accessToken);
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: accessToken !== null,
      isInitialized,
      isLoading,
      login,
      register,
      refreshAccessToken,
      logout,
      getCurrentUser: getUser,
    }),
    [accessToken, getUser, isInitialized, isLoading, login, logout, refreshAccessToken, register],
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

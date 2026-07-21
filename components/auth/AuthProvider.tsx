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
import { setAccessTokenRefreshHandler } from "@/lib/api/client";
import type {
  AccessTokenResponse,
  CurrentUser,
  LoginRequest,
  RegistrationResponse,
  RegisterRequest,
} from "@/lib/api/types";

type AuthContextValue = {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<AccessTokenResponse>;
  register: (request: RegisterRequest) => Promise<RegistrationResponse>;
  refreshAccessToken: () => Promise<AccessTokenResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<CurrentUser>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
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
      const user = await getCurrentUser(token);
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await runAuthRequest(() => loginRequest(request));
      await loadCurrentUser(response.accessToken);
      return response;
    },
    [loadCurrentUser, runAuthRequest],
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

  const refreshAccessTokenForRequest = useCallback(async () => {
    try {
      const response = await refreshAccessTokenRequest();
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch {
      setAccessToken(null);
      setCurrentUser(null);
      return null;
    }
  }, []);

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
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, []);

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

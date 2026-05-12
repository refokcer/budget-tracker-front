import { createContext, useCallback, useContext, useState, useEffect, useRef } from "react";
import API_ENDPOINTS from "../config/apiConfig";
import {
  apiFetch,
  apiJson,
  configureApiClient,
  refreshAccessToken,
} from "../services/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refreshToken")
  );
  const [initializing, setInitializing] = useState(true);

  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  const saveTokens = useCallback(({ accessToken, refreshToken }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    accessTokenRef.current = accessToken;
    refreshTokenRef.current = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      getRefreshToken: () => refreshTokenRef.current,
      onTokens: saveTokens,
      onUnauthorized: clearTokens,
    });
  }, [clearTokens, saveTokens]);

  const register = async (email, password) => {
    const data = await apiJson(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: { email, password },
      auth: false,
    }, "Registration failed");
    saveTokens(data);
  };

  const login = async (email, password) => {
    const data = await apiJson(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: { email, password },
      auth: false,
    }, "Login failed");
    saveTokens(data);
  };

  const logout = useCallback(async () => {
    if (accessToken && refreshToken) {
      await apiFetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        body: { accessToken, refreshToken },
        retryOnUnauthorized: false,
      }).catch(() => {});
    }
    clearTokens();
  }, [accessToken, clearTokens, refreshToken]);

  const refresh = useCallback(async () => {
    return refreshAccessToken();
  }, []);
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json =
        typeof window === "undefined"
          ? Buffer.from(base64, "base64").toString("utf-8")
          : window.atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const verify = async () => {
      const token = accessTokenRef.current;
      if (token) {
        const payload = parseJwt(token);
        if (!payload || payload.exp * 1000 <= Date.now()) {
          const newToken = await refresh();
          if (!newToken) {
            await logout();
          }
        }
      }
      setInitializing(false);
    };
    verify();
  }, [logout, refresh]);
  const value = {
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    initializing,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

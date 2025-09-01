import { createContext, useContext, useState, useEffect, useRef } from "react";
import API_ENDPOINTS, { BASE_URL } from "../config/apiConfig";

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

  const saveTokens = ({ accessToken, refreshToken }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    accessTokenRef.current = accessToken;
    refreshTokenRef.current = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const register = async (email, password) => {
    const res = await fetch(API_ENDPOINTS.auth.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    const data = await res.json();
    saveTokens(data);
  };

  const login = async (email, password) => {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    saveTokens(data);
  };

  const logout = async () => {
    if (accessToken && refreshToken) {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      }).catch(() => {});
    }
    setAccessToken(null);
    setRefreshToken(null);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const refresh = async () => {
    const currentAccess = accessTokenRef.current;
    const currentRefresh = refreshTokenRef.current;
    if (!currentAccess || !currentRefresh) return null;
    const res = await fetch(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentAccess}`,
      },
      body: JSON.stringify({ accessToken: currentAccess, refreshToken: currentRefresh }),
    });
    if (res.ok) {
      const data = await res.json();
      saveTokens(data);
      return data.accessToken;
    } else {
      await logout();
      return null;
    }
  };
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
  }, []);
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const options = { ...init };
      const token = accessTokenRef.current;
      if (token && url.startsWith(BASE_URL)) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
      let response = await originalFetch(input, options);
      if (response.status === 401 && refreshTokenRef.current) {
        const newToken = await refresh();
        if (newToken) {
          options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessTokenRef.current}`,
          };
          response = await originalFetch(input, options);
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

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

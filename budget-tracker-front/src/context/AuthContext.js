import { createContext, useContext, useState, useEffect } from "react";
import API_ENDPOINTS, { BASE_URL } from "../config/apiConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refreshToken")
  );

  const saveTokens = ({ accessToken, refreshToken }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const refresh = async () => {
    if (!accessToken || !refreshToken) return null;
    const res = await fetch(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ accessToken, refreshToken }),
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

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const options = { ...init };
      if (accessToken && url.startsWith(BASE_URL)) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        };
      }
      let response = await originalFetch(input, options);
      if (response.status === 401 && refreshToken) {
        const newToken = await refresh();
        if (newToken) {
          options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          response = await originalFetch(input, options);
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [accessToken, refreshToken]);

  const value = {
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
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

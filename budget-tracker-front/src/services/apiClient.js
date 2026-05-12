import API_ENDPOINTS, { BASE_URL } from "../config/apiConfig";

let authState = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  onTokens: null,
  onUnauthorized: null,
};

let refreshPromise = null;

export class ApiError extends Error {
  constructor({ status = 0, code = "request_error", message, errors = [], traceId = null }) {
    super(message || "Request failed.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = Array.isArray(errors) ? errors.filter(Boolean) : [];
    this.traceId = traceId;
  }
}

export const configureApiClient = (config = {}) => {
  authState = {
    ...authState,
    ...config,
  };
};

export const parseApiError = async (response, fallbackMessage = "Request failed.") => {
  const status = response?.status || 0;
  const contentType = response?.headers?.get?.("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        return new ApiError({
          status: payload.status || status,
          code: payload.code || codeFromStatus(status),
          message: payload.message || payload.error || fallbackMessage,
          errors: normalizeErrors(payload.errors),
          traceId: payload.traceId || null,
        });
      }

      if (Array.isArray(payload)) {
        return new ApiError({
          status,
          code: codeFromStatus(status),
          message: fallbackMessage,
          errors: normalizeErrors(payload),
        });
      }
    }

    const text = await response.text();
    return new ApiError({
      status,
      code: codeFromStatus(status),
      message: text || fallbackMessage,
    });
  } catch {
    return new ApiError({
      status,
      code: codeFromStatus(status),
      message: fallbackMessage,
    });
  }
};

export const ensureOk = async (response, fallbackMessage) => {
  if (!response.ok) {
    throw await parseApiError(response, fallbackMessage);
  }

  return response;
};

export const apiFetch = async (url, options = {}, fallbackMessage = "Request failed.") => {
  const response = await requestWithAuth(url, options);
  return ensureOk(response, fallbackMessage);
};

export const apiJson = async (url, options = {}, fallbackMessage = "Request failed.") => {
  const response = await apiFetch(url, options, fallbackMessage);
  if (response.status === 204) return null;
  return response.json();
};

export const apiText = async (url, options = {}, fallbackMessage = "Request failed.") => {
  const response = await apiFetch(url, options, fallbackMessage);
  return response.text();
};

export const refreshAccessToken = async () => {
  const accessToken = authState.getAccessToken?.();
  const refreshToken = authState.getRefreshToken?.();
  if (!accessToken || !refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = rawFetchJson(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
      .then((tokens) => {
        authState.onTokens?.(tokens);
        return tokens.accessToken;
      })
      .catch(async () => {
        await authState.onUnauthorized?.();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const getApiErrorMessage = (error, fallbackMessage = "Request failed.") => {
  if (error instanceof ApiError) {
    return error.errors.length > 0
      ? [error.message, ...error.errors].filter(Boolean).join("\n")
      : error.message || fallbackMessage;
  }

  return error?.message || fallbackMessage;
};

const requestWithAuth = async (url, options = {}) => {
  const { auth = shouldUseAuth(url), retryOnUnauthorized = true, ...fetchOptions } = options;
  const requestOptions = buildRequestOptions(fetchOptions);

  if (auth) {
    const token = authState.getAccessToken?.();
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  let response = await fetch(url, requestOptions);
  if (!auth || !retryOnUnauthorized || response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    return response;
  }

  return fetch(url, {
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: `Bearer ${newAccessToken}`,
    },
  });
};

const rawFetchJson = async (url, options) => {
  const response = await fetch(url, options);
  await ensureOk(response, "Authentication refresh failed.");
  return response.json();
};

const buildRequestOptions = (options = {}) => {
  const next = { ...options };
  const headers = { ...(next.headers || {}) };

  if (isPlainObject(next.body)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    next.body = JSON.stringify(next.body);
  }

  next.headers = headers;
  return next;
};

const shouldUseAuth = (url) => typeof url === "string" && url.startsWith(BASE_URL);

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !(value instanceof FormData) &&
  !(value instanceof Blob) &&
  !(value instanceof ArrayBuffer);

const normalizeErrors = (errors) => {
  if (!Array.isArray(errors)) return [];

  return errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error?.description) return error.description;
      if (error?.message) return error.message;
      return null;
    })
    .filter(Boolean);
};

const codeFromStatus = (status) => {
  if (status === 400) return "validation_error";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status >= 500) return "server_error";
  return "request_error";
};

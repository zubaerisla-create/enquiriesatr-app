import axios, { InternalAxiosRequestConfig } from "axios";
import { clearTokens, getTokens, setTokens } from "./storage";

export type ApiError = {
  message: string;
  extra?: Record<string, unknown>;
  status?: number;
};

declare module "axios" {
  export interface AxiosRequestConfig {
    requireAuth?: boolean;
    retryOnUnauthorized?: boolean;
  }
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

if (!BASE_URL) {
  console.warn("EXPO_PUBLIC_API_BASE_URL is not set");
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken } = await getTokens();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      const data = response.data as { access: string; refresh: string };
      await setTokens({ accessToken: data.access, refreshToken: data.refresh });
      return data.access;
    } catch {
      await clearTokens();
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.requireAuth) {
    const { accessToken } = await getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest.requireAuth &&
      originalRequest.retryOnUnauthorized !== false &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || "Request failed",
      status: error.response?.status,
      extra: error.response?.data?.extra,
    };

    return Promise.reject(apiError);
  }
);


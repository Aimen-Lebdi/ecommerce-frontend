/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from "axios";
// REMOVE store import - this causes circular dependency
// import { store } from "../app/Store";
// import { refreshToken, handleTokenExpiration } from "../features/auth/authSlice";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailure(error);
    } else {
      prom.onSuccess(token!);
    }
  });

  failedQueue = [];
  isRefreshing = false;
};

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((onSuccess, onFailure) => {
          failedQueue.push({ onSuccess, onFailure });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = localStorage.getItem("refreshToken");

        if (!refreshTokenValue) {
          // No refresh token available, clear auth and trigger expiration event
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event('tokenExpired'));
          processQueue(error, null);
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL || "http://localhost:5000"}/api/auth/refresh`,
          { refreshToken: refreshTokenValue },
          {
            withCredentials: true,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Add new token to the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and trigger expiration event
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event('tokenExpired'));
        processQueue(refreshError as AxiosError, null);
        return Promise.reject(refreshError);
      }
    }

    // If error response exists, try to extract detailed error message
    if (error.response?.data) {
      const errorData = error.response.data as any;
      const customError = new Error(
        errorData.message || errorData.errors?.[0]?.msg || error.message
      );
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
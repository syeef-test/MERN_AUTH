import axios from "axios";
import { server } from "./config/config.js";

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error, token = null) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  csrfFailedQueue = [];
};

// Combined response interceptor to avoid overwriting
api.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response
    const csrfFromHeader = response.headers["x-csrf-token"];
    const csrfFromBody = response.data?.csrfToken;
    const csrf = csrfFromHeader || csrfFromBody;
    
    if (csrf) {
      sessionStorage.setItem("csrfToken", csrf);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 403) && !originalRequest._retry) {
      const errorCode = error.response.data?.code || "";

       // Handle CSRF token errors (403)
      if (errorCode.startsWith("CSRF_")) {
        // Handle CSRF token refresh
        if (isRefreshingCSRFToken) {
          return new Promise((resolve, reject) => {
            csrfFailedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        
        originalRequest._retry = true;
        originalRequest._csrfRetry = true; // Add separate flag for CSRF retry
        isRefreshingCSRFToken = true;

        try {
          await api.post("/api/v1/refresh-csrf");
          processCSRFQueue(null);
          return api(originalRequest);
        } catch (error) {
          processCSRFQueue(error);
          console.error("Failed to refresh CSRF token", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }

      // Handle access token refresh (non-CSRF 403 errors)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/v1/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor
api.interceptors.request.use((config) => {
  if (["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())) {
    const csrfToken = sessionStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
});

export default api;
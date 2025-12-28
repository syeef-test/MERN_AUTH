import axios from "axios";
import { server } from "./config/config.js";

// const getCookie = (name) => {
//   const value = `;${document.cookie}`;
//   const parts = value.split(";${name}=");

//   if (parts.length === 2) {
//     return parts.pop().split(";").shift();
//   }
// };

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

// api.interceptors.request.use(
//   (config) => {
//     console.log("Interceptor running:", config.method, config.url);
//     if (
//       config.method === "post" ||
//       config.method === "put" ||
//       config.method === "delete"
//     ) {
//       const csrfToken = getCookie("csrfToken");
//       console.log("csrfToken", csrfToken);
//       if (csrfToken) {
//         config.headers["x-csrf-token"] = csrfToken;
//       }
//     }

//     return config;
//   },
//   (error) => {
//     console.log(error);
//     return Promise.reject(error);
//   }
// );


api.interceptors.response.use((response) => {
    
  const csrfFromHeader = response.headers["x-csrf-token"];
  const csrfFromBody = response.data?.csrfToken;

  console.log("🔵 INTERCEPTOR RESPONSE HEADERS:", response.headers);
  console.log("🔵 CSRF HEADER:", response.headers["x-csrf-token"]);

  console.log("🔵 INTERCEPTOR RESPONSE DATA:", response?.data);
  console.log("🔵 CSRF RESPONSE DATA:", csrfFromBody);

  const csrf = csrfFromHeader || csrfFromBody;

  if (csrf) {
    sessionStorage.setItem("csrfToken", csrf);
  }

  return response;
});

api.interceptors.request.use((config) => {
  if (["post", "put", "delete"].includes(config.method)) {
    const csrfToken = sessionStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorCode = error.response.data?.code || "";

      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCSRFToken) {
          return new Promise((resolve, reject) => {
            csrfFailedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        originalRequest._retry = true;
        isRefreshingCSRFToken = true;

        try {
          await api.post("/api/v1/refresh-csrf");
          processCSRFQueue(null);
          return api(originalRequest);
        } catch (error) {
          processCSRFQueue(error);
          console.error("Failed to refresh csrf token", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
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

export default api;

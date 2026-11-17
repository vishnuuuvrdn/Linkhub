import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let refreshing = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const isAuthCall = original?.url?.includes("/api/auth/");

        if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
            original._retry = true;
            try {
                refreshing = refreshing || api.post("/api/auth/refresh").finally(() => { refreshing = null; });
                await refreshing;
                return api(original);
            } catch {
                window.dispatchEvent(new Event("auth:logout"));
            }
        }
        return Promise.reject(error);
    }
);

export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") =>
    err.response?.data?.message ||
    (err.request ? "Can't reach the server. Is the backend running?" : fallback);

export default api;

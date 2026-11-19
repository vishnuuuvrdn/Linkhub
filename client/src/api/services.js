import api from "./api";

export const authApi = {
    register: (data) => api.post("/api/auth/register", data),
    login: (data) => api.post("/api/auth/login", data),
    logout: () => api.post("/api/auth/logout"),
    getMe: () => api.get("/api/auth/me"),
    sendVerification: (email, redirectLink) => api.post("/api/auth/verify-email", { email, redirectLink }),
    verifyToken: (payload) => api.post("/api/auth/verify-token", payload),
    forgotPassword: (email, redirectLink) => api.post("/api/auth/forgot-password", { email, redirectLink }),
    resetPassword: (email, newPassword) => api.post("/api/auth/reset-password", { email, newPassword }),
};

export const linksApi = {
    list: (page = 1, limit = 10) => api.get("/api/links", { params: { page, limit } }),
    create: (data) => api.post("/api/links", data),
    remove: (customSlung) => api.delete(`/api/links/${customSlung}`),
    analytics: async () => {
        try {
            const { data } = await api.get("/api/links/analytics");
            return Array.isArray(data) ? data : [];
        } catch (err) {
            if (err.response?.data?.message?.includes("No one Clicked")) return [];
            throw err;
        }
    },
};

export const bioApi = {
    get: (username) => api.get(`/api/bio/${username}`),
    getMe: () => api.get("/api/bio/me"),
    update: (data) => api.put("/api/bio", data),
};

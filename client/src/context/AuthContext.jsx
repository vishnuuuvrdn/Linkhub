import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, linksApi } from "../api/services";

const AuthContext = createContext(null);
const KEY = "linkhub_user";

const readStoredUser = () => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [checking, setChecking] = useState(() => Boolean(readStoredUser()));

    const save = useCallback((u) => {
        if (u) localStorage.setItem(KEY, JSON.stringify(u));
        else localStorage.removeItem(KEY);
        setUser(u);
    }, []);

    useEffect(() => {
        if (!user) return;
        linksApi.list(1, 1)
            .catch((e) => { if (e.response?.status === 401) save(null); })
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        const onLogout = () => save(null);
        window.addEventListener("auth:logout", onLogout);
        return () => window.removeEventListener("auth:logout", onLogout);
    }, [save]);

    const login = useCallback(async (credentials) => {
        const { data } = await authApi.login(credentials);
        save(data.user);
        return data.user;
    }, [save]);

    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch {  }
        save(null);
    }, [save]);

    const updateUser = useCallback((patch) => save({ ...user, ...patch }), [user, save]);

    const value = useMemo(
        () => ({ user, checking, login, logout, updateUser }),
        [user, checking, login, logout, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

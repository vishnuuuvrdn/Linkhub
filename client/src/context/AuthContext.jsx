import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "../api/services";

const AuthContext = createContext(null);
const KEY = "linkhub_user";
const BIO_KEY = "linkhub_username";

const readStoredUser = () => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);
    const [checking, setChecking] = useState(() => Boolean(readStoredUser()));
    const hasChecked = useRef(false);

    const save = useCallback((u) => {
        if (u) {
            localStorage.setItem(KEY, JSON.stringify(u));
            if (u.username || u.handle) {
                localStorage.setItem(BIO_KEY, u.username || u.handle);
            }
        } else {
            localStorage.removeItem(KEY);
            localStorage.removeItem(BIO_KEY);
        }
        setUser(u);
    }, []);

    useEffect(() => {
        if (!user || hasChecked.current) {
            setChecking(false);
            return;
        }
        hasChecked.current = true;
        authApi.getMe()
            .then(({ data }) => {
                if (data?.user) {
                    save(data.user);
                }
            })
            .catch((e) => {
                if (e.response?.status === 401) {
                    save(null);
                }
            })
            .finally(() => setChecking(false));
    }, [user, save]);

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
        try {
            await authApi.logout();
        } catch {
            // Ignore logout network errors
        }
        save(null);
    }, [save]);

    const updateUser = useCallback((patch) => {
        setUser((prev) => {
            const next = { ...prev, ...patch };
            localStorage.setItem(KEY, JSON.stringify(next));
            if (next.username || next.handle) {
                localStorage.setItem(BIO_KEY, next.username || next.handle);
            }
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({ user, checking, login, logout, updateUser }),
        [user, checking, login, logout, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
